import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, ChevronRight, Settings, Volume2, VolumeX, Trash2, Eye, EyeOff, Star, Move } from 'lucide-react';
import styles from '../styles/styles';

const FloatingNotificationIcon = ({ 
  notifications = [], 
  onMarkAsRead, 
  onNavigateToSection,
  pendingBookingCount = 0,
  messageCount = 0,
  paymentCount = 0,
  onClearAll,
  onToggleMute,
  onToggleVisibility,
  onMarkAllAsRead
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const importantCount = notifications.filter(n => n.important).length;
  const totalCount = isMuted ? 0 : (unreadCount + pendingBookingCount + messageCount + paymentCount);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('notificationIconPosition');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (error) {
        console.error('Error loading saved position:', error);
      }
    }
  }, []);

  // Save position to localStorage
  const savePosition = (newPosition) => {
    try {
      localStorage.setItem('notificationIconPosition', JSON.stringify(newPosition));
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  // Handle mouse down for drag start
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('select') || e.target.closest('input')) {
      return; // Don't start drag if clicking on interactive elements
    }
    
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Constrain to viewport bounds
    const maxX = window.innerWidth - 56; // 56px is the icon width
    const maxY = window.innerHeight - 56; // 56px is the icon height

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    const newPosition = { x: constrainedX, y: constrainedY };
    setPosition(newPosition);
    savePosition(newPosition);
  };

  // Handle mouse up for drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

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

  const handleNotificationClick = (notification, index) => {
    if (onMarkAsRead) {
      onMarkAsRead(index);
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
    if (onToggleMute) {
      onToggleMute(newMutedState);
    }
  };

  const handleToggleVisibility = () => {
    const newVisibleState = !isVisible;
    setIsVisible(newVisibleState);
    if (onToggleVisibility) {
      onToggleVisibility(newVisibleState);
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
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

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      style={{
        ...styles.floatingNotificationContainer,
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        userSelect: 'none'
      }}
    >
      {/* Floating Notification Icon */}
      <div 
        data-notification-icon
        style={{
          ...styles.floatingNotificationButton,
          opacity: isMuted ? 0.6 : 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative'
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (!isDragging) {
            setIsOpen(!isOpen);
          }
        }}
        title={isMuted ? 'Notifications muted (Drag to move)' : 'Notifications (Drag to move)'}
      >
        <Bell size={24} color="#ffffff" />
        
        {/* Drag indicator */}
        <div style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 12,
          height: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <Move size={8} color="#2563eb" />
        </div>
        
        {totalCount > 0 && (
          <div style={{
            ...styles.floatingNotificationBadge,
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
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div style={{
          ...styles.floatingNotificationPanel,
          position: 'absolute',
          bottom: '70px',
          right: '0',
          width: '320px'
        }}>
          {/* Header with Settings */}
          <div style={styles.floatingNotificationHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={styles.floatingNotificationTitle}>Notifications</h3>
              {isMuted && <VolumeX size={16} color="#ef4444" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                style={{
                  ...styles.floatingNotificationCloseButton,
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings size={16} color="#6b7280" />
              </button>
              <button 
                style={styles.floatingNotificationCloseButton}
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
            <div style={styles.floatingQuickActions}>
              {pendingBookingCount > 0 && (
                <div 
                  style={styles.floatingQuickAction}
                  onClick={() => handleQuickAction('reservations')}
                >
                  <div style={styles.floatingQuickActionContent}>
                    <span style={styles.floatingQuickActionText}>New Reservations</span>
                    <span style={styles.floatingQuickActionCount}>{pendingBookingCount}</span>
                  </div>
                  <ChevronRight size={16} color="#6b7280" />
                </div>
              )}
              
              {paymentCount > 0 && (
                <div 
                  style={styles.floatingQuickAction}
                  onClick={() => handleQuickAction('payments')}
                >
                  <div style={styles.floatingQuickActionContent}>
                    <span style={styles.floatingQuickActionText}>Payment Alerts</span>
                    <span style={styles.floatingQuickActionCount}>{paymentCount}</span>
                  </div>
                  <ChevronRight size={16} color="#6b7280" />
                </div>
              )}
              
              {messageCount > 0 && (
                <div 
                  style={styles.floatingQuickAction}
                  onClick={() => handleQuickAction('message')}
                >
                  <div style={styles.floatingQuickActionContent}>
                    <span style={styles.floatingQuickActionText}>New Messages</span>
                    <span style={styles.floatingQuickActionCount}>{messageCount}</span>
                  </div>
                  <ChevronRight size={16} color="#6b7280" />
                </div>
              )}
            </div>
          )}

          {/* Recent Notifications */}
          {!showSettings && (
            <div style={styles.floatingNotificationList}>
              {filteredNotifications.length === 0 ? (
                <div style={styles.floatingEmptyState}>
                  {notificationFilter === 'all' ? 'No notifications' : 
                   notificationFilter === 'unread' ? 'No unread notifications' : 
                   'No important notifications'}
                </div>
              ) : (
                filteredNotifications.slice(0, 3).map((notification, index) => (
                  <div 
                    key={index}
                    style={{
                      ...styles.floatingNotificationItem,
                      ...(notification.read ? {} : styles.floatingNotificationItemUnread),
                      position: 'relative'
                    }}
                    onClick={() => handleNotificationClick(notification, index)}
                  >
                    <div style={styles.floatingNotificationContent}>
                      <div style={{
                        ...styles.floatingNotificationDot,
                        ...(notification.read ? styles.floatingNotificationDotRead : styles.floatingNotificationDotUnread)
                      }}></div>
                      <div style={styles.floatingNotificationText}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <p style={styles.floatingNotificationItemTitle}>{notification.title}</p>
                          {notification.important && (
                            <Star size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
                          )}
                        </div>
                        <p style={styles.floatingNotificationMessage}>{notification.message}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <p style={styles.floatingNotificationTime}>{notification.time}</p>
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
            <div style={styles.floatingViewAllButton}>
              <button 
                style={styles.floatingViewAllButtonText}
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

export default FloatingNotificationIcon;
