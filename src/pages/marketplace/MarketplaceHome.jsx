import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ArrowRight, Tag, Star, Clock } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import ProductCard from '../../components/marketplace/ProductCard';

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
        
        setCategories(categoriesRes.data);
        setFeaturedProducts(featuredRes.data);
        setNewArrivals(newArrivalsRes.data);
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
      navigate(`/marketplace/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-primary-600 rounded-3xl overflow-hidden relative shadow-2xl shadow-primary-600/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="flex flex-col md:flex-row items-center relative z-10">
            <div className="p-10 md:p-16 md:w-1/2 flex flex-col items-start text-left">
              <span className="bg-white/20 text-white backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full mb-4 inline-flex items-center gap-1.5 uppercase tracking-wide">
                <ShoppingBag size={14} />
                PetZoe Store
              </span>
              <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
                Premium Care for Your <span className="text-accent-500">Best Friend</span>
              </h1>
              <p className="text-primary-100 text-lg mb-8 max-w-md font-medium">
                Shop top-rated food, medicines, and accessories from certified sellers and trusted brands.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="w-full max-w-md relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Search for products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-800 rounded-full py-4 pl-6 pr-14 outline-none focus:ring-4 focus:ring-accent-500/30 transition-all font-medium shadow-lg"
                />
                <button type="submit" className="absolute right-2 bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 transition-colors">
                  <Search size={20} />
                </button>
              </form>
            </div>
            
            <div className="w-full md:w-1/2 h-64 md:h-[500px] relative">
              <img 
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800" 
                alt="Happy dog shopping" 
                className="w-full h-full object-cover object-center clip-path-hero-img"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800 mb-2">Shop by Category</h2>
            <p className="text-slate-500 font-medium">Find exactly what your pet needs.</p>
          </div>
          <Link to="/marketplace/products" className="hidden md:flex items-center gap-1.5 text-primary-600 font-bold hover:text-primary-700 transition-colors group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/marketplace/products?category=${category.id}`}
              className="bg-white rounded-3xl p-4 flex flex-col items-center text-center border border-slate-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-slate-50 ring-4 ring-slate-50 group-hover:ring-primary-50 transition-all">
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="font-bold text-slate-700 text-sm group-hover:text-primary-600 transition-colors">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-accent-100 text-accent-600 rounded-xl">
              <Star size={24} className="fill-current" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800">Featured Products</h2>
              <p className="text-slate-500 font-medium">Hand-picked premium selections.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-secondary-600 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 md:w-2/3 text-center md:text-left mb-6 md:mb-0">
            <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-3">Get 20% Off Your First Order!</h2>
            <p className="text-secondary-100 text-lg font-medium max-w-lg">
              Sign up today and use code <span className="bg-white/20 px-2 py-0.5 rounded font-bold text-white tracking-widest">WELCOME20</span> at checkout on select premium brands.
            </p>
          </div>
          <div className="relative z-10">
            <Link to="/register" className="bg-white text-secondary-600 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:bg-secondary-50 transition-all inline-flex items-center gap-2">
              Claim Offer <Tag size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Clock size={24} className="fill-current" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800">New Arrivals</h2>
              <p className="text-slate-500 font-medium">The latest additions to our store.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
