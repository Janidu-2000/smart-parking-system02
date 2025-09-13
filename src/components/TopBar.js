import React, { useState } from 'react';
import { useResponsive, getTopBarStyles } from '../utils/responsive';
import NotificationButton from './NotificationButton';
import { User, Settings, LogOut, ChevronRight, Home } from 'lucide-react';

const TopBar = ({ pageName, onNavigateToSection, currentPath = [] }) => {
  const screenSize = useResponsive();
  const topBarStyles = getTopBarStyles(screenSize);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 0 });

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('authUser') || '{}');
  const userName = userInfo.displayName || userInfo.email || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleUserMenuToggle = (e) => {
    if (!showUserMenu) {
      // Calculate position when opening
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const topBarHeight = screenSize.isMobile ? 70 : 64;
      setUserMenuPosition({
        top: topBarHeight + 8,
        right: window.innerWidth - buttonRect.right
      });
    }
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    window.location.href = '/login';
  };

  return (
    <div style={topBarStyles.topBar} className="topbar-fixed">
      {/* Left Section - Breadcrumb & Title */}
      <div style={topBarStyles.leftSection}>
        {/* Breadcrumb Navigation */}
        <div style={topBarStyles.breadcrumb}>
          <Home size={16} color="#ffffff" />
          {currentPath.map((path, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={16} color="#ffffff" />
              <span style={topBarStyles.breadcrumbItem}>{path}</span>
            </React.Fragment>
          ))}
        </div>
        
        {/* Page Title */}
        <h6 style={topBarStyles.title}>
          {pageName}
        </h6>
      </div>


      {/* Right Section - Notifications & User Profile */}
      <div style={topBarStyles.rightSection}>
        <NotificationButton onNavigateToSection={onNavigateToSection} />
        
        {/* User Profile */}
        <div style={topBarStyles.userProfile}>
          <button
            style={topBarStyles.userButton}
            onClick={handleUserMenuToggle}
            onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
          >
            <div style={topBarStyles.userAvatar}>
              {userInitials}
            </div>
            <div style={topBarStyles.userInfo}>
              <span style={topBarStyles.userName}>{userName}</span>
              <span style={topBarStyles.userRole}>Admin</span>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div style={{
              ...topBarStyles.userMenu,
              top: `${userMenuPosition.top}px`,
              right: `${userMenuPosition.right}px`
            }}>
              <div style={topBarStyles.userMenuHeader}>
                <div style={topBarStyles.userAvatarLarge}>
                  {userInitials}
                </div>
                <div>
                  <div style={topBarStyles.userMenuName}>{userName}</div>
                  <div style={topBarStyles.userMenuEmail}>{userInfo.email}</div>
                </div>
              </div>
              
              <div style={topBarStyles.userMenuDivider} />
              
              <button style={topBarStyles.userMenuItem}>
                <User size={16} />
                <span>Profile</span>
              </button>
              
              <button style={topBarStyles.userMenuItem}>
                <Settings size={16} />
                <span>Settings</span>
              </button>
              
              <div style={topBarStyles.userMenuDivider} />
              
              <button style={topBarStyles.userMenuItem} onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS Animations and Fixes */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .topbar-fixed {
          position: fixed !important;
          top: 0 !important;
          z-index: 1000 !important;
          box-sizing: border-box !important;
        }
        
        /* Ensure content doesn't overlap with TopBar */
        body {
          padding-top: 0 !important;
        }
        
        /* Fix for any potential overflow issues */
        .topbar-fixed * {
          box-sizing: border-box;
        }
        
        /* Responsive fixes for different screen sizes */
        @media (max-width: 480px) {
          .topbar-fixed {
            height: 70px !important;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          .topbar-fixed {
            height: 64px !important;
          }
        }
        
        @media (min-width: 769px) {
          .topbar-fixed {
            height: 64px !important;
          }
        }
        
        /* Ensure proper positioning on all devices */
        @media (max-width: 480px) {
          .topbar-fixed {
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          .topbar-fixed {
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .topbar-fixed {
            left: 72px !important;
            right: 0 !important;
            width: calc(100vw - 72px) !important;
          }
        }
        
        @media (min-width: 1025px) and (max-width: 1280px) {
          .topbar-fixed {
            left: 200px !important;
            right: 0 !important;
            width: calc(100vw - 200px) !important;
          }
        }
        
        @media (min-width: 1281px) and (max-width: 1536px) {
          .topbar-fixed {
            left: 220px !important;
            right: 0 !important;
            width: calc(100vw - 220px) !important;
          }
        }
        
        @media (min-width: 1537px) and (max-width: 1920px) {
          .topbar-fixed {
            left: 240px !important;
            right: 0 !important;
            width: calc(100vw - 240px) !important;
          }
        }
        
        @media (min-width: 1921px) {
          .topbar-fixed {
            left: 260px !important;
            right: 0 !important;
            width: calc(100vw - 260px) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TopBar;
