import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../../services/medicalApi';
import { 
  Send, X, AlertCircle, Stethoscope, ShieldCheck, 
  Sparkles, Clock, CheckCheck, Loader2, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const QUICK_PROMPTS = [
  "Hello Doctor 👋",
  "Doing much better today!",
  "Question about medication dosage",
  "Follow-up update on recovery"
];

const ChatWidget = ({ appointmentId, onClose, currentUserId, otherUserName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  // Hide global AI button while consultation chat is open to prevent UI collisions
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('petzoe:doctor-chat', { detail: { open: true } }));
    return () => {
      window.dispatchEvent(new CustomEvent('petzoe:doctor-chat', { detail: { open: false } }));
    };
  }, []);

  const fetchMessagesAndStatus = async () => {
    try {
      const [messagesRes, statusRes] = await Promise.allSettled([
        chatApi.getMessages(appointmentId),
        chatApi.getPartnerStatus(appointmentId)
      ]);

      if (messagesRes.status === 'fulfilled') {
        setMessages(messagesRes.value.data);
        setChatError(null);
        chatApi.markAsRead(appointmentId).catch(() => {});
      } else {
        const error = messagesRes.reason;
        console.error('Error fetching messages:', error);
        if (error.response?.status === 400 || error.response?.status === 404) {
          setChatError(error.response?.data?.message || 'This consultation session is no longer active.');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }

      if (statusRes.status === 'fulfilled' && statusRes.value.data) {
        setIsPartnerOnline(Boolean(statusRes.value.data.isOnline));
      }
    } catch (error) {
      console.error('Error fetching chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesAndStatus();
    intervalRef.current = setInterval(fetchMessagesAndStatus, 4000); // Poll every 4s for messages and live status
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [appointmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = (textOverride || newMessage).trim();
    if (!textToSend || chatError || isSending) return;

    setIsSending(true);
    try {
      const response = await chatApi.sendMessage(appointmentId, textToSend);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error) {
      console.error('Error sending message:', error);
      const errMsg = error.response?.data?.message || 'Failed to send message. Please verify appointment status.';
      alert(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const displayName = otherUserName || 'Veterinarian';
  const isDoctor = displayName.toLowerCase().includes('dr.') || displayName.toLowerCase().includes('vet');

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[70] flex flex-col justify-end sm:justify-auto sm:block pointer-events-none">
      {/* Backdrop for mobile devices */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs sm:hidden pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Chat Container */}
      <div className="pointer-events-auto relative w-full sm:w-[420px] max-w-full h-[88vh] sm:h-[590px] max-h-[calc(100vh-2rem)] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-full flex justify-center pt-2 pb-1 bg-[#112A46]">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Premium Header */}
        <div className="bg-gradient-to-r from-[#112A46] via-[#1E3A5F] to-[#2563EB] text-white p-3.5 sm:p-4 px-4 sm:px-5 flex items-center justify-between border-b border-white/10 shrink-0 select-none shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Badge */}
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#38BDF8] shadow-inner">
                {isDoctor ? <Stethoscope size={20} /> : <MessageSquare size={20} />}
              </div>
              {isPartnerOnline ? (
                <span 
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#112A46] animate-pulse shadow-sm" 
                  title="Online"
                />
              ) : (
                <span 
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-[#112A46]" 
                  title="Offline"
                />
              )}
            </div>

            {/* Info */}
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-wide truncate max-w-[200px] sm:max-w-[240px]">
                  {displayName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                {isPartnerOnline ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300 font-semibold">Online</span>
                    <span className="text-sky-200/70 text-[10px]">• Live Consultation</span>
                  </>
                ) : (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-slate-300 font-medium">Offline</span>
                    <span className="text-sky-200/60 text-[10px]">• Consultation Room</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Close Action */}
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:rotate-90 duration-200 shrink-0"
            aria-label="Close consultation chat"
            title="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3 min-h-0">
          {chatError ? (
            <div className="text-center my-auto p-6 flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-200/60 shadow-xs">
                <AlertCircle size={26} />
              </div>
              <p className="text-xs font-bold text-slate-800">{chatError}</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                This consultation session has concluded or been removed. Please contact the clinic or book a new appointment if you need further assistance.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center my-auto gap-2">
              <Loader2 size={24} className="text-blue-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center my-auto p-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100 shadow-xs">
                <Sparkles size={24} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Consultation Room Ready</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                You are directly connected with <strong>{displayName}</strong>. You can ask about symptoms, dietary questions, or treatment updates.
              </p>

              {/* Quick Prompts */}
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center max-w-xs">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(null, prompt)}
                    className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                (currentUserId && msg.senderId === currentUserId) ||
                (user?.id && msg.senderId === user.id) ||
                (user?.name && msg.senderName === user.name);

              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs transition-all ${
                      isMine
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-blue-500/10'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-slate-200/50'
                    }`}
                  >
                    {!isMine && msg.senderName && (
                      <p className="text-[10px] font-bold text-sky-700 mb-0.5 tracking-tight">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="break-words font-medium whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 font-semibold ${
                        isMine ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      <Clock size={10} className="inline opacity-80" />
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && <CheckCheck size={11} className="text-blue-200 inline ml-0.5" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Premium Input Footer */}
        <div className="p-3 sm:p-3.5 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              autoFocus={!chatError}
              disabled={!!chatError || isSending}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={chatError ? "Consultation session closed" : "Type a message for the veterinarian..."}
              className="flex-1 bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !!chatError || isSending}
              className="h-10 w-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-blue-500/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} className="ml-0.5" />
              )}
            </button>
          </form>

          {/* Privacy & Trust Caption */}
          <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-slate-400 font-semibold select-none">
            <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
            <span>End-to-end verified medical consultation</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatWidget;
