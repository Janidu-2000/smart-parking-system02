import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  where 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const MESSAGES_COLLECTION = 'messages';
const CHAT_COLLECTION = 'chats'; // Alternative collection name

// Add a new message to Firestore
export const addMessageToFirestore = async (messageData) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    console.log('Current auth user:', authUser);
    console.log('User email:', userEmail);
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated. Please log in again.');
    }
    
    const messageDoc = {
      fullName: messageData.fullName,
      mobile: messageData.mobile,
      email: messageData.email,
      message: messageData.message,
      category: messageData.category || 'general',
      priority: messageData.priority || 'normal',
      status: 'unread', // Default status
      userEmail: userEmail, // Add user email to message
      parkId: parkId, // Add park ID for filtering
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageDoc);
    console.log('Message added to Firestore with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...messageDoc
    };
  } catch (error) {
    console.error('Error adding message to Firestore:', error);
    throw error;
  }
};

// Get all messages from Firestore for the current user
export const getMessagesFromFirestore = async () => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    console.log('Getting messages for user:', userEmail, 'parkId:', parkId);
    
    if (!userEmail || !parkId) {
      console.log('No authenticated user found, returning empty messages');
      return [];
    }
    
    const messages = [];
    
    // Try to get messages from the messages collection first
    try {
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION), 
        where('parkId', '==', parkId),
        orderBy('createdAt', 'desc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle both data structures - new format and existing format
        const message = {
          id: doc.id,
          // New format fields
          fullName: data.fullName || data.userName || 'Unknown User',
          mobile: data.mobile || data.phone || '',
          email: data.email || data.userEmail || '',
          message: data.message || data.lastMessage || '',
          category: data.category || 'general',
          priority: data.priority || 'normal',
          status: data.status || (data.unreadCount > 0 ? 'unread' : 'read'),
          userEmail: data.userEmail || '',
          parkId: data.parkId,
          // Handle different timestamp fields
          createdAt: data.createdAt?.toDate?.() || data.lastMessageTime?.toDate?.() || data.createdAt || data.lastMessageTime,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          // Additional fields from existing structure
          parkName: data.parkName || '',
          unreadCount: data.unreadCount || 0,
          // Reply fields
          isReply: data.isReply || false,
          originalMessageId: data.originalMessageId || null,
          replyTo: data.replyTo || null
        };
        
        messages.push(message);
      });
      
      console.log('Fetched messages from messages collection:', messages.length);
    } catch (error) {
      console.log('No messages found in messages collection:', error.message);
    }
    
    // Also try to get messages from the chats collection
    try {
      const chatsQuery = query(
        collection(db, CHAT_COLLECTION), 
        where('parkId', '==', parkId)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      
      chatsSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert chat data to message format
        const message = {
          id: doc.id,
          fullName: data.userName || 'Unknown User',
          mobile: data.phone || '',
          email: data.userEmail || '',
          message: data.lastMessage || '',
          category: 'chat',
          priority: 'normal',
          status: data.unreadCount > 0 ? 'unread' : 'read',
          userEmail: data.userEmail || '',
          parkId: data.parkId,
          createdAt: data.lastMessageTime?.toDate?.() || data.createdAt?.toDate?.() || data.lastMessageTime || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          parkName: data.parkName || '',
          unreadCount: data.unreadCount || 0,
          isReply: false,
          originalMessageId: null,
          replyTo: null
        };
        
        messages.push(message);
      });
      
      console.log('Fetched messages from chats collection:', chatsSnapshot.size);
    } catch (error) {
      console.log('No messages found in chats collection:', error.message);
    }
    
    // Sort all messages by date
    messages.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    
    console.log('Total messages fetched:', messages.length);
    if (messages.length > 0) {
      console.log('Sample message data:', messages[0]);
    }
    return messages;
  } catch (error) {
    console.error('Error getting messages from Firestore:', error);
    return [];
  }
};

