// Inline styles object
const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e5e7eb'
  },
  headerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  navButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    fontSize: '14px'
  },
  navButtonActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff'
  },
  navButtonInactive: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    ':hover': {
      backgroundColor: '#f3f4f6'
    }
  },
  notificationButton: {
    position: 'relative',
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '12px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dashboardContainer: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  contentWrapper: {
    maxWidth: '1280px',
    margin: '0 auto'
  },
  pageTitle: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '32px'
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  analyticsCardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  analyticsCardText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  analyticsCardNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827'
  },
  controlsPanel: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '32px'
  },
  controlsRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  controlsLeft: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flex: '1'
  },
  searchContainer: {
    position: 'relative'
  },
  searchInput: {
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    ':focus': {
      borderColor: '#2563eb',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
    }
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  select: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    outline: 'none'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  parkingLot: {
    backgroundColor: '#6b7280',
    padding: '40px',
    borderRadius: '12px',
    margin: '20px 0'
  },
  parkingRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '60px',
    alignItems: 'center'
  },
  parkingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  roadway: {
    width: '100%',
    height: '4px',
    backgroundColor: '#ffffff',
    position: 'relative'
  },
  slotsGrid: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  },
  parkingSlot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  slotTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  slotVerticalLine: {
    width: '3px',
    height: '40px',
    backgroundColor: '#ffffff'
  },
  slotHorizontalLine: {
    width: '50px',
    height: '3px',
    backgroundColor: '#ffffff'
  },
  slotNumber: {
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 'bold',
    marginTop: '4px',
    textAlign: 'center',
    minWidth: '20px'
  },
  slotCard: {
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  slotCardAvailable: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4'
  },
  slotCardOccupied: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2'
  },
  slotCardReserved: {
    borderColor: '#fef3c7',
    backgroundColor: '#fffbeb'
  },
  slotHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  slotId: {
    fontWeight: '600',
    fontSize: '14px'
  },
  statusBadge: {
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '16px'
  },
  statusAvailable: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  statusOccupied: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  statusReserved: {
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },

  slotPrice: {
    fontSize: '12px',
    fontWeight: '500'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    textAlign: 'left',
    padding: '8px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    fontWeight: '600'
  },
  tableCell: {
    padding: '8px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px'
  },
  driverContainer: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  driverWrapper: {
    maxWidth: '1024px',
    margin: '0 auto'
  },
  searchPanel: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '32px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  availableSlotCard: {
    padding: '16px',
    border: '2px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  availableSlotDefault: {
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff'
  },
  availableSlotSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  slotCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  slotTitle: {
    fontWeight: '600',
    fontSize: '16px'
  },
  priceTag: {
    color: '#059669',
    fontWeight: '500'
  },
  slotDetails: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  slotStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusText: {
    fontSize: '14px',
    color: '#059669'
  },
  selectedSlotInfo: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#dbeafe',
    borderRadius: '6px'
  },
  reservationPanel: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  reservationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  sectionTitle: {
    fontWeight: '500',
    marginBottom: '12px',
    fontSize: '16px'
  },
  detailsList: {
    fontSize: '14px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  detailRowTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: '600',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '8px'
  },
  paymentButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  paymentButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  paymentButtonPrimary: {
    backgroundColor: '#2563eb',
    color: '#ffffff'
  },
  paymentButtonSecondary: {
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #d1d5db'
  },
  paymentButtonSuccess: {
    backgroundColor: '#059669',
    color: '#ffffff'
  },
  notificationPanel: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    width: '320px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    zIndex: '50'
  },
  notificationHeader: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  notificationHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  notificationTitle: {
    fontWeight: '600',
    fontSize: '16px'
  },
  notificationList: {
    maxHeight: '384px',
    overflowY: 'auto'
  },
  notificationItem: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  notificationItemUnread: {
    backgroundColor: '#eff6ff'
  },
  notificationContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '8px'
  },
  notificationDotUnread: {
    backgroundColor: '#2563eb'
  },
  notificationDotRead: {
    backgroundColor: '#d1d5db'
  },
  notificationText: {
    flex: '1'
  },
  notificationItemTitle: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px'
  },
  notificationMessage: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  notificationTime: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  emptyState: {
    padding: '16px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px'
  },
  // Floating Notification Styles
  floatingNotificationContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '1000'
  },
  floatingNotificationButton: {
    width: '56px',
    height: '56px',
    backgroundColor: '#2563eb',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s ease',
    position: 'relative',
    ':hover': {
      backgroundColor: '#1d4ed8',
      transform: 'scale(1.05)'
    }
  },
  floatingNotificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    minWidth: '20px',
    height: '20px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px'
  },
  floatingNotificationPanel: {
    position: 'absolute',
    bottom: '70px',
    right: '0',
    width: '320px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  floatingNotificationHeader: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb'
  },
  floatingNotificationTitle: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#111827',
    margin: '0'
  },
  floatingNotificationCloseButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#e5e7eb'
    }
  },
  floatingQuickActions: {
    padding: '8px 0'
  },
  floatingQuickAction: {
    padding: '12px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #f3f4f6',
    ':hover': {
      backgroundColor: '#f9fafb'
    }
  },
  floatingQuickActionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  floatingQuickActionText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  floatingQuickActionCount: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '10px',
    minWidth: '20px',
    textAlign: 'center'
  },
  floatingNotificationList: {
    maxHeight: '200px',
    overflowY: 'auto'
  },
  floatingNotificationItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f9fafb'
    }
  },
  floatingNotificationItemUnread: {
    backgroundColor: '#eff6ff'
  },
  floatingNotificationContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  floatingNotificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: '0'
  },
  floatingNotificationDotUnread: {
    backgroundColor: '#2563eb'
  },
  floatingNotificationDotRead: {
    backgroundColor: '#d1d5db'
  },
  floatingNotificationText: {
    flex: '1',
    minWidth: '0'
  },
  floatingNotificationItemTitle: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
    color: '#111827'
  },
  floatingNotificationMessage: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
    lineHeight: '1.4'
  },
  floatingNotificationTime: {
    fontSize: '11px',
    color: '#9ca3af'
  },
  floatingEmptyState: {
    padding: '16px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px'
  },
  floatingViewAllButton: {
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  floatingViewAllButtonText: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#1d4ed8'
    }
  },
  // Additional styles for enhanced notification features
  floatingQuickActions: {
    padding: '8px 0'
  },
  floatingQuickAction: {
    padding: '12px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #f3f4f6',
    ':hover': {
      backgroundColor: '#f9fafb'
    }
  },
  floatingQuickActionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  floatingQuickActionText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  floatingQuickActionCount: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '10px',
    minWidth: '20px',
    textAlign: 'center'
  }
};

export default styles;