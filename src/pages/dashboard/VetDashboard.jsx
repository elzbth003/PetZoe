import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Stethoscope, Calendar, Users, LogOut, Activity, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VetDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
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
              <Stethoscope size={16} /> Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all">
              <Calendar size={16} /> Appointments
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all">
              <Users size={16} /> Patients
            </a>
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
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <header className="sticky top-0 z-10 bg-slate-50 flex justify-between items-center border-b border-slate-200 px-10 py-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Veterinarian Portal</h1>
            <p className="text-slate-500 text-xs mt-0.5">Welcome back, {user?.name}. Managing your consultations and schedules.</p>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Visits</p>
              <h3 className="text-2xl font-black text-slate-800">8</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Patients</p>
              <h3 className="text-2xl font-black text-slate-800">142</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Diagnostics</p>
              <h3 className="text-2xl font-black text-slate-800">3</h3>
            </div>
          </div>
          </div>

        {/* Schedule preview */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Today's Consultations Queue</h2>
          <div className="divide-y divide-slate-100">
            <div className="py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">M</div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Milo (Golden Retriever)</p>
                  <p className="text-[10px] text-slate-400">Owner: Alex Carter</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">10:00 AM</span>
            </div>
            <div className="py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">B</div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Bella (Labrador)</p>
                  <p className="text-[10px] text-slate-400">Owner: Chloe Martinez</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">11:30 AM</span>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
