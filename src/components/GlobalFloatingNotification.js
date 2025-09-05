import React from 'react';
import FloatingNotificationIcon from './FloatingNotificationIcon';
import { useNotifications } from '../contexts/NotificationContext';

const GlobalFloatingNotification = ({ onNavigateToSection }) => {
  const {
    notifications,
    pendingBookingCount,
    messageCount,
    paymentCount,
    markAsRead,
    clearAllNotifications,
    markAllAsRead,
    toggleMute,
    toggleVisibility
  } = useNotifications();

  return (
    <FloatingNotificationIcon
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onNavigateToSection={onNavigateToSection}
      pendingBookingCount={pendingBookingCount}
      messageCount={messageCount}
      paymentCount={paymentCount}
      onClearAll={clearAllNotifications}
      onToggleMute={toggleMute}
      onToggleVisibility={toggleVisibility}
      onMarkAllAsRead={markAllAsRead}
    />
  );
};

export default GlobalFloatingNotification;
