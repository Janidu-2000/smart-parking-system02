import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Palette, Database, Shield, User, Bell, DollarSign } from 'lucide-react';
import UserProfile from './UserProfile';
import SlotPriceManager from './SlotPriceManager';

const SettingsPage = ({ onOpenDesigner }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallTablet, setIsSmallTablet] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth <= 1440);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSlotPriceManager, setShowSlotPriceManager] = useState(false);
  
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

  const getResponsiveValue = (mobile, smallTablet, tablet, large, desktop) => {
    if (isMobile) return mobile;
    if (isSmallTablet) return smallTablet;
    if (isTablet) return tablet;
    if (isLargeScreen) return large;
    return desktop;
  };

  const settingsCards = [
    {
      title: 'Parking Designer',
      description: 'Design and customize your parking lot layout with slots, roads, and labels.',
      icon: <Palette size={getResponsiveValue(20, 22, 24, 24, 24)} />,
      action: {
        label: 'Open Designer',
        onClick: onOpenDesigner,
        primary: true
      }
    },
    {
      title: 'User Profile',
      description: 'Update your profile information and account settings.',
      icon: <User size={getResponsiveValue(20, 22, 24, 24, 24)} />,
      action: {
        label: 'Edit Profile',
        onClick: () => setShowUserProfile(true),
        primary: true
      }
    },
    {
      title: 'System Preferences',
      description: 'Configure system settings, notifications, and user preferences.',
      icon: <SettingsIcon size={getResponsiveValue(20, 22, 24, 24, 24)} />,
      action: {
        label: 'Configure',
        onClick: () => alert('System preferences coming soon!'),
        primary: false
      }
    },
    {
      title: 'Data Management',
      description: 'Backup, restore, and manage your parking system data.',
      icon: <Database size={getResponsiveValue(20, 22, 24, 24, 24)} />,
      action: {
        label: 'Manage Data',
        onClick: () => alert('Data management coming soon!'),
        primary: false
      }
    },
    {
      title: 'Security Settings',
      description: 'Manage user access, permissions, and security configurations.',
      icon: <Shield size={getResponsiveValue(20, 22, 24, 24, 24)} />,
      action: {
        label: 'Security',
        onClick: () => alert('Security settings coming soon!'),
        primary: false
      }
    },
    {
      title: 'Notifications',
      description: 'Configure email notifications and alert preferences.',
      icon: <Bell size={getResponsiveValue(20, 22, 24, 24, 24)} />,
      action: {
        label: 'Configure',
        onClick: () => alert('Notification settings coming soon!'),
        primary: false
      }
    },
    {
      title: 'Slot Price Manager',
      description: 'Manage and set prices for different parking slots.',
      icon: <DollarSign size={getResponsiveValue(20, 22, 24, 24, 24)} />,
      action: {
        label: 'Manage Prices',
        onClick: () => setShowSlotPriceManager(true),
        primary: false
      }
    }
  ];

  // Responsive styles
  const containerStyle = {
    margin: getResponsiveValue('0', '10px 8px', '15px 12px', '20px 0 20px 20px', '20px 0 20px 20px'),
    padding: getResponsiveValue(8, 12, 16, 24, 24),
    paddingTop: getResponsiveValue(65, 68, 72, 68, 72), // Add extra top padding for navbar spacing
    maxWidth: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box'
  };

  const titleStyle = {
    fontSize: getResponsiveValue(18, 20, 22, 24, 24),
    fontWeight: 700,
    marginBottom: getResponsiveValue(16, 20, 22, 24, 24),
    textAlign: getResponsiveValue('center', 'left', 'left', 'left', 'left'),
    color: '#1f2937'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: getResponsiveValue(
      '1fr',
      '1fr',
      'repeat(2, 1fr)',
      'repeat(2, 1fr)',
      'repeat(3, 1fr)'
    ),
    gap: getResponsiveValue(12, 16, 20, 24, 24),
    maxWidth: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box'
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: getResponsiveValue(8, 10, 12, 12, 12),
    padding: getResponsiveValue(16, 18, 20, 24, 24),
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: getResponsiveValue(12, 14, 16, 16, 16),
    minHeight: getResponsiveValue(160, 180, 200, 200, 200),
    boxSizing: 'border-box',
    overflow: 'hidden'
  };

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(8, 10, 12, 12, 12),
    minWidth: 0
  };

  const iconContainerStyle = {
    width: getResponsiveValue(40, 44, 48, 48, 48),
    height: getResponsiveValue(40, 44, 48, 48, 48),
    borderRadius: getResponsiveValue(8, 10, 12, 12, 12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const cardContentStyle = {
    minWidth: 0,
    overflow: 'hidden'
  };

  const cardTitleStyle = {
    fontSize: getResponsiveValue(16, 17, 18, 18, 18),
    fontWeight: 600,
    margin: 0,
    color: '#1f2937',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const cardDescriptionStyle = {
    fontSize: getResponsiveValue(13, 13, 14, 14, 14),
    color: '#6b7280',
    margin: '4px 0 0 0',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const buttonStyle = {
    padding: getResponsiveValue('8px 16px', '10px 18px', '10px 20px', '10px 20px', '10px 20px'),
    border: 'none',
    borderRadius: getResponsiveValue(6, 7, 8, 8, 8),
    cursor: 'pointer',
    fontSize: getResponsiveValue(13, 13, 14, 14, 14),
    fontWeight: 500,
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'center',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Settings</h2>
      
      <div style={gridStyle}>
        {settingsCards.map((card, index) => (
          <div key={index} style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{
                ...iconContainerStyle,
                backgroundColor: card.action.primary ? '#2563eb' : '#f3f4f6',
                color: card.action.primary ? 'white' : '#374151'
              }}>
                {card.icon}
              </div>
              <div style={cardContentStyle}>
                <h3 style={cardTitleStyle}>
                  {card.title}
                </h3>
                <p style={cardDescriptionStyle}>
                  {card.description}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto' }}>
              <button
                onClick={card.action.onClick}
                style={{
                  ...buttonStyle,
                  backgroundColor: card.action.primary ? '#2563eb' : '#f3f4f6',
                  color: card.action.primary ? 'white' : '#374151'
                }}
                onMouseOver={(e) => {
                  if (card.action.primary) {
                    e.target.style.backgroundColor = '#1d4ed8';
                  } else {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (card.action.primary) {
                    e.target.style.backgroundColor = '#2563eb';
                  } else {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                {card.action.label}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}
      {showSlotPriceManager && (
        <SlotPriceManager onClose={() => setShowSlotPriceManager(false)} />
      )}
    </div>
  );
};

export default SettingsPage;
