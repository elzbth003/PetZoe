import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Stethoscope, Calendar, Users, LogOut, Activity, PawPrint,
  HeartPulse, Menu, X, Bell, ShieldCheck, ShieldAlert, CheckCircle2,
  Clock, ArrowRight, FileText, AlertCircle, RefreshCw, Home
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import VetAnimalCarePanel from '../../components/dashboard/VetAnimalCarePanel';
import VetAppointmentsPanel from '../../components/dashboard/VetAppointmentsPanel';
import VetPatientsPanel from '../../components/dashboard/VetPatientsPanel';
import VetVerificationPanel from '../../components/dashboard/VetVerificationPanel';
import NotificationCenter from '../../components/dashboard/NotificationCenter';
import { vetClinicalService } from '../../services/vetClinicalService';
import { notificationService } from '../../services/notificationService';

export default function VetDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const urlTab = new URLSearchParams(window.location.search).get('tab');
    if (urlTab) {
      const clean = urlTab.trim().toLowerCase().replace(/[-_ ]/g, '');
      if (clean.includes('appoint')) return 'Appointments';
      if (clean.includes('patient')) return 'Patients';
      if (clean.includes('shelter')) return 'Shelter Animals';
      if (clean.includes('profile') || clean.includes('verif')) return 'Profile & Verification';
      if (clean.includes('notif')) return 'Notifications';
      if (clean.includes('overview')) return 'Overview';
    }
    const sessionTab = sessionStorage.getItem('petzoe_vet_tab');
    if (sessionTab) {
      sessionStorage.removeItem('petzoe_vet_tab');
      return sessionTab;
    }
    return 'Overview';
  });
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    activePatients: 0,
    pendingFollowUps: 0,
    shelterAnimalsCount: 0,
    overdueShelterCare: 0,
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [vetProfile, setVetProfile] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      const clean = tabFromUrl.trim().toLowerCase().replace(/[-_ ]/g, '');
      if (clean.includes('appoint')) setActiveTab('Appointments');
      else if (clean.includes('patient')) setActiveTab('Patients');
      else if (clean.includes('shelter')) setActiveTab('Shelter Animals');
      else if (clean.includes('profile') || clean.includes('verif')) setActiveTab('Profile & Verification');
      else if (clean.includes('notif')) setActiveTab('Notifications');
      else if (clean.includes('overview')) setActiveTab('Overview');
    }
  }, [searchParams, location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, unreadCount, profileData] = await Promise.allSettled([
        vetClinicalService.getDashboardStats(),
        notificationService.getUnreadCount(),
        vetClinicalService.getVetProfile(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (unreadCount.status === 'fulfilled') setUnreadNotifications(unreadCount.value);
      if (profileData.status === 'fulfilled') setVetProfile(profileData.value);
    } catch (err) {
      console.error('Failed to load vet dashboard data', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Overview', icon: Stethoscope },
    {
      name: 'Appointments',
      icon: Calendar,
      badge: stats.pendingAppointments > 0 ? stats.pendingAppointments : null,
      badgeColor: 'bg-purple-500 text-white',
    },
    { name: 'Patients', icon: Users },
    {
      name: 'Shelter Animals',
      icon: HeartPulse,
      badge: stats.overdueShelterCare > 0 ? stats.overdueShelterCare : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      name: 'Profile & Verification',
      icon: ShieldCheck,
      badge: vetProfile?.verificationStatus === 'APPROVED' ? 'Verified' : 'Pending',
      badgeColor:
        vetProfile?.verificationStatus === 'APPROVED'
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      name: 'Notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Verification notice if not approved */}
      {vetProfile && vetProfile.verificationStatus !== 'APPROVED' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Medical License Verification Status: {vetProfile.verificationStatus?.replace('_', ' ')}
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Ensure your veterinary license and degree certificates are up to date for official verification.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('Profile & Verification')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Review Credentials
          </button>
        </div>
      )}

      {/* Dynamic Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Today's Appointments */}
        <div
          onClick={() => setActiveTab('Appointments')}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform shrink-0">
            <Calendar size={26} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Visits</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              {loadingStats ? '...' : stats.todaysAppointments}
            </h3>
            <span className="text-[11px] font-semibold text-sky-600">Scheduled Today</span>
          </div>
        </div>

        {/* Card 2: Pending Requests */}
        <div
          onClick={() => setActiveTab('Appointments')}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform shrink-0">
            <Clock size={26} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Requests</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              {loadingStats ? '...' : stats.pendingAppointments}
            </h3>
            <span className="text-[11px] font-semibold text-purple-600">Awaiting Your Action</span>
          </div>
        </div>

        {/* Card 3: Active Patients */}
        <div
          onClick={() => setActiveTab('Patients')}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform shrink-0">
            <Users size={26} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Patients</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              {loadingStats ? '...' : stats.activePatients}
            </h3>
            <span className="text-[11px] font-semibold text-teal-600">Total Consulted Pets</span>
          </div>
        </div>

        {/* Card 4: Pending Follow-ups */}
        <div
          onClick={() => setActiveTab('Appointments')}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform shrink-0">
            <Activity size={26} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Due Follow-ups</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              {loadingStats ? '...' : stats.pendingFollowUps}
            </h3>
            <span className="text-[11px] font-semibold text-amber-600">Post-Op & Treatments</span>
          </div>
        </div>
      </div>

      {/* Two-Column Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shelter Care Hub */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                <HeartPulse size={24} />
              </div>
              {stats.overdueShelterCare > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  {stats.overdueShelterCare} Need Exam
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900">Shelter Animal Medicine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Shelter animals rely on your clinical evaluations, preventive vaccination protocols, and fitness certificates before adoption approvals.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-2">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl">
                {stats.shelterAnimalsCount} Shelter Animals
              </span>
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl">
                {stats.overdueShelterCare} Overdue Care
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('Shelter Animals')}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
          >
            Manage Shelter Animals <ArrowRight size={15} />
          </button>
        </div>

        {/* Private Patient Appointments Hub */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Stethoscope size={24} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                {stats.confirmedAppointments} Confirmed
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Clinical Consultation Room</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Start consultations with owners, examine clinical symptoms, log automated medical records, generate e-prescriptions, and schedule follow-ups.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-2">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl">
                {stats.pendingAppointments} Pending Requests
              </span>
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl">
                {stats.completedAppointments} Completed Visits
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('Appointments')}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
          >
            View Consultation Schedule <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Shelter Animals':
        return <VetAnimalCarePanel />;
      case 'Appointments':
        return <VetAppointmentsPanel />;
      case 'Patients':
        return <VetPatientsPanel />;
      case 'Profile & Verification':
        return <VetVerificationPanel />;
      case 'Notifications':
        return <NotificationCenter />;
      case 'Overview':
      default:
        return renderOverview();
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-6 shrink-0 fixed md:relative inset-y-0 left-0 z-30 h-screen transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-1.5 select-none">
            <Link
              to="/"
              title="Return to PetZoe Home Page"
              className="font-display font-black text-xl text-white flex items-center hover:opacity-90 transition-opacity cursor-pointer group"
            >
              PetZ
              <span className="inline-block group-hover:rotate-12 transition-transform duration-300">
                <PawPrint size={20} className="fill-current text-[#38BDF8] mx-0.5 animate-pulse" />
              </span>
              e
              <span className="ml-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-400/30">
                Doctor
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1.5">
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} /> {item.name}
                  </span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.badgeColor || 'bg-slate-700 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="px-4 py-2 flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">Licensed Veterinarian</p>
            </div>
          </div>

          <Link
            to="/"
            title="Return to PetZoe Home Page"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-[#38BDF8] font-semibold text-xs transition-all cursor-pointer text-left w-full group"
          >
            <Home size={16} className="group-hover:scale-110 transition-transform" />
            <span>Home Page</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 font-semibold text-xs transition-all cursor-pointer text-left w-full hover:bg-rose-950/20 hover:text-rose-300"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 w-full">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm flex justify-between items-center border-b border-slate-200 px-4 sm:px-10 py-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{activeTab}</h1>
              <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">
                Welcome, {user?.name}. Managing private consultations and shelter clinical care.
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('Notifications')}
              className="relative p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Verification Badge */}
            <button
              onClick={() => setActiveTab('Profile & Verification')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer border ${
                vetProfile?.verificationStatus === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {vetProfile?.verificationStatus === 'APPROVED' ? (
                <>
                  <ShieldCheck size={14} className="text-emerald-600" /> Verified
                </>
              ) : (
                <>
                  <Clock size={14} className="text-amber-600" /> Pending Review
                </>
              )}
            </button>

            {/* Quick Home Link */}
            <Link
              to="/"
              title="Return to PetZoe Home Page"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 bg-white border border-slate-200 hover:border-sky-300 px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Home size={13} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-4 sm:p-10 space-y-8">{renderTabContent()}</div>
      </main>
    </div>
  );
}