// Update message status in Firestore
export const updateMessageStatusInFirestore = async (messageId, status) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    let messageRef = null;
    let messageData = null;
    
    // Try to find the message in the messages collection first
    try {
      messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        messageData = messageDoc.data();
      }
    } catch (error) {
      console.log('Message not found in messages collection, trying chats collection');
    }
    
    // If not found in messages collection, try chats collection
    if (!messageData) {
      try {
        messageRef = doc(db, CHAT_COLLECTION, messageId);
        const messageDoc = await getDoc(messageRef);
        
        if (messageDoc.exists()) {
          messageData = messageDoc.data();
        }
      } catch (error) {
        console.log('Message not found in chats collection either');
      }
    }
    
    if (!messageData) {
      throw new Error('Message not found in any collection');
    }
    
    // Verify the message belongs to the current parking lot
    if (messageData.parkId !== parkId) {
      throw new Error('Unauthorized: Message does not belong to current parking lot');
    }
    
    const updateData = {
      status: status,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(messageRef, updateData);
    console.log('Message status updated in Firestore:', messageId, status);
    
    return true;
  } catch (error) {
    console.error('Error updating message status in Firestore:', error);
    throw error;
  }
};

// Update message details in Firestore
export const updateMessageDetailsInFirestore = async (messageId, messageData) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    
    // First verify the message belongs to the current parking lot
    const messageDoc = await getDoc(messageRef);
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }
    
    const messageDataFromDB = messageDoc.data();
    if (messageDataFromDB.parkId !== parkId) {
      throw new Error('Unauthorized: Message does not belong to current parking lot');
    }

    const updateData = {
      fullName: messageData.fullName,
      mobile: messageData.mobile,
      email: messageData.email,
      message: messageData.message,
      category: messageData.category,
      priority: messageData.priority,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(messageRef, updateData);
    console.log('Message details updated in Firestore:', messageId);
    
    return true;
  } catch (error) {
    console.error('Error updating message details in Firestore:', error);
    throw error;
  }
};

// Delete message from Firestore
export const deleteMessageFromFirestore = async (messageId) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    let messageRef = null;
    let messageData = null;
    
    // Try to find the message in the messages collection first
    try {
      messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        messageData = messageDoc.data();
      }
    } catch (error) {
      console.log('Message not found in messages collection, trying chats collection');
    }
    
    // If not found in messages collection, try chats collection
    if (!messageData) {
      try {
        messageRef = doc(db, CHAT_COLLECTION, messageId);
        const messageDoc = await getDoc(messageRef);
        
        if (messageDoc.exists()) {
          messageData = messageDoc.data();
        }
      } catch (error) {
        console.log('Message not found in chats collection either');
      }
    }
    
    if (!messageData) {
      throw new Error('Message not found in any collection');
    }
    
    // Verify the message belongs to the current parking lot
    if (messageData.parkId !== parkId) {
      throw new Error('Unauthorized: Message does not belong to current parking lot');
    }
    
    await deleteDoc(messageRef);
    console.log('Message deleted from Firestore:', messageId);
    
    return true;
  } catch (error) {
    console.error('Error deleting message from Firestore:', error);
    throw error;
  }
};

// Get messages by status for the current user
export const getMessagesByStatus = async (status) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      console.log('No authenticated user found, returning empty messages');
      return [];
    }
    
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('status', '==', status),
      where('parkId', '==', parkId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const messages = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting messages by status from Firestore:', error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  return await updateMessageStatusInFirestore(messageId, 'read');
};

// Mark message as unread
export const markMessageAsUnread = async (messageId) => {
  return await updateMessageStatusInFirestore(messageId, 'unread');
};

// Archive message
export const archiveMessage = async (messageId) => {
  return await updateMessageStatusInFirestore(messageId, 'archived');
};

