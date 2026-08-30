import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, Menu, X, LogOut, User, ShoppingCart, ShoppingBag, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import marketplaceService from '../services/marketplaceService';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isBuyer = user && user.role === 'Pet Owner';
  const canBrowseAdopt = !user || user.role === 'Pet Owner';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isBuyer) {
      fetchCartCount();
      // Listen for custom event when cart is updated
      window.addEventListener('cart-updated', fetchCartCount);
      return () => window.removeEventListener('cart-updated', fetchCartCount);
    }
  }, [isBuyer]);

  const fetchCartCount = async () => {
    try {
      const res = await marketplaceService.getCart();
      const count = res.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (err) {
      console.error('Failed to fetch cart count');
    }
  };

  // Handle smooth scroll to anchor
  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
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
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 bg-white/95 backdrop-blur-md ${isScrolled ? 'shadow-md py-3' : 'shadow-sm py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" aria-label="PetZoe" className="flex items-center gap-1.5 group cursor-pointer">
          <span className="font-display font-black text-xl tracking-tight text-slate-900 flex items-center select-none">
            PetZ
            <span className="inline-block group-hover:rotate-12 transition-transform duration-300">
              <PawPrint size={20} className="fill-current text-secondary-500 mx-0.5" />
            </span>
            e
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
          
          <Link to="/marketplace" className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors">
            <ShoppingBag size={14} /> Shop Now
          </Link>
          {canBrowseAdopt && (
            <Link to="/adopt" className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors">
              <Heart size={14} /> Adopt
            </Link>
          )}
        </div>

        {/* Auth Actions / Profile Card */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {isBuyer && (
                <Link to="/marketplace/cart" className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <Link to={`/dashboard/${user.role === 'Pet Owner' ? 'owner' : user.role === 'Veterinarian' ? 'vet' : user.role === 'Shelter Manager' ? 'shelter' : user.role === 'Marketplace Seller' ? 'seller' : 'admin'}`} className="flex items-center gap-2">
                  <div className="p-1 bg-primary-100 rounded-full text-primary-600">
                    <User size={14} />
                  </div>
                  <div className="text-left flex flex-col hover:text-primary-600 transition-colors">
                    <span className="text-xs font-bold text-slate-800 leading-none">{user.name.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{user.role}</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="ml-2 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors border-l border-slate-200 pl-3"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-xs font-bold text-slate-700 hover:text-primary-600 transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/10 hover:shadow-primary-600/25 transition-all duration-200 cursor-pointer">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          {isBuyer && (
            <Link to="/marketplace/cart" className="relative p-2 text-slate-600">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer menu */}
      <div className={`fixed inset-y-0 right-0 z-40 w-full max-w-xs bg-white px-6 py-20 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-6 p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <X size={20} />
        </button>

        <Link
          to="/marketplace"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 text-primary-600 bg-primary-50 px-4 py-3 rounded-2xl font-bold"
        >
          <ShoppingBag size={18} /> Shop Products
        </Link>

        {canBrowseAdopt && (
          <Link
            to="/adopt"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-2xl font-bold"
          >
            <Heart size={18} /> Adopt a Pet
          </Link>
        )}

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
            <Link to={`/dashboard/${user.role === 'Pet Owner' ? 'owner' : user.role === 'Veterinarian' ? 'vet' : user.role === 'Shelter Manager' ? 'shelter' : user.role === 'Marketplace Seller' ? 'seller' : 'admin'}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="p-2 bg-primary-50 rounded-full text-primary-600">
                <User size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Dashboard</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </Link>
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
