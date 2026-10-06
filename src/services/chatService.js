import api from './api';

export const chatService = {
  /**
   * Send a message to the public guest chat endpoint.
   * Permitted without login.
   */
  sendPublicMessage: (message) => {
    return api.post('/chat/public/message', { message });
  },

  /**
   * Send a message to the authenticated chat endpoint.
   * Transmits JWT via Axios interceptor, accesses personalized records.
   */
  sendAuthenticatedMessage: (message, conversationId = null) => {
    return api.post('/chat/message', { message, conversationId });
  },

  /**
   * Get user's saved conversations.
   */
  getConversations: () => {
    return api.get('/chat/conversations');
  },

  /**
   * Get messages for a specific conversation.
   */
  getConversation: (conversationId) => {
    return api.get(`/chat/conversations/${conversationId}`);
  },

  /**
   * Delete a conversation.
   */
  deleteConversation: (conversationId) => {
    return api.delete(`/chat/conversations/${conversationId}`);
  }
};

export default chatService;
