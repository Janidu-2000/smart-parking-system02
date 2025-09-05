import React, { useState, useEffect } from 'react';
import { Send, User, Phone, Mail, MessageSquare, X } from 'lucide-react';
import { addMessageToFirestore } from '../services/messageService';

const MessageForm = ({ onMessageAdded, onClose, isOpen = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    message: '',
    category: 'general',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendMessage = async () => {
    console.log('=== SEND MESSAGE CLICKED ===');
    console.log('Form data:', formData);
    
    if (loading) {
      console.log('Already loading, ignoring click');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.fullName.trim()) {
        throw new Error('Full name is required');
      }
      if (!formData.mobile.trim()) {
        throw new Error('Mobile number is required');
      }
      if (!formData.message.trim()) {
        throw new Error('Message is required');
      }

      console.log('Validation passed, adding message to Firestore...');

      // Add message to Firestore
      const newMessage = await addMessageToFirestore(formData);
      
      console.log('Message added successfully:', newMessage);
      
      // Reset form
      setFormData({
        fullName: '',
        mobile: '',
        email: '',
        message: '',
        category: 'general',
        priority: 'normal'
      });

      // Call callback
      if (onMessageAdded) {
        console.log('Calling onMessageAdded callback...');
        onMessageAdded(newMessage);
      }

      // Close form
      if (onClose) {
        console.log('Closing form...');
        onClose();
      }

    } catch (error) {
      console.error('Error adding message:', error);
      setError(error.message || 'Failed to add message');
    } finally {
      setLoading(false);
      console.log('=== SEND MESSAGE COMPLETED ===');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Modal overlay styles
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: isOpen ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: getResponsiveValue(16, 20, 24, 32, 32)
  };

  // Modal content styles
  const modalStyle = {
    background: '#fff',
    borderRadius: getResponsiveValue(8, 10, 12, 12, 12),
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: getResponsiveValue('100%', '90%', 600, 600, 600),
    maxHeight: getResponsiveValue('90vh', '85vh', '80vh', '80vh', '80vh'),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsiveValue(16, 20, 24, 24, 24),
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  };

  const titleStyle = {
    fontSize: getResponsiveValue(16, 18, 20, 20, 20),
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(8, 10, 12, 12, 12)
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: getResponsiveValue(4, 6, 8, 8, 8),
    borderRadius: '4px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  };

  const formStyle = {
    padding: getResponsiveValue(16, 20, 24, 24, 24),
    overflowY: 'auto',
    flex: 1
  };

  const formGroupStyle = {
    marginBottom: getResponsiveValue(16, 20, 24, 24, 24)
  };

  const labelStyle = {
    display: 'block',
    fontSize: getResponsiveValue(13, 14, 14, 14, 14),
    fontWeight: 500,
    color: '#374151',
    marginBottom: getResponsiveValue(4, 6, 8, 8, 8)
  };

  const inputStyle = {
    width: '100%',
    padding: getResponsiveValue('10px 12px', '12px 14px', '12px 16px', '12px 16px', '12px 16px'),
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: getResponsiveValue(14, 14, 14, 14, 14),
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: getResponsiveValue(100, 120, 140, 140, 140),
    resize: 'vertical',
    fontFamily: 'inherit'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: getResponsiveValue('1fr', '1fr', '1fr 1fr', '1fr 1fr', '1fr 1fr'),
    gap: getResponsiveValue(12, 16, 20, 20, 20)
  };

  const errorStyle = {
    color: '#dc2626',
    fontSize: getResponsiveValue(12, 13, 14, 14, 14),
    marginTop: getResponsiveValue(4, 6, 8, 8, 8),
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(4, 6, 8, 8, 8)
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: getResponsiveValue(8, 12, 16, 16, 16),
    justifyContent: 'flex-end',
    padding: getResponsiveValue(16, 20, 24, 24, 24),
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  };

  const buttonStyle = (primary = false) => ({
    padding: getResponsiveValue('10px 16px', '12px 20px', '12px 24px', '12px 24px', '12px 24px'),
    border: 'none',
    borderRadius: '6px',
    fontSize: getResponsiveValue(13, 14, 14, 14, 14),
    fontWeight: 500,
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(6, 8, 10, 10, 10),
    transition: 'all 0.2s',
    backgroundColor: primary ? '#3b82f6' : '#f3f4f6',
    color: primary ? 'white' : '#374151',
    opacity: loading ? 0.6 : 1
  });

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            <MessageSquare size={getResponsiveValue(18, 20, 22, 22, 22)} />
            Add New Message
          </h2>
          <button style={closeButtonStyle} onClick={handleClose}>
            <X size={getResponsiveValue(18, 20, 22, 22, 22)} />
          </button>
        </div>

        {/* Form Content */}
        <div style={formStyle}>
          {/* Name and Mobile */}
          <div style={rowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                <User size={getResponsiveValue(12, 14, 16, 16, 16)} style={{ marginRight: 6 }} />
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                style={inputStyle}
                disabled={loading}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                <Phone size={getResponsiveValue(12, 14, 16, 16, 16)} style={{ marginRight: 6 }} />
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
                style={inputStyle}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <Mail size={getResponsiveValue(12, 14, 16, 16, 16)} style={{ marginRight: 6 }} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address (optional)"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          {/* Category and Priority */}
          <div style={rowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={selectStyle}
                disabled={loading}
              >
                <option value="general">General</option>
                <option value="support">Support</option>
                <option value="billing">Billing</option>
                <option value="feedback">Feedback</option>
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                style={selectStyle}
                disabled={loading}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <MessageSquare size={getResponsiveValue(12, 14, 16, 16, 16)} style={{ marginRight: 6 }} />
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter your message..."
              style={textareaStyle}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={errorStyle}>
              <X size={getResponsiveValue(12, 14, 16, 16, 16)} />
              {error}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={buttonContainerStyle}>
          <button
            type="button"
            onClick={handleClose}
            style={buttonStyle(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendMessage}
            style={buttonStyle(true)}
            disabled={loading}
          >
            <Send size={getResponsiveValue(12, 14, 16, 16, 16)} />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
