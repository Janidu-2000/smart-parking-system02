import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Maximize2, Minimize2, Clock } from 'lucide-react';
import DesignerCanvas from './designer/DesignerCanvas';

const ParkingStatusPage = ({ slots, designElements = [], canvas, gridSize, onUpdateSlot, onRefreshData }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showOnlyReserved, setShowOnlyReserved] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallTablet, setIsSmallTablet] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth <= 1440);
  
  // Enhanced responsive breakpoint handling
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

  // Responsive helper function
  const getResponsiveValue = (mobile, smallTablet, tablet, large, desktop) => {
    if (isMobile) return mobile;
    if (isSmallTablet) return smallTablet;
    if (isTablet) return tablet;
    if (isLargeScreen) return large;
    return desktop;
  };
  
  // Handle escape key to exit full screen
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    
    if (isFullScreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullScreen]);

  // Filter design elements - only filter slots, always show roads and labels
  const filteredDesignElements = designElements.filter(element => {
    if (element.type === 'slot') {
      // For slots, check if they match the filter criteria
      // Extract slot number from design element and convert to new format
      const slotNumberStr = element.meta?.slotNumber || '';
      const slotNumber = parseInt(slotNumberStr.replace(/[^0-9]/g, '')) || 1;
      
      // Convert to new slot format (S1, S2, etc.)
      const slotId = `S${slotNumber}`;
      
      // Find matching slot in the slots array
      const matchingSlot = slots.find(slot => slot.id === slotId);
      
      const slotStatus = matchingSlot?.status || element.meta?.status || 'available';
      
      // Apply reserved slots filter
      if (showOnlyReserved) {
        if (slotStatus !== 'reserved') {
          return false; // Hide non-reserved slots
        }
      }
      
      const matchesFilter = filter === 'all' || slotStatus === filter;
      const matchesSearch = (element.meta?.slotNumber || '').toString().includes(searchTerm);
      
      return matchesFilter && matchesSearch;
    }
    // For roads and labels, always show them (no filtering)
    return true;
  });

  // Responsive styles
  const containerStyle = {
    margin: getResponsiveValue('0', '10px 8px', '15px 12px', '20px 0 20px 0px', '20px 0 20px 0px'),
    maxWidth: '100%',
    overflowX: 'hidden',
    padding: getResponsiveValue('8px', '0', '0', '0', '0')
  };

  const filterContainerStyle = {
    display: 'flex',
    flexDirection: getResponsiveValue('column', 'column', 'row', 'row', 'row'),
    gap: getResponsiveValue(6, 8, 12, 16, 16),
    marginBottom: getResponsiveValue(12, 16, 20, 24, 24),
    flexWrap: 'wrap',
    alignItems: getResponsiveValue('stretch', 'stretch', 'center', 'center', 'center'),
    padding: getResponsiveValue('0 4px', '0', '0', '0', '0')
  };

  const searchContainerStyle = {
    position: 'relative',
    flex: getResponsiveValue('1', '1', '1', '1', '1')
  };

  const searchInputStyle = {
    padding: getResponsiveValue('10px 12px 10px 32px', '10px 12px 10px 40px', '8px 12px 8px 40px', '8px 12px 8px 40px', '8px 12px 8px 40px'),
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: getResponsiveValue(14, 14, 14, 14, 14),
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const selectStyle = {
    padding: getResponsiveValue('10px 12px', '10px 12px', '8px 12px', '8px 12px', '8px 12px'),
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: getResponsiveValue(14, 14, 14, 14, 14),
    outline: 'none',
    backgroundColor: 'white',
    minWidth: getResponsiveValue('auto', 'auto', 120, 120, 120),
    flex: getResponsiveValue('1', '1', 'none', 'none', 'none'),
    width: getResponsiveValue('100%', '100%', 'auto', 'auto', 'auto'),
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: getResponsiveValue('10px 12px', '10px 16px', '8px 16px', '8px 16px', '8px 16px'),
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: getResponsiveValue(13, 13, 14, 14, 14),
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(6, 8, 8, 8, 8),
    transition: 'all 0.2s',
    justifyContent: 'center',
    minWidth: getResponsiveValue('auto', 'auto', 'auto', 'auto', 'auto'),
    flex: getResponsiveValue('1', '1', 'none', 'none', 'none'),
    width: getResponsiveValue('100%', '100%', 'auto', 'auto', 'auto'),
    boxSizing: 'border-box'
  };

  const reservedButtonStyle = {
    ...buttonStyle,
    background: showOnlyReserved ? '#f59e0b' : '#e5e7eb',
    color: showOnlyReserved ? 'white' : '#374151'
  };

  const refreshButtonStyle = {
    ...buttonStyle,
    background: '#2563eb',
    color: 'white'
  };

  const fullScreenButtonStyle = {
    ...buttonStyle,
    background: '#2563eb',
    color: 'white'
  };

  const parkingContainerStyle = isFullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: '#f9fafb',
    padding: getResponsiveValue('10px', '15px', '20px', '20px', '20px'),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  } : {
    background: '#fff',
    borderRadius: getResponsiveValue(6, 8, 10, 12, 12),
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
    padding: getResponsiveValue(8, 12, 16, 24, 24),
    margin: getResponsiveValue('0 4px', '0', '0', '0', '0')
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: getResponsiveValue('column', 'row', 'row', 'row', 'row'),
    justifyContent: 'space-between',
    alignItems: getResponsiveValue('flex-start', 'center', 'center', 'center', 'center'),
    marginBottom: getResponsiveValue(12, 16, 16, 16, 16),
    padding: isFullScreen ? '0 0 16px 0' : '0',
    width: isFullScreen ? '90%' : '100%',
    maxWidth: isFullScreen ? '1400px' : 'none',
    gap: getResponsiveValue(12, 0, 0, 0, 0)
  };

  const titleStyle = {
    fontSize: getResponsiveValue(16, 18, 20, 20, 20),
    margin: 0,
    fontWeight: '600',
    color: '#111827'
  };

  const reservedIndicatorStyle = {
    fontSize: getResponsiveValue(12, 14, 16, 16, 16),
    color: '#f59e0b',
    fontWeight: '500',
    marginLeft: getResponsiveValue(0, 12, 12, 12, 12),
    marginTop: getResponsiveValue(4, 0, 0, 0, 0)
  };

  const canvasContainerStyle = {
    position: 'relative',
    width: isFullScreen ? '90%' : '100%',
    maxWidth: isFullScreen ? '1400px' : 'none',
    height: isFullScreen ? 'calc(100vh - 100px)' : getResponsiveValue(250, 300, 400, 500, 500),
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: getResponsiveValue(4, 6, 8, 8, 8),
    overflow: 'auto',
    minHeight: getResponsiveValue(200, 250, 300, 'auto', 'auto')
  };

  const reservedInfoStyle = {
    padding: getResponsiveValue('6px 10px', '8px 12px', '8px 12px', '8px 12px', '8px 12px'),
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    marginBottom: getResponsiveValue(8, 10, 12, 12, 12),
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(6, 8, 8, 8, 8),
    fontSize: getResponsiveValue(12, 13, 14, 14, 14),
    color: '#92400e'
  };

  const legendStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: getResponsiveValue(16, 20, 24, 24, 24),
    marginTop: getResponsiveValue(12, 16, 20, 20, 20),
    flexWrap: 'wrap',
    width: isFullScreen ? '90%' : '100%',
    maxWidth: isFullScreen ? '1400px' : 'none'
  };

  const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(6, 8, 8, 8, 8)
  };

  const legendBarStyle = {
    width: getResponsiveValue(16, 18, 20, 20, 20),
    height: getResponsiveValue(2, 3, 3, 3, 3),
    backgroundColor: '#10b981'
  };

  const legendTextStyle = {
    fontSize: getResponsiveValue(11, 12, 14, 14, 14)
  };

  const emptyStateStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#6b7280',
    fontSize: getResponsiveValue(13, 14, 16, 16, 16),
    textAlign: 'center',
    padding: getResponsiveValue(20, 24, 32, 32, 32)
  };

  return (
    <div style={containerStyle}>
      {/* Filters and Controls */}
      <div style={filterContainerStyle}>
        <div style={searchContainerStyle}>
          <Search size={getResponsiveValue(14, 16, 16, 16, 16)} style={{ 
            position: 'absolute', 
            left: getResponsiveValue(10, 12, 12, 12, 12), 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            placeholder="Search by slot number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Slots</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
        </select>
        <button
          onClick={() => setShowOnlyReserved(!showOnlyReserved)}
          style={reservedButtonStyle}
        >
          <Clock size={getResponsiveValue(12, 14, 16, 16, 16)} />
          {showOnlyReserved ? 'Show All' : 'Show Reserved Only'}
        </button>
        <button
          onClick={onRefreshData}
          style={refreshButtonStyle}
        >
          <RefreshCw size={getResponsiveValue(12, 14, 16, 16, 16)} />
          Refresh Data
        </button>
      </div>

      {/* Parking Design Status */}
      <div style={parkingContainerStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>
              Real-Time Parking Lot Status
            </h2>
            {showOnlyReserved && (
              <div style={reservedIndicatorStyle}>
                (Reserved Slots Only)
              </div>
            )}
          </div>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            style={fullScreenButtonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            {isFullScreen ? <Minimize2 size={getResponsiveValue(12, 14, 16, 16, 16)} /> : <Maximize2 size={getResponsiveValue(12, 14, 16, 16, 16)} />}
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          </button>
        </div>
        <div style={canvasContainerStyle}>
          {filteredDesignElements && filteredDesignElements.length > 0 ? (
            <>
              {showOnlyReserved && (
                <div style={reservedInfoStyle}>
                  <Clock size={getResponsiveValue(12, 14, 16, 16, 16)} />
                  Showing {filteredDesignElements.filter(el => el.type === 'slot').length} reserved slot(s)
                </div>
              )}
              <DesignerCanvas
                elements={filteredDesignElements}
                selectedId={null}
                onSelect={() => {}} // No selection in dashboard view
                onChange={() => {}} // No editing in dashboard view
                canvas={canvas || { width: 1200, height: 700, backgroundColor: '#f3f4f6' }}
                gridSize={gridSize || 10}
                snapToGrid={false}
                slotStatuses={slots.reduce((acc, slot) => {
                  acc[slot.id] = slot.status;

                  return acc;
                }, {})}
              />
            </>
          ) : (
            <div style={emptyStateStyle}>
              {designElements && designElements.length > 0 
                ? 'No elements match the current filter criteria.' 
                : 'No parking design available. Create a design in the Parking Designer.'
              }
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={legendStyle}>
          <div style={legendItemStyle}>
            <div style={{ ...legendBarStyle, backgroundColor: '#10b981' }}></div>
            <span style={legendTextStyle}>Available</span>
          </div>
          <div style={legendItemStyle}>
            <div style={{ ...legendBarStyle, backgroundColor: '#ef4444' }}></div>
            <span style={legendTextStyle}>Occupied</span>
          </div>
          <div style={legendItemStyle}>
            <div style={{ ...legendBarStyle, backgroundColor: '#f59e0b' }}></div>
            <span style={legendTextStyle}>Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingStatusPage;
