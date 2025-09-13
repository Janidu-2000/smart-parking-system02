import { useState, useEffect } from 'react';

// Enhanced responsive breakpoints
export const BREAKPOINTS = {
  xs: 320,          // Extra small phones
  sm: 480,          // Small phones
  md: 768,          // Tablets
  lg: 1024,         // Small laptops
  xl: 1280,         // Large laptops
  xxl: 1536,        // Desktops
  xxxl: 1920        // Large desktops
};

// Enhanced responsive hook
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    // Legacy breakpoints for backward compatibility
    isMobile: window.innerWidth <= BREAKPOINTS.sm,
    isSmallTablet: window.innerWidth <= BREAKPOINTS.md,
    isTablet: window.innerWidth <= BREAKPOINTS.lg,
    isLargeScreen: window.innerWidth <= BREAKPOINTS.xl,
    isDesktop: window.innerWidth > BREAKPOINTS.xl,
    // New enhanced breakpoints
    isXs: window.innerWidth <= BREAKPOINTS.xs,
    isSm: window.innerWidth <= BREAKPOINTS.sm,
    isMd: window.innerWidth <= BREAKPOINTS.md,
    isLg: window.innerWidth <= BREAKPOINTS.lg,
    isXl: window.innerWidth <= BREAKPOINTS.xl,
    isXxl: window.innerWidth <= BREAKPOINTS.xxl,
    isXxxl: window.innerWidth > BREAKPOINTS.xxl
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        height: window.innerHeight,
        // Legacy breakpoints
        isMobile: width <= BREAKPOINTS.sm,
        isSmallTablet: width <= BREAKPOINTS.md,
        isTablet: width <= BREAKPOINTS.lg,
        isLargeScreen: width <= BREAKPOINTS.xl,
        isDesktop: width > BREAKPOINTS.xl,
        // New enhanced breakpoints
        isXs: width <= BREAKPOINTS.xs,
        isSm: width <= BREAKPOINTS.sm,
        isMd: width <= BREAKPOINTS.md,
        isLg: width <= BREAKPOINTS.lg,
        isXl: width <= BREAKPOINTS.xl,
        isXxl: width <= BREAKPOINTS.xxl,
        isXxxl: width > BREAKPOINTS.xxl
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Enhanced responsive value helper function
export const getResponsiveValue = (screenSize, values) => {
  // Support both old and new breakpoint naming
  const { 
    mobile, smallTablet, tablet, large, desktop, // Legacy
    xs, sm, md, lg, xl, xxl, xxxl // New
  } = values;
  
  // New breakpoint system (preferred)
  if (xs !== undefined && screenSize.isXs) return xs;
  if (sm !== undefined && screenSize.isSm) return sm;
  if (md !== undefined && screenSize.isMd) return md;
  if (lg !== undefined && screenSize.isLg) return lg;
  if (xl !== undefined && screenSize.isXl) return xl;
  if (xxl !== undefined && screenSize.isXxl) return xxl;
  if (xxxl !== undefined && screenSize.isXxxl) return xxxl;
  
  // Legacy breakpoint system (fallback)
  if (screenSize.isMobile) return mobile;
  if (screenSize.isSmallTablet) return smallTablet;
  if (screenSize.isTablet) return tablet;
  if (screenSize.isLargeScreen) return large;
  return desktop;
};

