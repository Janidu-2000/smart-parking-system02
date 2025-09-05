import React, { useState, useEffect } from 'react';
import { DollarSign, Save, X, Edit3 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const SlotPriceManager = ({ onClose, onPricesUpdated }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallTablet, setIsSmallTablet] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth <= 1440);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slotPrices, setSlotPrices] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
      setIsSmallTablet(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
      setIsLargeScreen(window.innerWidth <= 1440);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsiveValue = (mobile, smallTablet, tablet, large, desktop) => {
    if (isMobile) return mobile;
    if (isSmallTablet) return smallTablet;
    if (isTablet) return tablet;
    if (isLargeScreen) return large;
    return desktop;
  };

  useEffect(() => {
    loadSlotPrices();
  }, []);

  const loadSlotPrices = async () => {
    try {
      setLoading(true);
      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      if (!authUser.uid) {
        throw new Error('User not authenticated');
      }

      const designRef = doc(db, 'parkingDesigns', authUser.uid);
      const designSnap = await getDoc(designRef);
      
      if (designSnap.exists()) {
        const designData = designSnap.data();
        const elements = designData.elements || [];
        
        // Create a map of slot prices
        const prices = {};
        elements.forEach(element => {
          if (element.type === 'slot' && element.meta?.slotNumber) {
            prices[element.meta.slotNumber] = element.meta.price || 5.00;
          }
        });
        
        setSlotPrices(prices);
      } else {
        // Create default prices for slots S1-S50
        const defaultPrices = {};
        for (let i = 1; i <= 50; i++) {
          defaultPrices[`S${i}`] = 5.00;
        }
        setSlotPrices(defaultPrices);
      }
    } catch (err) {
      setError(err.message || 'Failed to load slot prices');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      if (!authUser.uid) {
        throw new Error('User not authenticated');
      }

      const designRef = doc(db, 'parkingDesigns', authUser.uid);
      const designSnap = await getDoc(designRef);
      
      if (designSnap.exists()) {
        const designData = designSnap.data();
        const elements = designData.elements || [];
        
        // Update slot prices in elements
        const updatedElements = elements.map(element => {
          if (element.type === 'slot' && element.meta?.slotNumber) {
            const price = slotPrices[element.meta.slotNumber] || 5.00;
            return {
              ...element,
              meta: {
                ...element.meta,
                price: price
              }
            };
          }
          return element;
        });
        
        // Save updated design
        await setDoc(designRef, {
          ...designData,
          elements: updatedElements,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Save user data to users collection
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
        
        setSuccess('Slot prices updated successfully!');
        setIsEditing(false);
        
        if (onPricesUpdated) {
          onPricesUpdated();
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save slot prices');
    } finally {
      setSaving(false);
    }
  };

  const handlePriceChange = (slotId, newPrice) => {
    setSlotPrices(prev => ({
      ...prev,
      [slotId]: parseFloat(newPrice) || 0
    }));
  };

  const handleBulkUpdate = (newPrice) => {
    const updatedPrices = {};
    Object.keys(slotPrices).forEach(slotId => {
      updatedPrices[slotId] = parseFloat(newPrice) || 0;
    });
    setSlotPrices(updatedPrices);
  };

  // Responsive styles
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: getResponsiveValue(16, 20, 24, 32, 32)
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: getResponsiveValue(12, 16, 20, 24, 24),
    padding: getResponsiveValue(20, 24, 28, 32, 32),
    width: '100%',
    maxWidth: getResponsiveValue('100%', '90%', '80%', '800px', '800px'),
    maxHeight: getResponsiveValue('90vh', '85vh', '80vh', '75vh', '75vh'),
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    position: 'relative'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getResponsiveValue(20, 24, 28, 32, 32),
    paddingBottom: getResponsiveValue(16, 20, 24, 28, 28),
    borderBottom: '1px solid #e5e7eb'
  };

  const titleStyle = {
    fontSize: getResponsiveValue(18, 20, 22, 24, 24),
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(8, 10, 12, 12, 12)
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: getResponsiveValue('1fr', '1fr 1fr', '1fr 1fr 1fr', '1fr 1fr 1fr 1fr', '1fr 1fr 1fr 1fr'),
    gap: getResponsiveValue(8, 10, 12, 16, 16),
    marginBottom: getResponsiveValue(20, 24, 28, 32, 32)
  };

  const slotItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveValue(8, 10, 12, 14, 14),
    border: '1px solid #e5e7eb',
    borderRadius: getResponsiveValue(6, 8, 10, 12, 12),
    backgroundColor: '#f9fafb'
  };

  const inputStyle = {
    width: getResponsiveValue(60, 70, 80, 80, 80),
    padding: getResponsiveValue('4px 6px', '6px 8px', '6px 8px', '6px 8px', '6px 8px'),
    border: '1px solid #d1d5db',
    borderRadius: getResponsiveValue(4, 6, 8, 8, 8),
    fontSize: getResponsiveValue(12, 13, 14, 14, 14),
    outline: 'none',
    textAlign: 'center'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: getResponsiveValue(8, 12, 16, 20, 20),
    marginTop: getResponsiveValue(24, 28, 32, 36, 36),
    flexDirection: getResponsiveValue('column', 'row', 'row', 'row', 'row')
  };

  const buttonStyle = {
    padding: getResponsiveValue('10px 16px', '12px 20px', '14px 24px', '14px 24px', '14px 24px'),
    border: 'none',
    borderRadius: getResponsiveValue(6, 8, 10, 12, 12),
    fontSize: getResponsiveValue(14, 15, 16, 16, 16),
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveValue(6, 8, 10, 12, 12),
    flex: getResponsiveValue('none', 'none', 'none', 1, 1)
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2563eb',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  const messageStyle = {
    padding: getResponsiveValue(10, 12, 14, 16, 16),
    borderRadius: getResponsiveValue(6, 8, 10, 12, 12),
    marginBottom: getResponsiveValue(16, 20, 24, 28, 28),
    fontSize: getResponsiveValue(13, 14, 15, 16, 16)
  };

  const successMessageStyle = {
    ...messageStyle,
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0'
  };

  const errorMessageStyle = {
    ...messageStyle,
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5'
  };

  if (loading) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            Loading slot prices...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            <DollarSign size={getResponsiveValue(20, 22, 24, 24, 24)} />
            Slot Price Manager
          </h2>
          <button style={closeButtonStyle} onClick={onClose}>
            <X size={getResponsiveValue(18, 20, 22, 24, 24)} />
          </button>
        </div>

        {error && <div style={errorMessageStyle}>{error}</div>}
        {success && <div style={successMessageStyle}>{success}</div>}

        {/* Bulk Update Section */}
        <div style={{ marginBottom: getResponsiveValue(20, 24, 28, 32, 32) }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: getResponsiveValue(8, 10, 12, 16, 16),
            flexWrap: 'wrap'
          }}>
            <label style={{ 
              fontSize: getResponsiveValue(14, 15, 16, 16, 16),
              fontWeight: 600,
              color: '#374151'
            }}>
              Set all slots to: $
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="5.00"
              style={inputStyle}
              onChange={(e) => handleBulkUpdate(e.target.value)}
            />
            <button
              style={secondaryButtonStyle}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 size={getResponsiveValue(16, 18, 20, 20, 20)} />
              {isEditing ? 'Cancel Edit' : 'Edit Prices'}
            </button>
          </div>
        </div>

        {/* Slot Prices Grid */}
        <div style={gridStyle}>
          {Object.entries(slotPrices).map(([slotId, price]) => (
            <div key={slotId} style={slotItemStyle}>
              <span style={{ 
                fontSize: getResponsiveValue(12, 13, 14, 14, 14),
                fontWeight: 600,
                color: '#374151'
              }}>
                {slotId}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: getResponsiveValue(10, 11, 12, 12, 12), color: '#6b7280' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => handlePriceChange(slotId, e.target.value)}
                  disabled={!isEditing}
                  style={{
                    ...inputStyle,
                    backgroundColor: isEditing ? 'white' : '#f3f4f6',
                    color: isEditing ? '#374151' : '#6b7280'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={buttonGroupStyle}>
          {isEditing && (
            <button
              style={primaryButtonStyle}
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={getResponsiveValue(16, 18, 20, 20, 20)} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          <button
            style={secondaryButtonStyle}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotPriceManager;
