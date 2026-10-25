import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, Menu, X, LogOut, User, ShoppingCart, ShoppingBag, Heart, HeartHandshake, Package } from 'lucide-react';
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
  const isMarketplace = location.pathname.startsWith('/marketplace');

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
      window.addEventListener('cart-updated', fetchCartCount);
      return () => window.removeEventListener('cart-updated', fetchCartCount);
    } else {
      setCartCount(0);
    }
  }, [isBuyer]);

  const fetchCartCount = async () => {
    try {
      const res = await marketplaceService.getCart();
      if (Array.isArray(res.data)) {
        const count = res.data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      }
    } catch (err) {
      // Cart fetch fail silently on network blips
    }
  };

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
        
        {/* Brand Logo */}
        <Link to="/" aria-label="PetZoe Home" className="flex items-center gap-1.5 group cursor-pointer">
          <span className="font-display font-black text-xl tracking-tight text-slate-900 flex items-center select-none">
            PetZ
            <span className="inline-block group-hover:rotate-12 transition-transform duration-300">
              <PawPrint size={20} className="fill-current text-teal-600 mx-0.5" />
            </span>
            e
          </span>
          {isMarketplace && (
            <span className="ml-2 hidden sm:inline-flex items-center text-[11px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
              Store
            </span>
          )}
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          {isMarketplace ? (
            <>
              <Link
                to="/marketplace"
                className={`text-xs font-bold transition-colors ${
                  location.pathname === '/marketplace' ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                }`}
              >
                Store Home
              </Link>
              <Link
                to="/marketplace/products"
                className={`text-xs font-bold transition-colors ${
                  location.pathname.startsWith('/marketplace/products') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                }`}
              >
                All Products
              </Link>
              {isBuyer && (
                <Link
                  to="/marketplace/orders"
                  className={`text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/marketplace/orders') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                  }`}
                >
                  <Package size={14} /> My Orders
                </Link>
              )}
              {canBrowseAdopt && (
                <Link to="/adopt" className="text-xs font-bold text-slate-600 hover:text-rose-600 transition-colors">
                  Adopt
                </Link>
              )}
              <Link to="/rehoming" className="text-xs font-bold text-slate-600 hover:text-amber-700 transition-colors">
                Rehome
              </Link>
            </>
          ) : (
            <>
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
              <Link to="/rehoming" className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                <HeartHandshake size={14} /> Rehome
              </Link>
            </>
          )}
        </div>

        {/* Right Actions: Wishlist, Cart & Auth */}
        <div className="hidden md:flex items-center gap-3.5">
          {user ? (
            <div className="flex items-center gap-3">
              {isBuyer && (
                <>
                  {/* Wishlist button */}
                  <Link
                    to="/marketplace/wishlist"
                    title="My Wishlist"
                    aria-label="My Wishlist"
                    className="p-2 text-slate-600 hover:text-rose-600 transition-colors rounded-full hover:bg-slate-100"
                  >
                    <Heart size={20} className={location.pathname === '/marketplace/wishlist' ? 'text-rose-600 fill-rose-600' : ''} />
                  </Link>

                  {/* Cart button */}
                  <Link
                    to="/marketplace/cart"
                    title="Shopping Cart"
                    aria-label="Shopping Cart"
                    className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors rounded-full hover:bg-slate-100"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-scale-in">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Profile Pill */}
              <div className="flex items-center gap-3 bg-slate-100/90 pl-3.5 pr-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Link
                  to={`/dashboard/${
                    user.role === 'Pet Owner'
                      ? 'owner'
                      : user.role === 'Veterinarian'
                      ? 'vet'
                      : user.role === 'Shelter Manager'
                      ? 'shelter'
                      : user.role === 'Marketplace Seller'
                      ? 'seller'
                      : 'admin'
                  }`}
                  className="flex items-center gap-2 group"
                >
                  <div className="p-1 bg-primary-100 rounded-full text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <User size={13} />
                  </div>
                  <div className="text-left flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-none group-hover:text-primary-600 transition-colors">
                      {user.name ? user.name.split(' ')[0] : 'Account'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">{user.role}</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                  className="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors border-l border-slate-200 pl-2.5 h-8 w-8 flex items-center justify-center"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-xs font-bold text-slate-700 hover:text-primary-600 transition-colors px-3 py-2">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/10 hover:shadow-primary-600/25 transition-all duration-200 cursor-pointer">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Action Controls */}
        <div className="md:hidden flex items-center gap-2">
          {isBuyer && (
            <Link to="/marketplace/cart" aria-label="Shopping Cart" className="relative p-2.5 text-slate-600">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="p-2.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-y-0 right-0 z-40 w-full max-w-xs bg-white px-6 py-16 flex flex-col gap-5 shadow-2xl transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation menu"
          className="absolute top-5 right-6 p-3 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            to="/marketplace"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 text-primary-700 bg-primary-50 px-4 py-3 rounded-2xl font-bold text-sm"
          >
            <ShoppingBag size={18} /> Marketplace Store
          </Link>
          <Link
            to="/marketplace/products"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-2xl font-semibold text-sm"
          >
            All Products Catalog
          </Link>
          {isBuyer && (
            <>
              <Link
                to="/marketplace/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-2xl font-semibold text-sm"
              >
                <Package size={18} /> My Orders
              </Link>
              <Link
                to="/marketplace/wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-2xl font-semibold text-sm"
              >
                <Heart size={18} /> Saved Wishlist
              </Link>
            </>
          )}

          {canBrowseAdopt && (
            <Link
              to="/adopt"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 text-rose-600 bg-rose-50/60 px-4 py-3 rounded-2xl font-bold text-sm"
            >
              <Heart size={18} /> Adopt a Pet
            </Link>
          )}

          <Link
            to="/rehoming"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 text-amber-700 bg-amber-50/60 px-4 py-3 rounded-2xl font-bold text-sm"
          >
            <HeartHandshake size={18} /> Community Rehoming
          </Link>
        </div>

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-1">
          {['features', 'services', 'why-us', 'testimonials', 'faq'].map((section) => (
            <button
              key={section}
              onClick={() => handleNavClick(section)}
              className="text-left text-sm font-semibold text-slate-600 hover:text-primary-600 capitalize py-2 transition-colors cursor-pointer"
            >
              {section.replace('-', ' ')}
            </button>
          ))}
        </div>

        {user ? (
          <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
            <Link
              to={`/dashboard/${
                user.role === 'Pet Owner'
                  ? 'owner'
                  : user.role === 'Veterinarian'
                  ? 'vet'
                  : user.role === 'Shelter Manager'
                  ? 'shelter'
                  : user.role === 'Marketplace Seller'
                  ? 'seller'
                  : 'admin'
              }`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200"
            >
              <div className="p-2 bg-primary-50 rounded-full text-primary-600">
                <User size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500 font-medium">{user.role}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mt-auto pt-4 border-t border-slate-100">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-2xl text-center font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-2xl text-center font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/10 transition-all text-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