// Common responsive styles
export const getResponsiveStyles = (screenSize) => ({
  // Container styles
  container: {
    margin: getResponsiveValue(screenSize, {
      xs: '4px',
      sm: '5px',
      md: '6px',
      lg: '8px',
      xl: '10px',
      xxl: '12px',
      xxxl: '14px'
    }),
    padding: getResponsiveValue(screenSize, {
      xs: '6px',
      sm: '8px',
      md: '10px',
      lg: '12px',
      xl: '14px',
      xxl: '16px',
      xxxl: '18px'
    }),
    maxWidth: '100%',
    overflowX: 'hidden'
  },

  // Header styles
  header: {
    display: 'flex',
    flexDirection: getResponsiveValue(screenSize, {
      mobile: 'column',
      smallTablet: 'column',
      tablet: 'row',
      large: 'row',
      desktop: 'row'
    }),
    justifyContent: 'space-between',
    alignItems: getResponsiveValue(screenSize, {
      mobile: 'flex-start',
      smallTablet: 'flex-start',
      tablet: 'center',
      large: 'center',
      desktop: 'center'
    }),
    marginBottom: getResponsiveValue(screenSize, {
      mobile: 16,
      smallTablet: 20,
      tablet: 24,
      large: 28,
      desktop: 32
    }),
    gap: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 16,
      tablet: 20,
      large: 24,
      desktop: 28
    })
  },

  // Title styles
  title: {
    fontSize: getResponsiveValue(screenSize, {
      mobile: 18,
      smallTablet: 20,
      tablet: 22,
      large: 24,
      desktop: 26
    }),
    fontWeight: 700,
    margin: 0,
    color: '#111827'
  },

  // Subtitle styles
  subtitle: {
    fontSize: getResponsiveValue(screenSize, {
      mobile: 11,
      smallTablet: 12,
      tablet: 13,
      large: 14,
      desktop: 15
    }),
    color: '#6b7280',
    margin: '4px 0 0 0'
  },

  // Button container styles
  buttonContainer: {
    display: 'flex',
    flexDirection: getResponsiveValue(screenSize, {
      mobile: 'column',
      smallTablet: 'column',
      tablet: 'row',
      large: 'row',
      desktop: 'row'
    }),
    gap: getResponsiveValue(screenSize, {
      mobile: 8,
      smallTablet: 10,
      tablet: 12,
      large: 14,
      desktop: 16
    }),
    width: getResponsiveValue(screenSize, {
      mobile: '100%',
      smallTablet: '100%',
      tablet: 'auto',
      large: 'auto',
      desktop: 'auto'
    })
  },

  // Button styles
  button: {
    padding: getResponsiveValue(screenSize, {
      mobile: '10px 16px',
      smallTablet: '10px 16px',
      tablet: '8px 16px',
      large: '10px 18px',
      desktop: '12px 20px'
    }),
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: getResponsiveValue(screenSize, {
      mobile: 13,
      smallTablet: 14,
      tablet: 14,
      large: 15,
      desktop: 16
    }),
    fontWeight: '500',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    width: getResponsiveValue(screenSize, {
      mobile: '100%',
      smallTablet: '100%',
      tablet: 'auto',
      large: 'auto',
      desktop: 'auto'
    }),
    minWidth: getResponsiveValue(screenSize, {
      mobile: 'auto',
      smallTablet: 'auto',
      tablet: 120,
      large: 130,
      desktop: 140
    })
  },

  // Search container styles
  searchContainer: {
    display: 'flex',
    flexDirection: getResponsiveValue(screenSize, {
      mobile: 'column',
      smallTablet: 'column',
      tablet: 'row',
      large: 'row',
      desktop: 'row'
    }),
    gap: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 14,
      tablet: 16,
      large: 18,
      desktop: 20
    }),
    marginBottom: getResponsiveValue(screenSize, {
      mobile: 16,
      smallTablet: 18,
      tablet: 20,
      large: 22,
      desktop: 24
    }),
    alignItems: getResponsiveValue(screenSize, {
      mobile: 'stretch',
      smallTablet: 'stretch',
      tablet: 'center',
      large: 'center',
      desktop: 'center'
    })
  },

  // Input styles
  input: {
    flex: 1,
    padding: getResponsiveValue(screenSize, {
      mobile: '10px 12px',
      smallTablet: '10px 12px',
      tablet: '10px 12px',
      large: '12px 14px',
      desktop: '12px 16px'
    }),
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: getResponsiveValue(screenSize, {
      mobile: 14,
      smallTablet: 14,
      tablet: 14,
      large: 15,
      desktop: 16
    }),
    outline: 'none',
    minWidth: getResponsiveValue(screenSize, {
      mobile: 'auto',
      smallTablet: 'auto',
      tablet: 200,
      large: 220,
      desktop: 240
    })
  },

  // Select styles
  select: {
    padding: getResponsiveValue(screenSize, {
      mobile: '10px 12px',
      smallTablet: '10px 12px',
      tablet: '10px 12px',
      large: '12px 14px',
      desktop: '12px 16px'
    }),
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: getResponsiveValue(screenSize, {
      mobile: 14,
      smallTablet: 14,
      tablet: 14,
      large: 15,
      desktop: 16
    }),
    backgroundColor: 'white',
    outline: 'none',
    minWidth: getResponsiveValue(screenSize, {
      mobile: 'auto',
      smallTablet: 'auto',
      tablet: 120,
      large: 130,
      desktop: 140
    })
  },

  // Table container styles
  tableContainer: {
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
    overflow: 'hidden'
  },

  // Table styles
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: getResponsiveValue(screenSize, {
      mobile: 600,
      smallTablet: 700,
      tablet: 800,
      large: 900,
      desktop: 1000
    })
  },

  // Table header styles
  th: {
    padding: getResponsiveValue(screenSize, {
      mobile: '12px 8px',
      smallTablet: '14px 10px',
      tablet: '16px 12px',
      large: '18px 14px',
      desktop: '20px 16px'
    }),
    textAlign: 'left',
    fontWeight: 600,
    fontSize: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 13,
      tablet: 14,
      large: 15,
      desktop: 16
    }),
    color: '#374151',
    whiteSpace: 'nowrap'
  },

  // Table cell styles
  td: {
    padding: getResponsiveValue(screenSize, {
      mobile: '12px 8px',
      smallTablet: '14px 10px',
      tablet: '16px 12px',
      large: '18px 14px',
      desktop: '20px 16px'
    }),
    fontSize: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 13,
      tablet: 14,
      large: 15,
      desktop: 16
    }),
    color: '#374151',
    whiteSpace: 'nowrap'
  },

  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: getResponsiveValue(screenSize, {
      mobile: 8,
      smallTablet: 10,
      tablet: 12,
      large: 14,
      desktop: 16
    }),
    padding: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 14,
      tablet: 16,
      large: 18,
      desktop: 20
    }),
    marginBottom: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 14,
      tablet: 16,
      large: 18,
      desktop: 20
    }),
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'box-shadow 0.2s ease'
  },

  // Modal styles
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: getResponsiveValue(screenSize, {
      mobile: '10px',
      smallTablet: '15px',
      tablet: '20px',
      large: '25px',
      desktop: '30px'
    })
  },

  modalContent: {
    backgroundColor: 'white',
    borderRadius: getResponsiveValue(screenSize, {
      mobile: 8,
      smallTablet: 10,
      tablet: 12,
      large: 14,
      desktop: 16
    }),
    padding: getResponsiveValue(screenSize, {
      mobile: 16,
      smallTablet: 18,
      tablet: 20,
      large: 22,
      desktop: 24
    }),
    maxWidth: getResponsiveValue(screenSize, {
      mobile: '95vw',
      smallTablet: '90vw',
      tablet: '80vw',
      large: '70vw',
      desktop: '60vw'
    }),
    width: '100%',
    maxHeight: getResponsiveValue(screenSize, {
      mobile: '90vh',
      smallTablet: '85vh',
      tablet: '80vh',
      large: '75vh',
      desktop: '70vh'
    }),
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },

  // Grid styles
  grid: {
    display: 'grid',
    gap: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 16,
      tablet: 20,
      large: 24,
      desktop: 28
    })
  },

  // Analytics grid
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: getResponsiveValue(screenSize, {
      mobile: 8,
      smallTablet: 10,
      tablet: 12,
      large: 14,
      desktop: 16
    }),
    overflowX: 'auto',
    minWidth: '100%'
  },

  // Analytics card
  analyticsCard: {
    backgroundColor: '#fff',
    padding: getResponsiveValue(screenSize, {
      mobile: 16,
      smallTablet: 18,
      tablet: 20,
      large: 22,
      desktop: 24
    }),
    borderRadius: getResponsiveValue(screenSize, {
      mobile: 8,
      smallTablet: 10,
      tablet: 12,
      large: 14,
      desktop: 16
    }),
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    textAlign: 'center'
  },

  // Analytics card title
  analyticsCardTitle: {
    fontSize: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 13,
      tablet: 14,
      large: 15,
      desktop: 16
    }),
    color: '#6b7280',
    marginBottom: getResponsiveValue(screenSize, {
      mobile: 8,
      smallTablet: 10,
      tablet: 12,
      large: 14,
      desktop: 16
    }),
    fontWeight: '500'
  },

  // Analytics card number
  analyticsCardNumber: {
    fontSize: getResponsiveValue(screenSize, {
      mobile: 20,
      smallTablet: 24,
      tablet: 28,
      large: 32,
      desktop: 36
    }),
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  }
});

