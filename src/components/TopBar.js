import React, { useState, useEffect } from 'react';

const TopBar = ({ pageName }) => {
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
  
  const marginLeft = getResponsiveValue(0, 0, 240, 240);
  const width = getResponsiveValue('100vw', '100vw', `calc(100vw - 240px)`, `calc(100vw - 240px)`);
  const height = getResponsiveValue(60, 48, 48, 48);
  const fontSize = getResponsiveValue(16, 17, 18, 18);
  const textMargin = getResponsiveValue(16, 24, 32, 32);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width,
      height,
      background: '#f3f6fb',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      zIndex: 200,
      boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)',
      marginLeft,
      transition: 'margin-left 0.2s, width 0.2s',
    }}>
      <span style={{ 
        fontWeight: 600, 
        fontSize, 
        color: '#2563eb', 
        marginLeft: textMargin,
        textAlign: getResponsiveValue('center', 'left', 'left', 'left'),
        width: getResponsiveValue('100%', 'auto', 'auto', 'auto')
      }}>
        {pageName}
      </span>
    </div>
  );
};

export default TopBar;
