import React from 'react';
import styles from '../styles/styles';

const ParkingSlotVisual = ({ slot, onClick, flipped = false, showRoad = true }) => {
  const getSlotColor = (status) => {
    switch(status) {
      case 'available': return '#10b981';
      case 'occupied': return '#ef4444';
      case 'reserved': return '#f59e0b';
      default: return '#ffffff';
    }
  };

  const slotColor = getSlotColor(slot.status);

  return (
    <div 
      style={{
        ...styles.parkingSlot,
        position: 'relative'
      }}
      onClick={onClick}
      onMouseOver={(e) => {
        const rectangle = e.currentTarget.querySelector('.slot-rectangle');
        if (rectangle) {
          rectangle.style.backgroundColor = '#60a5fa';
          rectangle.style.borderColor = '#3b82f6';
        }
      }}
      onMouseOut={(e) => {
        const rectangle = e.currentTarget.querySelector('.slot-rectangle');
        if (rectangle) {
          rectangle.style.backgroundColor = slotColor;
          rectangle.style.borderColor = slotColor;
        }
      }}
    >
      {/* Parking Slot Container */}
      <div style={{ 
        display: 'flex', 
        flexDirection: flipped ? 'column-reverse' : 'column',
        alignItems: 'center',
        gap: '2px',
        position: 'relative'
      }}>
        
        {/* Parking Space Rectangle */}
        <div 
          className="slot-rectangle"
          style={{ 
            width: '60px',
            height: '90px',
            backgroundColor: slotColor,
            border: `3px solid ${slotColor}`,
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            position: 'relative',
            padding: '4px'
          }}
        >
          {/* Parking lines (top and bottom) */}
          <div style={{
            width: '100%',
            height: '3px',
            backgroundColor: '#ffffff',
            opacity: 0.8,
            borderRadius: '1px'
          }} />
          
          {/* Slot content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            width: '100%',
            height: '100%',
            justifyContent: 'center'
          }}>
            {/* Slot ID */}
            <div style={{
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              marginBottom: '2px'
            }}>
              {slot.id}
            </div>
            
            {/* Vehicle Information - only show if slot is occupied or reserved */}
            {(slot.status === 'occupied' || slot.status === 'reserved') && slot.vehicle ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                width: '100%'
              }}>
                {/* Vehicle Number */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '1px 3px',
                  borderRadius: '2px',
                  textAlign: 'center',
                  maxWidth: '50px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {slot.vehicle.number}
                </div>
                
                {/* Vehicle Model */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '7px',
                  fontWeight: '500',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  padding: '1px 2px',
                  borderRadius: '2px',
                  textAlign: 'center',
                  maxWidth: '50px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {slot.vehicle.model}
                </div>
                
                {/* Vehicle Category */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '7px',
                  fontWeight: '500',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  padding: '1px 2px',
                  borderRadius: '2px',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  {slot.vehicle.category}
                </div>
                
                {/* Parking Hours */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '7px',
                  fontWeight: '500',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  padding: '1px 2px',
                  borderRadius: '2px',
                  textAlign: 'center'
                }}>
                  {slot.vehicle.hours}h
                </div>
              </div>
            ) : (
              /* Status indicator dot for available slots */
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                opacity: 0.9,
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                marginTop: '4px'
              }} />
            )}
          </div>
          
          {/* Parking lines (bottom) */}
          <div style={{
            width: '100%',
            height: '3px',
            backgroundColor: '#ffffff',
            opacity: 0.8,
            borderRadius: '1px'
          }} />
        </div>

        {/* Price indicator (small badge) */}
        {slot.price && (
          <div style={{
            position: 'absolute',
            top: '5px',
            right: '-8px',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            fontSize: '9px',
            padding: '2px 4px',
            borderRadius: '4px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 10
          }}>
            ${slot.price}/h
          </div>
        )}

        {/* Reserved/Occupied indicator */}
        {(slot.status === 'occupied' || slot.status === 'reserved') && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40px',
            height: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#ffffff',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            zIndex: 5
          }}>
            {slot.status === 'occupied' ? 'BUSY' : 'RSVD'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingSlotVisual;