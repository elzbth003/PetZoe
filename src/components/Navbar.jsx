import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle smooth scroll to anchor
  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      // The scroll will be handled in LandingPage's useEffect on mount/hash change
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "info");
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'glass-header shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-primary-600 rounded-xl text-white shadow-md shadow-primary-600/20 group-hover:scale-105 transition-transform duration-300">
            <PawPrint size={20} className="fill-current text-white" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
            Pet<span className="text-primary-600">Verse</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {['features', 'services', 'why-us', 'testimonials', 'faq'].map((section) => (
            <button
              key={section}
              onClick={() => handleNavClick(section)}
              className="text-xs font-semibold text-slate-600 hover:text-primary-600 capitalize transition-colors duration-200 cursor-pointer"
            >
              {section.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Auth Actions / Profile Card */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <div className="p-1 bg-primary-100 rounded-full text-primary-600">
                <User size={14} />
              </div>
              <div className="text-left flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-none">{user.name.split(' ')[0]}</span>
                <span className="text-[9px] text-slate-500 font-semibold">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="ml-2 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-primary-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/10 hover:shadow-primary-600/25 transition-all duration-200 cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer menu */}
      <div className={`fixed inset-y-0 right-0 z-40 w-full max-w-xs bg-white px-6 py-20 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-6 p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <X size={20} />
        </button>

        {['features', 'services', 'why-us', 'testimonials', 'faq'].map((section) => (
          <button
            key={section}
            onClick={() => handleNavClick(section)}
            className="text-left text-base font-bold text-slate-700 hover:text-primary-600 capitalize py-2.5 border-b border-slate-100 transition-colors cursor-pointer"
          >
            {section.replace('-', ' ')}
          </button>
        ))}

        {user ? (
          <div className="flex flex-col gap-4 mt-6">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="p-2 bg-primary-50 rounded-full text-primary-600">
                <User size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-2xl text-center font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-2xl text-center font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/10 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
