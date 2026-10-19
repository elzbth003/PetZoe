import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Clock, CheckCircle2, X, Star, Truck } from 'lucide-react';
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

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      
      {/* Hero Header & Search Utility */}
      <section className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                PetZoe Curated Store
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Veterinarian-approved diets, supplements, and supplies delivered fast.
              </p>
            </div>
          </div>

          {/* Prominent Search Bar */}
          <form onSubmit={handleSearch} className="w-full md:max-w-md relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search food, treats, toys, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white text-slate-900 rounded-xl py-2.5 pl-10 pr-24 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-xs sm:text-sm placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search query"
                className="absolute right-20 text-slate-400 hover:text-slate-600 p-1 transition-colors"
              >
                <X size={14} />
              </button>
            )}
            <button 
              type="submit" 
              aria-label="Search products"
              className="absolute right-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Hero Dual Promotional Cards (Side-by-Side) */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Card 1: Cats & Nutrition (Dark Dramatic Theme) */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-lg min-h-[360px] sm:min-h-[400px] flex flex-col justify-between group">
            {/* Background Image: Curious Cat with Pet Food Bowl */}
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=900" 
                alt="Quality Cat Foods and Nutrition" 
                className="w-full h-full object-cover object-right-bottom group-hover:scale-105 transition-transform duration-700 opacity-85"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=900";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent sm:w-3/4" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-7 sm:p-10 max-w-sm sm:max-w-md flex flex-col justify-between h-full">
              <div>
                <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight mb-3">
                  Your One Stop Shop for Quality Pet Foods
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal mb-6">
                  Discover high-quality, nutritious pet food made with love. From playful pups to curious cats, we've got you covered.
                </p>
              </div>

              <div>
                <Link
                  to="/marketplace/products"
                  className="inline-flex items-center gap-2 bg-[#ff8a3d] hover:bg-[#f77b27] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-[#ff8a3d]/25 active:scale-95 transition-all"
                >
                  <span>Shop Now</span>
                </Link>
              </div>
            </div>

            {/* Organic / Torn Paper Styled Bottom SVG Trim */}
            <div className="absolute -bottom-1 inset-x-0 z-20 pointer-events-none text-slate-50">
              <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-4 sm:h-5 fill-current">
                <path d="M0,0 Q150,45 300,10 Q450,55 600,18 Q750,48 900,12 Q1050,52 1200,8 L1200,60 L0,60 Z" />
              </svg>
            </div>
          </div>

          {/* Card 2: Dogs & Meals (Soft Teal / Powder Sky Blue Theme) */}
          <div className="relative rounded-3xl overflow-hidden bg-[#a6cbcf] text-slate-900 shadow-lg min-h-[360px] sm:min-h-[400px] flex flex-col justify-between group">
            {/* Background Image: Happy Golden Retriever eating from bowl */}
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=900" 
                alt="Delicious Meals for Your Dogs" 
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=900";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#a6cbcf] via-[#a6cbcf]/85 to-transparent sm:w-3/4" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#a6cbcf]/60 via-transparent to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-7 sm:p-10 max-w-sm sm:max-w-md flex flex-col justify-between h-full">
              <div>
                <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight mb-3">
                  Delicious Meals for Your Dogs
                </h2>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-normal mb-6">
                  Discover high-quality, nutritious pet food made with love. From playful pups to active companions.
                </p>
              </div>

              <div>
                <Link
                  to="/marketplace/products"
                  className="inline-flex items-center gap-2 bg-[#ff8a3d] hover:bg-[#f77b27] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-[#ff8a3d]/25 active:scale-95 transition-all"
                >
                  <span>Shop Now</span>
                </Link>
              </div>
            </div>

            {/* Organic / Torn Paper Styled Bottom SVG Trim */}
            <div className="absolute -bottom-1 inset-x-0 z-20 pointer-events-none text-slate-50">
              <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-4 sm:h-5 fill-current">
                <path d="M0,0 Q180,48 350,15 Q520,52 700,20 Q880,50 1020,15 Q1140,42 1200,10 L1200,60 L0,60 Z" />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* Category Discovery */}
      <section id="categories" className="max-w-7xl mx-auto px-6 mb-20 scroll-mt-28">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-teal-700 mb-1">
              Curated Selection
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800">
              Browse by Exclusive Category
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Find exactly what your pet requires for diet, comfort, and care.
            </p>
          </div>
          <Link 
            to="/marketplace/products" 
            className="flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold text-sm transition-colors group"
          >
            <span>View All Catalog</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 flex flex-col items-center animate-pulse border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 mb-3" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/marketplace/products?category=${category.id}`}
                className="bg-white rounded-3xl p-4 flex flex-col items-center text-center border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 bg-slate-50 ring-2 ring-slate-100 group-hover:ring-teal-200 transition-all">
                  <img 
                    src={category.imageUrl} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    loading="lazy" 
                  />
                </div>
                <span className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 mb-1">
              <Sparkles size={14} /> Top Selections
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800">
              Featured Products
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Highest-rated formulas and supplies vetted by pet care specialists.
            </p>
          </div>
          <Link 
            to="/marketplace/products" 
            className="hidden sm:flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold text-sm transition-colors group"
          >
            <span>See All Featured</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
            <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-200/80">
              <p className="text-slate-500 font-medium">New featured items arriving shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* PetZoe Quality Promise (Assurance Section) */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              <ShieldCheck size={16} /> The PetZoe Quality Promise
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mb-3">
              100% Genuine Care, Zero Compromise
            </h3>
            <p className="text-slate-600 text-base leading-relaxed mb-6 font-medium">
              Every dietary formula, wellness supplement, and medicinal remedy hosted in the PetZoe Marketplace undergoes batch authenticity checks. We guarantee factory-sealed packaging, safe storage conditions, and verified expiration dates.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
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

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-1">
              <Clock size={14} /> Fresh Catalog
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800">
              New Arrivals
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              The latest additions to our pet health and nutrition store.
            </p>
          </div>
          <Link 
            to="/marketplace/products" 
            className="hidden sm:flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold text-sm transition-colors group"
          >
            <span>Browse All New</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
            <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-200/80">
              <p className="text-slate-500 font-medium">Browse our full catalog to discover all available products.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