// Enhanced sidebar responsive styles
export const getSidebarStyles = (screenSize) => ({
  sidebar: {
    width: getResponsiveValue(screenSize, {
      xs: 60,
      sm: 64,
      md: 80,
      lg: 240,
      xl: 240,
      xxl: 260,
      xxxl: 280
    }),
    background: '#1e3a8a',
    borderRight: getResponsiveValue(screenSize, {
      xs: 'none',
      sm: 'none',
      md: '1px solid rgba(255, 255, 255, 0.1)',
      lg: '1px solid rgba(255, 255, 255, 0.1)',
      xl: '1px solid rgba(255, 255, 255, 0.1)',
      xxl: '1px solid rgba(255, 255, 255, 0.1)',
      xxxl: '1px solid rgba(255, 255, 255, 0.1)'
    }),
    height: getResponsiveValue(screenSize, {
      xs: '60px',
      sm: '60px',
      md: '100vh',
      lg: '100vh',
      xl: '100vh',
      xxl: '100vh',
      xxxl: '100vh'
    }),
    position: 'fixed',
    left: 0,
    top: getResponsiveValue(screenSize, {
      xs: 'auto',
      sm: 'auto',
      md: 0,
      lg: 0,
      xl: 0,
      xxl: 0,
      xxxl: 0
    }),
    bottom: getResponsiveValue(screenSize, {
      xs: 0,
      sm: 0,
      md: 'auto',
      lg: 'auto',
      xl: 'auto',
      xxl: 'auto',
      xxxl: 'auto'
    }),
    zIndex: 999,
    padding: getResponsiveValue(screenSize, {
      xs: '6px 0',
      sm: '8px 0',
      md: '12px 0',
      lg: '24px 0',
      xl: '28px 0',
      xxl: '32px 0',
      xxxl: '36px 0'
    }),
    display: 'flex',
    flexDirection: getResponsiveValue(screenSize, {
      xs: 'row',
      sm: 'row',
      md: 'column',
      lg: 'column',
      xl: 'column',
      xxl: 'column',
      xxxl: 'column'
    }),
    boxShadow: getResponsiveValue(screenSize, {
      xs: '0 -2px 8px 0 rgba(0,0,0,0.1)',
      sm: '0 -2px 8px 0 rgba(0,0,0,0.1)',
      md: '2px 0 8px 0 rgba(0,0,0,0.1)',
      lg: '2px 0 8px 0 rgba(0,0,0,0.1)',
      xl: '2px 0 8px 0 rgba(0,0,0,0.1)',
      xxl: '2px 0 8px 0 rgba(0,0,0,0.1)',
      xxxl: '2px 0 8px 0 rgba(0,0,0,0.1)'
    }),
    transition: 'width 0.3s ease, height 0.3s ease',
    justifyContent: getResponsiveValue(screenSize, {
      xs: 'space-around',
      sm: 'space-around',
      md: 'flex-start',
      lg: 'flex-start',
      xl: 'flex-start',
      xxl: 'flex-start',
      xxxl: 'flex-start'
    }),
    alignItems: getResponsiveValue(screenSize, {
      xs: 'center',
      sm: 'center',
      md: 'stretch',
      lg: 'stretch',
      xl: 'stretch',
      xxl: 'stretch',
      xxxl: 'stretch'
    })
  }
});

