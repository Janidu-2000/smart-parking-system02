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
    xs: 60,
    sm: 64,
    md: 80,
    lg: 240,
    xl: 240,
    xxl: 260,
    xxxl: 280
  });
  const fontSize = getResponsiveValue(screenSize, {
    xs: 0,
    sm: 0,
    md: 0,
    lg: 24,
    xl: 24,
    xxl: 26,
    xxxl: 28
  });
  const iconSize = getResponsiveValue(screenSize, {
    xs: 20,
    sm: 24,
    md: 28,
    lg: 32,
    xl: 34,
    xxl: 36,
    xxxl: 38
  });
  const showOnMobile = getResponsiveValue(screenSize, {
    xs: true,
    sm: true,
    md: true,
    lg: false,
    xl: false,
    xxl: false,
    xxxl: false
  });
  
  return (
    <aside style={sidebarStyles.sidebar}>
      {!showOnMobile && (
        <div style={{ 
          padding: getResponsiveValue(screenSize, {
            xs: '0',
            sm: '0',
            md: '0 8px',
            lg: '0 24px',
            xl: '0 28px',
            xxl: '0 32px',
            xxxl: '0 36px'
          }), 
          marginBottom: getResponsiveValue(screenSize, {
            xs: 0,
            sm: 0,
            md: 20,
            lg: 32,
            xl: 36,
            xxl: 40,
            xxxl: 44
          }), 
          display: 'flex', 
          alignItems: 'center', 
          gap: getResponsiveValue(screenSize, {
            xs: 0,
            sm: 0,
            md: 8,
            lg: 12,
            xl: 14,
            xxl: 16,
            xxxl: 18
          }), 
          height: getResponsiveValue(screenSize, {
            xs: 32,
            sm: 36,
            md: 40,
            lg: 44,
            xl: 48,
            xxl: 52,
            xxxl: 56
          }), 
          justifyContent: getResponsiveValue(screenSize, {
            xs: 'center',
            sm: 'center',
            md: 'center',
            lg: 'flex-start',
            xl: 'flex-start',
            xxl: 'flex-start',
            xxxl: 'flex-start'
          }) 
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            gap: getResponsiveValue(screenSize, {
              xs: 2,
              sm: 4,
              md: 6,
              lg: 8,
              xl: 10,
              xxl: 12,
              xxxl: 14
            }),
            marginLeft: getResponsiveValue(screenSize, {
              xs: 4,
              sm: 8,
              md: 12,
              lg: 16,
              xl: 20,
              xxl: 24,
              xxxl: 28
            }),
            marginRight: getResponsiveValue(screenSize, {
              xs: 0,
              sm: 0,
              md: 0,
              lg: 8,
              xl: 10,
              xxl: 12,
              xxxl: 14
            }),
            position: 'relative'
          }}>
            {/* Logo Icon */}
            <div style={{ 
              width: iconSize, 
              height: iconSize, 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Parking Icon Logo */}
              <svg 
                width={iconSize * 0.6} 
                height={iconSize * 0.6} 
                viewBox="0 0 24 24" 
                fill="none"
              >
                {/* Car/Parking symbol */}
                <path 
                  d="M5 11a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z" 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle 
                  cx="8" 
                  cy="15" 
                  r="1.5" 
                  fill="#ffffff"
                />
                <circle 
                  cx="16" 
                  cy="15" 
                  r="1.5" 
                  fill="#ffffff"
                />
                <path 
                  d="M7 11V8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {/* SMART PARKING Text */}
            <span style={{ 
              fontWeight: 600, 
              fontSize: getResponsiveValue(screenSize, {
                xs: 0,
                sm: 0,
                md: 0,
                lg: 14,
                xl: 15,
                xxl: 16,
                xxxl: 17
              }), 
              color: '#ffffff', 
              letterSpacing: 0.5, 
              whiteSpace: 'nowrap', 
              textTransform: 'uppercase',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>Smart Parking</span>
          </div>
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
              background: activeTab === tab.key ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: activeTab === tab.key ? '#ffffff' : '#ffffff',
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
              transition: 'all 0.2s ease',
              backdropFilter: activeTab === tab.key ? 'blur(10px)' : 'none',
              border: activeTab === tab.key ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.backdropFilter = 'blur(10px)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.target.style.background = 'transparent';
                e.target.style.backdropFilter = 'none';
                e.target.style.border = '1px solid transparent';
              }
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
          color: '#ffffff',
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
          transition: 'all 0.2s ease',
          border: '1px solid transparent',
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.backdropFilter = 'blur(10px)';
          e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'transparent';
          e.target.style.backdropFilter = 'none';
          e.target.style.border = '1px solid transparent';
        }}
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
