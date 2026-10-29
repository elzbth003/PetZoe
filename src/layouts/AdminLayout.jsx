import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { notificationService } from '../services/notificationService';
import { adminApi } from '../services/adminApi';
import {
  Users, LogOut, PawPrint, CheckSquare, Home, HeartPulse, Stethoscope,
  ShoppingBag, Bell, Settings, Menu, X, Check, Trash2, Loader2, ArrowUpRight,
  ChevronLeft, ChevronRight, Search, ShieldCheck, Calendar, Activity
} from 'lucide-react';
import { getNotificationDestination } from '../utils/notificationNavigator';

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

  // Desktop sidebar collapse state & mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const notifRef = useRef(null);
  const pollingRef = useRef(false);

  // Global search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Pending-review counts for badges
  const [pendingCounts, setPendingCounts] = useState({
    veterinarians: 0,
    shelters: 0,
    sellers: 0,
    products: 0,
    adoptions: 0,
  });

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  useEffect(() => {
    if (!user) return;
    adminApi.getStats()
      .then(res => setPendingCounts({
        veterinarians: res.data.pendingVets || 0,
        shelters: res.data.pendingShelters || 0,
        sellers: res.data.pendingSellers || 0,
        products: res.data.pendingProducts || 0,
        adoptions: res.data.pendingAdoptionListings || 0,
      }))
      .catch(() => { /* Degrade gracefully */ });
  }, [user]);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Degrade gracefully
    } finally {
      pollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  const openNotifDropdown = async () => {
    setNotifOpen(true);
    setNotifLoading(true);
    setNotifError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark as read', 'error');
    }
  };

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

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      handleMarkRead(notif.id);
    }
    setNotifOpen(false);
    const dest = getNotificationDestination(notif, 'Admin');
    if (dest && dest.path) {
      navigate(dest.path);
    }
  };

  // Structured sidebar nav items
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard/admin', icon: Home, exact: true },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'User Management', path: '/dashboard/admin/users', icon: Users },
        { name: 'Veterinarians', path: '/dashboard/admin/veterinarians', icon: Stethoscope, badge: pendingCounts.veterinarians },
        { name: 'Shelter Verification', path: '/dashboard/admin/shelters', icon: HeartPulse, badge: pendingCounts.shelters },
        { name: 'Adoption Review', path: '/dashboard/admin/adoptions', icon: PawPrint, badge: pendingCounts.adoptions },
        { name: 'Seller Verification', path: '/dashboard/admin/sellers', icon: ShoppingBag, badge: pendingCounts.sellers },
        { name: 'Product Moderation', path: '/dashboard/admin/products', icon: CheckSquare, badge: pendingCounts.products },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Notifications', path: '/dashboard/admin/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
        { name: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
      ]
    }
  ];

  // Current page header contextual info
  const getContextualInfo = () => {
    const p = location.pathname;
    if (p === '/dashboard/admin') {
      return {
        title: 'Administrator Console',
        subtitle: 'Digital Pet Healthcare Platform • Operational Analytics & Queues',
        breadcrumbs: ['Admin Console', 'Dashboard']
      };
    }
    if (p.includes('/users')) {
      return {
        title: 'User & Identity Management',
        subtitle: 'Platform accounts, role assignments, and authentication states',
        breadcrumbs: ['Admin Console', 'User Management']
      };
    }
    if (p.includes('/veterinarians')) {
      return {
        title: 'Veterinarian Management',
        subtitle: 'Clinical license verification, practice records, and credentials',
        breadcrumbs: ['Admin Console', 'Veterinarians']
      };
    }
    if (p.includes('/shelters')) {
      return {
        title: 'Shelter & Rescue Verification',
        subtitle: 'NGO credentials, facility capacity, and adoption authorization',
        breadcrumbs: ['Admin Console', 'Shelter Verification']
      };
    }
    if (p.includes('/adoptions')) {
      return {
        title: 'Adoption Listing Review',
        subtitle: 'Listing moderation, pet health verification, and applicant routing',
        breadcrumbs: ['Admin Console', 'Adoption Review']
      };
    }
    if (p.includes('/sellers')) {
      return {
        title: 'Marketplace Seller Verification',
        subtitle: 'Merchant validation, catalog authorization, and GST credentials',
        breadcrumbs: ['Admin Console', 'Seller Verification']
      };
    }
    if (p.includes('/products')) {
      return {
        title: 'Product Catalog Moderation',
        subtitle: 'Veterinary pharmaceuticals, diets, and pet supplies approvals',
        breadcrumbs: ['Admin Console', 'Product Moderation']
      };
    }
    if (p.includes('/notifications')) {
      return {
        title: 'System Notifications',
        subtitle: 'Administrative alerts, critical incidents, and review triggers',
        breadcrumbs: ['Admin Console', 'Notifications']
      };
    }
    if (p.includes('/settings')) {
      return {
        title: 'Console & Security Settings',
        subtitle: 'Administrative credentials, session controls, and platform policies',
        breadcrumbs: ['Admin Console', 'Settings']
      };
    }
    return {
      title: 'Administrator Console',
      subtitle: 'Digital Pet Healthcare Platform • Enterprise Management',
      breadcrumbs: ['Admin Console', 'Overview']
    };
  };

  const contextInfo = getContextualInfo();

  return (
    <div className="h-screen overflow-hidden bg-[#F5F8FC] flex text-[#172B4D] font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-[#102844]/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Left Sidebar ── */}
      <aside 
        className={`fixed md:relative z-50 h-screen transition-all duration-300 ease-in-out flex flex-col justify-between
          ${mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'}
          bg-[#102844] border-r border-[#17365C] text-slate-200 shadow-xl`}
      >
        {/* Top Branding Section */}
        <div className="p-4 lg:p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => navigate('/dashboard/admin')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-blue-900/30 group-hover:scale-105 transition-transform">
                <PawPrint size={20} className="fill-current text-white animate-pulse" />
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg text-white tracking-tight flex items-center leading-none">
                    PetZoe
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#17365C] text-[#38BDF8] border border-blue-500/20">
                      ADMIN
                    </span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#71829E] tracking-wider uppercase mt-1">
                    Healthcare Console
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex h-7 w-7 rounded-lg bg-[#17365C] hover:bg-[#1f487a] text-slate-300 hover:text-white items-center justify-center transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-5 overflow-y-auto max-h-[calc(100vh-230px)] pr-1 custom-scrollbar">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {(!isCollapsed || mobileOpen) && (
                  <p className="text-[9px] uppercase font-extrabold text-[#71829E] tracking-widest px-3 mb-1.5">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      title={isCollapsed ? item.name : undefined}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 cursor-pointer group relative ${
                        isActive
                          ? 'bg-[#17365C] text-white shadow-sm font-semibold'
                          : 'text-[#71829E] hover:text-white hover:bg-[#17365C]/40'
                      } ${isCollapsed && !mobileOpen ? 'justify-center' : 'justify-start'}`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#3B82F6] rounded-r-full" />
                      )}

                      <Icon 
                        size={17} 
                        className={`shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-[#3B82F6]' : 'text-[#71829E] group-hover:text-slate-200'
                        }`} 
                      />

                      {(!isCollapsed || mobileOpen) && (
                        <span className="flex-1 text-left truncate">{item.name}</span>
                      )}

                      {/* Pending Badge */}
                      {item.badge > 0 && (
                        <span className={`h-4 min-w-[16px] px-1 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${
                          item.name === 'Notifications' 
                            ? 'bg-[#3B82F6] text-white' 
                            : 'bg-[#F59E0B] text-slate-900'
                        } ${isCollapsed && !mobileOpen ? 'absolute top-1 right-1' : ''}`}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Administrator Profile Footer */}
        <div className="p-4 border-t border-[#17365C] bg-[#0c1f35]/60 flex flex-col gap-3">
          <div className={`flex items-center gap-3 ${isCollapsed && !mobileOpen ? 'justify-center' : ''}`}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#17365C] to-[#3B82F6] border border-blue-400/30 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <p className="text-[10px] font-medium text-[#71829E] truncate">
                    Platform Admin
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#71829E] hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer w-full ${
              isCollapsed && !mobileOpen ? 'justify-center' : 'justify-start'
            }`}
          >
            <LogOut size={15} className="shrink-0" />
            {(!isCollapsed || mobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E5ECF4] px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          {/* Left: Mobile Toggle & Page Context */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <button 
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 md:hidden rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              {/* Breadcrumbs */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-[#71829E] mb-0.5">
                {contextInfo.breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-300">/</span>}
                    <span className={idx === contextInfo.breadcrumbs.length - 1 ? 'text-[#17365C] font-bold' : ''}>
                      {crumb}
                    </span>
                  </React.Fragment>
                ))}
              </div>
              <h1 className="text-base md:text-lg font-black text-[#172B4D] truncate tracking-tight leading-tight">
                {contextInfo.title}
              </h1>
            </div>
          </div>

          {/* Right: Search, Notifications & Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Global Search Bar */}
            <div className="relative hidden lg:block w-64 xl:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entities, doctors, pets..."
                className="w-full bg-[#F5F8FC] border border-[#E5ECF4] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-[#172B4D] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:bg-white transition-all"
              />
            </div>

            {/* Notification Dropdown Bell */}
            <div className="relative" ref={notifRef}>
              <button
                className="p-2 rounded-xl text-slate-500 hover:text-[#17365C] hover:bg-slate-50 relative transition-colors cursor-pointer border border-transparent hover:border-[#E5ECF4]"
                onClick={toggleNotifDropdown}
                aria-label="Platform Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center bg-[#F43F5E] text-white text-[9px] font-black rounded-full border-2 border-white shadow-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Modal */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#E5ECF4] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 border-b border-[#E5ECF4] flex items-center justify-between bg-slate-50/70">
                    <div>
                      <h3 className="font-bold text-[#172B4D] text-xs">Administrative Alerts</h3>
                      <p className="text-[10px] text-[#71829E] font-medium">{unreadCount} unread actions</p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#F43F5E] text-[10px] font-bold border border-rose-200">
                        Attention Required
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifLoading ? (
                      <div className="py-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#3B82F6]" size={22} />
                      </div>
                    ) : notifError ? (
                      <div className="p-5 text-center">
                        <p className="text-rose-600 text-xs font-semibold">Failed to load notifications</p>
                        <p className="text-slate-400 text-[10px] mt-1">{notifError}</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={24} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-xs font-semibold">All queues clear. No new notifications.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((notif) => {
                        const dest = getNotificationDestination(notif, 'Admin');
                        return (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer group ${
                              !notif.isRead ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-xs leading-snug group-hover:text-[#3B82F6] transition-colors ${
                                  !notif.isRead ? 'font-bold text-[#172B4D]' : 'font-semibold text-slate-600'
                                }`}>
                                  {notif.title}
                                </p>
                                {!notif.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-[#3B82F6] shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <p className="text-[10px] text-slate-400 font-medium">{timeAgo(notif.createdAt)}</p>
                                {dest && dest.label && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#3B82F6] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                    {dest.label} <ArrowUpRight size={10} />
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                                  title="Mark as read"
                                  className="h-6 w-6 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                                title="Dismiss"
                                className="h-6 w-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-2.5 border-t border-[#E5ECF4] bg-slate-50 text-center">
                      <button 
                        onClick={() => { setNotifOpen(false); navigate('/dashboard/admin/notifications'); }}
                        className="text-xs font-bold text-[#3B82F6] hover:text-[#17365C] transition-colors py-0.5"
                      >
                        View all operational notifications →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-[#E5ECF4]">
              <div className="h-8 w-8 rounded-full bg-[#17365C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#172B4D] leading-none">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] font-semibold text-[#10B981] mt-0.5">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content Scroll Container ── */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-[1700px] w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
