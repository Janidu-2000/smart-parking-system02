import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Helper function to save user data to users collection
const saveUserData = async (authUser) => {
  if (!authUser?.uid) return;
  
  const userRef = doc(db, 'users', authUser.uid);
  const userData = {
    uid: authUser.uid,
    name: authUser.displayName || authUser.name || '',
    email: authUser.email || '',
    phone: authUser.phoneNumber || '',
    username: authUser.displayName || authUser.name || '',
    createdAt: authUser.metadata?.creationTime ? new Date(authUser.metadata.creationTime).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(userRef, userData, { merge: true });
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_CANVAS = {
  width: 1200,
  height: 700,
  backgroundColor: '#f3f4f6',
};

export default function useParkingDesign() {
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [gridSize, setGridSize] = useState(10);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [canvas, setCanvas] = useState(DEFAULT_CANVAS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [copiedElements, setCopiedElements] = useState([]);

  const adminUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }, []);

  const addElement = useCallback((type) => {
    const base = {
      id: generateId(),
      type,
      x: 50,
      y: 50,
      width: type === 'line' ? 200 : 100,
      height: type === 'line' ? 6 : 60,
      rotation: 0,
      style: {
        backgroundColor: type === 'line' ? '#9ca3af' : '#ffffff',
        borderColor: '#2563eb',
        borderWidth: 2,
        color: '#111827',
      },
      meta: {
        label: type === 'label' ? 'Label' : '',
        slotNumber: type === 'slot' ? 'S1' : '',
        price: type === 'slot' ? 5.00 : 0, // Default price for parking slots
      },
    };
    setElements((prev) => [...prev, base]);
    setSelectedElementId(base.id);
  }, []);

  const updateElement = useCallback((id, updates) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  const updateElementStyle = useCallback((id, styleUpdates) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, style: { ...el.style, ...styleUpdates } } : el)));
  }, []);

  const updateElementMeta = useCallback((id, metaUpdates) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, meta: { ...el.meta, ...metaUpdates } } : el)));
  }, []);

  const deleteElement = useCallback((id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedElementId((curr) => (curr === id ? null : curr));
  }, []);

  const rotateElement = useCallback((id, rotation) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, rotation } : el)));
  }, []);

  const clearDesign = useCallback(() => {
    setElements([]);
    setSelectedElementId(null);
    setCanvas(DEFAULT_CANVAS);
  }, []);

  const seedFromSlots = useCallback((slots) => {
    if (!Array.isArray(slots) || slots.length === 0) return;
    const columns = 10;
    const slotWidth = 100;
    const slotHeight = 60;
    const gap = 16;
    const padding = 20;
    const rows = Math.ceil(slots.length / columns);

    const mapped = slots.map((slot, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = padding + col * (slotWidth + gap);
      const y = padding + row * (slotHeight + gap);
      return {
        id: generateId(),
        type: 'slot',
        x,
        y,
        width: slotWidth,
        height: slotHeight,
        rotation: 0,
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#2563eb',
          borderWidth: 2,
          color: '#111827',
        },
        meta: {
          slotNumber: String(slot.id ?? index + 1),
          price: slot.price ?? 0,
          status: slot.status ?? 'available',
          label: '',
        },
      };
    });

    setElements(mapped);
    setSelectedElementId(mapped[0]?.id ?? null);
    setCanvas({
      width: padding * 2 + columns * slotWidth + (columns - 1) * gap,
      height: padding * 2 + rows * slotHeight + (rows - 1) * gap,
      backgroundColor: '#f3f4f6',
    });
  }, []);

  const saveDesign = useCallback(async () => {
    if (!adminUser?.uid) return;
    setSaveState('saving');
    setError('');
    try {
      // Save parking design
      const ref = doc(db, 'parkingDesigns', adminUser.uid);
      await setDoc(ref, {
        ownerUid: adminUser.uid,
        updatedAt: serverTimestamp(),
        canvas,
        elements,
      }, { merge: true });

      // Save user data to users collection
      await saveUserData(adminUser);

      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1200);
    } catch (e) {
      setSaveState('error');
      setError(e?.message || 'Failed to save design');
    }
  }, [adminUser?.uid, canvas, elements]);

  const saveSelectedElement = useCallback(async () => {
    if (!adminUser?.uid || !selectedElementId) return;
    setError('');
    try {
      // Update the selected element in the local state
      const updatedElements = elements.map(el => 
        el.id === selectedElementId ? { ...el } : el
      );
      setElements(updatedElements);
      
      // Save the updated design to Firebase
      const ref = doc(db, 'parkingDesigns', adminUser.uid);
      await setDoc(ref, {
        ownerUid: adminUser.uid,
        updatedAt: serverTimestamp(),
        canvas,
        elements: updatedElements,
      }, { merge: true });

      // Save user data to users collection
      await saveUserData(adminUser);
    } catch (e) {
      setError(e?.message || 'Failed to save element');
    }
  }, [adminUser?.uid, selectedElementId, elements, canvas]);

  const loadDesign = useCallback(async () => {
    if (!adminUser?.uid) return;
    setLoading(true);
    setError('');
    try {
      const ref = doc(db, 'parkingDesigns', adminUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setCanvas(data.canvas || DEFAULT_CANVAS);
        setElements(Array.isArray(data.elements) ? data.elements : []);
      } else {
        setCanvas(DEFAULT_CANVAS);
        setElements([]);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load design');
    } finally {
      setLoading(false);
    }
  }, [adminUser?.uid]);

  useEffect(() => {
    // auto-load on first mount
    loadDesign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mergeStatusesFromSlots = useCallback((slots) => {
    if (!Array.isArray(slots) || slots.length === 0) return;
    const byNumber = new Map(slots.map((s) => [String(s.id ?? s.slotNumber ?? ''), s]));
    setElements((prev) =>
      prev.map((el) => {
        if (el.type !== 'slot') return el;
        const match = byNumber.get(String(el.meta?.slotNumber ?? ''));
        if (!match) return el;
        return {
          ...el,
          meta: {
            ...el.meta,
            status: match.status ?? el.meta.status,
            price: match.price ?? el.meta.price,
          },
        };
      })
    );
  }, []);

  const copyElement = useCallback((id) => {
    const elementToCopy = elements.find(el => el.id === id);
    if (elementToCopy) {
      const copiedElement = {
        ...elementToCopy,
        id: generateId(), // Generate new ID for copied element
        x: elementToCopy.x + 20, // Offset slightly
        y: elementToCopy.y + 20,
      };
      setCopiedElements([copiedElement]);
      localStorage.setItem('parkingDesigner_copied', JSON.stringify([copiedElement]));
    }
  }, [elements]);

  const pasteElement = useCallback(() => {
    try {
      const stored = localStorage.getItem('parkingDesigner_copied');
      if (stored) {
        const pastedElements = JSON.parse(stored);
        const newElements = pastedElements.map(el => ({
          ...el,
          id: generateId(),
          x: el.x + 20,
          y: el.y + 20,
        }));
        setElements(prev => [...prev, ...newElements]);
        setSelectedElementId(newElements[0]?.id || null);
        return newElements;
      }
    } catch (e) {
      console.error('Failed to paste elements:', e);
    }
    return [];
  }, []);

  const duplicateElement = useCallback((id) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (elementToDuplicate) {
      const duplicatedElement = {
        ...elementToDuplicate,
        id: generateId(),
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
      };
      setElements(prev => [...prev, duplicatedElement]);
      setSelectedElementId(duplicatedElement.id);
      return duplicatedElement;
    }
    return null;
  }, [elements]);

  const copySelectedElement = useCallback(() => {
    if (selectedElementId) {
      copyElement(selectedElementId);
    }
  }, [selectedElementId, copyElement]);

  const duplicateSelectedElement = useCallback(() => {
    if (selectedElementId) {
      duplicateElement(selectedElementId);
    }
  }, [selectedElementId, duplicateElement]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            e.preventDefault();
            copySelectedElement();
            break;
          case 'v':
            e.preventDefault();
            pasteElement();
            break;
          case 'd':
            e.preventDefault();
            duplicateSelectedElement();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedElement, pasteElement, duplicateSelectedElement]);

  return {
    adminUser,
    elements,
    selectedElementId,
    setSelectedElementId,
    addElement,
    updateElement,
    updateElementStyle,
    updateElementMeta,
    deleteElement,
    rotateElement,
    clearDesign,
    seedFromSlots,
    mergeStatusesFromSlots,
    saveDesign,
    saveSelectedElement,
    loadDesign,
    copyElement,
    pasteElement,
    duplicateElement,
    copySelectedElement,
    duplicateSelectedElement,
    gridSize,
    setGridSize,
    snapToGrid,
    setSnapToGrid,
    canvas,
    setCanvas,
    loading,
    error,
    saveState,
  };
}




