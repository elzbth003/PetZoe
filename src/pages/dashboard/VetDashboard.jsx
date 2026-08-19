import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Stethoscope, Calendar, Users, LogOut, Activity, PawPrint, HeartPulse, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VetAnimalCarePanel from '../../components/dashboard/VetAnimalCarePanel';

export default function VetDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', icon: Stethoscope },
    { name: 'Shelter Animals', icon: HeartPulse },
    { name: 'Appointments', icon: Calendar },
    { name: 'Patients', icon: Users },
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Visits</p>
            <h3 className="text-2xl font-black text-slate-800">8</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Patients</p>
            <h3 className="text-2xl font-black text-slate-800">142</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Diagnostics</p>
            <h3 className="text-2xl font-black text-slate-800">3</h3>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center py-16">
        <HeartPulse size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Shelter animals need your care</h3>
        <p className="text-slate-500">Record veterinary assessments, vaccinations, and medical documents for shelter animals awaiting examination.</p>
        <button onClick={() => setActiveTab('Shelter Animals')}
          className="mt-6 bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer">
          Go to Shelter Animals
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'Shelter Animals') return <VetAnimalCarePanel />;
    if (activeTab === 'Overview') return renderOverview();
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm text-slate-500 animate-in fade-in duration-300">
        Coming Soon
      </div>
    );
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
      <aside className={`w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-6 shrink-0 fixed md:relative inset-y-0 left-0 z-30 h-screen transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-1.5 select-none">
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

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => { setActiveTab(item.name); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
                  }`}
                >
                  <Icon size={16} /> {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 font-semibold text-xs transition-all cursor-pointer text-left w-full"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm flex justify-between items-center border-b border-slate-200 px-4 sm:px-10 py-5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{activeTab}</h1>
              <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">Welcome back, {user?.name}. Managing your consultations and shelter care.</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-10 space-y-8">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
