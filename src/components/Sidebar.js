import React from 'react';
import { 
  Home, 
  Calendar, 
  ParkingCircle, 
  MessageSquare, 
  Settings, 
  LogOut,
  CreditCard
} from 'lucide-react';
import { useResponsive, getResponsiveValue, getSidebarStyles } from '../utils/responsive';

const Sidebar = ({ activeTab, onTabChange, messageCount = 0, pendingBookingCount = 0, onLogout }) => {
  const screenSize = useResponsive();
  const sidebarStyles = getSidebarStyles(screenSize);
  
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { key: 'reservations', label: 'Reservations', icon: <Calendar size={20} />, badge: pendingBookingCount },
    { key: 'parking', label: 'Add Customer', icon: <ParkingCircle size={20} /> },
    { key: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { key: 'message', label: 'Message', icon: <MessageSquare size={20} />, badge: messageCount },
    { key: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const sidebarWidth = getResponsiveValue(screenSize, {
    mobile: 64,
    smallTablet: 64,
    tablet: 240,
    large: 240,
    desktop: 240
  });
  const fontSize = getResponsiveValue(screenSize, {
    mobile: 0,
    smallTablet: 0,
    tablet: 24,
    large: 24,
    desktop: 24
  });
  const iconSize = getResponsiveValue(screenSize, {
    mobile: 24,
    smallTablet: 28,
    tablet: 32,
    large: 32,
    desktop: 32
  });
  const showOnMobile = getResponsiveValue(screenSize, {
    mobile: true,
    smallTablet: true,
    tablet: false,
    large: false,
    desktop: false
  });
  
  return (
    <aside style={sidebarStyles.sidebar}>
      {!showOnMobile && (
        <div style={{ 
          padding: getResponsiveValue(screenSize, {
            mobile: '0',
            smallTablet: '0 8px',
            tablet: '0 32px',
            large: '0 32px',
            desktop: '0 32px'
          }), 
          marginBottom: getResponsiveValue(screenSize, {
            mobile: 0,
            smallTablet: 16,
            tablet: 40,
            large: 40,
            desktop: 40
          }), 
          display: 'flex', 
          alignItems: 'center', 
          gap: getResponsiveValue(screenSize, {
            mobile: 0,
            smallTablet: 0,
            tablet: 12,
            large: 12,
            desktop: 12
          }), 
          height: 40, 
          justifyContent: getResponsiveValue(screenSize, {
            mobile: 'center',
            smallTablet: 'center',
            tablet: 'flex-start',
            large: 'flex-start',
            desktop: 'flex-start'
          }) 
        }}>
          <div style={{ 
            width: iconSize, 
            height: iconSize, 
            background: '#ef4444', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: getResponsiveValue(screenSize, {
              mobile: 0,
              smallTablet: 0,
              tablet: 8,
              large: 8,
              desktop: 8
            })
          }}>
            <Home size={iconSize * 0.6} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize, color: '#2563eb', letterSpacing: 1, whiteSpace: 'nowrap' }}>Smart Parking</span>
        </div>
      )}
      <nav style={{ 
        display: 'flex', 
        flexDirection: getResponsiveValue(screenSize, {
          mobile: 'row',
          smallTablet: 'column',
          tablet: 'column',
          large: 'column',
          desktop: 'column'
        }), 
        alignItems: getResponsiveValue(screenSize, {
          mobile: 'center',
          smallTablet: 'center',
          tablet: 'stretch',
          large: 'stretch',
          desktop: 'stretch'
        }),
        justifyContent: getResponsiveValue(screenSize, {
          mobile: 'space-around',
          smallTablet: 'flex-start',
          tablet: 'flex-start',
          large: 'flex-start',
          desktop: 'flex-start'
        }),
        flex: getResponsiveValue(screenSize, {
          mobile: '1',
          smallTablet: 'none',
          tablet: 'none',
          large: 'none',
          desktop: 'none'
        }),
        width: '100%'
      }}>
        {tabs.slice(0, getResponsiveValue(screenSize, {
          mobile: 5,
          smallTablet: tabs.length,
          tablet: tabs.length,
          large: tabs.length,
          desktop: tabs.length
        })).map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: getResponsiveValue(screenSize, {
                mobile: 'center',
                smallTablet: 'center',
                tablet: 'flex-start',
                large: 'flex-start',
                desktop: 'flex-start'
              }),
              width: getResponsiveValue(screenSize, {
                mobile: 'auto',
                smallTablet: '100%',
                tablet: '100%',
                large: '100%',
                desktop: '100%'
              }),
              padding: getResponsiveValue(screenSize, {
                mobile: '8px 4px',
                smallTablet: '10px 0',
                tablet: '12px 32px',
                large: '12px 32px',
                desktop: '12px 32px'
              }),
              background: activeTab === tab.key ? '#2563eb' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#1e293b',
              border: 'none',
              outline: 'none',
              fontWeight: 500,
              fontSize: getResponsiveValue(screenSize, {
                mobile: 0,
                smallTablet: 0,
                tablet: 16,
                large: 16,
                desktop: 16
              }),
              cursor: 'pointer',
              marginBottom: getResponsiveValue(screenSize, {
                mobile: 0,
                smallTablet: 8,
                tablet: 8,
                large: 8,
                desktop: 8
              }),
              borderRadius: getResponsiveValue(screenSize, {
                mobile: 4,
                smallTablet: 8,
                tablet: 8,
                large: 8,
                desktop: 8
              }),
              position: 'relative',
              minWidth: getResponsiveValue(screenSize, {
                mobile: 'auto',
                smallTablet: 'auto',
                tablet: 'auto',
                large: 'auto',
                desktop: 'auto'
              }),
              flex: getResponsiveValue(screenSize, {
                mobile: '1',
                smallTablet: 'none',
                tablet: 'none',
                large: 'none',
                desktop: 'none'
              }),
              transition: 'background 0.2s',
            }}
          >
            {React.cloneElement(tab.icon, { size: getResponsiveValue(screenSize, {
              mobile: 18,
              smallTablet: 20,
              tablet: 20,
              large: 20,
              desktop: 20
            }) })}
            {!showOnMobile && <span style={{ marginLeft: 16 }}>{tab.label}</span>}
            {tab.badge ? (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                fontSize: getResponsiveValue(screenSize, {
                  mobile: 10,
                  smallTablet: 11,
                  tablet: 12,
                  large: 12,
                  desktop: 12
                }),
                width: getResponsiveValue(screenSize, {
                  mobile: 16,
                  smallTablet: 18,
                  tablet: 22,
                  large: 22,
                  desktop: 22
                }),
                height: getResponsiveValue(screenSize, {
                  mobile: 16,
                  smallTablet: 18,
                  tablet: 22,
                  large: 22,
                  desktop: 22
                }),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: getResponsiveValue(screenSize, {
                  mobile: 4,
                  smallTablet: 6,
                  tablet: 24,
                  large: 24,
                  desktop: 24
                }),
                top: getResponsiveValue(screenSize, {
                  mobile: 2,
                  smallTablet: 4,
                  tablet: 8,
                  large: 8,
                  desktop: 8
                }),
              }}>{tab.badge}</span>
            ) : null}
          </button>
        ))}
      </nav>
      {!showOnMobile && <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: getResponsiveValue(screenSize, {
            mobile: 'center',
            smallTablet: 'center',
            tablet: 'flex-start',
            large: 'flex-start',
            desktop: 'flex-start'
          }),
          width: '100%',
          padding: getResponsiveValue(screenSize, {
            mobile: '10px 0',
            smallTablet: '10px 0',
            tablet: '12px 32px',
            large: '12px 32px',
            desktop: '12px 32px'
          }),
          background: 'transparent',
          color: '#ef4444',
          border: 'none',
          outline: 'none',
          fontWeight: 500,
          fontSize: getResponsiveValue(screenSize, {
            mobile: 0,
            smallTablet: 0,
            tablet: 16,
            large: 16,
            desktop: 16
          }),
          cursor: 'pointer',
          borderRadius: 8,
          marginTop: 'auto',
          marginBottom: getResponsiveValue(screenSize, {
            mobile: 16,
            smallTablet: 24,
            tablet: 32,
            large: 32,
            desktop: 32
          }),
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) => e.target.style.background = '#fef2f2'}
        onMouseOut={(e) => e.target.style.background = 'transparent'}
      >
        <LogOut size={getResponsiveValue(screenSize, {
          mobile: 18,
          smallTablet: 20,
          tablet: 20,
          large: 20,
          desktop: 20
        })} />
        {!showOnMobile && <span style={{ marginLeft: 16 }}>Logout</span>}
      </button>}
    </aside>
  );
};

export default Sidebar;
