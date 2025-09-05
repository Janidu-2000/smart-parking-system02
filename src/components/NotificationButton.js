import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, ChevronRight, Settings, Volume2, VolumeX, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import styles from '../styles/styles';

const NotificationButton = ({ onNavigateToSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

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

  const unreadCount = notifications.filter(n => !n.read).length;
  const importantCount = notifications.filter(n => n.important).length;
  const totalCount = isMuted ? 0 : (unreadCount + pendingBookingCount + messageCount + paymentCount);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-hide notification panel after 5 seconds if no interaction
  useEffect(() => {
    let timer;
    if (isOpen && !showSettings) {
      timer = setTimeout(() => {
        setIsOpen(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, showSettings]);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        // Force re-render to recalculate position
        setIsOpen(false);
        setTimeout(() => setIsOpen(true), 0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleNotificationClick = (notification, index) => {
    if (markAsRead) {
      markAsRead(index);
    }
    
    // Navigate based on notification type
    if (notification.type === 'reservation' && onNavigateToSection) {
      onNavigateToSection('reservations');
    } else if (notification.type === 'payment' && onNavigateToSection) {
      onNavigateToSection('payments');
    } else if (notification.type === 'message' && onNavigateToSection) {
      onNavigateToSection('message');
    }
    
    setIsOpen(false);
  };

  const handleQuickAction = (action) => {
    if (onNavigateToSection) {
      onNavigateToSection(action);
    }
    setIsOpen(false);
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (toggleMute) {
      toggleMute(newMutedState);
    }
  };

  const handleToggleVisibility = () => {
    if (toggleVisibility) {
      toggleVisibility();
    }
  };

  const handleClearAll = () => {
    if (clearAllNotifications) {
      clearAllNotifications();
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    if (markAllAsRead) {
      markAllAsRead();
    }
  };

  const getFilteredNotifications = () => {
    switch (notificationFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'important':
        return notifications.filter(n => n.important);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  // Calculate dropdown position to prevent overflow
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: '100%', right: '0' };
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 320;
    const dropdownHeight = 400; // Estimated max height
    
    // Check if dropdown would overflow to the right
    const wouldOverflowRight = buttonRect.right - dropdownWidth < 0;
    // Check if dropdown would overflow to the bottom
    const wouldOverflowBottom = buttonRect.bottom + dropdownHeight > viewportHeight;
    
    return {
      top: wouldOverflowBottom ? 'auto' : '100%',
      bottom: wouldOverflowBottom ? '100%' : 'auto',
      right: wouldOverflowRight ? '0' : 'auto',
      left: wouldOverflowRight ? '0' : 'auto',
      maxHeight: wouldOverflowBottom ? `${viewportHeight - buttonRect.top - 20}px` : '400px'
    };
  };

  const dropdownPosition = getDropdownPosition();

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Notification Button */}
      <button
        ref={buttonRef}
        style={{
          ...styles.notificationButton,
          opacity: isMuted ? 0.6 : 1,
          position: 'relative'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title={isMuted ? 'Notifications muted' : 'Notifications'}
      >
        <Bell size={20} color="#6b7280" />
        
        {totalCount > 0 && (
          <div style={{
            ...styles.notificationBadge,
            position: 'absolute',
            top: '-4px',
            right: '-4px'
          }}>
            {totalCount > 99 ? '99+' : totalCount}
          </div>
        )}
        {isMuted && (
          <div style={{
            position: 'absolute',
            top: -2,
            left: -2,
            width: 8,
            height: 8,
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid #ffffff'
          }} />
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div style={{
          ...styles.notificationDropdown,
          position: 'absolute',
          ...dropdownPosition,
          width: '320px',
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          {/* Header with Settings */}
          <div style={styles.notificationHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={styles.notificationTitle}>Notifications</h3>
              {isMuted && <VolumeX size={16} color="#ef4444" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                style={{
                  ...styles.notificationCloseButton,
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings size={16} color="#6b7280" />
              </button>
              <button 
                style={styles.notificationCloseButton}
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={16} color="#6b7280" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div style={{
              padding: '12px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>Notification Settings</h4>
                
                {/* Filter Options */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Filter:
                  </label>
                  <select 
                    value={notificationFilter}
                    onChange={(e) => setNotificationFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="all">All ({notifications.length})</option>
                    <option value="unread">Unread ({unreadCount})</option>
                    <option value="important">Important ({importantCount})</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title="Mark all as read"
                  >
                    <Eye size={12} style={{ marginRight: '4px' }} />
                    Mark All Read
                  </button>
                  
                  <button
                    onClick={handleToggleMute}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: isMuted ? '#10b981' : '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                  >
                    {isMuted ? <Volume2 size={12} /> : <VolumeX size={12} />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  
                  <button
                    onClick={handleToggleVisibility}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title="Hide notification icon"
                  >
                    <EyeOff size={12} />
                    Hide
                  </button>
                  
                  <button
                    onClick={handleClearAll}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title="Clear all notifications"
                  >
                    <Trash2 size={12} />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!showSettings && (
            <div style={styles.quickActions}>
              {pendingBookingCount > 0 && (
                <div 
                  style={styles.quickAction}
                  onClick={() => handleQuickAction('reservations')}
                >
                  <div style={styles.quickActionContent}>
                    <span style={styles.quickActionText}>New Reservations</span>
                    <span style={styles.quickActionCount}>{pendingBookingCount}</span>
                  </div>
                  <ChevronRight size={16} color="#6b7280" />
                </div>
              )}
              
              {paymentCount > 0 && (
                <div 
                  style={styles.quickAction}
                  onClick={() => handleQuickAction('payments')}
                >
                  <div style={styles.quickActionContent}>
                    <span style={styles.quickActionText}>Payment Alerts</span>
                    <span style={styles.quickActionCount}>{paymentCount}</span>
                  </div>
                  <ChevronRight size={16} color="#6b7280" />
                </div>
              )}
              
              {messageCount > 0 && (
                <div 
                  style={styles.quickAction}
                  onClick={() => handleQuickAction('message')}
                >
                  <div style={styles.quickActionContent}>
                    <span style={styles.quickActionText}>New Messages</span>
                    <span style={styles.quickActionCount}>{messageCount}</span>
                  </div>
                  <ChevronRight size={16} color="#6b7280" />
                </div>
              )}
            </div>
          )}

          {/* Recent Notifications */}
          {!showSettings && (
            <div style={styles.notificationList}>
              {filteredNotifications.length === 0 ? (
                <div style={styles.emptyState}>
                  {notificationFilter === 'all' ? 'No notifications' : 
                   notificationFilter === 'unread' ? 'No unread notifications' : 
                   'No important notifications'}
                </div>
              ) : (
                filteredNotifications.slice(0, 3).map((notification, index) => (
                  <div 
                    key={index}
                    style={{
                      ...styles.notificationItem,
                      ...(notification.read ? {} : styles.notificationItemUnread),
                      position: 'relative'
                    }}
                    onClick={() => handleNotificationClick(notification, index)}
                  >
                    <div style={styles.notificationContent}>
                      <div style={{
                        ...styles.notificationDot,
                        ...(notification.read ? styles.notificationDotRead : styles.notificationDotUnread)
                      }}></div>
                      <div style={styles.notificationText}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <p style={styles.notificationItemTitle}>{notification.title}</p>
                          {notification.important && (
                            <Star size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
                          )}
                        </div>
                        <p style={styles.notificationMessage}>{notification.message}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <p style={styles.notificationTime}>{notification.time}</p>
                          {notification.type && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              backgroundColor: notification.type === 'reservation' ? '#dbeafe' : 
                                               notification.type === 'payment' ? '#fef3c7' : '#d1fae5',
                              color: notification.type === 'reservation' ? '#1e40af' : 
                                    notification.type === 'payment' ? '#92400e' : '#065f46',
                              borderRadius: '10px',
                              textTransform: 'capitalize'
                            }}>
                              {notification.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* View All Button */}
          {!showSettings && filteredNotifications.length > 3 && (
            <div style={styles.viewAllButton}>
              <button 
                style={styles.viewAllButtonText}
                onClick={() => handleQuickAction('reservations')}
              >
                View All Notifications ({filteredNotifications.length})
              </button>
            </div>
          )}

          {/* Notification Stats */}
          {!showSettings && (
            <div style={{
              padding: '8px 12px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              fontSize: '11px',
              color: '#6b7280',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Total: {notifications.length}</span>
              <span>Unread: {unreadCount}</span>
              <span>Important: {importantCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
