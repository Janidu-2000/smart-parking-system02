import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, MessageSquare, Clock, Phone, Mail } from 'lucide-react';
import { getConversationMessages, sendMessageToConversation } from '../services/messageService';

const ConversationView = ({ conversation, onBack, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const messagesEndRef = useRef(null);

  // Responsive breakpoint handling
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive helper function
  const getResponsiveValue = (mobile, tablet, desktop) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  // Load conversation messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation?.userId) return;
      
      try {
        setLoading(true);
        setError('');
        const conversationMessages = await getConversationMessages(conversation.userId);
        setMessages(conversationMessages);
      } catch (error) {
        console.error('Error loading conversation messages:', error);
        setError('Failed to load conversation messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation?.userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation?.userId) return;

    try {
      setSending(true);
      setError('');
      
      const messageData = {
        message: newMessage.trim()
      };
      
      const sentMessage = await sendMessageToConversation(conversation.userId, messageData);
      
      // Add the new message to the local state
      setMessages(prev => [...prev, {
        id: sentMessage.id,
        message: sentMessage.message,
        isAdminReply: true,
        timestamp: new Date(),
        status: 'read',
        category: 'reply',
        priority: 'normal',
        replyTo: null,
        fullName: 'Admin'
      }]);
      
      // Clear input
      setNewMessage('');
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent(sentMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!conversation) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>No conversation selected</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{
        ...styles.header,
        padding: getResponsiveValue('12px 16px', '16px 20px', '16px 20px'),
        flexDirection: isMobile ? 'column' : 'row',
        gap: getResponsiveValue(12, 16, 16),
        alignItems: isMobile ? 'stretch' : 'center'
      }}>
        <div style={{
          ...styles.headerTop,
          flexDirection: isMobile ? 'column' : 'row',
          gap: getResponsiveValue(12, 16, 16),
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          <button 
            onClick={onBack}
            style={{
              ...styles.backButton,
              width: getResponsiveValue('100%', '40px', '40px'),
              height: getResponsiveValue('44px', '40px', '40px'),
              alignSelf: isMobile ? 'stretch' : 'flex-start'
            }}
            title="Back to conversations"
          >
            <ArrowLeft size={getResponsiveValue(18, 20, 20)} />
            {isMobile && 'Back to Conversations'}
          </button>
          
          <div style={{
            ...styles.userInfo,
            flexDirection: isMobile ? 'column' : 'row',
            gap: getResponsiveValue(12, 12, 12),
            alignItems: isMobile ? 'center' : 'flex-start',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <div style={{
              ...styles.avatar,
              width: getResponsiveValue(56, 48, 48),
              height: getResponsiveValue(56, 48, 48),
              fontSize: getResponsiveValue(20, 18, 18)
            }}>
              {conversation.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={styles.userDetails}>
              <div style={{
                ...styles.userName,
                fontSize: getResponsiveValue(20, 18, 18),
                textAlign: isMobile ? 'center' : 'left'
              }}>
                {conversation.userName}
              </div>
              <div style={{
                ...styles.userMeta,
                flexDirection: isMobile ? 'column' : 'row',
                gap: getResponsiveValue(8, 16, 16),
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                {conversation.userPhone && (
                  <span style={styles.metaItem}>
                    <Phone size={getResponsiveValue(16, 14, 14)} />
                    {conversation.userPhone}
                  </span>
                )}
                {conversation.userEmail && (
                  <span style={styles.metaItem}>
                    <Mail size={getResponsiveValue(16, 14, 14)} />
                    {conversation.userEmail}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          ...styles.conversationStats,
          flexDirection: isMobile ? 'row' : 'row',
          gap: getResponsiveValue(8, 12, 12),
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          width: isMobile ? '100%' : 'auto'
        }}>
          <div style={{
            ...styles.statItem,
            fontSize: getResponsiveValue(12, 14, 14),
            padding: getResponsiveValue('6px 10px', '6px 12px', '6px 12px')
          }}>
            <MessageSquare size={getResponsiveValue(14, 16, 16)} />
            {isMobile ? `${conversation.messageCount} msgs` : `${conversation.messageCount} messages`}
          </div>
          {conversation.unreadCount > 0 && (
            <div style={{
              ...styles.unreadBadge,
              fontSize: getResponsiveValue(11, 12, 12),
              padding: getResponsiveValue('4px 6px', '4px 8px', '4px 8px')
            }}>
              {conversation.unreadCount} unread
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div style={styles.messagesContainer}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={{
              ...styles.loadingText,
              fontSize: getResponsiveValue(14, 16, 16)
            }}>
              Loading conversation...
            </div>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <div style={{
              ...styles.errorText,
              fontSize: getResponsiveValue(14, 16, 16)
            }}>
              {error}
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                ...styles.retryButton,
                fontSize: getResponsiveValue(13, 14, 14),
                padding: getResponsiveValue('8px 16px', '8px 16px', '8px 16px')
              }}
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyContainer}>
            <div style={{
              ...styles.emptyIcon,
              fontSize: getResponsiveValue(40, 48, 48)
            }}>
              <MessageSquare size={getResponsiveValue(40, 48, 48)} />
            </div>
            <div style={{
              ...styles.emptyText,
              fontSize: getResponsiveValue(16, 18, 18)
            }}>
              No messages yet
            </div>
            <div style={{
              ...styles.emptySubtext,
              fontSize: getResponsiveValue(13, 14, 16)
            }}>
              Start the conversation by sending a message
            </div>
          </div>
        ) : (
          <div style={{
            ...styles.messagesList,
            padding: getResponsiveValue('16px', '20px', '20px'),
            gap: getResponsiveValue(12, 16, 16)
          }}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                style={{
                  ...styles.messageItem,
                  ...(message.isAdminReply ? styles.adminMessage : styles.userMessage),
                  maxWidth: getResponsiveValue('85%', '70%', '70%'),
                  padding: getResponsiveValue('10px 12px', '12px 16px', '12px 16px')
                }}
              >
                <div style={{
                  ...styles.messageHeader,
                  marginBottom: getResponsiveValue(4, 6, 6),
                  gap: getResponsiveValue(8, 12, 12)
                }}>
                  <div style={{
                    ...styles.messageSender,
                    fontSize: getResponsiveValue(11, 12, 12)
                  }}>
                    {message.isAdminReply ? 'Admin' : conversation.userName}
                  </div>
                  <div style={{
                    ...styles.messageTime,
                    fontSize: getResponsiveValue(10, 11, 11),
                    gap: getResponsiveValue(3, 4, 4)
                  }}>
                    <Clock size={getResponsiveValue(10, 12, 12)} />
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                
                <div style={{
                  ...styles.messageContent,
                  fontSize: getResponsiveValue(13, 14, 14)
                }}>
                  {message.message}
                </div>
                
                {message.replyTo && (
                  <div style={{
                    ...styles.replyContext,
                    marginTop: getResponsiveValue(6, 8, 8),
                    padding: getResponsiveValue('6px 10px', '8px 12px', '8px 12px'),
                    fontSize: getResponsiveValue(11, 12, 12)
                  }}>
                    <div style={{
                      ...styles.replyHeader,
                      marginBottom: getResponsiveValue(3, 4, 4)
                    }}>
                      Replying to: {message.replyTo.userName}
                    </div>
                    <div style={styles.replyContent}>
                      "{message.replyTo.originalMessage}"
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div style={{
        ...styles.inputContainer,
        padding: getResponsiveValue('12px 16px', '16px 20px', '16px 20px')
      }}>
        <form onSubmit={handleSendMessage} style={{
          ...styles.inputForm,
          gap: getResponsiveValue(8, 12, 12)
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              ...styles.messageInput,
              padding: getResponsiveValue('10px 14px', '12px 16px', '12px 16px'),
              fontSize: getResponsiveValue(14, 14, 14),
              minHeight: getResponsiveValue(40, 44, 44),
              maxHeight: getResponsiveValue(100, 120, 120)
            }}
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              ...styles.sendButton,
              ...(sending && styles.sendButtonDisabled),
              width: getResponsiveValue(40, 44, 44),
              height: getResponsiveValue(40, 44, 44)
            }}
          >
            <Send size={getResponsiveValue(16, 18, 18)} />
          </button>
        </form>
        
        {error && (
          <div style={{
            ...styles.inputError,
            fontSize: getResponsiveValue(13, 14, 14),
            marginTop: getResponsiveValue(6, 8, 8)
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f8fafc',
    paddingTop: '60px', // Add padding to account for fixed navbar
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
    zIndex: 10,
    position: 'sticky',
    top: 0
  },
  
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500',
    ':hover': {
      backgroundColor: '#e2e8f0',
      color: '#475569'
    }
  },
  
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  
  avatar: {
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    flexShrink: 0
  },
  
  userDetails: {
    flex: 1,
    minWidth: 0
  },
  
  userName: {
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  
  userMeta: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b'
  },
  
  conversationStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0
  },
  
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    fontWeight: '500'
  },
  
  unreadBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    minWidth: '20px',
    textAlign: 'center'
  },
  
  messagesContainer: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0 // Ensure proper flex behavior
  },
  
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b'
  },
  
  loadingText: {
    fontSize: '16px'
  },
  
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
    color: '#ef4444'
  },
  
  errorText: {
    fontSize: '16px',
    textAlign: 'center'
  },
  
  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    textAlign: 'center'
  },
  
  emptyIcon: {
    marginBottom: '16px',
    opacity: 0.5
  },
  
  emptyText: {
    fontWeight: '500',
    marginBottom: '8px'
  },
  
  emptySubtext: {
    opacity: 0.7
  },
  
  messagesList: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingBottom: '20px' // Add bottom padding for better scrolling
  },
  
  messageItem: {
    borderRadius: '12px',
    position: 'relative'
  },
  
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    color: '#1e293b'
  },
  
  adminMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    gap: '12px'
  },
  
  messageSender: {
    fontWeight: '600',
    opacity: 0.8
  },
  
  messageTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    opacity: 0.7
  },
  
  messageContent: {
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  
  replyContext: {
    marginTop: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '6px'
  },
  
  replyHeader: {
    fontWeight: '600',
    marginBottom: '4px',
    opacity: 0.8
  },
  
  replyContent: {
    fontStyle: 'italic',
    opacity: 0.7
  },
  
  inputContainer: {
    backgroundColor: 'white',
    borderTop: '1px solid #e2e8f0',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0
  },
  
  inputForm: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end'
  },
  
  messageInput: {
    flex: 1,
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },
  
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  },
  
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: '#9ca3af'
    }
  },
  
  inputError: {
    fontSize: '14px',
    color: '#ef4444',
    textAlign: 'center'
  }
};

export default ConversationView;
