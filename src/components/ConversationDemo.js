import React, { useState } from 'react';
import MessagePage from './MessagePage';
import ConversationView from './ConversationView';

const ConversationDemo = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'conversation'
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Mock conversation data for testing
  const mockConversation = {
    userId: 'user123',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '+1234567890',
    lastMessage: 'Hello, I have a question about parking.',
    lastMessageTime: new Date(),
    unreadCount: 2,
    messageCount: 5,
    category: 'general',
    priority: 'normal',
    parkId: 'park123',
    messages: []
  };

  const handleOpenConversation = (conversation) => {
    setSelectedConversation(conversation);
    setCurrentView('conversation');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedConversation(null);
  };

  const handleMessageSent = (message) => {
    console.log('Message sent:', message);
    // In a real app, this would refresh the conversation
  };

  if (currentView === 'conversation' && selectedConversation) {
    return (
      <ConversationView
        conversation={selectedConversation}
        onBack={handleBackToList}
        onMessageSent={handleMessageSent}
      />
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Conversation System Demo</h1>
      <p>This is a demo of the new conversation system.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => handleOpenConversation(mockConversation)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Open Demo Conversation
        </button>
      </div>

      <MessagePage 
        messages={[]}
        onRefreshData={() => console.log('Data refreshed')}
      />
    </div>
  );
};

export default ConversationDemo;
