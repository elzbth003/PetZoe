import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Heart, Calendar, FileText, ShoppingBag,
  Bell, User, LogOut, Sparkles, ShieldAlert, CalendarDays,
  Plus, ArrowRight, Activity, Clock, PawPrint, Menu, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PetList from '../../components/dashboard/PetList';
import AppointmentList from '../../components/dashboard/AppointmentList';
import ProfileManagement from '../../components/dashboard/ProfileManagement';
import NotificationCenter from '../../components/dashboard/NotificationCenter';
import ShopDashboard from '../../components/dashboard/ShopDashboard';
import AdopterProfilePanel from '../../components/dashboard/AdopterProfilePanel';
import { notificationService } from '../../services/notificationService';
import marketplaceService from '../../services/marketplaceService';
import api from '../../services/api';

export default function OwnerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const jumpTo = sessionStorage.getItem('petzoe_owner_tab');
    if (jumpTo) {
      sessionStorage.removeItem('petzoe_owner_tab');
      return jumpTo;
    }
    return 'Dashboard';
  });
  const [petsCount, setPetsCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [vaccineAlerts, setVaccineAlerts] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: "Logged in securely", time: "Just now", type: "auth" },
    { id: 2, action: "Retrieved patient records", time: "10 mins ago", type: "system" }
  ]);
  const [pets, setPets] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load overview numbers from APIs
  const fetchOverviewData = async () => {
    try {
      const [petsRes, apptsRes] = await Promise.all([
        api.get('/pets'),
        api.get('/appointments')
      ]);

      const petData = petsRes.data;
      setPets(petData);
      setPetsCount(petData.length);

      const apptData = apptsRes.data;
      const upcomingCount = apptData.filter(a => a.status === 'UPCOMING').length;
      setUpcomingAppointments(upcomingCount);

      const vaccineNeeds = petData.filter(p => p.vaccinationStatus !== 'Up-to-date').length;
      setVaccineAlerts(vaccineNeeds);

      const activities = [{ id: 1, action: "Logged in securely", time: "Just now", type: "auth" }];
      if (petData.length > 0) {
        activities.push({ id: 2, action: `Active patients: ${petData.map(p => p.name).join(', ')}`, time: "Synced", type: "pet" });
      }
      if (apptData.length > 0) {
        const nextAppt = apptData.find(a => a.status === 'UPCOMING');
        if (nextAppt) {
          activities.push({ id: 3, action: `Upcoming consultation with ${nextAppt.veterinarianName}`, time: `${nextAppt.appointmentDate} @ ${nextAppt.appointmentTime}`, type: "calendar" });
        }
      }
      setRecentActivities(activities);
    } catch (_) {
      // Swallowed, fallback to defaults
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadNotifications(count);
    } catch (_) {}
  };

  const fetchCartCount = async () => {
    try {
      const res = await marketplaceService.getCart();
      setCartItemCount(res.data.reduce((s, i) => s + i.quantity, 0));
    } catch (_) {}
  };

  useEffect(() => {
    fetchOverviewData();
    fetchUnreadCount();
    fetchCartCount();
    const onCartUpdate = () => fetchCartCount();
    window.addEventListener('cart-updated', onCartUpdate);
    return () => window.removeEventListener('cart-updated', onCartUpdate);
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Pets Widget */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <Heart size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Pets Registered</p>
                  <h3 className="text-2xl font-black text-slate-800">{petsCount}</h3>
                </div>
              </div>

              {/* Upcoming Appointments Widget */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <CalendarDays size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upcoming Consults</p>
                  <h3 className="text-2xl font-black text-slate-800">{upcomingAppointments}</h3>
                </div>
              </div>

              {/* Vaccine Alerts Widget */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                  vaccineAlerts > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <ShieldAlert size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vaccine Actions</p>
                  <h3 className="text-2xl font-black text-slate-800">
                    {vaccineAlerts > 0 ? `${vaccineAlerts} Pending` : 'All Clear'}
                  </h3>
                </div>
              </div>

            </div>

            {/* Middle Section: Welcome & Quick Actions / Vaccine Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Welcome Card & Recent Activity */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F]/90 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-blue-900/10">
                  <div className="absolute -right-8 -bottom-8 opacity-10 bg-white rounded-full h-48 w-48 pointer-events-none"></div>
                  <div className="relative space-y-4 max-w-lg text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-[10px] font-bold border border-white/10 uppercase">
                      <Sparkles size={10} /> Certified Healthcare
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl leading-tight">
                      Happy & Healthy Lives For Your Best Friends.
                    </h2>
                    <p className="text-slate-200 text-xs leading-relaxed">
                      Manage vaccinations, coordinate with local certified veterinarians, and keep clinical journals secure in our digital patient vaults.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab('My Pets')}
                        className="px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#32abdf] text-white font-bold text-xs shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                      >
                        <Plus size={14} /> Add First Pet
                      </button>
                      <button
                        onClick={() => setActiveTab('Appointments')}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 active:scale-95"
                      >
                        Book Appointment <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-left">
                    <Activity size={16} className="text-[#F97360]" /> Security & Audit Logs
                  </h3>
                  <div className="divide-y divide-slate-50">
                    {recentActivities.map((act) => (
                      <div key={act.id} className="py-3 flex justify-between items-center text-left">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-[#38BDF8]"></div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{act.action}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> {act.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Vaccination Alert Details & Quick Stats */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Vaccination Status alert card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-500" /> Vaccination Reminders
                  </h3>
                  
                  {pets.filter(p => p.vaccinationStatus !== 'Up-to-date').length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium">All pets are up-to-date with their vaccinations. Good job!</p>
                  ) : (
                    <div className="space-y-3">
                      {pets.filter(p => p.vaccinationStatus !== 'Up-to-date').map(p => (
                        <div key={p.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center gap-3">
                          <img src={p.photoUrl} className="h-9 w-9 rounded-xl object-cover shrink-0" alt={p.name} />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">{p.vaccinationStatus}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Summary */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <User size={18} className="text-slate-400" />
                      </div>
                    )}
                    <h3 className="font-bold text-slate-800 text-sm">Owner Account</h3>
                  </div>
                  <div className="space-y-2 text-xs text-slate-500 font-semibold">
                    <p className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-slate-400">Name:</span> 
                      <span className="text-slate-800">{user?.name}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-slate-400">Email:</span> 
                      <span className="text-slate-800 truncate max-w-[140px]">{user?.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Role:</span> 
                      <span className="text-slate-800">{user?.role}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('Profile')}
                    className="w-full mt-2 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <User size={12} /> Edit Profile
                  </button>
                </div>

              </div>

            </div>

          </div>
        );
      case 'My Pets':
        return <PetList onPetsUpdated={setPetsCount} />;
      case 'Appointments':
        return <AppointmentList onAppointmentsUpdated={setUpcomingAppointments} />;
      case 'My Shop':
        return <ShopDashboard />;
      case 'Adoptions':
        return <AdopterProfilePanel />;
      case 'Notifications':
        return <NotificationCenter />;
      case 'Profile':
        return <ProfileManagement />;
      case 'Medical Records':
        return (
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 animate-in fade-in duration-200 max-w-xl mx-auto">
            <div className="h-16 w-16 bg-blue-50 text-[#1E3A5F] rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-slate-800">Medical Records Module</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This module is planned for Milestone 2 and will support encrypted medical history, lab results, and prescription tracking.
              </p>
            </div>
            <button onClick={() => setActiveTab('Dashboard')} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer">
              Return to Overview
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Pets', icon: Heart },
    { name: 'Appointments', icon: Calendar },
    { name: 'My Shop', icon: ShoppingBag, badge: cartItemCount },
    { name: 'Adoptions', icon: Heart },
    { name: 'Medical Records', icon: FileText },
    { name: 'Notifications', icon: Bell, badge: unreadNotifications },
    { name: 'Profile', icon: User }
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-6 shrink-0 shadow-xl border-r border-slate-800 fixed md:relative inset-y-0 left-0 z-30 h-screen transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* Brand Header */}
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-1.5 px-2 select-none">
            <span className="font-display font-black text-xl text-white flex items-center">
              PetZ
              <span className="inline-block hover:rotate-12 transition-transform duration-300">
                <PawPrint size={20} className="fill-current text-[#38BDF8] mx-0.5 animate-pulse" />
              </span>
              e
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Avatar in Sidebar */}
          {user?.profileImage && (
            <div className="flex items-center gap-3 px-2">
              <img src={user.profileImage} alt={user.name} className="h-8 w-8 rounded-lg object-cover border border-slate-700" />
              <span className="text-xs font-semibold text-slate-300 truncate">{user.name}</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#1E3A5F] text-white border-l-4 border-[#38BDF8]'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Footer */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 font-bold text-xs transition-all cursor-pointer text-left w-full"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>

      </aside>

      {/* Main Dashboard Portal Panel */}
      <main className="flex-1 overflow-y-auto bg-slate-50 w-full">

        {/* Header Panel */}
        <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm flex justify-between items-center border-b border-slate-200 px-4 sm:px-8 py-5 gap-3">
          <div className="flex items-center gap-3 text-left min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">{activeTab}</h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5 hidden sm:block">
                Secure Pet Owner Workspace • {user?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {cartItemCount > 0 && (
              <button
                onClick={() => setActiveTab('My Shop')}
                className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#38BDF8] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                title="View Cart"
              >
                <ShoppingBag size={16} />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#38BDF8] text-white text-[9px] font-black flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              </button>
            )}
            {unreadNotifications > 0 && (
              <button
                onClick={() => setActiveTab('Notifications')}
                className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#38BDF8] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              >
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              </button>
            )}
            <span className="hidden sm:inline text-slate-500 text-xs font-semibold bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
              🔑 {user?.role}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-4 sm:p-8 pb-10">
          {renderTabContent()}
        </div>

      </main>

    </div>
  );
}
