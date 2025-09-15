import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Clock, 
  BarChart3, 
  MapPin, 
  DollarSign,
  Timer
} from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PaymentsPage from './PaymentsPage';
import MessagePage from './MessagePage';
import ReservationTable from './ReservationTable';
import ParkingStatusPage from './ParkingStatusPage';
import SettingsPage from './SettingsPage';
import EditBookingModal from './EditBookingModal';
import AddCustomerPage from './AddCustomerPage';

import { updateBookingStatusInFirestore, deleteBookingFromFirestore } from '../services/bookingService';
import styles from '../styles/styles';
import { useResponsive, getResponsiveStyles, getResponsiveValue } from '../utils/responsive';
import { calculateDurationSinceApproval, getDurationStatusColor } from '../utils/durationUtils';

const AdminDashboard = ({ 
  slots, 
  bookings, 
  analytics, 
  payments,
  onUpdateSlot, 
  onSettings, 
  onRefreshData, 
  designElements = [], 
  canvas, 
  gridSize,
  onGeneratePayments,
  onUpdateVehicleData,
  onBookingStatusUpdate,
  onBookingEdit: onBookingEditProp,
  onBookingCancel: onBookingCancelProp,
  onBookingApprove: onBookingApproveProp,
  onBookingDelete: onBookingDeleteProp,
  onLogout: onLogoutProp,
  messageCount: messageCountProp,
  pendingBookingCount: pendingBookingCountProp,
  bookingsLoading,
  onOpenDesigner: onOpenDesignerProp,
  messages: messagesProp,
  notifications = [],
  onMarkAsRead,
  onNavigateToSection
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingBooking, setEditingBooking] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const screenSize = useResponsive();
  const responsiveStyles = getResponsiveStyles(screenSize);
  const navigate = useNavigate();

  // Real-time updates for duration calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const pageNames = {
    dashboard: 'Dashboard',
    reservations: 'Reservations',
    parking: 'Add Customer',
    payments: 'Payments',
    message: 'Messages',
    settings: 'Settings'
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleNavigateToSection = (section) => {
    if (onNavigateToSection) {
      onNavigateToSection(section);
    } else {
      setActiveTab(section);
    }
  };

  const handleBookingAdded = async () => {
    if (onRefreshData) {
      await onRefreshData();
    }
  };

  const handleLogout = () => {
    if (onLogoutProp) {
      onLogoutProp();
    } else {
      localStorage.removeItem('authUser');
      navigate('/login');
    }
  };

  const handleOpenDesigner = () => {
    if (onOpenDesignerProp) {
      onOpenDesignerProp();
    } else {
      navigate('/designer');
    }
  };

  const handleBookingEdit = (booking) => {
    if (onBookingEditProp) {
      onBookingEditProp(booking);
    } else {
      setEditingBooking(booking);
    }
  };

  const handleBookingCancel = async (bookingId) => {
    if (onBookingCancelProp) {
      onBookingCancelProp(bookingId);
    } else {
      if (window.confirm('Are you sure you want to cancel this booking?')) {
        try {
          await updateBookingStatusInFirestore(bookingId, 'cancelled');
          onRefreshData();
        } catch (error) {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking');
        }
      }
    }
  };

  const handleBookingApprove = async (bookingId) => {
    if (onBookingApproveProp) {
      onBookingApproveProp(bookingId);
    } else {
      try {
        await updateBookingStatusInFirestore(bookingId, 'approved');
        onRefreshData();
      } catch (error) {
        console.error('Error approving booking:', error);
        alert('Failed to approve booking');
      }
    }
  };

  const handleBookingDelete = async (bookingId) => {
    if (onBookingDeleteProp) {
      onBookingDeleteProp(bookingId);
    } else {
      if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        try {
          await deleteBookingFromFirestore(bookingId);
          onRefreshData();
        } catch (error) {
          console.error('Error deleting booking:', error);
          alert('Failed to delete booking');
        }
      }
    }
  };

  const pendingBookingCount = pendingBookingCountProp || bookings?.filter(b => b.status === 'pending').length || 0;
  const messageCount = messageCountProp || (messagesProp ? messagesProp.length : 0);

  // Responsive styles
  const containerStyle = {
    ...responsiveStyles.container,
    minHeight: screenSize.isMobile ? 'calc(100vh - 60px)' : 'auto', // Account for mobile top bar
    boxSizing: 'border-box',
    padding: screenSize.isMobile ? '12px 16px' : '16px 24px'
  };

  const titleStyle = {
    ...responsiveStyles.title,
    textAlign: screenSize.isMobile ? 'center' : 'left',
    padding: screenSize.isMobile ? '0 8px' : '0'
  };

  const analyticsGridStyle = responsiveStyles.analyticsGrid;

  const analyticsCardStyle = {
    ...responsiveStyles.analyticsCard,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    width: '100%',
    minHeight: screenSize.isMobile ? 70 : screenSize.isSmallTablet ? 80 : screenSize.isTablet ? 90 : 100,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden',
    minWidth: screenSize.isMobile ? 120 : screenSize.isSmallTablet ? 140 : screenSize.isTablet ? 160 : 180
  };

  const analyticsCardContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden'
  };

  const analyticsCardTextStyle = {
    ...responsiveStyles.analyticsCardTitle,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: screenSize.isMobile ? '80px' : screenSize.isSmallTablet ? '100px' : screenSize.isTablet ? '120px' : '140px',
    fontSize: screenSize.isMobile ? '11px' : screenSize.isSmallTablet ? '12px' : screenSize.isTablet ? '13px' : '14px'
  };

  const analyticsCardNumberStyle = {
    ...responsiveStyles.analyticsCardNumber,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: screenSize.isMobile ? '80px' : screenSize.isSmallTablet ? '100px' : screenSize.isTablet ? '120px' : '140px',
    fontSize: screenSize.isMobile ? '16px' : screenSize.isSmallTablet ? '18px' : screenSize.isTablet ? '20px' : '22px'
  };

  const mainContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    position: 'relative'
  };

  const contentAreaStyle = {
    flex: 1,
    marginLeft: getResponsiveValue(screenSize, {
      xs: 0,
      sm: 0,
      md: 72,
      lg: 200,
      xl: 220,
      xxl: 240,
      xxxl: 260
    }),
    transition: 'margin-left 0.3s ease',
    width: getResponsiveValue(screenSize, {
      xs: '100%',
      sm: '100%',
      md: 'calc(100% - 72px)',
      lg: 'calc(100% - 200px)',
      xl: 'calc(100% - 220px)',
      xxl: 'calc(100% - 240px)',
      xxxl: 'calc(100% - 260px)'
    }),
    paddingTop: getResponsiveValue(screenSize, {
      xs: 50,
      sm: 52,
      md: 54,
      lg: 52,
      xl: 54,
      xxl: 56,
      xxxl: 58
    }),
    minWidth: 0,
    overflowX: 'hidden',
    position: 'relative',
    zIndex: 1
  };

  const renderDashboard = () => (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Dashboard Overview</h2>
      
      {/* Analytics Cards */}
      <div style={analyticsGridStyle}>
        <div style={analyticsCardStyle}>
          <div style={analyticsCardContentStyle}>
            <div>
              <p style={analyticsCardTextStyle}>Total Slots</p>
              <p style={analyticsCardNumberStyle}>
                {designElements?.filter(element => element.type === 'slot').length || 0}
              </p>
            </div>
            <MapPin size={screenSize.isMobile ? 16 : screenSize.isSmallTablet ? 18 : screenSize.isTablet ? 20 : 22} color="#3b82f6" style={{ flexShrink: 0 }} />
          </div>
        </div>
        
        <div style={analyticsCardStyle}>
          <div style={analyticsCardContentStyle}>
            <div>
              <p style={analyticsCardTextStyle}>Available</p>
              <p style={{ ...analyticsCardNumberStyle, color: '#059669' }}>
                {(() => {
                  const totalSlots = designElements?.filter(element => element.type === 'slot').length || 0;
                  const occupiedSlots = slots?.filter(slot => slot.status === 'occupied').length || 0;
                  const reservedSlots = slots?.filter(slot => slot.status === 'reserved').length || 0;
                  return totalSlots - occupiedSlots - reservedSlots;
                })()}
              </p>
            </div>
            <MapPin size={screenSize.isMobile ? 16 : screenSize.isSmallTablet ? 18 : screenSize.isTablet ? 20 : 22} color="#10b981" style={{ flexShrink: 0 }} />
          </div>
        </div>
        
        <div style={analyticsCardStyle}>
          <div style={analyticsCardContentStyle}>
            <div>
              <p style={analyticsCardTextStyle}>Occupied</p>
              <p style={{ ...analyticsCardNumberStyle, color: '#dc2626' }}>
                {slots?.filter(slot => slot.status === 'occupied').length || 0}
              </p>
            </div>
            <Car size={screenSize.isMobile ? 16 : screenSize.isSmallTablet ? 18 : screenSize.isTablet ? 20 : 22} color="#ef4444" style={{ flexShrink: 0 }} />
          </div>
        </div>
        
        <div style={analyticsCardStyle}>
          <div style={analyticsCardContentStyle}>
            <div>
              <p style={analyticsCardTextStyle}>Reserved</p>
              <p style={{ ...analyticsCardNumberStyle, color: '#f59e0b' }}>
                {slots?.filter(slot => slot.status === 'reserved').length || 0}
              </p>
            </div>
            <Clock size={screenSize.isMobile ? 16 : screenSize.isSmallTablet ? 18 : screenSize.isTablet ? 20 : 22} color="#f59e0b" style={{ flexShrink: 0 }} />
          </div>
        </div>
        
        <div style={analyticsCardStyle}>
          <div style={analyticsCardContentStyle}>
            <div>
              <p style={analyticsCardTextStyle}>Occupancy Rate</p>
              <p style={{ ...analyticsCardNumberStyle, color: '#2563eb' }}>
                {(() => {
                  const totalSlots = designElements?.filter(element => element.type === 'slot').length || 0;
                  const occupiedSlots = slots?.filter(slot => slot.status === 'occupied').length || 0;
                  const reservedSlots = slots?.filter(slot => slot.status === 'reserved').length || 0;
                  const totalUsed = occupiedSlots + reservedSlots;
                  return totalSlots > 0 ? Math.round((totalUsed / totalSlots) * 100) : 0;
                })()}%
              </p>
            </div>
            <BarChart3 size={screenSize.isMobile ? 16 : screenSize.isSmallTablet ? 18 : screenSize.isTablet ? 20 : 22} color="#3b82f6" style={{ flexShrink: 0 }} />
          </div>
        </div>
        
        <div style={analyticsCardStyle}>
          <div style={analyticsCardContentStyle}>
            <div>
              <p style={analyticsCardTextStyle}>Active Bookings</p>
              <p style={{ ...analyticsCardNumberStyle, color: '#7c3aed' }}>
                {bookings?.filter(booking => booking.status === 'approved' || booking.status === 'Approved').length || 0}
              </p>
            </div>
            <Timer size={screenSize.isMobile ? 16 : screenSize.isSmallTablet ? 18 : screenSize.isTablet ? 20 : 22} color="#7c3aed" style={{ flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* Parking Status Section */}
      <ParkingStatusPage 
        slots={slots}
        designElements={designElements}
        canvas={canvas}
        gridSize={gridSize}
        onUpdateSlot={onUpdateSlot}
        onRefreshData={onRefreshData}
      />

      {/* Active Bookings with Duration */}
      {bookings?.filter(booking => booking.status === 'approved' || booking.status === 'Approved').length > 0 && (
        <div style={{
          ...responsiveStyles.analyticsCard,
          marginTop: screenSize.isMobile ? '16px' : '24px',
          padding: screenSize.isMobile ? '16px' : '20px'
        }}>
          <h3 style={{
            ...responsiveStyles.analyticsCardTitle,
            marginBottom: screenSize.isMobile ? '12px' : '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Timer size={screenSize.isMobile ? 16 : 18} color="#7c3aed" />
            Active Bookings - Duration Since Approval
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: screenSize.isMobile ? '1fr' : screenSize.isSmallTablet ? '1fr 1fr' : '1fr 1fr 1fr',
            gap: screenSize.isMobile ? '12px' : '16px'
          }}>
            {bookings
              .filter(booking => booking.status === 'approved' || booking.status === 'Approved')
              .map(booking => {
                const duration = calculateDurationSinceApproval(booking.approvedAt || booking.actualCheckInTime, booking.checkOutTime);
                const statusColor = getDurationStatusColor(duration, booking.duration || 1);
                
                return (
                  <div key={booking.id} style={{
                    padding: screenSize.isMobile ? '12px' : '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${statusColor}`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <p style={{
                          margin: '0 0 4px 0',
                          fontSize: screenSize.isMobile ? '13px' : '14px',
                          fontWeight: '600',
                          color: '#1e293b'
                        }}>
                          {booking.customerName || 'Unknown'}
                        </p>
                        <p style={{
                          margin: '0',
                          fontSize: screenSize.isMobile ? '11px' : '12px',
                          color: '#64748b'
                        }}>
                          Slot {booking.slotId} • {booking.vehicleNumber}
                        </p>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: statusColor,
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: screenSize.isMobile ? '10px' : '11px',
                        fontWeight: '600'
                      }}>
                        {duration.totalHours <= (booking.duration || 1) * 0.8 ? 'On Time' : 
                         duration.totalHours <= (booking.duration || 1) ? 'Approaching' : 'Overtime'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Timer size={screenSize.isMobile ? 12 : 14} style={{ color: statusColor }} />
                      <span style={{
                        fontSize: screenSize.isMobile ? '12px' : '13px',
                        fontWeight: '600',
                        color: statusColor
                      }}>
                        {duration.formatted}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'reservations':
        return (
          <ReservationTable 
            bookings={bookings}
            onBookingStatusUpdate={onRefreshData}
            onBookingEdit={handleBookingEdit}
            onBookingCancel={handleBookingCancel}
            onBookingApprove={handleBookingApprove}
            onBookingDelete={handleBookingDelete}
          />
        );
      case 'parking':
        return (
          <AddCustomerPage 
            slots={slots}
            designElements={designElements}
            canvas={canvas}
            gridSize={gridSize}
            onUpdateSlot={onUpdateSlot}
            onBookingAdded={handleBookingAdded}
            bookings={bookings}
            parkId={JSON.parse(localStorage.getItem('authUser') || '{}').uid}
          />
        );
      case 'payments':
        return (
          <PaymentsPage 
            payments={payments}
            bookings={bookings}
            onRefreshData={onRefreshData}
          />
        );
      case 'message':
        return <MessagePage messages={messagesProp || []} onRefreshData={onRefreshData} />;
      case 'settings':
        return <SettingsPage onOpenDesigner={handleOpenDesigner} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={mainContainerStyle}>
      <Sidebar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        messageCount={messageCount}
        pendingBookingCount={pendingBookingCount}
        onLogout={handleLogout}
      />
      
      <div style={contentAreaStyle}>
        <TopBar 
          pageName={pageNames[activeTab]} 
          onNavigateToSection={handleNavigateToSection}
          currentPath={['Dashboard', pageNames[activeTab]]}
        />
        {renderContent()}
      </div>

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={async (updatedBooking) => {
            try {
              // Handle booking update logic here
              onRefreshData();
              setEditingBooking(null);
            } catch (error) {
              console.error('Error updating booking:', error);
              alert('Failed to update booking');
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;