import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditBookingModal = ({ booking, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    slotId: '',
    customerName: '',
    phoneNumber: '',
    vehicleNumber: '',
    vehicleType: 'car',
    duration: 1,
    startDate: '',
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        slotId: booking.slotId || '',
        customerName: booking.customerName || '',
        phoneNumber: booking.phoneNumber || '',
        vehicleNumber: booking.vehicleNumber || '',
        vehicleType: booking.vehicleType || 'car',
        duration: booking.duration || 1,
        startDate: booking.startDate || '',
        endDate: booking.endDate || '',
        notes: booking.notes || ''
      });
    }
  }, [booking]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate slot number
    if (!formData.slotId || !formData.slotId.match(/^S\d+$/)) {
      alert('Please select a valid slot number.');
      return;
    }
    
    // Validate required fields
    if (!formData.customerName.trim() || !formData.phoneNumber.trim() || !formData.vehicleNumber.trim()) {
      alert('Please fill in all required fields (Customer Name, Phone Number, Vehicle Number).');
      return;
    }
    
    try {
      await onSave(booking.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  if (!isOpen || !booking) return null;

  return (
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
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            Edit Booking Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#374151' }}>
            Booking ID: {booking.id}
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
            Current Slot: {booking.slotId}
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Status: {booking.status}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Slot Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Slot Number *
              </label>
              <select
                required
                value={formData.slotId}
                onChange={(e) => handleInputChange('slotId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select a slot</option>
                {/* All Slots */}
                {Array.from({length: 50}, (_, i) => i + 1).map(num => (
                  <option key={`S${num}`} value={`S${num}`}>S{num}</option>
                ))}
              </select>
            </div>



            {/* Customer Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter customer full name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter phone number"
              />
            </div>

            {/* Vehicle Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Vehicle Number *
              </label>
              <input
                type="text"
                required
                value={formData.vehicleNumber}
                onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter vehicle registration number"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Date Range */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Date Range
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Any additional notes..."
              />
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', gridColumn: '1 / -1' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px 24px',
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
                Update Booking
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