// Reply to a message
export const replyToMessage = async (originalMessageId, replyData) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated. Please log in again.');
    }
    
    let originalMessageData = null;
    let originalMessageRef = null;
    
    // Try to find the original message in the messages collection first
    try {
      originalMessageRef = doc(db, MESSAGES_COLLECTION, originalMessageId);
      const originalMessageDoc = await getDoc(originalMessageRef);
      
      if (originalMessageDoc.exists()) {
        originalMessageData = originalMessageDoc.data();
      }
    } catch (error) {
      console.log('Message not found in messages collection, trying chats collection');
    }
    
    // If not found in messages collection, try chats collection
    if (!originalMessageData) {
      try {
        originalMessageRef = doc(db, CHAT_COLLECTION, originalMessageId);
        const originalMessageDoc = await getDoc(originalMessageRef);
        
        if (originalMessageDoc.exists()) {
          originalMessageData = originalMessageDoc.data();
        }
      } catch (error) {
        console.log('Message not found in chats collection either');
      }
    }
    
    if (!originalMessageData) {
      throw new Error('Original message not found in any collection');
    }
    
    // Verify the original message belongs to the current parking lot
    if (originalMessageData.parkId !== parkId) {
      throw new Error('Unauthorized: Message does not belong to current parking lot');
    }
    
    const replyDoc = {
      fullName: `Admin Reply to ${originalMessageData.fullName || originalMessageData.userName || 'Customer'}`,
      mobile: originalMessageData.mobile || originalMessageData.phone || '',
      email: originalMessageData.email || originalMessageData.userEmail || '',
      message: replyData.message,
      category: 'reply',
      priority: 'normal',
      status: 'read', // Admin replies are automatically read
      userEmail: userEmail,
      parkId: parkId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Reference to original message
      originalMessageId: originalMessageId,
      isReply: true,
      replyTo: {
        messageId: originalMessageId,
        userName: originalMessageData.fullName || originalMessageData.userName || 'Customer',
        originalMessage: originalMessageData.message || originalMessageData.lastMessage || ''
      }
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), replyDoc);
    console.log('Reply added to Firestore with ID:', docRef.id);
    
    // Try to mark the original message as read (works for messages collection)
    try {
      if (originalMessageRef && originalMessageRef.parent.id === MESSAGES_COLLECTION) {
        await updateMessageStatusInFirestore(originalMessageId, 'read');
      }
    } catch (error) {
      console.log('Could not update original message status (might be from chats collection)');
    }
    
    return {
      id: docRef.id,
      ...replyDoc
    };
  } catch (error) {
    console.error('Error adding reply to Firestore:', error);
    throw error;
  }
};

// Get conversations grouped by user for the current parking lot
export const getConversationsFromFirestore = async () => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      console.log('No authenticated user found, returning empty conversations');
      return [];
    }
    
    const conversations = new Map();
    
    // Get messages from messages collection
    try {
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION), 
        where('parkId', '==', parkId),
        orderBy('createdAt', 'desc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Create a unique key for each user (by email or phone)
        const userKey = data.email || data.userEmail || data.mobile || `user_${doc.id}`;
        
        if (!conversations.has(userKey)) {
          conversations.set(userKey, {
            userId: userKey,
            userName: data.fullName || data.userName || 'Unknown User',
            userEmail: data.email || data.userEmail || '',
            userPhone: data.mobile || data.phone || '',
            lastMessage: data.message || data.lastMessage || '',
            lastMessageTime: data.createdAt?.toDate?.() || data.createdAt || data.lastMessageTime,
            unreadCount: data.status === 'unread' ? 1 : 0,
            messageCount: 1,
            category: data.category || 'general',
            priority: data.priority || 'normal',
            parkId: data.parkId,
            messages: []
          });
        }
        
        const conversation = conversations.get(userKey);
        conversation.messageCount++;
        if (data.status === 'unread') {
          conversation.unreadCount++;
        }
        
        // Add message to conversation
        conversation.messages.push({
          id: doc.id,
          message: data.message || data.lastMessage || '',
          isAdminReply: data.isReply || false,
          timestamp: data.createdAt?.toDate?.() || data.createdAt || data.lastMessageTime,
          status: data.status || 'read',
          category: data.category || 'general',
          priority: data.priority || 'normal',
          replyTo: data.replyTo || null
        });
        
        // Update last message info
        if (data.createdAt && (!conversation.lastMessageTime || data.createdAt > conversation.lastMessageTime)) {
          conversation.lastMessage = data.message || data.lastMessage || '';
          conversation.lastMessageTime = data.createdAt?.toDate?.() || data.createdAt;
        }
      });
    } catch (error) {
      console.log('No messages found in messages collection:', error.message);
    }
    
    // Get messages from chats collection
    try {
      const chatsQuery = query(
        collection(db, CHAT_COLLECTION), 
        where('parkId', '==', parkId)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      
      chatsSnapshot.forEach((doc) => {
        const data = doc.data();
        const userKey = data.userEmail || data.phone || `chat_${doc.id}`;
        
        if (!conversations.has(userKey)) {
          conversations.set(userKey, {
            userId: userKey,
            userName: data.userName || 'Unknown User',
            userEmail: data.userEmail || '',
            userPhone: data.phone || '',
            lastMessage: data.lastMessage || '',
            lastMessageTime: data.lastMessageTime?.toDate?.() || data.lastMessageTime || data.createdAt?.toDate?.() || data.createdAt,
            unreadCount: data.unreadCount || 0,
            messageCount: 1,
            category: 'chat',
            priority: 'normal',
            parkId: data.parkId,
            messages: []
          });
        }
        
        const conversation = conversations.get(userKey);
        conversation.messageCount++;
        conversation.unreadCount += data.unreadCount || 0;
        
        // Add chat message to conversation
        conversation.messages.push({
          id: doc.id,
          message: data.lastMessage || '',
          isAdminReply: false,
          timestamp: data.lastMessageTime?.toDate?.() || data.lastMessageTime || data.createdAt?.toDate?.() || data.createdAt,
          status: data.unreadCount > 0 ? 'unread' : 'read',
          category: 'chat',
          priority: 'normal',
          replyTo: null
        });
        
        // Update last message info
        if (data.lastMessageTime && (!conversation.lastMessageTime || data.lastMessageTime > conversation.lastMessageTime)) {
          conversation.lastMessage = data.lastMessage || '';
          conversation.lastMessageTime = data.lastMessageTime?.toDate?.() || data.lastMessageTime;
        }
      });
    } catch (error) {
      console.log('No chats found in chats collection:', error.message);
    }
    
    // Convert Map to array and sort by last message time
    const conversationsArray = Array.from(conversations.values());
    conversationsArray.sort((a, b) => {
      const dateA = new Date(a.lastMessageTime);
      const dateB = new Date(b.lastMessageTime);
      return dateB - dateA;
    });
    
    // Sort messages within each conversation by timestamp
    conversationsArray.forEach(conversation => {
      conversation.messages.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateA - dateB; // Oldest first for conversation view
      });
    });
    
    console.log('Total conversations fetched:', conversationsArray.length);
    return conversationsArray;
  } catch (error) {
    console.error('Error getting conversations from Firestore:', error);
    return [];
  }
};

