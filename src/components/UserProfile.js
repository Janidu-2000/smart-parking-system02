import React, { useState, useEffect } from 'react';
import { User, Mail, Save, X, Edit3, Phone, MapPin, Calendar } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const UserProfile = ({ onClose }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallTablet, setIsSmallTablet] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth <= 1440);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: ''
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
      setIsSmallTablet(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
      setIsLargeScreen(window.innerWidth <= 1440);
    };
    window.addEventListener('resize', handleResize);
    
    // Load user data from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    setUserData({
      name: authUser.name || '',
      email: authUser.email || '',
      phone: authUser.phone || '',
      address: authUser.address || '',
      joinDate: authUser.joinDate || new Date().toLocaleDateString()
    });
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsiveValue = (mobile, smallTablet, tablet, large, desktop) => {
    if (isMobile) return mobile;
    if (isSmallTablet) return smallTablet;
    if (isTablet) return tablet;
    if (isLargeScreen) return large;
    return desktop;
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update Firebase profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: userData.name
        });
      }
      
      // Update localStorage
      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      const updatedAuthUser = {
        ...authUser,
        name: userData.name,
        phone: userData.phone,
        address: userData.address
      };
      localStorage.setItem('authUser', JSON.stringify(updatedAuthUser));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    setUserData({
      name: authUser.name || '',
      email: authUser.email || '',
      phone: authUser.phone || '',
      address: authUser.address || '',
      joinDate: authUser.joinDate || new Date().toLocaleDateString()
    });
    setIsEditing(false);
    setError('');
  };

  // Responsive styles
  const overlayStyle = {
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
    padding: getResponsiveValue(16, 20, 24, 32, 32)
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: getResponsiveValue(12, 16, 20, 24, 24),
    padding: getResponsiveValue(20, 24, 28, 32, 32),
    width: '100%',
    maxWidth: getResponsiveValue('100%', '90%', '80%', '600px', '600px'),
    maxHeight: getResponsiveValue('90vh', '85vh', '80vh', '75vh', '75vh'),
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    position: 'relative'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getResponsiveValue(20, 24, 28, 32, 32),
    paddingBottom: getResponsiveValue(16, 20, 24, 28, 28),
    borderBottom: '1px solid #e5e7eb'
  };

  const titleStyle = {
    fontSize: getResponsiveValue(18, 20, 22, 24, 24),
    fontWeight: 700,
    color: '#1f2937',
    margin: 0
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  };

  const fieldStyle = {
    marginBottom: getResponsiveValue(16, 20, 24, 28, 28)
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(6, 8, 10, 12, 12),
    fontSize: getResponsiveValue(14, 15, 16, 16, 16),
    fontWeight: 600,
    color: '#374151',
    marginBottom: getResponsiveValue(6, 8, 10, 12, 12)
  };

  const inputStyle = {
    width: '100%',
    padding: getResponsiveValue('10px 12px', '12px 14px', '14px 16px', '14px 16px', '14px 16px'),
    border: '1px solid #d1d5db',
    borderRadius: getResponsiveValue(6, 8, 10, 12, 12),
    fontSize: getResponsiveValue(14, 15, 16, 16, 16),
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: getResponsiveValue(80, 90, 100, 100, 100),
    resize: 'vertical'
  };

  const readOnlyStyle = {
    ...inputStyle,
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    cursor: 'not-allowed'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: getResponsiveValue(8, 12, 16, 20, 20),
    marginTop: getResponsiveValue(24, 28, 32, 36, 36),
    flexDirection: getResponsiveValue('column', 'row', 'row', 'row', 'row')
  };

  const buttonStyle = {
    padding: getResponsiveValue('10px 16px', '12px 20px', '14px 24px', '14px 24px', '14px 24px'),
    border: 'none',
    borderRadius: getResponsiveValue(6, 8, 10, 12, 12),
    fontSize: getResponsiveValue(14, 15, 16, 16, 16),
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveValue(6, 8, 10, 12, 12),
    flex: getResponsiveValue('none', 'none', 'none', 1, 1)
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2563eb',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white'
  };

  const messageStyle = {
    padding: getResponsiveValue(10, 12, 14, 16, 16),
    borderRadius: getResponsiveValue(6, 8, 10, 12, 12),
    marginBottom: getResponsiveValue(16, 20, 24, 28, 28),
    fontSize: getResponsiveValue(13, 14, 15, 16, 16)
  };

  const successMessageStyle = {
    ...messageStyle,
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0'
  };

  const errorMessageStyle = {
    ...messageStyle,
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>User Profile</h2>
          <button style={closeButtonStyle} onClick={onClose}>
            <X size={getResponsiveValue(18, 20, 22, 24, 24)} />
          </button>
        </div>

        {error && <div style={errorMessageStyle}>{error}</div>}
        {success && <div style={successMessageStyle}>{success}</div>}

        <div style={fieldStyle}>
          <label style={labelStyle}>
            <User size={getResponsiveValue(16, 18, 20, 20, 20)} />
            Full Name
          </label>
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({...userData, name: e.target.value})}
            disabled={!isEditing}
            style={isEditing ? inputStyle : readOnlyStyle}
            placeholder="Enter your full name"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>
            <Mail size={getResponsiveValue(16, 18, 20, 20, 20)} />
            Email Address
          </label>
          <input
            type="email"
            value={userData.email}
            disabled={true}
            style={readOnlyStyle}
            placeholder="Email address"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>
            <Phone size={getResponsiveValue(16, 18, 20, 20, 20)} />
            Phone Number
          </label>
          <input
            type="tel"
            value={userData.phone}
            onChange={(e) => setUserData({...userData, phone: e.target.value})}
            disabled={!isEditing}
            style={isEditing ? inputStyle : readOnlyStyle}
            placeholder="Enter your phone number"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>
            <MapPin size={getResponsiveValue(16, 18, 20, 20, 20)} />
            Address
          </label>
          <textarea
            value={userData.address}
            onChange={(e) => setUserData({...userData, address: e.target.value})}
            disabled={!isEditing}
            style={isEditing ? textareaStyle : {...readOnlyStyle, minHeight: getResponsiveValue(80, 90, 100, 100, 100)}}
            placeholder="Enter your address"
            rows={3}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>
            <Calendar size={getResponsiveValue(16, 18, 20, 20, 20)} />
            Join Date
          </label>
          <input
            type="text"
            value={userData.joinDate}
            disabled={true}
            style={readOnlyStyle}
            placeholder="Join date"
          />
        </div>

        <div style={buttonGroupStyle}>
          {!isEditing ? (
            <>
              <button
                style={primaryButtonStyle}
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={getResponsiveValue(16, 18, 20, 20, 20)} />
                Edit Profile
              </button>
              <button
                style={secondaryButtonStyle}
                onClick={onClose}
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                style={primaryButtonStyle}
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={getResponsiveValue(16, 18, 20, 20, 20)} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                style={secondaryButtonStyle}
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={getResponsiveValue(16, 18, 20, 20, 20)} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

