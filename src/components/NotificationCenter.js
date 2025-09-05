import React from 'react';
import { Bell } from 'lucide-react';
import styles from '../styles/styles';

const NotificationCenter = ({ notifications, onMarkAsRead }) => {
  return (
    <div style={styles.notificationPanel}>
      <div style={styles.notificationHeader}>
        <div style={styles.notificationHeaderContent}>
          <h3 style={styles.notificationTitle}>Notifications</h3>
          <Bell size={20} color="#6b7280" />
        </div>
      </div>
      <div style={styles.notificationList}>
        {notifications.length === 0 ? (
          <div style={styles.emptyState}>
            No new notifications
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div 
              key={index}
              style={{
                ...styles.notificationItem,
                ...(notification.read ? {} : styles.notificationItemUnread)
              }}
              onClick={() => onMarkAsRead(index)}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.target.style.backgroundColor = notification.read ? '#ffffff' : '#eff6ff'}
            >
              <div style={styles.notificationContent}>
                <div style={{
                  ...styles.notificationDot,
                  ...(notification.read ? styles.notificationDotRead : styles.notificationDotUnread)
                }}></div>
                <div style={styles.notificationText}>
                  <p style={styles.notificationItemTitle}>{notification.title}</p>
                  <p style={styles.notificationMessage}>{notification.message}</p>
                  <p style={styles.notificationTime}>{notification.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;