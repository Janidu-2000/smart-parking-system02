import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  ParkingCircle, 
  MessageSquare, 
  Settings, 
  LogOut,
  CreditCard
} from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, messageCount = 0, pendingBookingCount = 0, onLogout }) => {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { key: 'reservations', label: 'Reservations', icon: <Calendar size={20} />, badge: pendingBookingCount },
    { key: 'parking', label: 'Add Customer', icon: <ParkingCircle size={20} /> },
    { key: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { key: 'message', label: 'Message', icon: <MessageSquare size={20} />, badge: messageCount },
    { key: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallTablet, setIsSmallTablet] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
      setIsSmallTablet(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Responsive helper function
  const getResponsiveValue = (mobile, smallTablet, tablet, desktop) => {
    if (isMobile) return mobile;
    if (isSmallTablet) return smallTablet;
    if (isTablet) return tablet;
    return desktop;
  };
  
  const sidebarWidth = getResponsiveValue(64, 64, 240, 240);
  const fontSize = getResponsiveValue(0, 0, 24, 24);
  const iconSize = getResponsiveValue(24, 28, 32, 32);
  const showOnMobile = getResponsiveValue(true, true, false, false);
  
  return (
    <aside style={{
      width: sidebarWidth,
      background: '#f3f6fb',
      height: getResponsiveValue('60px', '100vh', '100vh', '100vh'),
      position: 'fixed',
      left: 0,
      top: getResponsiveValue('auto', 0, 0, 0),
      bottom: getResponsiveValue(0, 'auto', 'auto', 'auto'),
      zIndex: 100,
      padding: getResponsiveValue('8px 0', '16px 0', '32px 0', '32px 0'),
      display: 'flex',
      flexDirection: getResponsiveValue('row', 'column', 'column', 'column'),
      boxShadow: getResponsiveValue('0 -2px 8px 0 rgba(0,0,0,0.03)', '2px 0 8px 0 rgba(0,0,0,0.03)', '2px 0 8px 0 rgba(0,0,0,0.03)', '2px 0 8px 0 rgba(0,0,0,0.03)'),
      transition: 'width 0.2s',
      justifyContent: getResponsiveValue('space-around', 'flex-start', 'flex-start', 'flex-start'),
      alignItems: getResponsiveValue('center', 'stretch', 'stretch', 'stretch'),
    }}>
      {!getResponsiveValue(true, true, false, false) && (
        <div style={{ padding: getResponsiveValue('0', '0 8px', '0 32px', '0 32px'), marginBottom: getResponsiveValue(0, 16, 40, 40), display: 'flex', alignItems: 'center', gap: getResponsiveValue(0, 0, 12, 12), height: 40, justifyContent: getResponsiveValue('center', 'center', 'flex-start', 'flex-start') }}>
          <div style={{ 
            width: iconSize, 
            height: iconSize, 
            background: '#ef4444', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: getResponsiveValue(0, 0, 8, 8)
          }}>
            <Home size={iconSize * 0.6} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize, color: '#2563eb', letterSpacing: 1, whiteSpace: 'nowrap' }}>Smart Parking</span>
        </div>
      )}
      <nav style={{ 
        display: 'flex', 
        flexDirection: getResponsiveValue('row', 'column', 'column', 'column'), 
        alignItems: getResponsiveValue('center', 'center', 'stretch', 'stretch'),
        justifyContent: getResponsiveValue('space-around', 'flex-start', 'flex-start', 'flex-start'),
        flex: getResponsiveValue('1', 'none', 'none', 'none'),
        width: '100%'
      }}>
        {tabs.slice(0, getResponsiveValue(5, tabs.length, tabs.length, tabs.length)).map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: getResponsiveValue('center', 'center', 'flex-start', 'flex-start'),
              width: getResponsiveValue('auto', '100%', '100%', '100%'),
              padding: getResponsiveValue('8px 4px', '10px 0', '12px 32px', '12px 32px'),
              background: activeTab === tab.key ? '#2563eb' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#1e293b',
              border: 'none',
              outline: 'none',
              fontWeight: 500,
              fontSize: getResponsiveValue(0, 0, 16, 16),
              cursor: 'pointer',
              marginBottom: getResponsiveValue(0, 8, 8, 8),
              borderRadius: getResponsiveValue(4, 8, 8, 8),
              position: 'relative',
              minWidth: getResponsiveValue('auto', 'auto', 'auto', 'auto'),
              flex: getResponsiveValue('1', 'none', 'none', 'none'),
              transition: 'background 0.2s',
            }}
          >
            {React.cloneElement(tab.icon, { size: getResponsiveValue(18, 20, 20, 20) })}
            {!getResponsiveValue(true, true, false, false) && <span style={{ marginLeft: 16 }}>{tab.label}</span>}
            {tab.badge ? (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                fontSize: getResponsiveValue(10, 11, 12, 12),
                width: getResponsiveValue(16, 18, 22, 22),
                height: getResponsiveValue(16, 18, 22, 22),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: getResponsiveValue(4, 6, 24, 24),
                top: getResponsiveValue(2, 4, 8, 8),
              }}>{tab.badge}</span>
            ) : null}
          </button>
        ))}
      </nav>
      {!getResponsiveValue(true, true, false, false) && <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: getResponsiveValue('center', 'center', 'flex-start', 'flex-start'),
          width: '100%',
          padding: getResponsiveValue('10px 0', '10px 0', '12px 32px', '12px 32px'),
          background: 'transparent',
          color: '#ef4444',
          border: 'none',
          outline: 'none',
          fontWeight: 500,
          fontSize: getResponsiveValue(0, 0, 16, 16),
          cursor: 'pointer',
          borderRadius: 8,
          marginTop: 'auto',
          marginBottom: getResponsiveValue(16, 24, 32, 32),
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) => e.target.style.background = '#fef2f2'}
        onMouseOut={(e) => e.target.style.background = 'transparent'}
      >
        <LogOut size={getResponsiveValue(18, 20, 20, 20)} />
        {!getResponsiveValue(true, true, false, false) && <span style={{ marginLeft: 16 }}>Logout</span>}
      </button>}
    </aside>
  );
};

export default Sidebar;
