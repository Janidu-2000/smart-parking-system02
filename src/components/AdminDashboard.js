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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallTablet, setIsSmallTablet] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth <= 1440);
  const navigate = useNavigate();

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

  // Responsive helper function
  const getResponsiveValue = (mobile, smallTablet, tablet, large, desktop) => {
    if (isMobile) return mobile;
    if (isSmallTablet) return smallTablet;
    if (isTablet) return tablet;
    if (isLargeScreen) return large;
    return desktop;
  };

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
    margin: getResponsiveValue('0', '10px', '15px 12px', '20px 0 40px 10px', '20px 0 40px 10px'),
    padding: getResponsiveValue(8, 12, 16, 24, 24),
    maxWidth: '100%',
    overflowX: 'hidden',
    minHeight: getResponsiveValue('calc(100vh - 60px)', 'auto', 'auto', 'auto', 'auto'), // Account for mobile top bar
    boxSizing: 'border-box'
  };

  const titleStyle = {
    fontSize: getResponsiveValue(16, 18, 20, 24, 24),
    fontWeight: 700,
    marginBottom: getResponsiveValue(12, 16, 20, 24, 24),
    color: '#111827',
    textAlign: getResponsiveValue('center', 'left', 'left', 'left', 'left'),
    padding: getResponsiveValue('0 8px', '0', '0', '0', '0')
  };

  const analyticsGridStyle = {
    display: 'grid',
    gridTemplateColumns: getResponsiveValue(
      '1fr', // Mobile: single column
      '1fr', // Small tablet: single column for better readability
      'repeat(2, 1fr)', // Tablet: 2 columns
      'repeat(3, 1fr)', // Large screen: 3 columns (better for 5 cards)
      'repeat(5, 1fr)' // Desktop: 5 columns
    ),
    gap: getResponsiveValue(8, 12, 16, 24, 24),
    marginBottom: getResponsiveValue(16, 20, 24, 32, 32),
    padding: getResponsiveValue('0 8px', '0', '0', '0', '0'),
    width: '100%',
    boxSizing: 'border-box'
  };

  const analyticsCardStyle = {
    background: '#fff',
    borderRadius: getResponsiveValue(6, 8, 10, 12, 12),
    padding: getResponsiveValue(12, 16, 20, 24, 24),
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    width: '100%',
    minHeight: getResponsiveValue(80, 90, 100, 'auto', 'auto'),
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
    fontSize: getResponsiveValue(11, 12, 13, 14, 14),
    color: '#6b7280',
    margin: '0 0 4px 0',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: getResponsiveValue('60px', '80px', '100px', '120px', '120px')
  };

  const analyticsCardNumberStyle = {
    fontSize: getResponsiveValue(18, 20, 24, 32, 32),
    fontWeight: '700',
    margin: 0,
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: getResponsiveValue('60px', '80px', '100px', '120px', '120px')
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
    marginLeft: getResponsiveValue(0, 0, 240, 240, 240),
    transition: 'margin-left 0.2s',
    width: getResponsiveValue('100%', '100%', 'calc(100% - 240px)', 'calc(100% - 240px)', 'calc(100% - 240px)'),
    paddingTop: getResponsiveValue(60, 0, 0, 0, 0), // Add top padding for mobile to account for fixed sidebar
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
            <MapPin size={getResponsiveValue(20, 24, 28, 32, 32)} color="#3b82f6" style={{ flexShrink: 0 }} />
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
            <MapPin size={getResponsiveValue(20, 24, 28, 32, 32)} color="#10b981" style={{ flexShrink: 0 }} />
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
            <Car size={getResponsiveValue(20, 24, 28, 32, 32)} color="#ef4444" style={{ flexShrink: 0 }} />
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
            <Clock size={getResponsiveValue(20, 24, 28, 32, 32)} color="#f59e0b" style={{ flexShrink: 0 }} />
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
            <BarChart3 size={getResponsiveValue(20, 24, 28, 32, 32)} color="#3b82f6" style={{ flexShrink: 0 }} />
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
        <TopBar pageName={pageNames[activeTab]} />
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