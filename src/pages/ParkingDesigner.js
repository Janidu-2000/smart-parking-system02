import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Clock, Car, Info } from 'lucide-react';
import styles from '../styles/styles';
import useParkingDesign from '../hooks/useParkingDesign';
import DesignerToolbar from '../components/designer/DesignerToolbar';
import DesignerCanvas from '../components/designer/DesignerCanvas';
import PropertiesPanel from '../components/designer/PropertiesPanel';
import GlobalFloatingNotification from '../components/GlobalFloatingNotification';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

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

const ParkingDesigner = () => {
  const [showParkingDetails, setShowParkingDetails] = useState(false);
  const [parkingDetails, setParkingDetails] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    capacity: '',
    operatingHours: '',
    description: '',
    amenities: '',
    contactPerson: '',
    emergencyContact: ''
  });
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const {
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
    saveDesign,
    saveSelectedElement,
    loadDesign,
    seedFromSlots,
    mergeStatusesFromSlots,
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
  } = useParkingDesign();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedElement = useMemo(() => elements.find((e) => e.id === selectedElementId) || null, [elements, selectedElementId]);

  // Load parking details from Firebase
  const loadParkingDetails = async () => {
    try {
      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      if (!authUser.uid) return;

      const designRef = doc(db, 'parkingDesigns', authUser.uid);
      const designSnap = await getDoc(designRef);
      
      if (designSnap.exists()) {
        const designData = designSnap.data();
        if (designData.parkingDetails) {
          setParkingDetails(designData.parkingDetails);
        }
      }
    } catch (error) {
      console.error('Error loading parking details:', error);
    }
  };

  // Save parking details to Firebase
  const saveParkingDetails = async () => {
    try {
      setIsSavingDetails(true);
      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      if (!authUser.uid) {
        throw new Error('User not authenticated');
      }

      // Save parking design details
      const designRef = doc(db, 'parkingDesigns', authUser.uid);
      const designSnap = await getDoc(designRef);
      
      if (designSnap.exists()) {
        const designData = designSnap.data();
        await setDoc(designRef, {
          ...designData,
          parkingDetails: parkingDetails,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        // Create new design document with parking details
        await setDoc(designRef, {
          ownerUid: authUser.uid,
          parkingDetails: parkingDetails,
          elements: [],
          canvas: { width: 1200, height: 700, backgroundColor: '#f3f4f6' },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Save user data to users collection
      await saveUserData(authUser);
      
      setDetailsSaved(true);
      setShowSuccessPopup(true);
      setTimeout(() => {
        setDetailsSaved(false);
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving parking details:', error);
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Handle input changes for parking details
  const handleParkingDetailChange = (field, value) => {
    setParkingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (saveState === 'saved') {
      navigate('/app', { replace: true });
    }
  }, [saveState, navigate]);

  // Load parking details on component mount
  useEffect(() => {
    loadParkingDetails();
  }, []);

  // If we navigated with seedSlots and there is no saved design yet, seed the canvas
  useEffect(() => {
    const seedSlots = location?.state?.seedSlots;
    if (!seedSlots || loading) return;
    if (!elements || elements.length === 0) {
      seedFromSlots(seedSlots);
    } else {
      mergeStatusesFromSlots(seedSlots);
    }
  }, [location?.state, elements, loading, seedFromSlots, mergeStatusesFromSlots]);

  return (
    <div style={{ ...styles.dashboardContainer, overflowX: 'hidden' }}>
      <div style={{ ...styles.contentWrapper, maxWidth: '100%', overflowX: 'hidden' }}>
        <h1 style={styles.pageTitle}>Parking Designer</h1>

        <DesignerToolbar
          onAddSlot={() => addElement('slot')}
          onAddLine={() => addElement('line')}
          onAddLabel={() => addElement('label')}
          onSave={saveDesign}
          onLoad={loadDesign}
          onClear={clearDesign}
          onCopy={copySelectedElement}
          onPaste={pasteElement}
          onDuplicate={duplicateSelectedElement}
          saveState={saveState}
          hasSelection={!!selectedElementId}
        />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 320px', 
          gap: 16,
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <div style={styles.controlsPanel}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* <div style={{ fontSize: 14, color: '#6b7280' }}>Signed in as: {adminUser?.email}</div> */}
                <button
                  onClick={() => setShowParkingDetails(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  <Building2 size={16} />
                  Parking Details
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>Grid</span>
                  <input type="number" min={1} value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} style={{ width: 80, ...styles.input }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
                  <span style={{ fontSize: 14 }}>Snap to grid</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>Canvas W</span>
                  <input type="number" min={200} value={canvas.width} onChange={(e) => setCanvas({ ...canvas, width: Number(e.target.value) })} style={{ width: 100, ...styles.input }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>Canvas H</span>
                  <input type="number" min={200} value={canvas.height} onChange={(e) => setCanvas({ ...canvas, height: Number(e.target.value) })} style={{ width: 100, ...styles.input }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>Canvas BG</span>
                  <input type="color" value={canvas.backgroundColor} onChange={(e) => setCanvas({ ...canvas, backgroundColor: e.target.value })} />
                </label>
              </div>
            </div>

            {loading ? (
              <div style={{ ...styles.analyticsCard, padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading design…</div>
            ) : (
              <DesignerCanvas
                elements={elements}
                selectedId={selectedElementId}
                onSelect={(id) => setSelectedElementId(id)}
                onChange={(id, updates) => updateElement(id, updates)}
                canvas={canvas}
                gridSize={gridSize}
                snapToGrid={snapToGrid}
              />
            )}
          </div>
          <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <PropertiesPanel
              element={selectedElement}
              updateElement={updateElement}
              updateStyle={updateElementStyle}
              updateMeta={updateElementMeta}
              deleteElement={deleteElement}
              onSave={saveDesign}
              onSaveAndClose={() => {
                saveSelectedElement();
                setSelectedElementId(null);
              }}
              rotateElement={rotateElement}
            />
            {error && (
              <div style={{ ...styles.controlsPanel, color: '#991b1b', backgroundColor: '#fee2e2' }}>{error}</div>
            )}
          </div>
        </div>
      </div>

      {/* Global Floating Notification */}
      <GlobalFloatingNotification onNavigateToSection={() => navigate('/app')} />

      {/* Parking Details Modal */}
      {showParkingDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '95%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb'
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '24px 32px 20px 32px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Building2 size={24} />
                  Parking Lot Details
                </h2>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '14px', 
                  color: '#6b7280' 
                }}>
                  Configure your parking lot information
                </p>
              </div>
              <button
                onClick={() => setShowParkingDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#374151';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }}
              >
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>×</span>
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '0 32px 32px 32px' }}>
              {/* Success Message */}
              {detailsSaved && (
                <div style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  backgroundColor: '#d1fae5',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  color: '#065f46',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✅ Parking details saved successfully!
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); saveParkingDetails(); }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Basic Information */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Info size={18} />
                      Basic Information
                    </h3>
                  </div>

                  {/* Parking Lot Name */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Parking Lot Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={parkingDetails.name}
                      onChange={(e) => handleParkingDetailChange('name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter parking lot name"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={parkingDetails.location}
                      onChange={(e) => handleParkingDetailChange('location', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter location (e.g., Downtown, Mall Area)"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Address */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Full Address *
                    </label>
                    <textarea
                      required
                      value={parkingDetails.address}
                      onChange={(e) => handleParkingDetailChange('address', e.target.value)}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Enter complete address"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Contact Information */}
                  <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                    <h3 style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Phone size={18} />
                      Contact Information
                    </h3>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={parkingDetails.phone}
                      onChange={(e) => handleParkingDetailChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter phone number"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={parkingDetails.email}
                      onChange={(e) => handleParkingDetailChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter email address"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Website
                    </label>
                    <input
                      type="url"
                      value={parkingDetails.website}
                      onChange={(e) => handleParkingDetailChange('website', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter website URL"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={parkingDetails.emergencyContact}
                      onChange={(e) => handleParkingDetailChange('emergencyContact', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter emergency contact"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Operational Details */}
                  <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                    <h3 style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Clock size={18} />
                      Operational Details
                    </h3>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Total Capacity
                    </label>
                    <input
                      type="number"
                      value={parkingDetails.capacity}
                      onChange={(e) => handleParkingDetailChange('capacity', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter total parking capacity"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Operating Hours */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      value={parkingDetails.operatingHours}
                      onChange={(e) => handleParkingDetailChange('operatingHours', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="e.g., 24/7 or 6 AM - 10 PM"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={parkingDetails.contactPerson}
                      onChange={(e) => handleParkingDetailChange('contactPerson', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter contact person name"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Additional Information */}
                  <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                    <h3 style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Car size={18} />
                      Additional Information
                    </h3>
                  </div>

                  {/* Description */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Description
                    </label>
                    <textarea
                      value={parkingDetails.description}
                      onChange={(e) => handleParkingDetailChange('description', e.target.value)}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Enter parking lot description"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Amenities */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Amenities & Features
                    </label>
                    <textarea
                      value={parkingDetails.amenities}
                      onChange={(e) => handleParkingDetailChange('amenities', e.target.value)}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        fontFamily: 'inherit'
                      }}
                      placeholder="e.g., Security cameras, Lighting, Covered parking, EV charging"
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginTop: '32px',
                  paddingTop: '20px',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <button
                    type="submit"
                    disabled={isSavingDetails}
                    style={{
                      flex: 1,
                      padding: '14px 24px',
                      backgroundColor: isSavingDetails ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isSavingDetails ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isSavingDetails ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => !isSavingDetails && (e.target.style.backgroundColor = '#1d4ed8')}
                    onMouseOut={(e) => !isSavingDetails && (e.target.style.backgroundColor = '#2563eb')}
                  >
                    {isSavingDetails ? (
                      <>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          border: '2px solid transparent', 
                          borderTop: '2px solid white', 
                          borderRadius: '50%', 
                          animation: 'spin 1s linear infinite' 
                        }}></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Building2 size={16} />
                        Save Parking Details
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowParkingDetails(false)}
                    style={{
                      padding: '14px 24px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          zIndex: 10001,
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#d1fae5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            animation: 'bounceIn 0.6s ease-out'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'scaleIn 0.4s ease-out 0.2s both'
            }}>
              <span style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>✓</span>
            </div>
          </div>

          {/* Success Title */}
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827'
          }}>
            Success!
          </h3>

          {/* Success Message */}
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Parking details have been saved successfully to your database.
          </p>

          {/* Close Button */}
          <button
            onClick={() => setShowSuccessPopup(false)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            <Building2 size={16} />
            Continue
          </button>
        </div>
      )}

      {/* Backdrop for Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out'
        }} />
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ParkingDesigner;




