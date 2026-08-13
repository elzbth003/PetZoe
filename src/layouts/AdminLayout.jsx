import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Users, LogOut, PawPrint, CheckSquare, Home, HeartPulse, Stethoscope, ShoppingBag, Bell, Settings, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/admin', icon: Home },
    { name: 'User Management', path: '/dashboard/admin/users', icon: Users },
    { name: 'Veterinarians', path: '/dashboard/admin/veterinarians', icon: Stethoscope },
    { name: 'Shelter Verification', path: '/dashboard/admin/shelters', icon: HeartPulse },
    { name: 'Adoption Review', path: '/dashboard/admin/adoptions', icon: PawPrint },
    { name: 'Seller Verification', path: '/dashboard/admin/sellers', icon: ShoppingBag },
    { name: 'Product Moderation', path: '/dashboard/admin/products', icon: CheckSquare },
    { name: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
                  className={`flex items-center gap-3 w-full px-2 lg:px-4 py-3 rounded-xl font-semibold text-xs transition-all ${
                    isActive 
                      ? 'bg-slate-700 text-white' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  } ${isSidebarOpen ? 'md:justify-center lg:justify-start' : 'justify-start'}`}
                >
                  <Icon size={isSidebarOpen ? 20 : 16} className="shrink-0 lg:w-4 lg:h-4" /> 
                  <span className={`${isSidebarOpen ? 'md:hidden lg:block' : 'block'}`}>{item.name}</span>
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
            <h1 className="text-xl font-black text-slate-900 hidden sm:block">Administrator Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-slate-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
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
