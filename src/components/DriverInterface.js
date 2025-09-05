import React, { useState } from 'react';
import { CheckCircle, CreditCard } from 'lucide-react';
import styles from '../styles/styles';

const DriverInterface = ({ slots, onReserveSlot }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(1);

  // Filter available slots
  const availableSlots = slots.filter(slot => slot.status === 'available');

  const handleReservation = () => {
    if (selectedSlot) {
      onReserveSlot(selectedSlot.id, duration);
      setSelectedSlot(null);
    }
  };

  const getSlotColor = (status) => {
    switch(status) {
      case 'available': return '#10b981';
      case 'occupied': return '#ef4444';
      case 'reserved': return '#f59e0b';
      default: return '#ffffff';
    }
  };

  return (
    <div style={styles.driverContainer}>
      <div style={styles.driverWrapper}>
        <h1 style={styles.pageTitle}>Find & Reserve Parking</h1>
        
        {/* Search and Filter */}
        <div style={styles.searchPanel}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Duration (hours)</label>
              <select 
                style={styles.input}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 8, 12, 24].map(h => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                style={{ ...styles.button, width: '100%', padding: '12px' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                Search Slots
              </button>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div style={{ ...styles.searchPanel, marginBottom: '32px' }}>
          <h2 style={styles.sectionTitle}>
            Available Parking Slots ({availableSlots.length})
          </h2>
          
          <div style={styles.slotsGrid}>
            {availableSlots.map((slot, index) => {
              const isSelected = selectedSlot?.id === slot.id;
              const nextSlot = availableSlots[index + 1];
              
              return (
                <div key={slot.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Slot */}
                  <div
                    style={{
                      ...styles.slotCard,
                      border: isSelected ? '3px solid #2563eb' : '1px solid #e5e7eb',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSelectedSlot(slot)}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    {/* Slot Status Indicator */}
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getSlotColor(slot.status),
                      marginBottom: '8px'
                    }} />
                    
                    {/* Slot Number */}
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '4px'
                    }}>
                      {slot.id}
                    </div>
                    
                    {/* Price */}
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      ${slot.price}/hr
                    </div>
                    
                    {/* Status */}
                    <div style={{
                      fontSize: '12px',
                      color: '#10b981',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      Available
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reservation Panel */}
        {selectedSlot && (
          <div style={styles.reservationPanel}>
            <div style={styles.reservationHeader}>
              <h3 style={styles.reservationTitle}>Reserve Parking Slot</h3>
              <button
                style={styles.closeButton}
                onClick={() => setSelectedSlot(null)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.reservationContent}>
              <div style={styles.reservationDetails}>
                <div style={styles.detailRow}>
                  <span style={{ fontWeight: '500' }}>Slot:</span>
                  <span style={{ fontWeight: '600', color: '#374151' }}>#{selectedSlot.id}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={{ fontWeight: '500' }}>Price:</span>
                  <span style={{ fontWeight: '600', color: '#374151' }}>${selectedSlot.price}/hour</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={{ fontWeight: '500' }}>Duration:</span>
                  <span style={{ fontWeight: '600', color: '#374151' }}>{duration} hour{duration > 1 ? 's' : ''}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={{ fontWeight: '500' }}>Total:</span>
                  <span style={{ fontWeight: '600', color: '#374151' }}>${(selectedSlot.price * duration).toFixed(2)}</span>
                </div>
              </div>
              
              <div style={styles.reservationActions}>
                <button
                  style={{
                    ...styles.button,
                    backgroundColor: '#10b981',
                    width: '100%',
                    marginBottom: '12px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                  onClick={handleReservation}
                >
                  <CheckCircle size={18} style={{ marginRight: '8px' }} />
                  Reserve Now
                </button>
                
                <button
                  style={{
                    ...styles.button,
                    backgroundColor: '#6b7280',
                    width: '100%'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  <CreditCard size={18} style={{ marginRight: '8px' }} />
                  Pay Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverInterface;