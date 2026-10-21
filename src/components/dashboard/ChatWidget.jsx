import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../../services/medicalApi';
import { Send, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ChatWidget = ({ appointmentId, onClose, currentUserId, otherUserName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await chatApi.getMessages(appointmentId);
      setMessages(response.data);
      setChatError(null);
      // Mark as read when opened or polling
      await chatApi.markAsRead(appointmentId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 400 || error.response?.status === 404) {
        setChatError(error.response?.data?.message || 'This consultation session is no longer active.');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [appointmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || chatError) return;

    try {
      const response = await chatApi.sendMessage(appointmentId, newMessage.trim());
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      const errMsg = error.response?.data?.message || 'Failed to send message. Please verify appointment status.';
      alert(errMsg);
    }
  };

  const { user } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50 h-[500px] max-h-[80vh]">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center rounded-t-lg">
        <h3 className="font-semibold text-sm">Chat with {otherUserName}</h3>
        <button type="button" onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none cursor-pointer">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
        {chatError ? (
          <div className="text-center my-auto p-4 flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <AlertCircle size={22} />
            </div>
            <p className="text-xs font-semibold text-slate-800">{chatError}</p>
            <p className="text-[11px] text-slate-500 mt-1">This appointment session has concluded or been removed.</p>
          </div>
        ) : isLoading ? (
          <div className="text-center text-gray-500 my-auto text-xs">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 my-auto text-xs">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const isMine =
              (currentUserId && msg.senderId === currentUserId) ||
              (user?.id && msg.senderId === user.id) ||
              (user?.name && msg.senderName === user.name);

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                  isMine
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right font-medium ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          autoFocus={!chatError}
          disabled={!!chatError}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={chatError ? "Chat unavailable" : "Type a message..."}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !!chatError}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-9 h-9 cursor-pointer transition-colors"
        >
          <Send size={16} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
