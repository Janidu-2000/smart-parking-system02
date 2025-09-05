import React from 'react';
import { useResponsive, getTopBarStyles } from '../utils/responsive';
import NotificationButton from './NotificationButton';

const TopBar = ({ pageName, onNavigateToSection }) => {
  const screenSize = useResponsive();
  const topBarStyles = getTopBarStyles(screenSize);
  
  return (
    <div style={topBarStyles.topBar}>
      <span style={topBarStyles.title}>
        {pageName}
      </span>
      <NotificationButton onNavigateToSection={onNavigateToSection} />
    </div>
  );
};

export default TopBar;