// Enhanced TopBar responsive styles
export const getTopBarStyles = (screenSize) => ({
  topBar: {
    position: 'fixed',
    top: 0,
    left: getResponsiveValue(screenSize, {
      xs: 0,
      sm: 0,
      md: 80,
      lg: 240,
      xl: 240,
      xxl: 260,
      xxxl: 280
    }),
    right: 0,
    width: getResponsiveValue(screenSize, {
      xs: '100vw',
      sm: '100vw',
      md: 'calc(100vw - 80px)',
      lg: 'calc(100vw - 240px)',
      xl: 'calc(100vw - 240px)',
      xxl: 'calc(100vw - 260px)',
      xxxl: 'calc(100vw - 280px)'
    }),
    height: getResponsiveValue(screenSize, {
      xs: 60,
      sm: 64,
      md: 68,
      lg: 64,
      xl: 68,
      xxl: 72,
      xxxl: 76
    }),
    background: '#1e3a8a',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: 'left 0.3s ease, width 0.3s ease',
    padding: getResponsiveValue(screenSize, {
      xs: '0 12px',
      sm: '0 16px',
      md: '0 20px',
      lg: '0 24px',
      xl: '0 28px',
      xxl: '0 32px',
      xxxl: '0 36px'
    })
  },
  
  // Left Section
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0
  },
  
  breadcrumb: {
    display: getResponsiveValue(screenSize, {
      mobile: 'none',
      smallTablet: 'flex',
      tablet: 'flex',
      large: 'flex',
      desktop: 'flex'
    }),
    alignItems: 'center',
    gap: '4px',
    marginBottom: '2px',
    fontSize: '12px',
    color: '#ffffff'
  },
  
  breadcrumbItem: {
    fontSize: '12px',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100px'
  },
  
  title: {
    fontWeight: 700,
    fontSize: getResponsiveValue(screenSize, {
      mobile: 18,
      smallTablet: 20,
      tablet: 22,
      large: 24,
      desktop: 24
    }),
    color: '#ffffff',
    margin: 0,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  
  
  // Right Section
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(screenSize, {
      mobile: 8,
      smallTablet: 12,
      tablet: 16,
      large: 16,
      desktop: 16
    }),
    flexShrink: 0,
    marginLeft: getResponsiveValue(screenSize, {
      mobile: 20,
      smallTablet: 40,
      tablet: 60,
      large: 80,
      desktop: 100
    })
  },
  
  // User Profile Styles
  userProfile: {
    position: 'relative'
  },
  
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderColor: 'rgba(255, 255, 255, 0.3)'
    }
  },
  
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  
  userInfo: {
    display: getResponsiveValue(screenSize, {
      mobile: 'none',
      smallTablet: 'flex',
      tablet: 'flex',
      large: 'flex',
      desktop: 'flex'
    }),
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1px'
  },
  
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  
  userRole: {
    fontSize: '11px',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  // User Menu Dropdown
  userMenu: {
    position: 'fixed',
    top: 'auto',
    bottom: 'auto',
    right: getResponsiveValue(screenSize, {
      mobile: '16px',
      smallTablet: '20px',
      tablet: '24px',
      large: '24px',
      desktop: '24px'
    }),
    marginTop: '8px',
    width: '280px',
    maxWidth: 'calc(100vw - 32px)',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    zIndex: 1001,
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    transform: 'translateY(0)',
    animation: 'slideDown 0.2s ease-out'
  },
  
  userMenuHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#f8fafc'
  },
  
  userAvatarLarge: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff'
  },
  
  userMenuName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '2px'
  },
  
  userMenuEmail: {
    fontSize: '13px',
    color: '#6b7280'
  },
  
  userMenuDivider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '8px 0'
  },
  
  userMenuItem: {
    width: '100%',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#f3f4f6'
    }
  }
});

