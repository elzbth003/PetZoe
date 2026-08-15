import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Home, Heart, FileText, LogOut, CheckCircle, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ShelterDashboard() {
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
              <Home size={16} /> Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all">
              <Heart size={16} /> Fosters
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all">
              <FileText size={16} /> Adoptions
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
            <h1 className="text-2xl font-black text-slate-900">Shelter & Adoption Hub</h1>
            <p className="text-slate-500 text-xs mt-0.5">Welcome back, {user?.name}. Managing intakes and adoption checks.</p>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Home size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Capacity</p>
              <h3 className="text-2xl font-black text-slate-800">42 / 60</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Heart size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Under Fostering</p>
              <h3 className="text-2xl font-black text-slate-800">18</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Adoptions This Month</p>
              <h3 className="text-2xl font-black text-slate-800">12</h3>
            </div>
          </div>
        </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center py-12 space-y-3">
            <Heart className="mx-auto text-slate-300" size={48} />
            <h3 className="font-bold text-slate-800 text-sm">Adoption Matching System Ready</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">This dashboard serves as a functional placeholder for Shelter Managers to manage background checks and pet listings.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
