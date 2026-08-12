import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Users, LogOut, PawPrint, CheckSquare, Home, HeartPulse, Stethoscope, ShoppingBag, Bell, Settings } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/admin', icon: Home },
    { name: 'User Management', path: '/dashboard/admin/users', icon: Users },
    { name: 'Vet Verification', path: '/dashboard/admin/vets', icon: Stethoscope },
    { name: 'Shelter Verification', path: '/dashboard/admin/shelters', icon: HeartPulse },
    { name: 'Adoption Review', path: '/dashboard/admin/adoptions', icon: PawPrint },
    { name: 'Seller Verification', path: '/dashboard/admin/sellers', icon: ShoppingBag },
    { name: 'Product Moderation', path: '/dashboard/admin/products', icon: CheckSquare },
    { name: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-6 h-screen sticky top-0">
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
          
          <nav className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-4 mb-2">Admin Panel</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-xs transition-all ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
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
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 font-semibold text-xs transition-all cursor-pointer text-left w-full mt-8"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-black text-slate-900">Administrator Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                A
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-bold text-slate-700 leading-none">{user?.name}</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
