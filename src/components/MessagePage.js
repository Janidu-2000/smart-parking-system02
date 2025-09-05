import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, User, Clock, Filter, MessageSquare, Star, Archive, Trash2, Reply, MoreVertical, Plus, Folder, ChevronRight } from 'lucide-react';
import { getConversationsFromFirestore } from '../services/messageService';
import MessageForm from './MessageForm';
import ConversationView from './ConversationView';

const MessagePage = ({ messages: propMessages = [], onRefreshData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallTablet, setIsSmallTablet] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth <= 1440);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Load conversations from Firestore
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const firestoreConversations = await getConversationsFromFirestore();
        setConversations(firestoreConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

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

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter(conversation => {
      const matchesSearch = 
        conversation.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.userPhone?.includes(searchTerm) ||
        conversation.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'unread' && conversation.unreadCount > 0) ||
        (statusFilter === 'read' && conversation.unreadCount === 0);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.lastMessageTime);
          bValue = new Date(b.lastMessageTime);
          break;
        case 'name':
          aValue = (a.userName || '').toLowerCase();
          bValue = (b.userName || '').toLowerCase();
          break;
        case 'unread':
          aValue = a.unreadCount;
          bValue = b.unreadCount;
          break;
        case 'priority':
          aValue = a.priority === 'high' ? 1 : 0;
          bValue = b.priority === 'high' ? 1 : 0;
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Helper function to format time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Handle opening a conversation
  const handleOpenConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  // Handle going back to conversations list
  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  // Handle message sent in conversation
  const handleMessageSent = (newMessage) => {
    // Refresh conversations to update unread counts and last message
    const loadConversations = async () => {
      try {
        const firestoreConversations = await getConversationsFromFirestore();
        setConversations(firestoreConversations);
      } catch (error) {
        console.error('Error refreshing conversations:', error);
      }
    };
    loadConversations();
    
    if (onRefreshData) {
      onRefreshData();
    }
  };

  // If a conversation is selected, show the conversation view
  if (selectedConversation) {
    return (
      <ConversationView
        conversation={selectedConversation}
        onBack={handleBackToConversations}
        onMessageSent={handleMessageSent}
      />
    );
  }

  // Responsive styles
  const containerStyle = {
    margin: getResponsiveValue('0', '10px 8px', '15px 12px', '20px 0 20px 20px', '20px 0 20px 20px'),
    padding: getResponsiveValue(8, 12, 16, 24, 24),
    paddingTop: getResponsiveValue(60, 31, 32, 48, 48),
    maxWidth: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: getResponsiveValue('column', 'column', 'row', 'row', 'row'),
    justifyContent: 'space-between',
    alignItems: getResponsiveValue('flex-start', 'flex-start', 'center', 'center', 'center'),
    marginBottom: getResponsiveValue(16, 20, 24, 24, 24),
    gap: getResponsiveValue(12, 16, 0, 0, 0)
  };

  const titleStyle = {
    fontSize: getResponsiveValue(18, 20, 22, 24, 24),
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(8, 10, 12, 12, 12)
  };

  const statsStyle = {
    display: 'flex',
    gap: getResponsiveValue(8, 12, 16, 16, 16),
    flexWrap: 'wrap',
    justifyContent: getResponsiveValue('center', 'center', 'flex-end', 'flex-end', 'flex-end')
  };

  const statItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(4, 6, 8, 8, 8),
    padding: getResponsiveValue('6px 10px', '8px 12px', '8px 12px', '8px 12px', '8px 12px'),
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    fontSize: getResponsiveValue(11, 12, 13, 14, 14),
    color: '#374151',
    fontWeight: '500',
    flex: getResponsiveValue('1', '1', 'none', 'none', 'none'),
    justifyContent: 'center'
  };

  const filterContainerStyle = {
    display: 'flex',
    flexDirection: getResponsiveValue('column', 'column', 'row', 'row', 'row'),
    gap: getResponsiveValue(8, 10, 12, 16, 16),
    marginBottom: getResponsiveValue(16, 20, 24, 24, 24),
    flexWrap: 'wrap',
    alignItems: getResponsiveValue('stretch', 'stretch', 'center', 'center', 'center')
  };

  const searchContainerStyle = {
    position: 'relative',
    flex: getResponsiveValue('1', '1', '1', '1', '1')
  };

  const searchInputStyle = {
    padding: getResponsiveValue('10px 12px 10px 40px', '10px 12px 10px 40px', '8px 12px 8px 40px', '8px 12px 8px 40px', '8px 12px 8px 40px'),
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
    boxSizing: 'border-box'
  };

  const conversationGridStyle = {
    display: 'grid',
    gridTemplateColumns: getResponsiveValue(
      '1fr',
      '1fr',
      '1fr',
      'repeat(auto-fit, minmax(400px, 1fr))',
      'repeat(auto-fit, minmax(450px, 1fr))'
    ),
    gap: getResponsiveValue(12, 16, 20, 24, 24)
  };

  const conversationCardStyle = (conversation) => ({
    background: '#fff',
    borderRadius: getResponsiveValue(8, 10, 12, 12, 12),
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
    border: `1px solid ${conversation.unreadCount > 0 ? '#dbeafe' : '#e5e7eb'}`,
    padding: getResponsiveValue(16, 20, 24, 24, 24),
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)'
    }
  });

  const conversationHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: getResponsiveValue('flex-start', 'flex-start', 'flex-start', 'flex-start', 'flex-start'),
    marginBottom: getResponsiveValue(8, 12, 16, 16, 16),
    gap: getResponsiveValue(8, 10, 12, 12, 12),
    flexDirection: getResponsiveValue('column', 'column', 'row', 'row', 'row')
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: getResponsiveValue('center', 'center', 'center', 'center', 'center'),
    gap: getResponsiveValue(8, 10, 12, 12, 12),
    flex: 1,
    minWidth: 0,
    flexDirection: getResponsiveValue('column', 'row', 'row', 'row', 'row'),
    textAlign: getResponsiveValue('center', 'left', 'left', 'left', 'left')
  };

  const avatarStyle = {
    width: getResponsiveValue(48, 36, 40, 40, 40),
    height: getResponsiveValue(48, 36, 40, 40, 40),
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: getResponsiveValue(16, 13, 14, 14, 14),
    flexShrink: 0
  };

  const userDetailsStyle = {
    flex: 1,
    minWidth: 0
  };

  const userNameStyle = {
    fontSize: getResponsiveValue(16, 15, 16, 16, 16),
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 2px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const userContactStyle = {
    fontSize: getResponsiveValue(11, 12, 13, 13, 13),
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(4, 6, 8, 8, 8),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexDirection: getResponsiveValue('column', 'row', 'row', 'row', 'row'),
    justifyContent: getResponsiveValue('center', 'flex-start', 'flex-start', 'flex-start', 'flex-start')
  };

  const conversationMetaStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: getResponsiveValue('center', 'flex-end', 'flex-end', 'flex-end', 'flex-end'),
    gap: getResponsiveValue(4, 6, 8, 8, 8),
    flexShrink: 0
  };

  const timestampStyle = {
    fontSize: getResponsiveValue(10, 11, 12, 12, 12),
    color: '#9ca3af',
    whiteSpace: 'nowrap'
  };

  const unreadIndicatorStyle = (unreadCount) => ({
    width: getResponsiveValue(8, 10, 12, 12, 12),
    height: getResponsiveValue(8, 10, 12, 12, 12),
    borderRadius: '50%',
    backgroundColor: unreadCount > 0 ? '#ef4444' : '#9ca3af',
    flexShrink: 0
  });

  const categoryBadgeStyle = {
    padding: getResponsiveValue('2px 6px', '3px 8px', '4px 8px', '4px 8px', '4px 8px'),
    borderRadius: '4px',
    fontSize: getResponsiveValue(9, 10, 11, 11, 11),
    fontWeight: '500',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    whiteSpace: 'nowrap'
  };

  const lastMessageStyle = {
    fontSize: getResponsiveValue(13, 14, 15, 15, 15),
    color: '#374151',
    lineHeight: 1.5,
    margin: '0 0 12px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const conversationActionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: getResponsiveValue(8, 12, 16, 16, 16),
    borderTop: '1px solid #f3f4f6',
    flexDirection: getResponsiveValue('column', 'row', 'row', 'row', 'row'),
    gap: getResponsiveValue(12, 0, 0, 0, 0)
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: getResponsiveValue(6, 8, 10, 10, 10)
  };

  const actionButtonStyle = {
    padding: getResponsiveValue('6px 8px', '8px 10px', '8px 12px', '8px 12px', '8px 12px'),
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: getResponsiveValue(11, 12, 13, 13, 13),
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(4, 6, 8, 8, 8),
    transition: 'background-color 0.2s',
    backgroundColor: 'transparent',
    color: '#6b7280'
  };

  const openButtonStyle = {
    padding: getResponsiveValue('8px 12px', '10px 16px', '10px 16px', '10px 16px', '10px 16px'),
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: getResponsiveValue(12, 13, 14, 14, 14),
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: getResponsiveValue(4, 6, 8, 8, 8),
    transition: 'background-color 0.2s',
    width: getResponsiveValue('100%', 'auto', 'auto', 'auto', 'auto'),
    justifyContent: 'center',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: getResponsiveValue(40, 60, 80, 100, 100),
    color: '#6b7280'
  };

  const emptyStateIconStyle = {
    fontSize: getResponsiveValue(48, 64, 80, 80, 80),
    marginBottom: getResponsiveValue(16, 20, 24, 24, 24),
    opacity: 0.5
  };

  const emptyStateTextStyle = {
    fontSize: getResponsiveValue(14, 16, 18, 18, 18),
    marginBottom: getResponsiveValue(8, 12, 16, 16, 16)
  };

  const emptyStateSubtextStyle = {
    fontSize: getResponsiveValue(12, 14, 16, 16, 16),
    opacity: 0.7
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <Folder size={getResponsiveValue(20, 22, 24, 24, 24)} />
          User Conversations
        </h2>
        
        <div style={statsStyle}>
          <div style={statItemStyle}>
            <Folder size={getResponsiveValue(14, 16, 18, 18, 18)} />
            {filteredConversations.length} conversations
          </div>
          <div style={statItemStyle}>
            <MessageSquare size={getResponsiveValue(14, 16, 18, 18, 18)} />
            {filteredConversations.reduce((total, conv) => total + conv.messageCount, 0)} total messages
          </div>
          <div style={statItemStyle}>
            <Star size={getResponsiveValue(14, 16, 18, 18, 18)} />
            {filteredConversations.reduce((total, conv) => total + conv.unreadCount, 0)} unread
          </div>
          <button
            onClick={() => setShowMessageForm(true)}
            style={{
              ...statItemStyle,
              cursor: 'pointer',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: getResponsiveValue(4, 6, 8, 8, 8),
              flex: getResponsiveValue('1', '1', 'none', 'none', 'none')
            }}
          >
            <Plus size={getResponsiveValue(14, 16, 18, 18, 18)} />
            {getResponsiveValue('Add', 'Add', 'Add Message', 'Add Message', 'Add Message')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={filterContainerStyle}>
        <div style={searchContainerStyle}>
          <Search size={getResponsiveValue(16, 18, 20, 20, 20)} style={{ 
            position: 'absolute', 
            left: getResponsiveValue(12, 14, 16, 16, 16), 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            placeholder={getResponsiveValue(
              "Search conversations...",
              "Search conversations...",
              "Search conversations, names, or messages...",
              "Search conversations, names, or messages...",
              "Search conversations, names, or messages..."
            )}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Conversations</option>
          <option value="unread">Has Unread</option>
          <option value="read">All Read</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={selectStyle}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="unread">Sort by Unread</option>
          <option value="priority">Sort by Priority</option>
        </select>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: getResponsiveValue('10px 12px', '10px 12px', '8px 12px', '8px 12px', '8px 12px'),
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: getResponsiveValue(14, 14, 14, 14, 14),
            minWidth: getResponsiveValue('auto', 'auto', 'auto', 'auto', 'auto'),
            flex: getResponsiveValue('1', '1', 'none', 'none', 'none')
          }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Conversations Grid */}
      {loading ? (
        <div style={emptyStateStyle}>
          <div style={emptyStateTextStyle}>Loading conversations...</div>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={emptyStateIconStyle}>
            <Folder />
          </div>
          <div style={emptyStateTextStyle}>
            {conversations.length === 0 ? 'No conversations found' : 'No conversations match your search criteria'}
          </div>
          <div style={emptyStateSubtextStyle}>
            {conversations.length === 0 ? 'User conversations will appear here when they contact you.' : 'Try adjusting your search or filter criteria.'}
          </div>
        </div>
      ) : (
        <div style={conversationGridStyle}>
          {filteredConversations.map((conversation) => (
            <div 
              key={conversation.userId} 
              style={conversationCardStyle(conversation)}
              onClick={() => handleOpenConversation(conversation)}
            >
              {/* Conversation Header */}
              <div style={conversationHeaderStyle}>
                <div style={userInfoStyle}>
                  <div style={avatarStyle}>
                    {conversation.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={userDetailsStyle}>
                    <div style={userNameStyle}>{conversation.userName}</div>
                    <div style={userContactStyle}>
                      {conversation.userPhone && (
                        <>
                      <Phone size={getResponsiveValue(10, 12, 14, 14, 14)} />
                          {conversation.userPhone}
                        </>
                      )}
                      {conversation.userEmail && (
                        <>
                          <Mail size={getResponsiveValue(10, 12, 14, 14, 14)} />
                          {conversation.userEmail}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div style={conversationMetaStyle}>
                  <div style={timestampStyle}>
                    {getTimeAgo(conversation.lastMessageTime)}
                  </div>
                  <div style={unreadIndicatorStyle(conversation.unreadCount)} />
                </div>
              </div>

              {/* Last Message */}
              <div style={lastMessageStyle}>
                {conversation.lastMessage || 'No messages yet'}
              </div>

              {/* Conversation Actions */}
              <div style={conversationActionsStyle}>
                <div style={{ display: 'flex', gap: getResponsiveValue(6, 8, 10, 10, 10), flexWrap: 'wrap', justifyContent: getResponsiveValue('center', 'flex-start', 'flex-start', 'flex-start', 'flex-start') }}>
                  <span style={categoryBadgeStyle}>
                    {conversation.category}
                  </span>
                  <span style={{
                    ...statItemStyle,
                    fontSize: getResponsiveValue(10, 11, 12, 12, 12),
                    padding: getResponsiveValue('4px 8px', '6px 10px', '6px 10px', '6px 10px', '6px 10px'),
                    flex: 'none'
                  }}>
                    {conversation.messageCount} messages
                  </span>
                </div>
                
                  <button 
                  style={openButtonStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenConversation(conversation);
                  }}
                >
                  <ChevronRight size={getResponsiveValue(12, 14, 16, 16, 16)} />
                  {!isMobile && 'Open'}
                  </button>
              </div>
          </div>
        ))}
              </div>
      )}

      {/* Message Form Modal */}
      <MessageForm
        isOpen={showMessageForm}
        onClose={() => setShowMessageForm(false)}
        onMessageAdded={(newMessage) => {
          console.log('MessageForm onMessageAdded called with:', newMessage);
          // Refresh conversations after adding a message
          const loadConversations = async () => {
            try {
              console.log('Refreshing conversations...');
              const firestoreConversations = await getConversationsFromFirestore();
              console.log('New conversations loaded:', firestoreConversations);
              setConversations(firestoreConversations);
            } catch (error) {
              console.error('Error refreshing conversations:', error);
            }
          };
          loadConversations();
          
          if (onRefreshData) {
            onRefreshData();
          }
        }}
      />
    </div>
  );
};

export default MessagePage;
