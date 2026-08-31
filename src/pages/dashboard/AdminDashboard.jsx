import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Users, Database, LogOut, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-1.5 select-none">
            <span className="font-display font-black text-xl text-white flex items-center">
              PetZ
              <span className="inline-block hover:rotate-12 transition-transform duration-300">
                <PawPrint size={20} className="fill-current text-[#38BDF8] mx-0.5 animate-pulse" />
              </span>
              e
            </span>
          </div>
          
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white font-semibold text-xs transition-all">
              <Shield size={16} /> Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all">
              <Users size={16} /> Users List
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all">
              <Database size={16} /> System Health
            </a>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-semibold text-xs transition-all cursor-pointer text-left w-full
            hover:bg-rose-950/20 hover:text-rose-300`}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Administrator Console</h1>
            <p className="text-slate-500 text-xs mt-0.5">Welcome back, {user?.name}. Overseeing system settings and records.</p>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Active Users</p>
              <h3 className="text-2xl font-black text-slate-800">1,482</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Database size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">API Invocations</p>
              <h3 className="text-2xl font-black text-slate-800">48.2K / day</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Security Audits</p>
              <h3 className="text-2xl font-black text-slate-800">Passing</h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center py-12 space-y-3">
          <Shield className="mx-auto text-slate-300" size={48} />
          <h3 className="font-bold text-slate-800 text-sm">Admin Control Center</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">This dashboard serves as a functional placeholder for Administrators to monitor overall platform health and databases.</p>
        </div>
      </main>
    </div>
  );
}
