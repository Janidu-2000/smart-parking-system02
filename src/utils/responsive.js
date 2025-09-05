import { useState, useEffect } from 'react';

// Standard responsive breakpoints
export const BREAKPOINTS = {
  mobile: 480,      // Mobile phones
  smallTablet: 768, // Small tablets
  tablet: 1024,     // Tablets
  largeScreen: 1440, // Large screens
  desktop: 1920     // Desktop
};

// Custom hook for responsive behavior
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= BREAKPOINTS.mobile,
    isSmallTablet: window.innerWidth <= BREAKPOINTS.smallTablet,
    isTablet: window.innerWidth <= BREAKPOINTS.tablet,
    isLargeScreen: window.innerWidth <= BREAKPOINTS.largeScreen,
    isDesktop: window.innerWidth > BREAKPOINTS.largeScreen
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        height: window.innerHeight,
        isMobile: width <= BREAKPOINTS.mobile,
        isSmallTablet: width <= BREAKPOINTS.smallTablet,
        isTablet: width <= BREAKPOINTS.tablet,
        isLargeScreen: width <= BREAKPOINTS.largeScreen,
        isDesktop: width > BREAKPOINTS.largeScreen
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Responsive value helper function
export const getResponsiveValue = (screenSize, values) => {
  const { mobile, smallTablet, tablet, large, desktop } = values;
  
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
      mobile: '10px',
      smallTablet: '15px',
      tablet: '20px',
      large: '30px',
      desktop: '40px'
    }),
    padding: getResponsiveValue(screenSize, {
      mobile: '12px',
      smallTablet: '16px',
      tablet: '20px',
      large: '24px',
      desktop: '32px'
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
    gridTemplateColumns: getResponsiveValue(screenSize, {
      mobile: '1fr',
      smallTablet: 'repeat(2, 1fr)',
      tablet: 'repeat(3, 1fr)',
      large: 'repeat(4, 1fr)',
      desktop: 'repeat(5, 1fr)'
    }),
    gap: getResponsiveValue(screenSize, {
      mobile: 12,
      smallTablet: 16,
      tablet: 20,
      large: 24,
      desktop: 28
    })
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

// Sidebar responsive styles
export const getSidebarStyles = (screenSize) => ({
  sidebar: {
    width: getResponsiveValue(screenSize, {
      mobile: 64,
      smallTablet: 64,
      tablet: 240,
      large: 240,
      desktop: 240
    }),
    background: '#f3f6fb',
    height: getResponsiveValue(screenSize, {
      mobile: '60px',
      smallTablet: '100vh',
      tablet: '100vh',
      large: '100vh',
      desktop: '100vh'
    }),
    position: 'fixed',
    left: 0,
    top: getResponsiveValue(screenSize, {
      mobile: 'auto',
      smallTablet: 0,
      tablet: 0,
      large: 0,
      desktop: 0
    }),
    bottom: getResponsiveValue(screenSize, {
      mobile: 0,
      smallTablet: 'auto',
      tablet: 'auto',
      large: 'auto',
      desktop: 'auto'
    }),
    zIndex: 100,
    padding: getResponsiveValue(screenSize, {
      mobile: '8px 0',
      smallTablet: '16px 0',
      tablet: '32px 0',
      large: '32px 0',
      desktop: '32px 0'
    }),
    display: 'flex',
    flexDirection: getResponsiveValue(screenSize, {
      mobile: 'row',
      smallTablet: 'column',
      tablet: 'column',
      large: 'column',
      desktop: 'column'
    }),
    boxShadow: getResponsiveValue(screenSize, {
      mobile: '0 -2px 8px 0 rgba(0,0,0,0.03)',
      smallTablet: '2px 0 8px 0 rgba(0,0,0,0.03)',
      tablet: '2px 0 8px 0 rgba(0,0,0,0.03)',
      large: '2px 0 8px 0 rgba(0,0,0,0.03)',
      desktop: '2px 0 8px 0 rgba(0,0,0,0.03)'
    }),
    transition: 'width 0.2s',
    justifyContent: getResponsiveValue(screenSize, {
      mobile: 'space-around',
      smallTablet: 'flex-start',
      tablet: 'flex-start',
      large: 'flex-start',
      desktop: 'flex-start'
    }),
    alignItems: getResponsiveValue(screenSize, {
      mobile: 'center',
      smallTablet: 'stretch',
      tablet: 'stretch',
      large: 'stretch',
      desktop: 'stretch'
    })
  }
});

// TopBar responsive styles
export const getTopBarStyles = (screenSize) => ({
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: getResponsiveValue(screenSize, {
      mobile: '100vw',
      smallTablet: '100vw',
      tablet: 'calc(100vw - 240px)',
      large: 'calc(100vw - 240px)',
      desktop: 'calc(100vw - 240px)'
    }),
    height: getResponsiveValue(screenSize, {
      mobile: 60,
      smallTablet: 48,
      tablet: 48,
      large: 48,
      desktop: 48
    }),
    background: '#f3f6fb',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 200,
    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)',
    marginLeft: getResponsiveValue(screenSize, {
      mobile: 0,
      smallTablet: 0,
      tablet: 240,
      large: 240,
      desktop: 240
    }),
    transition: 'margin-left 0.2s, width 0.2s',
    paddingRight: getResponsiveValue(screenSize, {
      mobile: 16,
      smallTablet: 24,
      tablet: 32,
      large: 32,
      desktop: 32
    })
  },
  title: {
    fontWeight: 600,
    fontSize: getResponsiveValue(screenSize, {
      mobile: 16,
      smallTablet: 17,
      tablet: 18,
      large: 18,
      desktop: 18
    }),
    color: '#2563eb',
    marginLeft: getResponsiveValue(screenSize, {
      mobile: 16,
      smallTablet: 24,
      tablet: 32,
      large: 32,
      desktop: 32
    }),
    textAlign: getResponsiveValue(screenSize, {
      mobile: 'center',
      smallTablet: 'left',
      tablet: 'left',
      large: 'left',
      desktop: 'left'
    }),
    width: getResponsiveValue(screenSize, {
      mobile: '100%',
      smallTablet: 'auto',
      tablet: 'auto',
      large: 'auto',
      desktop: 'auto'
    })
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
