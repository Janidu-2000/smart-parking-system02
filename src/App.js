import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

import AdminDashboard from './components/AdminDashboard';
import DriverInterface from './components/DriverInterface';
import NotificationCenter from './components/NotificationCenter';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { generateMockData, mockAnalytics, mockMessages, mockPayments } from './data/mockData';
import { getBookingsFromFirestore, updateBookingStatusInFirestore, updateBookingDetailsInFirestore, cancelBookingInFirestore, approveBookingInFirestore, deleteBookingFromFirestore } from './services/bookingService';
import { getParkingSlotsWithStatus, refreshSlotStatuses } from './services/slotService';
import { getPaymentsFromFirestore } from './services/paymentService';
import { getMessagesFromFirestore } from './services/messageService';


import AddCustomerPage from './components/AddCustomerPage';
import EditBookingModal from './components/EditBookingModal';
import useParkingDesign from './hooks/useParkingDesign';

const SmartParkingAppContent = () => {
  const navigate = useNavigate();
  const { updateCounts, addNotification } = useNotifications();

  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSlots: 0,
    occupiedSlots: 0,
    availableSlots: 0,
    reservedSlots: 0,
    revenue: 0,
    avgOccupancy: 0
  });
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Get parking design data
  const { elements, canvas, gridSize, loading: designLoading } = useParkingDesign();

  // Calculate analytics from Firebase data
  const calculateAnalytics = (slotsData, bookingsData, paymentsData = []) => {
    const totalSlots = slotsData.length;
    const occupiedSlots = slotsData.filter(slot => slot.status === 'occupied').length;
    const availableSlots = slotsData.filter(slot => slot.status === 'available').length;
    const reservedSlots = slotsData.filter(slot => slot.status === 'reserved').length;
    
    // Calculate revenue from completed payments (Rs.200 per hour)
    const revenue = paymentsData
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + (payment.amount || 0), 0);
    
    const avgOccupancy = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
    
    return {
      totalSlots,
      occupiedSlots,
      availableSlots,
      reservedSlots,
      revenue,
      avgOccupancy
    };
  };

    useEffect(() => {
    // Load slots and bookings from Firestore
    const loadData = async () => {
      try {
        setBookingsLoading(true);
        
        // Check if user is authenticated
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        if (!authUser.email) {
          console.log('No authenticated user found, using empty data');
          setBookings([]);
          setSlots([]);
          setAnalytics({
            totalSlots: 0,
            occupiedSlots: 0,
            availableSlots: 0,
            reservedSlots: 0,
            revenue: 0,
            avgOccupancy: 0
          });
          return;
        }
        
        // Load bookings first
        const firestoreBookings = await getBookingsFromFirestore();
        setBookings(firestoreBookings);
        
        // Load slots with status based on bookings
        const firestoreSlots = await getParkingSlotsWithStatus(authUser?.uid);
        setSlots(firestoreSlots);
        
        // Load payments for the user
        const firestorePayments = await getPaymentsFromFirestore();
        setPayments(firestorePayments);
        
        // Load messages for the user
        const firestoreMessages = await getMessagesFromFirestore();
        setMessages(firestoreMessages);
        
        // Calculate analytics from Firebase data
        const calculatedAnalytics = calculateAnalytics(firestoreSlots, firestoreBookings, firestorePayments);
        setAnalytics(calculatedAnalytics);
        
        // Update notification counts with real data
        const messagesWithReadStatus = firestoreMessages.map(msg => ({ ...msg, read: msg.status === 'read' }));
        updateCounts(firestoreBookings, messagesWithReadStatus, firestorePayments);
        
      } catch (error) {
        console.error('Error loading data:', error);
        setBookings([]);
        setSlots(generateMockData()); // Fallback to mock data
      } finally {
        setBookingsLoading(false);
      }
    };
    
    loadData();
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(async () => {
      try {
        // Check if user is still authenticated
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        if (!authUser.email) {
          return; // Don't refresh if user is not authenticated
        }
        
        const firestoreBookings = await getBookingsFromFirestore();
        setBookings(firestoreBookings);
        
        const firestoreSlots = await getParkingSlotsWithStatus(authUser?.uid);
        setSlots(firestoreSlots);
        
        const firestorePayments = await getPaymentsFromFirestore();
        setPayments(firestorePayments);
        
        // Load messages for the user
        const firestoreMessages = await getMessagesFromFirestore();
        setMessages(firestoreMessages);
        
        // Update analytics with fresh data
        const calculatedAnalytics = calculateAnalytics(firestoreSlots, firestoreBookings, firestorePayments);
        setAnalytics(calculatedAnalytics);
        
        // Update notification counts with real data
        const messagesWithReadStatus = firestoreMessages.map(msg => ({ ...msg, read: msg.status === 'read' }));
        updateCounts(firestoreBookings, messagesWithReadStatus, firestorePayments);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }, 30000);
  
    return () => clearInterval(interval);
  }, []);

  const handleReserveSlot = (slotId, duration) => {
    setSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, status: 'reserved', reservedBy: 'Current User' }
        : slot
    ));
  };

  const handleUpdateSlot = (slotId) => {
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        const statuses = ['available', 'occupied', 'reserved'];
        const currentIndex = statuses.indexOf(slot.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        return { ...slot, status: nextStatus };
      }
      return slot;
    }));
  };

  const refreshBookings = async () => {
    try {
      setBookingsLoading(true);
      const firestoreBookings = await getBookingsFromFirestore();
      setBookings(firestoreBookings);
      
      // Also refresh slots to reflect booking changes
      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      const firestoreSlots = await getParkingSlotsWithStatus(authUser?.uid);
      setSlots(firestoreSlots);
      
      // Refresh payments
      const firestorePayments = await getPaymentsFromFirestore();
      setPayments(firestorePayments);
      
      // Update analytics with fresh data
      const calculatedAnalytics = calculateAnalytics(firestoreSlots, firestoreBookings, firestorePayments);
      setAnalytics(calculatedAnalytics);
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatusInFirestore(bookingId, newStatus);
      await refreshBookings(); // Refresh the list after update
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const handleBookingEdit = (booking) => {
    setSelectedBooking(booking);
    setEditModalOpen(true);
  };

  const handleBookingEditSave = async (bookingId, bookingData) => {
    try {
      await updateBookingDetailsInFirestore(bookingId, bookingData);
      await refreshBookings(); // Refresh the list after update
    } catch (error) {
      console.error('Error updating booking details:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleBookingCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBookingInFirestore(bookingId);
        await refreshBookings(); // Refresh the list after update
        
        // Add notification for cancelled booking
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          addNotification({
            title: "Booking Cancelled",
            message: `${booking.customerName || 'Customer'} - Slot ${booking.slotId} cancelled`,
            type: "reservation"
          });
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleBookingApprove = async (bookingId) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      try {
        await approveBookingInFirestore(bookingId);
        await refreshBookings(); // Refresh the list after update
        
        // Add notification for approved booking
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          addNotification({
            title: "Booking Approved",
            message: `${booking.customerName || 'Customer'} - Slot ${booking.slotId} approved`,
            type: "reservation"
          });
        }
      } catch (error) {
        console.error('Error approving booking:', error);
        alert('Failed to approve booking. Please try again.');
      }
    }
  };

  const handleBookingDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await deleteBookingFromFirestore(bookingId);
        await refreshBookings(); // Refresh the list after delete
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
      }
    }
  };

  const handleRefreshData = async () => {
    try {
      // Check if user is authenticated
      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      if (!authUser.email) {
        alert('Please log in to refresh data.');
        return;
      }
      
      await refreshBookings();
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Failed to refresh data. Please try again.');
    }
  };



  const handleNavigateToSection = (section) => {
    // This will be handled by the AdminDashboard component
    console.log('Navigating to section:', section);
  };

  const unreadCount = 0; // Will be handled by notification context
  const pendingBookingCount = bookings ? bookings.filter(b => b.status === 'pending').length : 0; // Still using 'pending' for count since that's the original status

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem('authUser');
      navigate('/login', { replace: true });
    }
  };



  return (
    <div>
      <AdminDashboard 
        slots={slots}
        bookings={bookings}
        analytics={analytics}
        payments={payments}
        onUpdateSlot={handleUpdateSlot}
        onRefreshData={handleRefreshData}
        designElements={elements}
        canvas={canvas}
        gridSize={gridSize}

        onBookingStatusUpdate={handleBookingStatusUpdate}
        onBookingEdit={handleBookingEdit}
        onBookingCancel={handleBookingCancel}
        onBookingApprove={handleBookingApprove}
        onBookingDelete={handleBookingDelete}
        onLogout={handleLogout}
        messageCount={0}
        pendingBookingCount={pendingBookingCount}
        bookingsLoading={bookingsLoading}
        onOpenDesigner={() => navigate('/designer')}
        messages={messages}
        onNavigateToSection={handleNavigateToSection}
      />

      
      {/* Edit Booking Modal */}
      <EditBookingModal
        booking={selectedBooking}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBooking(null);
        }}
        onSave={handleBookingEditSave}
      />
    </div>
  );
};

const SmartParkingApp = () => {
  return <SmartParkingAppContent />;
};

export default SmartParkingApp;