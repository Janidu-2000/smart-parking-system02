import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Clock, 
  BarChart3, 
  MapPin, 
  DollarSign
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
import { useResponsive, getResponsiveStyles } from '../utils/responsive';

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
  const screenSize = useResponsive();
  const responsiveStyles = getResponsiveStyles(screenSize);
  const navigate = useNavigate();

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
    boxSizing: 'border-box'
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
    minHeight: screenSize.isMobile ? 80 : screenSize.isSmallTablet ? 90 : screenSize.isTablet ? 100 : 'auto',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden'
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
    maxWidth: screenSize.isMobile ? '60px' : screenSize.isSmallTablet ? '80px' : screenSize.isTablet ? '100px' : '120px'
  };

  const analyticsCardNumberStyle = {
    ...responsiveStyles.analyticsCardNumber,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: screenSize.isMobile ? '60px' : screenSize.isSmallTablet ? '80px' : screenSize.isTablet ? '100px' : '120px'
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
    marginLeft: screenSize.isMobile || screenSize.isSmallTablet ? 0 : 240,
    transition: 'margin-left 0.2s',
    width: screenSize.isMobile || screenSize.isSmallTablet ? '100%' : 'calc(100% - 240px)',
    paddingTop: screenSize.isMobile ? 60 : 0, // Add top padding for mobile to account for fixed sidebar
    minWidth: 0, // Prevent flex item from overflowing
    overflowX: 'hidden'
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
            <MapPin size={screenSize.isMobile ? 20 : screenSize.isSmallTablet ? 24 : screenSize.isTablet ? 28 : 32} color="#3b82f6" style={{ flexShrink: 0 }} />
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
            <MapPin size={screenSize.isMobile ? 20 : screenSize.isSmallTablet ? 24 : screenSize.isTablet ? 28 : 32} color="#10b981" style={{ flexShrink: 0 }} />
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
            <Car size={screenSize.isMobile ? 20 : screenSize.isSmallTablet ? 24 : screenSize.isTablet ? 28 : 32} color="#ef4444" style={{ flexShrink: 0 }} />
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
            <Clock size={screenSize.isMobile ? 20 : screenSize.isSmallTablet ? 24 : screenSize.isTablet ? 28 : 32} color="#f59e0b" style={{ flexShrink: 0 }} />
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
            <BarChart3 size={screenSize.isMobile ? 20 : screenSize.isSmallTablet ? 24 : screenSize.isTablet ? 28 : 32} color="#3b82f6" style={{ flexShrink: 0 }} />
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
        <TopBar pageName={pageNames[activeTab]} onNavigateToSection={handleNavigateToSection} />
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