import React, { useState, useEffect } from 'react';
import { Send, X, MessageSquare, User, Clock } from 'lucide-react';
import { replyToMessage } from '../services/messageService';

const ReplyModal = ({ isOpen, onClose, message, onReplySent }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReplyText('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      setError('Please enter a reply message');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const replyData = {
        message: replyText.trim()
      };
      
      const newReply = await replyToMessage(message.id, replyData);
      
      // Call the callback to refresh the messages list
      if (onReplySent) {
        onReplySent(newReply);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error sending reply:', error);
      setError(error.message || 'Failed to send reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !message) return null;

  // Responsive styles
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    position: 'relative'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    color: '#6b7280',
    transition: 'color 0.2s',
    ':hover': {
      color: '#374151'
    }
  };

  const originalMessageStyle = {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  };

  const originalMessageHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const originalMessageUserStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const originalMessageTimeStyle = {
    fontSize: '12px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const originalMessageContentStyle = {
    fontSize: '14px',
    color: '#111827',
    lineHeight: '1.5'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.5',
    resize: 'vertical',
    fontFamily: 'inherit',
    ':focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  };

  const errorStyle = {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '8px'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px'
  };

  const cancelButtonStyle = {
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#fff',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      background: '#f9fafb',
      borderColor: '#9ca3af'
    }
  };

  const sendButtonStyle = {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#3b82f6',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    ':hover': {
      background: loading ? '#3b82f6' : '#2563eb'
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleStyle}>
            <MessageSquare size={20} />
            Reply to Message
          </div>
          <button style={closeButtonStyle} onClick={handleClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Original Message */}
        <div style={originalMessageStyle}>
          <div style={originalMessageHeaderStyle}>
            <div style={originalMessageUserStyle}>
              <User size={14} />
              {message.fullName || 'Unknown User'}
            </div>
            <div style={originalMessageTimeStyle}>
              <Clock size={12} />
              {getTimeAgo(message.createdAt || message.timestamp)}
            </div>
          </div>
          <div style={originalMessageContentStyle}>
            {message.message || 'No message content'}
          </div>
        </div>

        {/* Reply Form */}
        <form style={formStyle} onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>
              Your Reply
            </label>
            <textarea
              style={textareaStyle}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <div style={buttonContainerStyle}>
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={sendButtonStyle}
              disabled={loading || !replyText.trim()}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyModal;