// Get conversation messages for a specific user
export const getConversationMessages = async (userId) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    const messages = [];
    
    // Get messages from messages collection
    try {
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION), 
        where('parkId', '==', parkId),
        orderBy('createdAt', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        const messageUserKey = data.email || data.userEmail || data.mobile || `user_${doc.id}`;
        
        if (messageUserKey === userId) {
          messages.push({
            id: doc.id,
            message: data.message || data.lastMessage || '',
            isAdminReply: data.isReply || false,
            timestamp: data.createdAt?.toDate?.() || data.createdAt || data.lastMessageTime,
            status: data.status || 'read',
            category: data.category || 'general',
            priority: data.priority || 'normal',
            replyTo: data.replyTo || null,
            fullName: data.fullName || data.userName || 'Unknown User'
          });
        }
      });
    } catch (error) {
      console.log('No messages found in messages collection:', error.message);
    }
    
    // Get messages from chats collection
    try {
      const chatsQuery = query(
        collection(db, CHAT_COLLECTION), 
        where('parkId', '==', parkId)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      
      chatsSnapshot.forEach((doc) => {
        const data = doc.data();
        const chatUserKey = data.userEmail || data.phone || `chat_${doc.id}`;
        
        if (chatUserKey === userId) {
          messages.push({
            id: doc.id,
            message: data.lastMessage || '',
            isAdminReply: false,
            timestamp: data.lastMessageTime?.toDate?.() || data.lastMessageTime || data.createdAt?.toDate?.() || data.createdAt,
            status: data.unreadCount > 0 ? 'unread' : 'read',
            category: 'chat',
            priority: 'normal',
            replyTo: null,
            fullName: data.userName || 'Unknown User'
          });
        }
      });
    } catch (error) {
      console.log('No chats found in chats collection:', error.message);
    }
    
    // Sort messages by timestamp (oldest first for conversation view)
    messages.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA - dateB;
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

// Send a message to a specific user conversation
export const sendMessageToConversation = async (userId, messageData) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated. Please log in again.');
    }
    
    // Find the user's conversation to get their details
    const conversations = await getConversationsFromFirestore();
    const userConversation = conversations.find(conv => conv.userId === userId);
    
    if (!userConversation) {
      throw new Error('User conversation not found');
    }
    
    const messageDoc = {
      fullName: `Admin Reply to ${userConversation.userName}`,
      mobile: userConversation.userPhone || '',
      email: userConversation.userEmail || '',
      message: messageData.message,
      category: 'reply',
      priority: 'normal',
      status: 'read', // Admin replies are automatically read
      userEmail: userEmail,
      parkId: parkId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isReply: true,
      replyTo: {
        messageId: userId,
        userName: userConversation.userName,
        originalMessage: userConversation.lastMessage || ''
      }
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageDoc);
    console.log('Message sent to conversation in Firestore with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...messageDoc
    };
  } catch (error) {
    console.error('Error sending message to conversation:', error);
    throw error;
  }
};
