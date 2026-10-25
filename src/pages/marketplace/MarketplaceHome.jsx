import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Clock,
  CheckCircle2, X, Star, Truck, HeartHandshake, Headphones,
  Tag, Award, Check, Zap, Flame, Heart
} from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import ProductCard from '../../components/marketplace/ProductCard';
import ProductSkeleton from '../../components/marketplace/ProductSkeleton';

export default function MarketplaceHome() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Live countdown timer state (matching reference deal module)
  const [timeLeft, setTimeLeft] = useState({
    days: 239,
    hours: 7,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, featuredRes, newArrivalsRes] = await Promise.all([
          marketplaceService.getCategories(),
          marketplaceService.getFeaturedProducts(),
          marketplaceService.getNewArrivals()
        ]);
        
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setFeaturedProducts(Array.isArray(featuredRes.data) ? featuredRes.data : []);
        setNewArrivals(Array.isArray(newArrivalsRes.data) ? newArrivalsRes.data : []);
      } catch (err) {
        console.error("Failed to fetch marketplace data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Styled categories with organic pastel blobs matching the reference design
  const referenceCategories = [
    {
      name: 'Bird Food',
      bgColor: 'bg-amber-100/80',
      borderColor: 'border-amber-200/60',
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=300',
      search: 'bird'
    },
    {
      name: 'Hamster Food',
      bgColor: 'bg-sky-100/80',
      borderColor: 'border-sky-200/60',
      image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=300',
      search: 'hamster'
    },
    {
      name: 'Dog Food',
      bgColor: 'bg-rose-100/80',
      borderColor: 'border-rose-200/60',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300',
      search: 'dog'
    },
    {
      name: 'Cat Food',
      bgColor: 'bg-purple-100/80',
      borderColor: 'border-purple-200/60',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300',
      search: 'cat'
    },
    {
      name: 'Fish Food',
      bgColor: 'bg-teal-100/80',
      borderColor: 'border-teal-200/60',
      image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=300',
      search: 'fish'
    },
    {
      name: 'Small Pets',
      bgColor: 'bg-orange-100/80',
      borderColor: 'border-orange-200/60',
      image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=300',
      search: 'small'
    }
  ];

  return (
    <div className="pt-20 pb-20 bg-white min-h-screen">
      
      {/* ========================================================== */}
      {/* 1. HERO SECTION: Reference "60% Sale, We Make Shopping Easy" */}
      {/* ========================================================== */}
      <section className="relative bg-gradient-to-b from-[#edf3fd] via-[#f2f6fe] to-[#edf3fd] pt-10 sm:pt-16 pb-20 sm:pb-28 overflow-hidden">
        {/* Playful Paw Watermarks in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 select-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="paw-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
                <path fill="#4f75b3" opacity="0.3" d="M30 40c2 0 4-3 4-7s-2-7-4-7-4 3-4 7 2 7 4 7zm-12-6c2 0 4-3 4-7s-2-7-4-7-4 3-4 7 2 7 4 7zm24 0c2 0 4-3 4-7s-2-7-4-7-4 3-4 7 2 7 4 7zm-12 18c6 0 10-4 10-9 0-3-2-5-5-5-2 0-3 1-5 1s-3-1-5-1c-3 0-5 2-5 5 0 5 4 9 10 9zm42-12c2 0 4-3 4-7s-2-7-4-7-4 3-4 7 2 7 4 7zm-12-6c2 0 4-3 4-7s-2-7-4-7-4 3-4 7 2 7 4 7zm24 0c2 0 4-3 4-7s-2-7-4-7-4 3-4 7 2 7 4 7zm-12 18c6 0 10-4 10-9 0-3-2-5-5-5-2 0-3 1-5 1s-3-1-5-1c-3 0-5 2-5 5 0 5 4 9 10 9z" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#paw-pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Quick Search Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-xs mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug">
                  PetZoe Official Store
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Veterinarian-approved pet diets, supplements & essentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="w-full sm:max-w-md relative flex items-center">
              <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search food, treats, toys, supplements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 hover:bg-white text-slate-900 rounded-xl py-2 pl-10 pr-24 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-xs placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-20 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
              <button 
                type="submit" 
                className="absolute right-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Main Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* White Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-slate-500 text-xs font-bold shadow-xs border border-slate-200/60 uppercase tracking-wider">
                <Sparkles size={14} className="text-amber-500" />
                <span>Big Stock For Pet Food Shop</span>
              </div>

              {/* Bold Reference Headline */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                60% Sale, We Make <br />
                <span className="text-[#3b5998]">Shopping Easy</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
                Discover high-grade nutritious pet food, wholesome kibbles, and vet-certified diets designed to keep your companions vibrant, healthy, and happy.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/marketplace/products"
                  className="inline-flex items-center justify-center gap-2 bg-[#ff6e5a] hover:bg-[#ff553e] text-white font-extrabold text-sm px-8 py-3.5 rounded-full shadow-lg shadow-[#ff6e5a]/30 active:scale-95 transition-all cursor-pointer"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight size={16} />
                </Link>

                <a
                  href="#categories"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-full border border-slate-200/80 shadow-xs transition-all"
                >
                  <span>Explore Categories</span>
                </a>
              </div>
            </div>

            {/* Right Column: Cute Cutout Pets Holding Food Bowl */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-[1/1] flex items-end justify-center">
                {/* Soft glow shape */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-sky-200/50 via-indigo-100/40 to-pink-100/50 blur-2xl pointer-events-none" />

                {/* Happy Pet Cutouts */}
                <img 
                  src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=750" 
                  alt="Happy Dog and Cat Eating Healthy Meal"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border-4 border-white/80 z-10"
                />

                {/* Floating Discount Badge */}
                <div className="absolute -top-3 -left-3 sm:top-4 sm:-left-4 bg-[#ff6e5a] text-white p-3.5 rounded-2xl shadow-xl z-20 flex items-center gap-2 animate-bounce duration-1000">
                  <Flame size={20} className="fill-white" />
                  <div className="text-left leading-tight">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-100">Special Offer</span>
                    <span className="block text-sm font-black">Up to 60% OFF</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scallop / Wavy Cloud Bottom Divider Transitioning to White */}
        <div className="absolute -bottom-1 inset-x-0 overflow-hidden leading-none z-10 pointer-events-none text-white">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-8 sm:h-12 fill-current">
            <path d="M0,0 C100,45 200,45 300,0 C400,45 500,45 600,0 C700,45 800,45 900,0 C1000,45 1100,45 1200,0 L1200,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. SHOP BY CATEGORIES: Reference Organic Pastel Blobs */}
      {/* ========================================================== */}
      <section id="categories" className="max-w-7xl mx-auto px-6 py-14 sm:py-20 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          {/* Header Icon */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-500 mb-1">
            <Heart size={16} className="fill-rose-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shop By Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Hand-selected diets, natural treats, and certified nutrition for all your beloved pets.
          </p>
        </div>

        {/* 6 Circular/Organic Category Avatars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {referenceCategories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/marketplace/products?search=${encodeURIComponent(cat.search)}`}
              className="group flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
            >
              {/* Organic Pastel Blob Card with Animal Avatar */}
              <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full ${cat.bgColor} border-2 ${cat.borderColor} p-3 flex items-center justify-center shadow-xs group-hover:shadow-lg transition-all duration-300 relative overflow-hidden`}>
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Title */}
              <span className="mt-3 font-extrabold text-sm text-slate-800 group-hover:text-teal-700 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. BENTO PROMO TILES: Reference 4 Color Banners Grid */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Large Left Tile: Sky Blue - "Natural Freeze Dog Foods" */}
          <div className="md:col-span-7 bg-[#58b7e8] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-md flex flex-col justify-between min-h-[300px] group">
            <div className="relative z-10 max-w-xs space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-100">
                Nature's Blend Foods
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Natural Freeze <br />Dog Foods
              </h3>
              <div className="pt-2">
                <Link
                  to="/marketplace/products?search=freeze"
                  className="inline-flex items-center gap-1.5 bg-white text-[#58b7e8] hover:bg-slate-50 font-black text-xs px-5 py-2.5 rounded-full shadow-sm active:scale-95 transition-all"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Product Bag & Bowl Image */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-end justify-end pointer-events-none">
              <img 
                src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=500" 
                alt="Natural Freeze Dog Foods"
                className="w-full h-4/5 object-cover object-left rounded-tl-3xl group-hover:scale-105 transition-transform duration-500 opacity-95"
              />
            </div>
          </div>

          {/* Right Column with Stacked Tiles */}
          <div className="md:col-span-5 flex flex-col gap-6">

            {/* Top Right Tile: Coral Pink - "Branded Pet Accessories / Cans" */}
            <div className="bg-[#ff766d] rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-md flex items-center justify-between min-h-[140px] group">
              <div className="relative z-10 space-y-1.5 max-w-[200px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-100">
                  Cans / Wet Food
                </span>
                <h4 className="text-lg font-black text-white leading-snug">
                  Branded Pet Canned Food
                </h4>
                <Link
                  to="/marketplace/products?search=canned"
                  className="inline-flex items-center gap-1 text-xs font-black text-white underline underline-offset-4 hover:text-rose-100 transition-colors"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=400" 
                  alt="Pet Canned Food"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Bottom Right Tile: Soft Periwinkle - "Best Quality Pet Foods" */}
            <div className="bg-[#859ee2] rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-md flex items-center justify-between min-h-[140px] group">
              <div className="relative z-10 space-y-1.5 max-w-[200px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-100">
                  Summer Sale Offer
                </span>
                <h4 className="text-lg font-black text-white leading-snug">
                  Best Quality Pet Foods
                </h4>
                <Link
                  to="/marketplace/products"
                  className="inline-flex items-center gap-1 text-xs font-black text-white underline underline-offset-4 hover:text-indigo-100 transition-colors"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1582457380669-c833e7c77e01?auto=format&fit=crop&q=80&w=400" 
                  alt="Best Quality Pet Foods"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. HEALTH FEATURE BANNER: Reference Beagle with Food Bag */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Dog Cutout sitting beside Pet Food bag */}
            <div className="lg:col-span-5 flex justify-center relative">
              {/* Organic Soft Pastel Blob Behind Dog */}
              <div className="relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#e7edd3] rounded-[45%_55%_60%_40%/50%_40%_60%_50%] transition-transform hover:scale-105 duration-700" />
                <img 
                  src="https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=600" 
                  alt="Happy Beagle Dog with Healthy Pet Food"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-cover rounded-3xl relative z-10 shadow-lg border-4 border-white"
                />
              </div>
            </div>

            {/* Right: Health Benefits & 4-Feature Grid */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                100% Organic Pet Food
              </span>

              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Help Your Dog Maintain <br />
                <span className="text-teal-700">Healthier & Happier</span>
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium max-w-lg">
                Discover PetZoe's delectable range of pet food, crafted with certified organic ingredients to deliver complete nutritional balance, promoting shiny coats, resilient immunity, and joint mobility.
              </p>

              {/* 4 Feature Badges (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Headphones size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">24/7 Support</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Truck size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Pet Delivery Facility</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <HeartHandshake size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">100% Money Back</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Lowest Direct Price</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/marketplace/products"
                  className="inline-flex items-center gap-2 bg-[#ff6e5a] hover:bg-[#ff553e] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-md shadow-[#ff6e5a]/25 active:scale-95 transition-all"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 5. DISCOUNT BANNER WITH LIVE COUNTDOWN: Reference Module */}
      {/* ========================================================== */}
      <section className="relative bg-gradient-to-r from-[#edf3fd] via-[#f1f5fe] to-[#edf3fd] py-16 mb-24 overflow-hidden border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Offer Details & Checklist */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Fresh Flavoured Food
              </span>

              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Up To <span className="text-[#ff6e5a]">25% Off</span> <br />
                Discounts
              </h3>

              <div className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Check size={11} />
                  </div>
                  <span>Gourmet Cat Food & Gravy Pouches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Check size={11} />
                  </div>
                  <span>Immunity Booster Dog Kibble</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Check size={11} />
                  </div>
                  <span>Rodents, Birds & Small Animals Food</span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  to="/marketplace/products"
                  className="inline-flex items-center gap-2 bg-[#ff6e5a] hover:bg-[#ff553e] text-white font-extrabold text-xs px-6 py-3 rounded-full shadow-md shadow-[#ff6e5a]/25 transition-all"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Middle: Food Bags Showcase */}
            <div className="lg:col-span-4 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=500" 
                alt="Discounted Fresh Pet Food Products"
                className="w-64 h-56 object-cover rounded-3xl shadow-lg border-2 border-white/90"
              />
            </div>

            {/* Right: Live Countdown Timer Boxes */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Hurry, Offer Ends In:
              </span>
              <div className="flex items-center gap-2">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center w-16 shadow-xs">
                  <span className="block text-xl font-black text-slate-900">{timeLeft.days}</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Days</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center w-16 shadow-xs">
                  <span className="block text-xl font-black text-slate-900">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Hours</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center w-16 shadow-xs">
                  <span className="block text-xl font-black text-slate-900">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Mins</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center w-16 shadow-xs">
                  <span className="block text-xl font-black text-[#ff6e5a]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Secs</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 6. FEATURED PRODUCTS & POPULAR PICKS */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 mb-1">
              <Sparkles size={14} /> Top Selections
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
              Highest-rated formulas and supplies vetted by pet care specialists.
            </p>
          </div>
          <Link 
            to="/marketplace/products" 
            className="hidden sm:flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold text-xs sm:text-sm transition-colors group"
          >
            <span>See All Featured</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <ProductSkeleton count={4} />
          ) : featuredProducts.length > 0 ? (
            featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full bg-slate-50 rounded-3xl p-8 text-center border border-slate-200/80">
              <p className="text-slate-500 font-medium text-sm">New featured items arriving shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 7. NEW ARRIVALS */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-1">
              <Clock size={14} /> Fresh Catalog
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              New Arrivals
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
              The latest additions to our pet health and nutrition store.
            </p>
          </div>
          <Link 
            to="/marketplace/products" 
            className="hidden sm:flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold text-xs sm:text-sm transition-colors group"
          >
            <span>Browse All New</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <ProductSkeleton count={8} />
          ) : newArrivals.length > 0 ? (
            newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full bg-slate-50 rounded-3xl p-8 text-center border border-slate-200/80">
              <p className="text-slate-500 font-medium text-sm">Browse our full catalog to discover all available products.</p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 8. PETZOE QUALITY PROMISE */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              <ShieldCheck size={16} /> The PetZoe Quality Promise
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mb-3">
              100% Genuine Care, Zero Compromise
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Every dietary formula, wellness supplement, and medicinal remedy hosted in the PetZoe Marketplace undergoes batch authenticity checks. We guarantee factory-sealed packaging, safe storage conditions, and verified expiration dates.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Authentic Sourcing</h4>
                <p className="text-xs text-slate-500">Only authorized distributors and licensed veterinary pharmacies.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Secure Packaging</h4>
                <p className="text-xs text-slate-500">Tamper-evident cartons designed to keep nutritional contents fresh.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Clinical Safety</h4>
                <p className="text-xs text-slate-500">Verified species, age, and dosage specifications on every label.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
