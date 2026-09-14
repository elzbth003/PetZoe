import React, { useState, useEffect } from 'react';
import {
  Bell, Calendar, Shield, User, Settings, Trash2,
  Check, CheckCheck, Loader2, Sparkles, X, CheckCircle, XCircle, MessageSquare
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import ChatWidget from './ChatWidget';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG = {
  CHAT: {
    icon: MessageSquare,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    label: 'Chat Message',
  },
  APPOINTMENT: {
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    label: 'Appointment',
  },
  VACCINATION: {
    icon: Shield,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    label: 'Vaccination',
  },
  PROFILE: {
    icon: User,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    label: 'Profile',
  },
  SYSTEM: {
    icon: Settings,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-100',
    label: 'System',
  },
  ACCOUNT_APPROVED: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    label: 'Account',
  },
  ACCOUNT_REJECTED: {
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    label: 'Account',
  },
  PRODUCT_APPROVED: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    label: 'Product',
  },
  PRODUCT_REJECTED: {
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    label: 'Product',
  },
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [activeChat, setActiveChat] = useState(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch {
      showToast('Could not load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: updated.isRead } : n));
    } catch {
      showToast('Failed to mark as read.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    try {
      await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.', 'success');
    } catch {
      showToast('Failed to mark all as read.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Notification removed.', 'success');
    } catch {
      showToast('Failed to delete notification.', 'error');
    }
  };

  const filters = ['ALL', 'UNREAD', 'CHAT', 'APPOINTMENT', 'VACCINATION', 'SYSTEM'];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.isRead;
    return n.type === filter;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-left">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Bell size={18} className="text-[#38BDF8]" /> Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer shrink-0"
          >
            <CheckCheck size={13} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              filter === f
                ? 'bg-[#1E3A5F] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'UNREAD' ? `Unread (${unreadCount})` : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#1E3A5F]" size={36} />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-14 text-center space-y-3">
          <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles size={28} className="text-slate-300" />
          </div>
          <h4 className="font-bold text-slate-700 text-sm">
            {filter === 'UNREAD' ? 'All caught up!' : 'No notifications'}
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {filter === 'UNREAD'
              ? 'You have no unread notifications. Nice work!'
              : 'Notifications will appear here when you book appointments, update your profile, or get vaccination reminders.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white border rounded-2xl p-4 flex items-start gap-3 transition-all ${
                    !notif.isRead ? 'border-sky-200 bg-sky-50/20 shadow-sm' : 'border-slate-100'
                  }`}
                >
                  {/* Icon */}
                  <div className={`h-9 w-9 rounded-xl ${cfg.bg} ${cfg.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={16} className={cfg.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-bold leading-snug ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-[#38BDF8] shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{notif.message}</p>
                    {notif.reason && (
                      <div className="mt-1 p-2 rounded-lg bg-rose-50 border border-rose-100">
                        <p className="text-[10px] font-bold text-rose-700">Rejection Reason:</p>
                        <p className="text-[11px] text-rose-600">{notif.reason}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">{timeAgo(notif.createdAt)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {notif.type === 'CHAT' && notif.referenceId && (
                      <button
                        onClick={() => {
                          handleMarkRead(notif.id);
                          setActiveChat({
                            appointmentId: notif.referenceId,
                            otherUserName: notif.title.replace('New message from ', '')
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                        title="Reply to message"
                      >
                        <MessageSquare size={13} /> Reply
                      </button>
                    )}
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        title="Mark as read"
                        className={`h-7 w-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center transition-all cursor-pointer
                          hover:bg-blue-50 hover:text-blue-500`}
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      title="Delete notification"
                      className={`h-7 w-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center transition-all cursor-pointer
                        hover:bg-rose-50 hover:text-rose-500`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reply Chat Widget Popup */}
      {activeChat && (
        <ChatWidget
          appointmentId={activeChat.appointmentId}
          currentUserId={user?.id}
          otherUserName={activeChat.otherUserName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
