import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, CheckCircle, XCircle, Filter, Clock, CheckSquare, Timer, Video } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { calculateDurationSinceApproval, getDurationStatusColor, getDurationStatusText } from '../utils/durationUtils';
import TopVehicleCamera from './TopVehicleCamera';

const ReservationTable = ({ bookings, onBookingStatusUpdate, onBookingEdit, onBookingCancel, onBookingApprove, onBookingDelete, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallTablet, setIsSmallTablet] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth <= 1440);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('notApproved'); // 'notApproved' or 'approved'
  const [slotPrices, setSlotPrices] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [detectedVehicles, setDetectedVehicles] = useState([]);
  const [showCameraView, setShowCameraView] = useState(false); // For mobile toggle
  const [notification, setNotification] = useState(null); // For auto-approval notifications
  const [confirmationPopup, setConfirmationPopup] = useState(null); // For approval confirmation popup

  // Load slot prices from parking design
  useEffect(() => {
    const loadSlotPrices = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        if (!authUser.uid) return;

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
        }
      } catch (error) {
        console.error('Error loading slot prices:', error);
      }
    };

    loadSlotPrices();
  }, []);

  // Real-time updates for duration calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Recalculate amounts when slot prices change
  useEffect(() => {
    // This will trigger recalculation when slotPrices state changes
  }, [slotPrices, bookings]);

  // Function to calculate amount based on slot price and duration
  const calculateAmount = (booking) => {
    const slotId = booking.slotId || booking.slot;
    const slotPrice = slotPrices[slotId] || 5.00; // Default price if not found
    
    // Get duration in hours
    let durationHours = 1;
    if (booking.duration) {
      // If duration is a string like "2 hours", extract the number
      if (typeof booking.duration === 'string') {
        const match = booking.duration.match(/(\d+)/);
        durationHours = match ? parseInt(match[1]) : 1;
      } else {
        durationHours = parseInt(booking.duration) || 1;
      }
    }
    
    return (slotPrice * durationHours).toFixed(2);
  };
  
  // Enhanced responsive breakpoint handling
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
  
  // Use the enhanced booking data directly
  const enhancedBookings = bookings.map((b) => {
    // Calculate duration since approval for approved bookings
    const durationSinceApproval = (b.status === 'approved' || b.status === 'Approved') && b.approvedAt 
      ? calculateDurationSinceApproval(b.approvedAt, b.checkOutTime)
      : null;

    const enhanced = {
      ...b,
      name: b.customerName || b.driver || 'Unknown',
      vehicleType: b.vehicleType || 'Car',
      vehicleNumber: b.vehicleNumber || 'N/A',
      slot: (() => {
        // Handle both old and new slot formats
        if (b.slotId) {
          // If it's already in the new format (S1, S2, etc.)
          if (typeof b.slotId === 'string' && b.slotId.startsWith('S') && !b.slotId.includes('-')) {
            return b.slotId;
          }
          // If it's a numeric ID, convert to new format
          if (typeof b.slotId === 'number' || (typeof b.slotId === 'string' && /^\d+$/.test(b.slotId))) {
            const slotNum = parseInt(b.slotId);
            return `S${slotNum}`;
          }

          // If it's already a string but not in S format, return as is
          return b.slotId;
        }
        // Fallback if no slotId
        return 'N/A';
      })(),
      duration: b.duration ? `${b.duration} hour${b.duration > 1 ? 's' : ''}` : 'N/A',
      checkIn: b.checkInTime ? new Date(b.checkInTime).toLocaleString() : 'N/A',
      checkOut: b.checkOutTime ? new Date(b.checkOutTime).toLocaleString() : null,
      status: b.status === 'pending' ? 'Pending' : (b.status === 'approved' ? 'Approved' : b.status === 'active' ? 'Active' : b.status === 'completed' ? 'Completed' : b.status === 'cancelled' ? 'Cancelled' : b.status === 'Reserved' ? 'Reserved' : 'Pending'),
      // Calculate amount based on slot price and duration
      calculatedAmount: calculateAmount(b),
      // Add duration since approval
      durationSinceApproval: durationSinceApproval,
      approvedAt: b.approvedAt
    };
    
    return enhanced;
  });

  // Separate bookings by approval status
  const notApprovedBookings = enhancedBookings.filter(booking => 
    booking.status === 'Reserved' || booking.status === 'Pending'
  );
  
  const approvedBookings = enhancedBookings.filter(booking => 
    booking.status === 'Approved' || booking.status === 'Active' || booking.status === 'Completed'
  );

  const statusColors = {
    'Reserved': '#fde68a',
    'Pending': '#fef3c7',
    'Approved': '#dcfce7',
    'Active': '#dbeafe',
    'Completed': '#f3f4f6',
    'Cancelled': '#fee2e2'
  };

  // Filter and sort bookings based on active tab
  const getFilteredBookings = (bookingsList) => {
    return bookingsList
      .filter(booking => {
    const matchesSearch = booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.slot.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicleType = vehicleTypeFilter === 'all' || booking.vehicleType.toLowerCase() === vehicleTypeFilter.toLowerCase();
        const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesVehicleType && matchesStatus;
      })
      .sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'date':
            aValue = new Date(a.checkInTime || 0);
            bValue = new Date(b.checkInTime || 0);
            break;
          case 'name':
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
            break;
          case 'status':
            aValue = (a.status || '').toLowerCase();
            bValue = (b.status || '').toLowerCase();
            break;
          default:
            aValue = a[sortBy] || '';
            bValue = b[sortBy] || '';
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  };

  const currentBookings = activeTab === 'notApproved' ? notApprovedBookings : approvedBookings;
  const filteredBookings = getFilteredBookings(currentBookings);

  // Helper function to normalize license plate text for comparison
  const normalizePlate = (plateText) => {
    if (!plateText) return '';
    // Remove spaces, dashes, dots and convert to uppercase
    return plateText.toString().replace(/[\s\-\.]/g, '').toUpperCase();
  };

  // Handle vehicle detection from camera
  const handleVehicleDetected = (vehicle) => {
    setDetectedVehicles(prev => [vehicle, ...prev.slice(0, 9)]); // Keep last 10 detections
    console.log('Vehicle detected:', vehicle);
    
    // Check if license plate matches any not approved reservations
    if (vehicle.licensePlate) {
      console.log('Detected license plate:', vehicle.licensePlate);
      
      const normalizedDetectedPlate = normalizePlate(vehicle.licensePlate);
      console.log('Normalized detected plate:', normalizedDetectedPlate);
      
      console.log('Checking against not approved bookings:', notApprovedBookings.length);
      
      // Find matching booking with normalized comparison
      const matchingBooking = notApprovedBookings.find(booking => {
        const normalizedBookingPlate = normalizePlate(booking.vehicleNumber);
        console.log(`Comparing: "${normalizedBookingPlate}" with "${normalizedDetectedPlate}"`);
        return normalizedBookingPlate === normalizedDetectedPlate;
      });
      
      if (matchingBooking) {
        console.log('License plate matched with pending reservation:', matchingBooking);
        
        try {
          // Show confirmation popup instead of auto-approving
          setConfirmationPopup({
            plateNumber: vehicle.licensePlate,
            bookingId: matchingBooking.id,
            customerName: matchingBooking.name,
            slot: matchingBooking.slot,
            timestamp: new Date()
          });
          
        } catch (error) {
          console.error('Error while setting up confirmation popup:', error);
        }
      } else {
        console.log('No matching reservation found for this license plate');
      }
    }
  };


  // Enhanced responsive styles for all screen sizes
  const getResponsiveValue = (mobile, smallTablet, tablet, large, desktop) => {
    if (isMobile) return mobile;
    if (isSmallTablet) return smallTablet;
    if (isTablet) return tablet;
    if (isLargeScreen) return large;
    return desktop;
  };

  const containerStyle = {
    margin: getResponsiveValue('2px 4px', '4px 8px', '5px 12px', '5px 0 5px 15px', '5px 0 5px 15px'),
    padding: getResponsiveValue(4, 8, 12, 16, 16),
    maxWidth: '100%',
    overflowX: 'hidden',
    paddingTop: getResponsiveValue(4, 6, 8, 10, 12)
  };

  const titleStyle = {
    fontSize: getResponsiveValue(18, 20, 22, 24, 24),
    fontWeight: 700,
    marginBottom: getResponsiveValue(12, 16, 20, 24, 24),
    color: '#111827'
  };

  const tabContainerStyle = {
    display: 'flex',
    gap: getResponsiveValue(4, 6, 8, 8, 8),
    marginBottom: getResponsiveValue(16, 20, 24, 28, 28),
    borderBottom: '1px solid #e5e7eb',
    overflowX: 'auto'
  };

  const tabButtonStyle = (isActive) => ({
    padding: getResponsiveValue('10px 16px', '12px 20px', '14px 24px', '14px 24px', '14px 24px'),
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: getResponsiveValue(13, 14, 15, 16, 16),
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#2563eb' : '#6b7280',
    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(6, 8, 10, 12, 12),
    transition: 'all 0.2s',
    minWidth: 'fit-content'
  });

  const tabBadgeStyle = {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: getResponsiveValue('2px 6px', '3px 8px', '4px 10px', '4px 10px', '4px 10px'),
    borderRadius: '12px',
    fontSize: getResponsiveValue(10, 11, 12, 12, 12),
    fontWeight: 600,
    minWidth: getResponsiveValue(20, 24, 28, 28, 28),
    textAlign: 'center'
  };

  const filterContainerStyle = {
    display: 'flex',
    flexDirection: getResponsiveValue('column', 'column', 'row', 'row', 'row'),
    gap: getResponsiveValue(8, 10, 12, 16, 16),
    marginBottom: getResponsiveValue(12, 16, 20, 24, 24),
    flexWrap: 'wrap',
    alignItems: getResponsiveValue('stretch', 'stretch', 'center', 'center', 'center')
  };

  const searchContainerStyle = {
    position: 'relative',
    flex: getResponsiveValue('1', '1', '1', '1', '1')
  };

  const searchInputStyle = {
    padding: getResponsiveValue('8px 12px 8px 36px', '10px 12px 10px 40px', '8px 12px 8px 40px', '8px 12px 8px 40px', '8px 12px 8px 40px'),
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: getResponsiveValue(13, 14, 14, 14, 14),
    width: getResponsiveValue('100%', '100%', 300, 300, 300),
    outline: 'none'
  };

  const selectStyle = {
    padding: getResponsiveValue('8px 10px', '10px 12px', '8px 12px', '8px 12px', '8px 12px'),
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: getResponsiveValue(13, 14, 14, 14, 14),
    outline: 'none',
    backgroundColor: 'white',
    minWidth: getResponsiveValue('auto', 'auto', 120, 120, 120),
    flex: getResponsiveValue('1', '1', 'none', 'none', 'none')
  };



  const tableContainerStyle = {
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
    overflow: 'hidden'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: getResponsiveValue(600, 700, 800, 'auto', 'auto')
  };

  const thStyle = {
    padding: getResponsiveValue('8px 6px', '10px 8px', '12px 8px', '16px 12px', '16px 12px'),
    textAlign: 'left',
    fontWeight: 600,
    fontSize: getResponsiveValue(11, 12, 12, 14, 14),
    color: '#374151',
    whiteSpace: 'nowrap'
  };

  const tdStyle = {
    padding: getResponsiveValue('8px 6px', '10px 8px', '12px 8px', '16px 12px', '16px 12px'),
    fontSize: getResponsiveValue(11, 12, 12, 14, 14),
    color: '#374151',
    whiteSpace: 'nowrap'
  };

  const statusBadgeStyle = (status) => ({
    padding: getResponsiveValue('3px 6px', '4px 8px', '4px 8px', '4px 8px', '4px 8px'),
    borderRadius: '12px',
    fontSize: getResponsiveValue(9, 10, 12, 12, 12),
    fontWeight: '500',
    backgroundColor: statusColors[status] || '#f3f4f6',
    color: '#374151',
    display: 'inline-block',
    minWidth: getResponsiveValue(50, 60, 70, 70, 70),
    textAlign: 'center'
  });

  const actionButtonStyle = {
    padding: getResponsiveValue('4px 6px', '6px 8px', '4px 8px', '4px 8px', '4px 8px'),
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: getResponsiveValue(10, 11, 12, 12, 12),
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(2, 4, 4, 4, 4),
    transition: 'background-color 0.2s'
  };

  // Enhanced mobile card view for all small screens
  const renderMobileCard = (booking, index) => (
    <div key={booking.id} style={{
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: getResponsiveValue(12, 16, 16, 16, 16),
      marginBottom: getResponsiveValue(8, 12, 12, 12, 12),
      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: getResponsiveValue(8, 12, 12, 12, 12),
        flexDirection: getResponsiveValue('column', 'row', 'row', 'row', 'row'),
        gap: getResponsiveValue(8, 0, 0, 0, 0)
      }}>
        <div>
          <h3 style={{ 
            fontSize: getResponsiveValue(14, 16, 16, 16, 16), 
            fontWeight: 600, 
            margin: '0 0 4px 0', 
            color: '#111827' 
          }}>
            {booking.name}
          </h3>
          <p style={{ 
            fontSize: getResponsiveValue(12, 14, 14, 14, 14), 
            color: '#6b7280', 
            margin: 0 
          }}>
            {booking.vehicleNumber} • {booking.vehicleType}
          </p>
        </div>
        <span style={statusBadgeStyle(booking.status)}>
          {booking.status}
        </span>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: getResponsiveValue('1fr 1fr', '1fr 1fr', '1fr 1fr 1fr', '1fr 1fr 1fr', '1fr 1fr 1fr'), 
        gap: getResponsiveValue(6, 8, 8, 8, 8), 
        marginBottom: getResponsiveValue(8, 12, 12, 12, 12) 
      }}>
        <div>
          <p style={{ fontSize: getResponsiveValue(10, 12, 12, 12, 12), color: '#6b7280', margin: '0 0 2px 0' }}>Slot ID</p>
          <p style={{ fontSize: getResponsiveValue(12, 14, 14, 14, 14), fontWeight: 500, margin: 0 }}>{booking.slot}</p>
        </div>
        <div>
          <p style={{ fontSize: getResponsiveValue(10, 12, 12, 12, 12), color: '#6b7280', margin: '0 0 2px 0' }}>Duration</p>
          <p style={{ fontSize: getResponsiveValue(12, 14, 14, 14, 14), margin: 0 }}>{booking.duration}</p>
        </div>
        <div>
          <p style={{ fontSize: getResponsiveValue(10, 12, 12, 12, 12), color: '#6b7280', margin: '0 0 2px 0' }}>Amount</p>
          <p style={{ 
            fontSize: getResponsiveValue(12, 14, 14, 14, 14), 
            fontWeight: '600', 
            color: '#059669',
            margin: 0 
          }}>Lkr {booking.calculatedAmount || '0.00'}</p>
        </div>
        <div>
          <p style={{ fontSize: getResponsiveValue(10, 12, 12, 12, 12), color: '#6b7280', margin: '0 0 2px 0' }}>Check-In</p>
          <p style={{ fontSize: getResponsiveValue(10, 12, 12, 12, 12), margin: 0 }}>{booking.checkIn}</p>
        </div>
        <div>
          <p style={{ fontSize: getResponsiveValue(10, 12, 12, 12, 12), color: '#6b7280', margin: '0 0 2px 0' }}>Check-Out</p>
          <p style={{ fontSize: getResponsiveValue(10, 12, 12, 12, 12), margin: 0 }}>{booking.checkOut || 'N/A'}</p>
        </div>
        {activeTab === 'approved' && booking.durationSinceApproval && (
          <div>
            <p style={{ fontSize: getResponsiveValue(10, 12, 12, 12, 12), color: '#6b7280', margin: '0 0 2px 0' }}>Time Since Approval</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Timer size={getResponsiveValue(10, 12, 12, 12, 12)} 
                     style={{ color: getDurationStatusColor(booking.durationSinceApproval, booking.duration) }} />
              <p style={{ 
                fontSize: getResponsiveValue(10, 12, 12, 12, 12), 
                margin: 0,
                color: getDurationStatusColor(booking.durationSinceApproval, booking.duration),
                fontWeight: '600'
              }}>
                {booking.durationSinceApproval.formatted}
              </p>
            </div>
            <p style={{ 
              fontSize: getResponsiveValue(9, 10, 10, 11, 11), 
              margin: '2px 0 0 0',
              color: '#6b7280'
            }}>
              {getDurationStatusText(booking.durationSinceApproval, booking.duration)}
            </p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: getResponsiveValue(4, 6, 8, 8, 8), 
        flexWrap: 'wrap',
        justifyContent: getResponsiveValue('center', 'flex-start', 'flex-start', 'flex-start', 'flex-start')
      }}>
        {(booking.status === 'Reserved' || booking.status === 'Pending') && (
          <button
            onClick={() => onBookingApprove && onBookingApprove(booking.id)}
            style={{ ...actionButtonStyle, background: '#10b981', color: 'white' }}
            title="Approve booking"
          >
            <CheckCircle size={getResponsiveValue(10, 12, 12, 12, 12)} />
            {getResponsiveValue('Approve', 'Approve', 'Approve', 'Approve', 'Approve')}
          </button>
        )}
        {booking.status === 'Approved' && (
          <button
            disabled
            style={{ ...actionButtonStyle, background: '#9ca3af', color: 'white', cursor: 'not-allowed' }}
            title="Already approved"
          >
            <CheckCircle size={getResponsiveValue(10, 12, 12, 12, 12)} />
            {getResponsiveValue('Approved', 'Approved', 'Approved', 'Approved', 'Approved')}
          </button>
        )}
        <button
          onClick={() => onBookingEdit && onBookingEdit(booking)}
          style={{ ...actionButtonStyle, background: '#3b82f6', color: 'white' }}
          title="Edit booking"
        >
          <Edit size={getResponsiveValue(10, 12, 12, 12, 12)} />
          {getResponsiveValue('Edit', 'Edit', 'Edit', 'Edit', 'Edit')}
        </button>
        <button
          onClick={() => onBookingCancel && onBookingCancel(booking.id)}
          style={{ ...actionButtonStyle, background: '#ef4444', color: 'white' }}
          title="Cancel booking"
        >
          <XCircle size={getResponsiveValue(10, 12, 12, 12, 12)} />
          {getResponsiveValue('Cancel', 'Cancel', 'Cancel', 'Cancel', 'Cancel')}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          fontSize: getResponsiveValue(13, 14, 16, 16, 16) 
        }}>
          Loading reservations...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      
      {/* Approval Confirmation Popup with Overlay */}
      {confirmationPopup && (
        <>
          {/* Semi-transparent overlay */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1999
          }} onClick={() => setConfirmationPopup(null)} />
          
          {/* Popup dialog */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 2000,
            maxWidth: '400px',
            width: '90%',
          }}>
            <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px',
            fontWeight: 700,
            fontSize: '18px',
            color: '#1f2937'
          }}>
            <CheckCircle size={24} color="#10b981" />
            License Plate Matched
          </div>
          <div style={{
            fontSize: '15px',
            color: '#374151',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '8px 0' }}>A vehicle with matching license plate has been detected:</p>
            <p style={{ margin: '12px 0', fontWeight: 600, fontSize: '16px', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
              <span style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>License Plate:</span>
              {confirmationPopup.plateNumber}
            </p>
            <p style={{ margin: '8px 0' }}><strong>Customer:</strong> {confirmationPopup.customerName}</p>
            <p style={{ margin: '8px 0' }}><strong>Slot:</strong> {confirmationPopup.slot}</p>
            <p style={{ margin: '12px 0 8px 0' }}>Do you want to approve this reservation?</p>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '16px'
          }}>
            <button 
              onClick={() => setConfirmationPopup(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                // Call approve function
                if (typeof onBookingApprove === 'function' && confirmationPopup.bookingId) {
                  onBookingApprove(confirmationPopup.bookingId);
                  
                  // Show success notification
                  setNotification({
                    plateNumber: confirmationPopup.plateNumber,
                    bookingId: confirmationPopup.bookingId,
                    customerName: confirmationPopup.customerName,
                    slot: confirmationPopup.slot,
                    timestamp: new Date()
                  });
                  
                  // Clear notification after 5 seconds
                  setTimeout(() => {
                    setNotification(null);
                  }, 5000);
                }
                setConfirmationPopup(null);
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #10b981',
                borderRadius: '6px',
                backgroundColor: '#10b981',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Approve Reservation
            </button>
          </div>
          </div>
        </>
      )}
      
      {/* Notification for Approved Reservation */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#dcfce7',
          border: '1px solid #86efac',
          borderLeft: '4px solid #10b981',
          borderRadius: '6px',
          padding: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxWidth: '400px',
          animation: 'fadeInRight 0.3s ease-out forwards',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '8px',
            fontWeight: 600,
            fontSize: '16px',
            color: '#065f46'
          }}>
            <CheckCircle size={20} />
            Reservation Approved
          </div>
          <div style={{
            fontSize: '14px',
            color: '#065f46'
          }}>
            <p style={{ margin: '4px 0' }}><strong>Plate Number:</strong> {notification.plateNumber}</p>
            <p style={{ margin: '4px 0' }}><strong>Customer:</strong> {notification.customerName}</p>
            <p style={{ margin: '4px 0' }}><strong>Slot:</strong> {notification.slot}</p>
          </div>
        </div>
      )}
      
      {/* Top Camera Section */}
      <div style={{ 
        marginBottom: getResponsiveValue(16, 20, 24, 28, 28),
        display: isMobile ? (showCameraView ? 'block' : 'none') : 'block'
      }}>
        <TopVehicleCamera onVehicleDetected={handleVehicleDetected} />
      </div>

      {/* Mobile Camera Toggle Button */}
      {isMobile && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: getResponsiveValue(16, 20, 24, 28, 28)
        }}>
          <button
            onClick={() => setShowCameraView(!showCameraView)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: showCameraView ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            <Video size={16} />
            <span>{showCameraView ? 'Hide Camera' : 'Show Camera'}</span>
          </button>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div style={tabContainerStyle}>
        <button
          style={tabButtonStyle(activeTab === 'notApproved')}
          onClick={() => setActiveTab('notApproved')}
        >
          <Clock size={getResponsiveValue(16, 18, 20, 20, 20)} />
          Not Approved
          <span style={tabBadgeStyle}>{notApprovedBookings.length}</span>
        </button>
        <button
          style={tabButtonStyle(activeTab === 'approved')}
          onClick={() => setActiveTab('approved')}
        >
          <CheckSquare size={getResponsiveValue(16, 18, 20, 20, 20)} />
          Approved
          <span style={tabBadgeStyle}>{approvedBookings.length}</span>
        </button>
      </div>
      
      {/* Filters and Search */}
      <div style={filterContainerStyle}>
        <div style={searchContainerStyle}>
          <Search size={getResponsiveValue(14, 16, 16, 16, 16)} style={{ 
            position: 'absolute', 
            left: getResponsiveValue(10, 12, 12, 12, 12), 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            placeholder="Search by name, vehicle number, or slot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        
        <select
          value={vehicleTypeFilter}
          onChange={(e) => setVehicleTypeFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Vehicle Types</option>
          <option value="car">Car</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="truck">Truck</option>
          <option value="suv">SUV</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Status</option>
          {activeTab === 'notApproved' ? (
            <>
              <option value="reserved">Reserved</option>
              <option value="pending">Pending</option>
            </>
          ) : (
            <>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </>
          )}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={selectStyle}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
        </select>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: getResponsiveValue('8px 10px', '10px 12px', '10px 12px', '10px 12px', '10px 12px'),
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: getResponsiveValue(12, 14, 14, 14, 14),
            minWidth: getResponsiveValue('auto', 'auto', 'auto', 'auto', 'auto'),
            flex: getResponsiveValue('1', '1', 'none', 'none', 'none')
          }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Results Count and Detection Summary */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getResponsiveValue(12, 16, 16, 16, 16),
        flexWrap: 'wrap',
        gap: getResponsiveValue(8, 12, 12, 12, 12)
      }}>
        {/* <div style={{ 
          fontSize: getResponsiveValue(11, 12, 14, 14, 14), 
          color: '#6b7280' 
        }}>
          Showing {filteredBookings.length} of {currentBookings.length} reservation(s)
        </div> */}
        
        {detectedVehicles.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: getResponsiveValue(6, 8, 8, 8, 8),
            padding: getResponsiveValue('6px 10px', '8px 12px', '8px 12px', '8px 12px', '8px 12px'),
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            fontSize: getResponsiveValue(11, 12, 12, 12, 12),
            color: '#0369a1'
          }}>
            <Video size={getResponsiveValue(12, 14, 14, 14, 14)} />
            <span>{detectedVehicles.length} vehicle(s) detected today</span>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredBookings.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          padding: getResponsiveValue(30, 40, 50, 60, 60),
          fontSize: getResponsiveValue(13, 14, 16, 16, 16)
        }}>
          {currentBookings.length === 0 
            ? `No ${activeTab === 'notApproved' ? 'pending' : 'approved'} reservations found.` 
            : 'No reservations match your search criteria.'}
        </div>
      ) : (
        <div style={tableContainerStyle}>
          {isSmallTablet ? (
            // Mobile and small tablet card view
            <div style={{ padding: getResponsiveValue(12, 16, 16, 16, 16) }}>
              {filteredBookings.map((booking, index) => renderMobileCard(booking, index))}
            </div>
          ) : (
            // Desktop table view with horizontal scrolling
          <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Vehicle Type</th>
                    <th style={thStyle}>Vehicle Number</th>
                    <th style={thStyle}>Slot ID</th>
                    <th style={thStyle}>Duration</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Check-In & Out</th>
                    <th style={thStyle}>Status</th>
                    {activeTab === 'approved' && <th style={thStyle}>Time Since Approval</th>}
                    <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, idx) => (
                    <tr key={booking.id} style={{ 
                      borderBottom: '1px solid #f3f4f6', 
                      backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                      ':hover': { backgroundColor: '#f9fafb' }
                    }}>
                      <td style={tdStyle}>{booking.name}</td>
                      <td style={tdStyle}>{booking.vehicleType}</td>
                      <td style={tdStyle}>{booking.vehicleNumber}</td>
                      <td style={tdStyle}>{booking.slot}</td>
                      <td style={tdStyle}>{booking.duration}</td>
                      <td style={tdStyle}>
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#059669',
                          fontSize: getResponsiveValue(11, 12, 12, 14, 14)
                        }}>
                          Lkr {booking.calculatedAmount || '0.00'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                      <div>{booking.checkIn}</div>
                        {booking.checkOut && <div style={{ color: '#6b7280', fontSize: getResponsiveValue(10, 11, 12, 12, 12) }}>{booking.checkOut}</div>}
                    </td>
                      <td style={tdStyle}>
                        <span style={statusBadgeStyle(booking.status)}>
                          {booking.status}
                        </span>
                    </td>
                    {activeTab === 'approved' && (
                      <td style={tdStyle}>
                        {booking.durationSinceApproval ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Timer size={getResponsiveValue(12, 14, 14, 14, 14)} 
                                   style={{ color: getDurationStatusColor(booking.durationSinceApproval, booking.duration) }} />
                            <div>
                              <div style={{ 
                                fontSize: getResponsiveValue(11, 12, 12, 13, 13),
                                fontWeight: '600',
                                color: getDurationStatusColor(booking.durationSinceApproval, booking.duration)
                              }}>
                                {booking.durationSinceApproval.formatted}
                              </div>
                              <div style={{ 
                                fontSize: getResponsiveValue(9, 10, 10, 11, 11),
                                color: '#6b7280'
                              }}>
                                {getDurationStatusText(booking.durationSinceApproval, booking.duration)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: getResponsiveValue(11, 12, 12, 13, 13) }}>
                            N/A
                          </span>
                        )}
                      </td>
                    )}
                      <td style={tdStyle}>
                        <div style={{ 
                          display: 'flex', 
                          gap: getResponsiveValue(4, 6, 8, 8, 8), 
                          flexWrap: 'wrap' 
                        }}>
                        {(booking.status === 'Reserved' || booking.status === 'Pending') && (
                          <button
                            onClick={() => onBookingApprove && onBookingApprove(booking.id)}
                              style={{ ...actionButtonStyle, background: '#10b981', color: 'white' }}
                            title="Approve booking"
                          >
                              <CheckCircle size={getResponsiveValue(10, 12, 12, 12, 12)} />
                            Approve
                          </button>
                        )}
                        {booking.status === 'Approved' && (
                          <button
                            disabled
                              style={{ ...actionButtonStyle, background: '#9ca3af', color: 'white', cursor: 'not-allowed' }}
                            title="Already approved"
                          >
                              <CheckCircle size={getResponsiveValue(10, 12, 12, 12, 12)} />
                            Approved
                          </button>
                        )}
                        <button
                          onClick={() => onBookingEdit && onBookingEdit(booking)}
                            style={{ ...actionButtonStyle, background: '#3b82f6', color: 'white' }}
                          title="Edit booking"
                        >
                            <Edit size={getResponsiveValue(10, 12, 12, 12, 12)} />
                          Edit
                        </button>
                        <button
                          onClick={() => onBookingCancel && onBookingCancel(booking.id)}
                            style={{ ...actionButtonStyle, background: '#ef4444', color: 'white' }}
                          title="Cancel booking"
                        >
                            <XCircle size={getResponsiveValue(10, 12, 12, 12, 12)} />
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationTable;