// Tab navigation styles
export const getTabStyles = (screenSize) => ({
  tabContainer: {
    display: 'flex',
    gap: getResponsiveValue(screenSize, {
      mobile: 4,
      smallTablet: 6,
      tablet: 8,
      large: 10,
      desktop: 12
    }),
    marginBottom: getResponsiveValue(screenSize, {
      mobile: 16,
      smallTablet: 20,
      tablet: 24,
      large: 28,
      desktop: 32
    }),
    borderBottom: '1px solid #e5e7eb',
    overflowX: 'auto'
  },
  tab: {
    padding: getResponsiveValue(screenSize, {
      mobile: '10px 16px',
      smallTablet: '12px 20px',
      tablet: '14px 24px',
      large: '16px 28px',
      desktop: '18px 32px'
    }),
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: getResponsiveValue(screenSize, {
      mobile: 13,
      smallTablet: 14,
      tablet: 16,
      large: 17,
      desktop: 18
    }),
    fontWeight: 500,
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(screenSize, {
      mobile: 6,
      smallTablet: 8,
      tablet: 12,
      large: 14,
      desktop: 16
    }),
    transition: 'all 0.2s',
    minWidth: 'fit-content'
  },
  activeTab: {
    color: '#2563eb',
    fontWeight: 600,
    borderBottom: '2px solid #2563eb'
  },
  tabBadge: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: getResponsiveValue(screenSize, {
      mobile: '2px 6px',
      smallTablet: '3px 8px',
      tablet: '4px 10px',
      large: '5px 12px',
      desktop: '6px 14px'
    }),
    borderRadius: '12px',
    fontSize: getResponsiveValue(screenSize, {
      mobile: 10,
      smallTablet: 11,
      tablet: 12,
      large: 13,
      desktop: 14
    }),
    fontWeight: 600,
    minWidth: getResponsiveValue(screenSize, {
      mobile: 20,
      smallTablet: 24,
      tablet: 28,
      large: 32,
      desktop: 36
    }),
    textAlign: 'center'
  }
});
