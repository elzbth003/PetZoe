import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';
import { adminApi } from '../services/adminApi';
import { useToast } from '../hooks/useToast';
import { Users, LogOut, PawPrint, CheckSquare, Home, HeartPulse, Stethoscope, ShoppingBag, Bell, Settings, Menu, X, Check, Trash2, Loader2 } from 'lucide-react';

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

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const notifRef = useRef(null);
  const pollingRef = useRef(false); // Guard against overlapping polls

  // Pending-review counts, surfaced as sidebar badges so admins see what needs action at a glance
  const [pendingCounts, setPendingCounts] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  useEffect(() => {
    if (!user) return;
    adminApi.getStats()
      .then(res => setPendingCounts({
        veterinarians: res.data.pendingVets,
        shelters: res.data.pendingShelters,
        sellers: res.data.pendingSellers,
        products: res.data.pendingProducts,
      }))
      .catch(() => { /* Degrade gracefully — badges just stay hidden */ });
  }, [user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (pollingRef.current) return; // Skip if previous request is still in flight
    pollingRef.current = true;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Degrade gracefully — don't break the layout
    } finally {
      pollingRef.current = false;
    }
  }, []);

  // Initial fetch + 30s polling
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // Fetch full notifications when dropdown opens
  const openNotifDropdown = async () => {
    setNotifOpen(true);
    setNotifLoading(true);
    setNotifError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      // Refresh unread count after fetch
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setNotifError(err.response?.data?.message || err.message || 'Failed to load notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const toggleNotifDropdown = () => {
    if (notifOpen) {
      setNotifOpen(false);
    } else {
      openNotifDropdown();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark as read
  const handleMarkRead = async (id) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark as read', 'error');
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const wasUnread = notifications.find(n => n.id === id && !n.isRead);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete notification', 'error');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/admin', icon: Home },
    { name: 'User Management', path: '/dashboard/admin/users', icon: Users },
    { name: 'Veterinarians', path: '/dashboard/admin/veterinarians', icon: Stethoscope, badge: pendingCounts.veterinarians },
    { name: 'Shelter Verification', path: '/dashboard/admin/shelters', icon: HeartPulse, badge: pendingCounts.shelters },
    { name: 'Adoption Review', path: '/dashboard/admin/adoptions', icon: PawPrint },
    { name: 'Seller Verification', path: '/dashboard/admin/sellers', icon: ShoppingBag, badge: pendingCounts.sellers },
    { name: 'Product Moderation', path: '/dashboard/admin/products', icon: CheckSquare, badge: pendingCounts.products },
    { name: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      {/* Sidebar Overlay (Mobile) */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? '-translate-x-full md:translate-x-0 md:w-20 lg:w-64' : 'translate-x-0 w-64'
        } bg-slate-900 text-slate-200 flex flex-col justify-between p-4 lg:p-6 h-screen sticky top-0 z-30 transition-all duration-300 fixed md:relative`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-1.5 select-none">
            <span className={`font-display font-black text-xl text-white flex items-center ${isSidebarOpen ? 'md:hidden lg:flex' : 'flex'}`}>
              PetZ
              <span className="inline-block hover:rotate-12 transition-transform duration-300">
                <PawPrint size={20} className="fill-current text-slate-400 mx-0.5 animate-pulse" />
              </span>
              e
            </span>
            {isSidebarOpen && <PawPrint size={28} className="hidden md:block lg:hidden fill-current text-slate-400 mx-auto" />}
            
            <button 
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="space-y-2">
            <p className={`text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 lg:px-4 mb-2 ${isSidebarOpen ? 'md:hidden lg:block' : 'block'}`}>Admin Panel</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path) && (item.path !== '/dashboard/admin' || location.pathname === '/dashboard/admin');
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={item.name}
                  className={`flex items-center gap-3 w-full px-2 lg:px-4 py-3 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#1E3A5F] text-white border-l-2 border-[#38BDF8]'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white hover:translate-x-0.5'
                  } ${isSidebarOpen ? 'md:justify-center lg:justify-start' : 'justify-start'}`}
                >
                  <Icon size={isSidebarOpen ? 20 : 16} className="shrink-0 lg:w-4 lg:h-4" />
                  <span className={`flex-1 text-left ${isSidebarOpen ? 'md:hidden lg:block' : 'block'}`}>{item.name}</span>
                  {item.badge > 0 && (
                    <span className={`h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black items-center justify-center ${isSidebarOpen ? 'hidden lg:flex' : 'flex'}`}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className={`flex items-center gap-3 px-2 lg:px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-300 font-semibold text-xs transition-all cursor-pointer w-full mt-8 ${
            isSidebarOpen ? 'md:justify-center lg:justify-start' : 'justify-start'
          }`}
        >
          <LogOut size={isSidebarOpen ? 20 : 16} className="shrink-0 lg:w-4 lg:h-4" /> 
          <span className={`${isSidebarOpen ? 'md:hidden lg:block' : 'block'}`}>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <header className="bg-white border-b border-slate-200 px-4 md:px-10 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Administrator Console</h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                Secure Admin Workspace • {user?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                className="p-2 rounded-xl text-slate-400 hover:text-[#1E3A5F] hover:bg-slate-50 relative transition-colors cursor-pointer"
                onClick={toggleNotifDropdown}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">{unreadCount} unread</p>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifLoading ? (
                      <div className="py-12 flex items-center justify-center">
                        <Loader2 className="animate-spin text-slate-400" size={24} />
                      </div>
                    ) : notifError ? (
                      <div className="p-6 text-center">
                        <p className="text-rose-600 text-xs font-semibold">Failed to load notifications</p>
                        <p className="text-slate-400 text-[10px] mt-1">{notifError}</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={28} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-slate-500 text-xs font-semibold">No new notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors flex items-start gap-3 ${
                            !notif.isRead ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs leading-snug ${!notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-600'}`}>
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">{timeAgo(notif.createdAt)}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {!notif.isRead && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                                title="Mark as read"
                                className={`h-6 w-6 rounded-lg text-slate-400 flex items-center justify-center transition-colors
                                  hover:bg-blue-100 hover:text-blue-500`}
                              >
                                <Check size={12} />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                              title="Dismiss"
                              className={`h-6 w-6 rounded-lg text-slate-400 flex items-center justify-center transition-colors
                                hover:bg-rose-100 hover:text-rose-500`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-100 bg-slate-50">
                      <button 
                        onClick={() => { setNotifOpen(false); navigate('/dashboard/admin/settings'); }}
                        className="w-full text-center text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors py-1"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-bold text-slate-700 leading-none">{user?.name}</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
