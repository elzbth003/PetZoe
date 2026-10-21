import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, X, Send, Sparkles, AlertTriangle, ShieldAlert,
  RotateCcw, Loader2, ArrowRight, Heart, Calendar,
  ShieldCheck, HelpCircle, User, Stethoscope, ShoppingBag,
  Globe, ExternalLink
} from 'lucide-react';
import chatService from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';

export default function PetZoeChatbot() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ASSISTANT',
      message: "Hello! I am your **PetZoe AI Assistant** 🐾. I can help you with pet-care advice, checking your pets' records, finding veterinarians, and navigating PetZoe. How can I help you today?",
      intent: 'GREETING',
      sourceType: 'WELCOME',
      createdAt: new Date().toISOString(),
      quickActions: [
        { label: 'My Pets', prompt: 'Show my registered pets', actionType: 'PROMPT' },
        { label: 'Book a Vet', targetUrl: '/dashboard/owner?tab=Appointments', actionType: 'NAVIGATE' },
        { label: 'My Appointments', prompt: 'When is my next vet appointment?', actionType: 'PROMPT' },
        { label: 'Core Vaccines', prompt: 'What are the core vaccines for dogs and cats?', actionType: 'PROMPT' },
        { label: 'Find a Vet', prompt: 'Show certified veterinarians', actionType: 'PROMPT' },
        { label: 'Adoptions', prompt: 'Show pets available for adoption', actionType: 'PROMPT' }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [webSearchStatusText, setWebSearchStatusText] = useState('Searching trusted veterinary sources...');
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isDoctorChatOpen, setIsDoctorChatOpen] = useState(false);

  useEffect(() => {
    const handleDoctorChat = (e) => {
      setIsDoctorChatOpen(!!e?.detail?.open);
    };
    window.addEventListener('petzoe:doctor-chat', handleDoctorChat);
    return () => window.removeEventListener('petzoe:doctor-chat', handleDoctorChat);
  }, []);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isWebQuery = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    // Exclude personal queries from web search indicator
    if (/\b(my\s+pet|my\s+pets|my\s+dog|my\s+cat|my\s+appointment|my\s+record|my\s+prescription)\b/i.test(lower)) {
      return false;
    }
    return /\b(latest|current|recent|newest|updated|wsava|aaha|avma|guideline|guidelines|research|studies|study|dermatitis|skin\s+lesion)\b/i.test(lower);
  };

  const handleSendMessage = async (textToSend = null) => {
    const message = (textToSend || inputMessage).trim();
    if (!message) {
      setErrorMessage('Please type a message before sending.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setErrorMessage(null);
    setInputMessage('');

    // Append user message immediately
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'USER',
      message,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const willWebSearch = isWebQuery(message);
    if (willWebSearch) {
      setIsWebSearching(true);
      setWebSearchStatusText('Searching trusted veterinary sources...');
    }

    try {
      let res;
      if (user) {
        try {
          res = await chatService.sendAuthenticatedMessage(message, currentConversationId);
        } catch (authErr) {
          if (authErr.response?.status === 401 || authErr.response?.status === 403) {
            console.warn('Authenticated chat token expired or rejected, clearing stale session');
            sessionStorage.removeItem('petzoe_token');
            sessionStorage.removeItem('petzoe_user');
            window.dispatchEvent(new Event('auth-change'));
            res = await chatService.sendPublicMessage(message);
          } else {
            throw authErr;
          }
        }
      } else {
        res = await chatService.sendPublicMessage(message);
      }

      const reply = res.data;
      if (reply.conversationId) {
        setCurrentConversationId(reply.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: reply.id || 'bot-' + Date.now(),
          sender: 'ASSISTANT',
          message: reply.message,
          intent: reply.intent,
          sourceType: reply.sourceType,
          toolUsed: reply.toolUsed,
          citations: reply.citations || [],
          searchStatus: reply.searchStatus,
          createdAt: reply.createdAt || new Date().toISOString(),
          quickActions: reply.quickActions || []
        }
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      let rawMsg = err.response?.data?.message || err.message || '';
      let displayError = 'PetZoe AI is temporarily unavailable. Please try again in a moment.';
      if (err.response?.status === 401 || err.response?.status === 403) {
        displayError = 'Your session has expired. Please log in again to access your personal pet records.';
      } else if (rawMsg && !rawMsg.toLowerCase().includes('status code') && !rawMsg.includes('JDBC') && !rawMsg.includes('SQL') && !rawMsg.includes('Exception') && !rawMsg.includes('bytea')) {
        displayError = rawMsg;
      }
      setErrorMessage(displayError);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'ASSISTANT',
          message: '⚠️ ' + displayError,
          intent: 'ERROR',
          sourceType: 'ERROR',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
      setIsWebSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        handleSendMessage();
      }
    }
  };

  const handleQuickAction = (action) => {
    if (action.actionType === 'NAVIGATE' && action.targetUrl) {
      setIsOpen(false);
      let target = action.targetUrl;
      let targetTab = null;

      // Check if target contains query param tab=
      if (target.includes('tab=')) {
        try {
          const queryString = target.split('?')[1] || '';
          const params = new URLSearchParams(queryString);
          targetTab = params.get('tab');
        } catch (_) {}
      }

      // If no tab in query param, infer from label or destination
      if (!targetTab) {
        const lbl = (action.label || '').toLowerCase();
        if (lbl.includes('vet') || lbl.includes('visit') || lbl.includes('appoint') || lbl.includes('book') || lbl.includes('doctor')) {
          targetTab = 'Appointments';
          target = '/dashboard/owner?tab=Appointments';
        } else if (lbl.includes('pet')) {
          targetTab = 'My Pets';
          target = '/dashboard/owner?tab=My Pets';
        } else if (lbl.includes('record') || lbl.includes('immuniz') || lbl.includes('medical') || lbl.includes('vaccin')) {
          targetTab = 'Medical Records';
          target = '/dashboard/owner?tab=Medical Records';
        }
      }

      if (targetTab) {
        sessionStorage.setItem('petzoe_owner_tab', targetTab);
        window.dispatchEvent(new CustomEvent('petzoe:switch-owner-tab', { detail: { tab: targetTab } }));
      }

      navigate(target);
    } else if (action.prompt) {
      handleSendMessage(action.prompt);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setErrorMessage(null);
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'ASSISTANT',
        message: "Conversation refreshed. How can I assist you with your pet or PetZoe today?",
        intent: 'GREETING',
        sourceType: 'WELCOME',
        createdAt: new Date().toISOString(),
        quickActions: [
          { label: 'My Pets', prompt: 'Show my registered pets', actionType: 'PROMPT' },
          { label: 'Book a Vet', targetUrl: '/dashboard/owner?tab=Appointments', actionType: 'NAVIGATE' },
          { label: 'My Appointments', prompt: 'When is my next vet appointment?', actionType: 'PROMPT' },
          { label: 'Core Vaccines', prompt: 'What are the core vaccines for dogs and cats?', actionType: 'PROMPT' }
        ]
      }
    ]);
  };

  const renderInlineFormatting = (text) => {
    if (!text) return null;
    // Regex splits text by bold/italic/code markdown tokens
    const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (!part) return null;
      if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
        return (
          <strong key={idx} className="font-semibold italic text-slate-900">
            {part.slice(3, -3)}
          </strong>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={idx} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-sky-800 font-mono text-[10.5px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      // Clean any accidental leftover raw asterisks
      const cleaned = part.replace(/\*{2,}/g, '');
      return cleaned;
    });
  };

  const renderMessageContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lineIdx} className="h-1.5" />;
      }

      // Subheading: ### Header
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={lineIdx} className="font-bold text-slate-900 text-xs mt-2 mb-1">
            {renderInlineFormatting(trimmed.substring(4))}
          </h4>
        );
      }

      // Bullet line: • or -
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        const bulletContent = trimmed.replace(/^[•\-]\s*/, '');
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 my-1 pl-0.5 text-left">
            <span className="text-sky-600 font-bold shrink-0 leading-relaxed">•</span>
            <div className="flex-1 leading-relaxed">
              {renderInlineFormatting(bulletContent)}
            </div>
          </div>
        );
      }

      // Numbered list: 1. , 2.
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 my-1 pl-0.5 text-left">
            <span className="text-slate-500 font-bold shrink-0 text-[11px] leading-relaxed">{numMatch[1]}.</span>
            <div className="flex-1 leading-relaxed">
              {renderInlineFormatting(numMatch[2])}
            </div>
          </div>
        );
      }

      // Default paragraph
      return (
        <p key={lineIdx} className="leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && !isDoctorChatOpen && (
        <button
          data-testid="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-[#112A46] via-[#1E3A5F] to-[#2563EB] text-white shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 border border-white/20 group cursor-pointer"
          aria-label="Open PetZoe AI Assistant"
        >
          <div className="relative">
            <Bot size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#112A46] animate-pulse" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-wide hidden sm:inline pr-1">
            PetZoe AI
          </span>
        </button>
      )}

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div
          data-testid="chatbot-window"
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-3rem)] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#112A46] via-[#1E3A5F] to-[#112A46] text-white p-4 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#38BDF8] shadow-inner">
                <Bot size={22} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white tracking-wide">PetZoe AI Assistant</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {user ? `Logged in as ${user.name}` : 'Pet Care & Platform Guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                data-testid="chat-new-conversation"
                onClick={handleNewConversation}
                title="Start New Conversation"
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw size={16} />
              </button>
              <button
                data-testid="chatbot-close"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              data-testid="chat-error"
              className="bg-rose-50 border-b border-rose-200 p-2.5 px-4 text-xs text-rose-800 flex items-center justify-between animate-in fade-in"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                {errorMessage}
              </span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Conversation History Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                data-testid="chat-message"
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-xs leading-relaxed text-left transition-all ${
                    msg.sender === 'USER'
                      ? 'bg-[#1E3A5F] text-white rounded-br-2xs shadow-sm font-medium'
                      : msg.sourceType === 'EMERGENCY_OVERRIDE'
                      ? 'bg-rose-50 border border-rose-300 text-rose-950 rounded-bl-2xs shadow-sm'
                      : msg.sourceType === 'MEDICAL_SAFETY_GUARD'
                      ? 'bg-amber-50 border border-amber-200 text-amber-950 rounded-bl-2xs shadow-sm'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-2xs shadow-xs'
                  }`}
                >
                  {/* Badge for special sources */}
                  {msg.sourceType === 'EMERGENCY_OVERRIDE' && (
                    <div className="flex items-center gap-1 text-rose-700 font-bold mb-1 text-[11px]">
                      <ShieldAlert size={13} /> Immediate Emergency Triage
                    </div>
                  )}
                  {msg.sourceType === 'MEDICAL_SAFETY_GUARD' && (
                    <div className="flex items-center gap-1 text-amber-700 font-bold mb-1 text-[11px]">
                      <AlertTriangle size={13} /> Veterinary Clinical Boundary
                    </div>
                  )}

                  {/* Render content formatted */}
                  <div className="space-y-1">
                    {renderMessageContent(msg.message)}
                  </div>

                  {/* External Sources / Citations Section */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div data-testid="chat-sources" className="mt-3 pt-2.5 border-t border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Globe size={11} className="text-sky-600" /> Trusted Sources ({msg.citations.length})
                      </div>
                      <div className="space-y-1.5">
                        {msg.citations.map((cite, idx) => (
                          <div
                            key={cite.index || idx}
                            data-testid="chat-source"
                            className="text-[11px] bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 rounded-xl p-2.5 transition-all text-left"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-bold text-slate-900 line-clamp-1">
                                [{cite.index}] {cite.title}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-semibold shrink-0">
                                {cite.domain}
                              </span>
                            </div>
                            {cite.snippet && (
                              <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">
                                {cite.snippet}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Published: {cite.publicationDate || 'Unverified'}</span>
                              <a
                                data-testid="chat-source-link"
                                href={cite.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-0.5 hover:underline"
                              >
                                View source <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Action Chips attached to assistant message */}
                {msg.sender === 'ASSISTANT' && msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(qa)}
                        disabled={loading}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {qa.actionType === 'NAVIGATE' ? (
                          <>
                            <span>{qa.label}</span>
                            <ArrowRight size={10} className="text-slate-400" />
                          </>
                        ) : (
                          <span>{qa.label}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing / Web Search Indicator */}
            {loading && (
              <div
                data-testid="chat-loading"
                className="flex flex-col gap-1.5 p-3 bg-white border border-slate-200/80 rounded-2xl rounded-bl-2xs w-fit max-w-[85%] text-xs text-slate-600 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-sky-600 shrink-0" />
                  <span className="font-semibold text-[11px] text-slate-700">
                    {isWebSearching ? 'Consulting external sources...' : 'PetZoe AI is thinking...'}
                  </span>
                </div>
                {isWebSearching && (
                  <div
                    data-testid="chat-web-search-status"
                    className="text-[10px] text-sky-700 bg-sky-50/80 border border-sky-200/60 px-2 py-1 rounded-lg flex items-center gap-1 font-medium"
                  >
                    <Globe size={11} className="shrink-0 text-sky-600" />
                    <span>{webSearchStatusText}</span>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Action Bar */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              data-testid="chat-message-input"
              type="text"
              disabled={loading}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about pet care, appointments, vaccines..."
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition-all disabled:opacity-50"
              maxLength={2000}
            />
            <button
              data-testid="chat-send"
              type="button"
              disabled={loading}
              onClick={() => handleSendMessage()}
              className="h-10 w-10 rounded-2xl bg-[#1E3A5F] hover:bg-[#112A46] text-white flex items-center justify-center transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
