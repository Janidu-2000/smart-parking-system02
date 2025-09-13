import React, { useState, useEffect } from 'react';
import { X, Car, User, Phone, Calendar } from 'lucide-react';
import DesignerCanvas from './designer/DesignerCanvas';
import styles from '../styles/styles';
import { addBookingToFirestore } from '../services/bookingService';
import { getParkingSlotsWithStatus } from '../services/slotService';
import { useResponsive, getResponsiveStyles } from '../utils/responsive';

const AddCustomerPage = ({ slots, designElements = [], canvas, gridSize, onUpdateSlot, onBookingAdded, parkId }) => {
  const screenSize = useResponsive();
  const responsiveStyles = getResponsiveStyles(screenSize);
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    phoneNumber: '',
    vehicleNumber: '',
    vehicleType: 'car',
    duration: 1,
    startDate: new Date().toISOString().split('T')[0], // Current date as default
    endDate: ''
  });

  // Add CSS for loading spinner animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Calculate total amount based on slot price and duration
  const calculateAmount = () => {
    if (!selectedSlot) return 0;
    
    const slotPrice = selectedSlot.price || 5.00; // Default price if not set
    const actualDuration = bookingForm.endDate 
      ? Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24)) + 1
      : bookingForm.duration;
    
    return (slotPrice * actualDuration).toFixed(2);
  };

  const totalAmount = calculateAmount();

  // Recalculate amount when form fields or selected slot changes
  useEffect(() => {
    // This will trigger a re-render and recalculate the amount
  }, [bookingForm.duration, bookingForm.startDate, bookingForm.endDate, selectedSlot]);

  // Filter design elements - only filter slots, always show roads and labels
  const filteredDesignElements = designElements.filter(element => {
    if (element.type === 'slot') {
      // Extract slot number from design element and convert to new format
      const slotNumberStr = element.meta?.slotNumber || '';
      const slotNumber = parseInt(slotNumberStr.replace(/[^0-9]/g, '')) || 1;
      
      // Convert to new slot format (S1, S2, etc.)
      const slotId = `S${slotNumber}`;
      
      // Find matching slot in the slots array (filtered by park ID)
      const matchingSlot = slots.find(slot => slot.id === slotId);
      
      const slotStatus = matchingSlot?.status || element.meta?.status || 'available';
      return slotStatus === 'available'; // Only show available slots
    }
    // For roads and labels, always show them (no filtering)
    return true;
  });

  const handleSlotClick = (element) => {
    if (element.type === 'slot') {
      const slotNumberStr = element.meta?.slotNumber || '';
      const slotNumber = parseInt(slotNumberStr.replace(/[^0-9]/g, '')) || 1;
      
      // Convert to new slot format (S1, S2, etc.)
      const slotId = `S${slotNumber}`;
      
      const matchingSlot = slots.find(slot => slot.id === slotId);
      
      if (matchingSlot && matchingSlot.status === 'available') {
        setSelectedSlot(matchingSlot);
        setShowBookingForm(true);
      }
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!bookingForm.customerName.trim() || !bookingForm.phoneNumber.trim() || !bookingForm.vehicleNumber.trim()) {
        throw new Error('Please fill in all required fields (Customer Name, Phone Number, Vehicle Number)');
      }
      
      // Validate park ID
      if (!parkId) {
        throw new Error('Park ID is missing. Please log in again to refresh your session.');
      }
      
      // Prepare booking data with date handling
      const bookingData = {
        slot: selectedSlot,
        ...bookingForm,
        // If no end date is selected, use start date only
        effectiveStartDate: bookingForm.startDate,
        effectiveEndDate: bookingForm.endDate || bookingForm.startDate,
        // Calculate actual duration if date range is provided
        actualDuration: bookingForm.endDate 
          ? Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24)) + 1
          : bookingForm.duration,
        // Add calculated amount
        amount: parseFloat(totalAmount),
        slotPrice: selectedSlot?.price || 5.00,
        // Add park ID for uniquely identifying slots that belong to this park
        parkId: parkId
      };
      
      console.log('Submitting booking data:', bookingData);
      console.log('Park ID for this booking:', parkId);
      console.log('Unique Slot ID:', `${parkId}_${selectedSlot.id}`);
      
      // Save the booking to Firestore
      const savedBooking = await addBookingToFirestore(bookingData);
      console.log('Booking saved to Firestore:', savedBooking);
      
      // Show success message
      setSuccessMessage(`Booking created successfully! Slot ${selectedSlot.id} (Park: ${parkId.substring(0, 8)}...) has been reserved for ${bookingForm.customerName}.`);
      
      // Refresh bookings list and slots
      if (onBookingAdded) {
        await onBookingAdded();
      }
      
      // Reset form and close modal after a short delay
      setTimeout(() => {
        setBookingForm({
          customerName: '',
          phoneNumber: '',
          vehicleNumber: '',
          vehicleType: 'car',
          duration: 1,
          startDate: new Date().toISOString().split('T')[0], // Reset to current date
          endDate: ''
        });
        setShowBookingForm(false);
        setSelectedSlot(null);
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving booking:', error);
      setErrorMessage(error.message || 'Failed to save booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={responsiveStyles.container}>
      <div style={responsiveStyles.header}>
        <div>
          <h1 style={responsiveStyles.title}>Add Customer - Parking Booking</h1>
          <p style={responsiveStyles.subtitle}>
            Click on any available parking slot to create a new booking
          </p>
        </div>
      </div>

        {/* Instructions */}
        {/* <div style={{ ...styles.analyticsCard, marginBottom: '24px', backgroundColor: '#dbeafe', border: '1px solid #93c5fd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Car size={24} color="#2563eb" />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1e40af', fontWeight: '600' }}>
                Available Slots for Booking
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1e40af' }}>
                Click on any green (available) slot to add a new customer booking
              </p>
              {parkId && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1e40af', fontStyle: 'italic' }}>
                  Park ID: {parkId.substring(0, 8)}... (using standard slot IDs S1-S50 across all parks)
                </p>
              )}
            </div>
          </div>
        </div> */}

        {/* Parking Design Status */}
        <div style={responsiveStyles.analyticsCard}>
          <h2 style={{ 
            ...responsiveStyles.analyticsCardTitle, 
            fontSize: screenSize.isMobile ? '16px' : screenSize.isSmallTablet ? '18px' : '20px', 
            marginBottom: '16px',
            color: '#1e293b',
            fontWeight: '600'
          }}>
            Available Parking Slots
          </h2>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: screenSize.isMobile ? '300px' : screenSize.isSmallTablet ? '400px' : '500px', 
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'auto'
          }}>
            {filteredDesignElements && filteredDesignElements.length > 0 ? (
              <DesignerCanvas
                elements={filteredDesignElements}
                selectedId={null}
                onSelect={(elementId) => {
                  const element = filteredDesignElements.find(el => el.id === elementId);
                  if (element) handleSlotClick(element);
                }}
                onChange={() => {}} // No editing in this view
                canvas={canvas || { width: 1200, height: 700, backgroundColor: '#f3f4f6' }}
                gridSize={gridSize || 10}
                snapToGrid={false}
                slotStatuses={slots.reduce((acc, slot) => {
                  acc[slot.id] = slot.status;
                  acc[`S${slot.id}`] = slot.status;
                  return acc;
                }, {})}
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#6b7280',
                fontSize: '16px'
              }}>
                No available parking slots at the moment.
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: screenSize.isMobile ? '12px' : '24px', 
            marginTop: '20px', 
            flexWrap: 'wrap' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: screenSize.isMobile ? '16px' : '20px', 
                height: '3px', 
                backgroundColor: '#10b981' 
              }}></div>
              <span style={{ 
                fontSize: screenSize.isMobile ? '12px' : '14px' 
              }}>Available (Click to Book)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: screenSize.isMobile ? '16px' : '20px', 
                height: '3px', 
                backgroundColor: '#ef4444' 
              }}></div>
              <span style={{ 
                fontSize: screenSize.isMobile ? '12px' : '14px' 
              }}>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: screenSize.isMobile ? '16px' : '20px', 
                height: '3px', 
                backgroundColor: '#f59e0b' 
              }}></div>
              <span style={{ 
                fontSize: screenSize.isMobile ? '12px' : '14px' 
              }}>Reserved</span>
            </div>
          </div>
          
          {/* Slot ID Information */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '12px', 
            padding: screenSize.isMobile ? '6px 12px' : '8px 16px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ 
              margin: '0', 
              fontSize: screenSize.isMobile ? '11px' : '12px', 
              color: '#64748b',
              fontStyle: 'italic'
            }}>
              All parks use standardized slot IDs (S1-S50) for consistency
            </p>
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div style={responsiveStyles.modal}>
            <div style={{
              ...responsiveStyles.modalContent,
              maxWidth: screenSize.isMobile ? '95vw' : screenSize.isSmallTablet ? '90vw' : '900px',
              maxHeight: screenSize.isMobile ? '95vh' : '95vh'
            }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: screenSize.isMobile ? '16px 20px 12px 20px' : '24px 32px 20px 32px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: screenSize.isMobile ? '18px' : screenSize.isSmallTablet ? '20px' : '24px', 
                    fontWeight: '700', 
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: screenSize.isMobile ? '8px' : '12px'
                  }}>
                    <User size={screenSize.isMobile ? 18 : 24} />
                    Add Customer Booking
                  </h2>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: screenSize.isMobile ? '12px' : '14px', 
                    color: '#6b7280' 
                  }}>
                    Create a new parking reservation
                  </p>
                </div>
                <button
                  onClick={() => setShowBookingForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: screenSize.isMobile ? '6px' : '8px',
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
                  <X size={screenSize.isMobile ? 16 : 20} />
                </button>
              </div>

              {/* Content */}
              <div style={{ 
                flex: 1, 
                padding: screenSize.isMobile ? '0 16px 16px 16px' : '0 32px 32px 32px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Selected Slot Info */}
                <div style={{ 
                  marginBottom: screenSize.isMobile ? '16px' : '24px', 
                  padding: screenSize.isMobile ? '12px 16px' : '16px 20px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: screenSize.isMobile ? '14px' : '16px', 
                    fontWeight: '600',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Car size={screenSize.isMobile ? 16 : 18} />
                    Selected Slot: {selectedSlot?.id}
                  </h3>
                  {parkId && (
                    <div style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: screenSize.isMobile ? '11px' : '12px', 
                      color: '#64748b',
                      fontStyle: 'italic'
                    }}>
                      <p style={{ margin: '0 0 4px 0' }}>
                        Park ID: {parkId.substring(0, 8)}...
                      </p>
                      <p style={{ margin: '0', fontSize: screenSize.isMobile ? '10px' : '11px', color: '#94a3b8' }}>
                        Unique Slot ID: {parkId.substring(0, 8)}..._{selectedSlot?.id}
                      </p>
                    </div>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    gap: screenSize.isMobile ? '16px' : '24px', 
                    fontSize: screenSize.isMobile ? '12px' : '14px', 
                    color: '#64748b',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '500' }}>Price:</span>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#059669', 
                        fontSize: screenSize.isMobile ? '13px' : '15px' 
                      }}>
                        ${selectedSlot?.price || 5.00}/hour
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {successMessage && (
                  <div style={{
                    marginBottom: screenSize.isMobile ? '16px' : '20px',
                    padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                    backgroundColor: '#d1fae5',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    color: '#065f46',
                    fontSize: screenSize.isMobile ? '12px' : '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ✅ {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div style={{
                    marginBottom: screenSize.isMobile ? '16px' : '20px',
                    padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: screenSize.isMobile ? '12px' : '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ❌ {errorMessage}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleBookingSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: screenSize.isMobile ? '1fr' : '1fr 1fr', 
                    gap: screenSize.isMobile ? '16px' : '20px',
                    flex: 1,
                    minHeight: 0
                  }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: screenSize.isMobile ? '16px' : '20px' }}>
                      {/* Customer Name */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontSize: screenSize.isMobile ? '13px' : '14px', 
                          fontWeight: '600', 
                          color: '#374151' 
                        }}>
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingForm.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          style={{
                            width: '100%',
                            padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: screenSize.isMobile ? '13px' : '14px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s'
                          }}
                          placeholder="Enter customer full name"
                          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontSize: screenSize.isMobile ? '13px' : '14px', 
                          fontWeight: '600', 
                          color: '#374151' 
                        }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={bookingForm.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          style={{
                            width: '100%',
                            padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: screenSize.isMobile ? '13px' : '14px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s'
                          }}
                          placeholder="Enter phone number"
                          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      {/* Vehicle Number */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontSize: screenSize.isMobile ? '13px' : '14px', 
                          fontWeight: '600', 
                          color: '#374151' 
                        }}>
                          Vehicle Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingForm.vehicleNumber}
                          onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                          style={{
                            width: '100%',
                            padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: screenSize.isMobile ? '13px' : '14px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s'
                          }}
                          placeholder="Enter vehicle registration number"
                          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      {/* Vehicle Type */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontSize: screenSize.isMobile ? '13px' : '14px', 
                          fontWeight: '600', 
                          color: '#374151' 
                        }}>
                          Vehicle Type
                        </label>
                        <select
                          value={bookingForm.vehicleType}
                          onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                          style={{
                            width: '100%',
                            padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: screenSize.isMobile ? '13px' : '14px',
                            backgroundColor: 'white',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                          <option value="car">Car</option>
                          <option value="motorcycle">Motorcycle</option>
                          <option value="truck">Truck</option>
                          <option value="van">Van</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: screenSize.isMobile ? '16px' : '20px' }}>
                      {/* Duration */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontSize: screenSize.isMobile ? '13px' : '14px', 
                          fontWeight: '600', 
                          color: '#374151' 
                        }}>
                          Duration (Hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={bookingForm.duration}
                          onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: screenSize.isMobile ? '13px' : '14px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      {/* Date Range */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontSize: screenSize.isMobile ? '13px' : '14px', 
                          fontWeight: '600', 
                          color: '#374151' 
                        }}>
                          Date Range (Optional)
                        </label>
                        <div style={{ 
                          display: 'flex', 
                          gap: screenSize.isMobile ? '8px' : '12px',
                          flexDirection: screenSize.isMobile ? 'column' : 'row'
                        }}>
                          <div style={{ flex: 1 }}>
                            <input
                              type="date"
                              value={bookingForm.startDate}
                              onChange={(e) => handleInputChange('startDate', e.target.value)}
                              style={{
                                width: '100%',
                                padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: screenSize.isMobile ? '13px' : '14px',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="date"
                              value={bookingForm.endDate}
                              onChange={(e) => handleInputChange('endDate', e.target.value)}
                              min={bookingForm.startDate}
                              style={{
                                width: '100%',
                                padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: screenSize.isMobile ? '13px' : '14px',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>
                        </div>
                        <p style={{ 
                          margin: '6px 0 0 0', 
                          fontSize: screenSize.isMobile ? '11px' : '12px', 
                          color: '#6b7280' 
                        }}>
                          If no date range is selected, current date will be used
                        </p>
                      </div>

                      {/* Amount Calculation */}
                      <div style={{ 
                        padding: screenSize.isMobile ? '12px' : '16px', 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        borderLeft: '4px solid #2563eb'
                      }}>
                        <h4 style={{ 
                          margin: '0 0 12px 0', 
                          fontSize: screenSize.isMobile ? '13px' : '15px', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          💰 Amount Calculation
                        </h4>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: screenSize.isMobile ? '1fr' : '1fr 1fr', 
                          gap: '8px', 
                          fontSize: screenSize.isMobile ? '12px' : '13px' 
                        }}>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: '500' }}>Slot Price:</span>
                            <span style={{ 
                              marginLeft: '6px', 
                              fontWeight: '600', 
                              color: '#059669',
                              fontSize: screenSize.isMobile ? '13px' : '14px'
                            }}>
                              Rs{selectedSlot?.price || 5.00}/hour
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: '500' }}>Duration:</span>
                            <span style={{ 
                              marginLeft: '6px', 
                              fontWeight: '600', 
                              color: '#1e293b'
                            }}>
                              {bookingForm.endDate 
                                ? Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24)) + 1
                                : bookingForm.duration
                              } {bookingForm.endDate ? 'days' : 'hours'}
                            </span>
                          </div>
                        </div>
                        <div style={{ 
                          marginTop: '8px', 
                          padding: screenSize.isMobile ? '6px 10px' : '8px 12px', 
                          backgroundColor: '#e2e8f0', 
                          borderRadius: '6px',
                          fontSize: screenSize.isMobile ? '11px' : '12px',
                          color: '#475569'
                        }}>
                          <span style={{ fontWeight: '500' }}>Calculation:</span> 
                           Rs{selectedSlot?.price || 5.00} × {bookingForm.endDate
                            ? Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24)) + 1
                            : bookingForm.duration
                          } {bookingForm.endDate ? 'days' : 'hours'} = Rs{totalAmount}
                        </div>
                        <div style={{ 
                          marginTop: '10px', 
                          padding: screenSize.isMobile ? '8px' : '10px', 
                          backgroundColor: '#2563eb', 
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}>
                          <span style={{ 
                            color: 'white', 
                            fontSize: screenSize.isMobile ? '14px' : '16px', 
                            fontWeight: '700'
                          }}>
                             Total Amount: Rs{totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: screenSize.isMobile ? '8px' : '12px', 
                    marginTop: screenSize.isMobile ? '16px' : '24px',
                    paddingTop: screenSize.isMobile ? '16px' : '20px',
                    borderTop: '1px solid #f3f4f6',
                    flexDirection: screenSize.isMobile ? 'column' : 'row'
                  }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        padding: screenSize.isMobile ? '12px 20px' : '14px 24px',
                        backgroundColor: isSubmitting ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: screenSize.isMobile ? '13px' : '14px',
                        fontWeight: '600',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: isSubmitting ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => !isSubmitting && (e.target.style.backgroundColor = '#1d4ed8')}
                      onMouseOut={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2563eb')}
                    >
                      {isSubmitting ? (
                        <>
                          <div style={{ 
                            width: screenSize.isMobile ? '14px' : '16px', 
                            height: screenSize.isMobile ? '14px' : '16px', 
                            border: '2px solid transparent', 
                            borderTop: '2px solid white', 
                            borderRadius: '50%', 
                            animation: 'spin 1s linear infinite' 
                          }}></div>
                          Creating Booking...
                        </>
                      ) : (
                        <>
                          <User size={screenSize.isMobile ? 14 : 16} />
                          Create Booking
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      style={{
                        padding: screenSize.isMobile ? '12px 20px' : '14px 24px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: screenSize.isMobile ? '13px' : '14px',
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
                      <X size={screenSize.isMobile ? 14 : 16} />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
   
  );
};

export default AddCustomerPage;

