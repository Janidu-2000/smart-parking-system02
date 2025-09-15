import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const [pendingBookingCount, setPendingBookingCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);

  const addNotification = (notification) => {
    try {
      const newNotification = {
        ...notification,
        id: Date.now(),
        time: "Just now",
        read: false,
        important: notification.important || false
      };
      setNotifications(prev => [newNotification, ...prev]);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = (index) => {
    try {
      setNotifications(prev => prev.map((notif, i) => 
        i === index ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = () => {
    try {
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const clearAllNotifications = () => {
    try {
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const toggleMute = (muted) => {
    try {
      const newMutedState = muted !== undefined ? muted : !isMuted;
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleVisibility = (visible) => {
    try {
      const newVisibleState = visible !== undefined ? visible : !isVisible;
      setIsVisible(newVisibleState);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const updateCounts = (bookings = [], messages = [], payments = []) => {
    try {
      const newPendingCount = bookings.filter(b => b.status === 'pending').length;
      const newMessageCount = messages.filter(m => !m.read).length;
      const newPaymentCount = payments.filter(p => p.status === 'pending').length;
      
      // Generate notifications from real data
      const newNotifications = [];
      
      // Add notifications for pending bookings
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      pendingBookings.forEach(booking => {
        newNotifications.push({
          title: "New Reservation Request",
          message: `${booking.customerName || 'Customer'} - ${booking.vehicleNumber || 'Vehicle'} (Slot ${booking.slotId})`,
          time: getTimeAgo(booking.checkInTime || new Date()),
          read: false,
          type: "reservation",
          important: true,
          id: `booking-${booking.id}`
        });
      });
      
      // Add notifications for pending payments
      const pendingPayments = payments.filter(p => p.status === 'pending');
      pendingPayments.forEach(payment => {
        newNotifications.push({
          title: "Payment Pending",
          message: `${payment.driverName || 'Customer'} - Lkr ${payment.amount || 0} (${payment.vehicleNumber || 'Vehicle'})`,
          time: getTimeAgo(payment.date || new Date()),
          read: false,
          type: "payment",
          important: true,
          id: `payment-${payment.id}`
        });
      });
      
      // Add notifications for failed payments
      const failedPayments = payments.filter(p => p.status === 'failed');
      failedPayments.forEach(payment => {
        newNotifications.push({
          title: "Payment Failed",
          message: `${payment.driverName || 'Customer'} - Lkr ${payment.amount || 0} (${payment.vehicleNumber || 'Vehicle'})`,
          time: getTimeAgo(payment.date || new Date()),
          read: false,
          type: "payment",
          important: true,
          id: `failed-${payment.id}`
        });
      });
      
      // Add notifications for new messages
      const unreadMessages = messages.filter(m => !m.read);
      unreadMessages.forEach(message => {
        newNotifications.push({
          title: "New Message",
          message: `${message.fullName || 'Customer'}: ${message.message?.substring(0, 50)}${message.message?.length > 50 ? '...' : ''}`,
          time: getTimeAgo(new Date()),
          read: false,
          type: "message",
          important: false,
          id: `message-${message.fullName}-${Date.now()}`
        });
      });
      
      // Add notifications for completed bookings
      const completedBookings = bookings.filter(b => b.status === 'completed' && b.checkOutTime);
      completedBookings.slice(0, 3).forEach(booking => {
        newNotifications.push({
          title: "Booking Completed",
          message: `${booking.customerName || 'Customer'} - Slot ${booking.slotId} (Lkr ${booking.amount || 0})`,
          time: getTimeAgo(booking.checkOutTime || new Date()),
          read: true,
          type: "reservation",
          important: false,
          id: `completed-${booking.id}`
        });
      });
      
      // Update notifications with real data
      setNotifications(newNotifications);
      
      setPendingBookingCount(newPendingCount);
      setMessageCount(newMessageCount);
      setPaymentCount(newPaymentCount);
    } catch (error) {
      console.error('Error updating counts:', error);
    }
  };

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    try {
      const now = new Date();
      const past = new Date(date);
      const diffInMinutes = Math.floor((now - past) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return "Just now";
    }
  };

  const value = {
    notifications,
    pendingBookingCount,
    messageCount,
    paymentCount,
    isMuted,
    isVisible,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearAllNotifications,
    toggleMute,
    toggleVisibility,
    updateCounts
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
