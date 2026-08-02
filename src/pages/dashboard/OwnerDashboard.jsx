import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Heart, Calendar, FileText, ShoppingBag, 
  Bell, User, LogOut, Sparkles, ShieldAlert, CalendarDays,
  Plus, ArrowRight, Activity, Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PetList from '../../components/dashboard/PetList';
import AppointmentList from '../../components/dashboard/AppointmentList';
import api from '../../services/api';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [petsCount, setPetsCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [vaccineAlerts, setVaccineAlerts] = useState(0);
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

      // Count pets needing vaccines
      const vaccineNeeds = petData.filter(p => p.vaccinationStatus !== 'Up-to-date').length;
      setVaccineAlerts(vaccineNeeds);

      // Populate dynamic activities based on actual data
      const activities = [
        { id: 1, action: "Logged in securely", time: "Just now", type: "auth" }
      ];
      
      if (petData.length > 0) {
        activities.push({
          id: 2,
          action: `Active patients: ${petData.map(p => p.name).join(', ')}`,
          time: "Synced",
          type: "pet"
        });
      }
      if (apptData.length > 0) {
        const nextAppt = apptData.find(a => a.status === 'UPCOMING');
        if (nextAppt) {
          activities.push({
            id: 3,
            action: `Upcoming consultation with ${nextAppt.veterinarianName}`,
            time: `${nextAppt.appointmentDate} @ ${nextAppt.appointmentTime}`,
            type: "calendar"
          });
        }
      }
      setRecentActivities(activities);
    } catch (_) {
      // Swallowed, fallback to defaults
    }
  };

  useEffect(() => {
    fetchOverviewData();
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
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <Heart size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Pets Registered</p>
                  <h3 className="text-2xl font-black text-slate-800">{petsCount}</h3>
                </div>
              </div>

              {/* Upcoming Appointments Widget */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <CalendarDays size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upcoming Consults</p>
                  <h3 className="text-2xl font-black text-slate-800">{upcomingAppointments}</h3>
                </div>
              </div>

              {/* Vaccine Alerts Widget */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
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
                        className="px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#32abdf] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={14} /> Add First Pet
                      </button>
                      <button 
                        onClick={() => setActiveTab('Appointments')}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
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
                          <img src={p.photoUrl} className="h-9 w-9 rounded-xl object-cover shrink-0" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">
                              {p.vaccinationStatus}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Summary */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">Owner Account</h3>
                  <div className="space-y-2 text-xs text-slate-500 font-semibold">
                    <p className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-slate-400">Name:</span> 
                      <span className="text-slate-800">{user?.name}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-slate-400">Email:</span> 
                      <span className="text-slate-800">{user?.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Role:</span> 
                      <span className="text-slate-800">{user?.role}</span>
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        );
      case 'My Pets':
        return <PetList onPetsUpdated={setPetsCount} />;
      case 'Appointments':
        return <AppointmentList onAppointmentsUpdated={setUpcomingAppointments} />;
      case 'Medical Records':
      case 'Marketplace':
      case 'Notifications':
        return (
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 animate-in fade-in duration-200 max-w-xl mx-auto">
            <div className="h-16 w-16 bg-blue-50 text-[#1E3A5F] rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-slate-800">{activeTab} Module</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This dashboard module is planned for a future release (Milestone 2/3) and will support interactive AI assistance, local pharmacy marketplace delivery, and encrypted file storage.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('Dashboard')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Return to Overview
            </button>
          </div>
        );
      case 'Profile':
        return (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-xl mx-auto text-left space-y-6 animate-in fade-in duration-200">
            <h3 className="font-display font-black text-xl text-slate-800">Your Account Profile</h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Full Name</span>
                  <span className="text-slate-800 font-bold">{user?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/50">
                  <span className="text-slate-400">Email Address</span>
                  <span className="text-slate-800 font-bold">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/50">
                  <span className="text-slate-400">Mobile Phone</span>
                  <span className="text-slate-800 font-bold">{user?.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/50">
                  <span className="text-slate-400">Account Access Level</span>
                  <span className="text-sky-700 font-bold px-2 py-0.5 bg-sky-50 border border-sky-100 rounded-full">{user?.role}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                <div>
                  <h4 className="font-bold text-rose-900 text-xs">Security Settings</h4>
                  <p className="text-[10px] text-rose-700 font-medium">Log out of the secure patient care vault.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
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
    { name: 'Medical Records', icon: FileText },
    { name: 'Marketplace', icon: ShoppingBag },
    { name: 'Notifications', icon: Bell },
    { name: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-6 shrink-0 shadow-xl border-r border-slate-800">
        
        {/* Brand Header */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-2">
            <div className="h-8 w-8 rounded-lg bg-[#38BDF8] flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <span className="font-display font-black text-xl text-white tracking-tight">PetZoe</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#1E3A5F] text-white border-l-4 border-[#38BDF8]' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
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
      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Header Panel */}
        <header className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activeTab}</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
              Secure Pet Owner Workspace • {user?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-semibold bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
              🔑 {user?.role}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="pb-10">
          {renderTabContent()}
        </div>

      </main>

    </div>
  );
}
