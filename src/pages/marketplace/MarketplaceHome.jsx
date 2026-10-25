import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw,
  Lock, Headphones, SlidersHorizontal, ChevronDown, Check,
  Sparkles, Star, Grid, List, ArrowRight, Loader2, X
} from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

// 8 Curated items matching the exact reference cards
const REFERENCE_PRODUCTS = [
  {
    id: 101,
    name: 'Royal Canin Medium Adult Dog Food',
    description: 'Complete and balanced nutrition for adult dogs.',
    price: 220,
    discountPrice: 89,
    discountPercent: 60,
    rating: 5,
    reviewCount: 124,
    petType: 'Dogs',
    category: 'Food',
    brand: 'Royal Canin',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400',
    stockQuantity: 18
  },
  {
    id: 102,
    name: 'Interactive Plush Toy',
    description: 'Keep your pet active and happy.',
    price: 35,
    discountPrice: 28,
    discountPercent: 20,
    rating: 5,
    reviewCount: 86,
    petType: 'Dogs',
    category: 'Toys',
    brand: 'PetZoe',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400',
    stockQuantity: 24
  },
  {
    id: 103,
    name: 'Comfort Pet Bed',
    description: 'Soft and supportive for better sleep.',
    price: 79,
    discountPrice: null,
    discountPercent: 0,
    rating: 5,
    reviewCount: 102,
    petType: 'Dogs',
    category: 'Beds',
    brand: 'PetZoe',
    imageUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&q=80&w=400',
    stockQuantity: 12
  },
  {
    id: 104,
    name: 'Self-Cleaning Grooming Brush',
    description: 'For a healthy and shiny coat.',
    price: 49,
    discountPrice: 34,
    discountPercent: 30,
    rating: 5,
    reviewCount: 118,
    petType: 'Cats',
    category: 'Grooming',
    brand: 'PetZoe',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=400',
    stockQuantity: 30
  },
  {
    id: 105,
    name: 'Omega 3 Pet Supplement',
    description: 'Supports skin, coat and joint health.',
    price: 69,
    discountPrice: 59,
    discountPercent: 15,
    rating: 5,
    reviewCount: 93,
    petType: 'Dogs',
    category: 'Health & Wellness',
    brand: 'Hill\'s',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
    stockQuantity: 40
  },
  {
    id: 106,
    name: 'Pet Travel Carrier',
    description: 'Safe and comfortable travel.',
    price: 129,
    discountPrice: null,
    discountPercent: 0,
    rating: 5,
    reviewCount: 76,
    petType: 'Cats',
    category: 'Travel & Outdoor',
    brand: 'PetZoe',
    imageUrl: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=400',
    stockQuantity: 9
  },
  {
    id: 107,
    name: 'Durable Chew Toy Set',
    description: 'Perfect for active chewers.',
    price: 39,
    discountPrice: null,
    discountPercent: 0,
    rating: 5,
    reviewCount: 64,
    petType: 'Dogs',
    category: 'Toys',
    brand: 'Pedigree',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=400',
    stockQuantity: 21
  },
  {
    id: 108,
    name: 'Purina ONE Adult Cat Food',
    description: 'Supports strong immunity.',
    price: 75,
    discountPrice: null,
    discountPercent: 0,
    rating: 5,
    reviewCount: 88,
    petType: 'Cats',
    category: 'Food',
    brand: 'Purina',
    imageUrl: 'https://images.unsplash.com/photo-1563460716037-460b3dd14abb?auto=format&fit=crop&q=80&w=400',
    stockQuantity: 15
  }
];

// 12 Horizontal Category Pods matching the reference carousel
const CATEGORY_PODS = [
  { id: 'all', label: 'All Products', icon: '🍲' },
  { id: 'dogs', label: 'Dog Supplies', icon: '🐶' },
  { id: 'cats', label: 'Cat Supplies', icon: '🐱' },
  { id: 'small', label: 'Small Pets', icon: '🐰' },
  { id: 'food', label: 'Pet Food', icon: '🥫' },
  { id: 'treats', label: 'Treats', icon: '🦴' },
  { id: 'toys', label: 'Toys', icon: '⚽' },
  { id: 'beds', label: 'Beds', icon: '🛏️' },
  { id: 'grooming', label: 'Grooming', icon: '🧼' },
  { id: 'health', label: 'Health & Wellness', icon: '💊' },
  { id: 'accessories', label: 'Accessories', icon: '🦮' },
  { id: 'travel', label: 'Travel & Outdoor', icon: '🎒' }
];

const PET_TYPES = ['Dogs', 'Cats', 'Small Pets (Rabbit, Guinea Pig, etc.)', 'Birds', 'Fish', 'All Pets'];
const CATEGORY_FILTERS = ['Food', 'Treats', 'Toys', 'Beds', 'Grooming', 'Health & Wellness', 'Accessories', 'Travel & Outdoor'];
const BRAND_OPTIONS = ['All Brands', 'Royal Canin', 'Purina', 'Hill\'s', 'Pedigree', 'Whiskas', 'Frontline'];

export default function MarketplaceHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeCategoryPod, setActiveCategoryPod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPetTypes, setSelectedPetTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [priceMax, setPriceMax] = useState(300);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [liveProducts, setLiveProducts] = useState([]);
  const [cartAddingId, setCartAddingId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState({});
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Fetch real backend products
  useEffect(() => {
    const loadMarketplaceData = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          marketplaceService.getFeaturedProducts(),
          marketplaceService.getNewArrivals()
        ]);
        const feat = Array.isArray(featRes.data) ? featRes.data : [];
        const newest = Array.isArray(newRes.data) ? newRes.data : [];
        
        // Merge without duplicates
        const combined = [...feat];
        newest.forEach(p => {
          if (!combined.some(existing => existing.id === p.id)) {
            combined.push(p);
          }
        });

        if (combined.length > 0) {
          setLiveProducts(combined);
        } else {
          setLiveProducts(REFERENCE_PRODUCTS);
        }
      } catch (e) {
        setLiveProducts(REFERENCE_PRODUCTS);
      }
    };
    loadMarketplaceData();
  }, []);

  // Filtered and sorted products
  const displayProducts = useMemo(() => {
    let list = liveProducts.length > 0 ? [...liveProducts] : [...REFERENCE_PRODUCTS];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q)
      );
    }

    // Horizontal category pod selection
    if (activeCategoryPod !== 'all') {
      if (activeCategoryPod === 'dogs') list = list.filter(p => p.petType === 'Dogs' || p.categoryName?.toLowerCase().includes('dog') || p.name?.toLowerCase().includes('dog'));
      else if (activeCategoryPod === 'cats') list = list.filter(p => p.petType === 'Cats' || p.categoryName?.toLowerCase().includes('cat') || p.name?.toLowerCase().includes('cat'));
      else if (activeCategoryPod === 'small') list = list.filter(p => p.petType?.includes('Small') || p.name?.toLowerCase().includes('hamster') || p.name?.toLowerCase().includes('bird'));
      else if (activeCategoryPod === 'food') list = list.filter(p => p.category === 'Food' || p.name?.toLowerCase().includes('food') || p.categoryName?.toLowerCase().includes('food'));
      else if (activeCategoryPod === 'treats') list = list.filter(p => p.category === 'Treats' || p.name?.toLowerCase().includes('treat'));
      else if (activeCategoryPod === 'toys') list = list.filter(p => p.category === 'Toys' || p.name?.toLowerCase().includes('toy'));
      else if (activeCategoryPod === 'beds') list = list.filter(p => p.category === 'Beds' || p.name?.toLowerCase().includes('bed'));
      else if (activeCategoryPod === 'grooming') list = list.filter(p => p.category === 'Grooming' || p.name?.toLowerCase().includes('brush') || p.name?.toLowerCase().includes('groom'));
      else if (activeCategoryPod === 'health') list = list.filter(p => p.category === 'Health & Wellness' || p.name?.toLowerCase().includes('supplement') || p.name?.toLowerCase().includes('health'));
      else if (activeCategoryPod === 'accessories') list = list.filter(p => p.category === 'Accessories' || p.name?.toLowerCase().includes('collar'));
      else if (activeCategoryPod === 'travel') list = list.filter(p => p.category === 'Travel & Outdoor' || p.name?.toLowerCase().includes('carrier'));
    }

    // Pet type filter
    if (selectedPetTypes.length > 0 && !selectedPetTypes.includes('All Pets')) {
      list = list.filter(p => selectedPetTypes.includes(p.petType));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      list = list.filter(p => selectedCategories.includes(p.category) || selectedCategories.includes(p.categoryName));
    }

    // Brand filter
    if (selectedBrand !== 'All Brands') {
      list = list.filter(p => p.brand === selectedBrand);
    }

    // Price range
    list = list.filter(p => {
      const price = p.discountPrice != null && p.discountPrice > 0 ? p.discountPrice : p.price;
      return price <= priceMax;
    });

    // Sorting
    if (sortBy === 'priceLow') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'priceHigh') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0));
    }

    return list;
  }, [liveProducts, searchQuery, activeCategoryPod, selectedPetTypes, selectedCategories, selectedBrand, priceMax, sortBy]);

  const togglePetType = (pt) => {
    setSelectedPetTypes(prev => 
      prev.includes(pt) ? prev.filter(x => x !== pt) : [...prev, pt]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]
    );
  };

  const handleClearFilters = () => {
    setSelectedPetTypes([]);
    setSelectedCategories([]);
    setSelectedBrand('All Brands');
    setPriceMax(300);
    setActiveCategoryPod('all');
    setSearchQuery('');
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      navigate('/login');
      return;
    }
    if (user.role && user.role !== 'Pet Owner') {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }

    try {
      setCartAddingId(product.id);
      await marketplaceService.addToCart(product.id, 1);
      showToast(`${product.name} added to cart!`, 'success');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add item to cart', 'error');
    } finally {
      setCartAddingId(null);
    }
  };

  const toggleWishlist = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
    showToast('Updated wishlist', 'success');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast('Thank you for subscribing to PetZoe updates!', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <div className="bg-[#fafafb] min-h-screen text-slate-800 font-sans pb-16">
      
      {/* 1. In-Page Top Navigation Bar matching reference */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Main Nav Tabs */}
          <div className="flex items-center gap-8">
            <Link to="/marketplace" className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-[#0a483c] flex items-center">
                PetZoe<span className="text-orange-500 text-3xl leading-none ml-0.5">🐾</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <button 
                onClick={() => setActiveCategoryPod('all')} 
                className="text-slate-900 border-b-2 border-[#107b5a] pb-1 font-bold cursor-pointer"
              >
                Store
              </button>
              <button onClick={() => navigate('/marketplace/products')} className="hover:text-slate-900 transition-colors cursor-pointer">
                All Products
              </button>
              <button onClick={() => { setActiveCategoryPod('dogs'); }} className="hover:text-slate-900 transition-colors cursor-pointer">
                Dog Supplies
              </button>
              <button onClick={() => { setActiveCategoryPod('cats'); }} className="hover:text-slate-900 transition-colors cursor-pointer">
                Cat Supplies
              </button>
              <button onClick={() => { setActiveCategoryPod('small'); }} className="hover:text-slate-900 transition-colors cursor-pointer">
                Small Pets
              </button>
              <button onClick={() => setSelectedBrand('Royal Canin')} className="hover:text-slate-900 transition-colors cursor-pointer">
                Brands
              </button>
              <button onClick={() => setPriceMax(80)} className="hover:text-slate-900 transition-colors cursor-pointer">
                Deals
              </button>
            </nav>
          </div>

          {/* Search bar & Cart / Profile Icons */}
          <div className="flex items-center gap-4">
            <div className="relative w-48 sm:w-72 lg:w-96">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for food, toys, beds, grooming..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs rounded-full pl-9 pr-8 py-2 outline-none border border-transparent focus:border-[#107b5a] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Cart Icon with notification badge */}
            <Link 
              to="/marketplace/cart" 
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition"
              title="View Cart"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                2
              </span>
            </Link>

            {/* Profile Avatar */}
            <Link
              to={user ? "/profile" : "/login"}
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition text-xs font-bold"
            >
              {user?.name ? user.name[0].toUpperCase() : '👤'}
            </Link>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* 2. Hero Banner: Healthy Pets, Happier Moments + Up to 60% OFF badge */}
        <section className="relative rounded-3xl bg-gradient-to-r from-[#fef5ee] via-[#fff3e8] to-[#fde9dc] p-6 sm:p-10 lg:p-12 mb-8 border border-orange-100/70 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="text-[11px] font-extrabold text-[#e65c27] uppercase tracking-wider block mb-2">
                PREMIUM PET ESSENTIALS
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b463a] tracking-tight leading-tight mb-3">
                Healthy Pets,<br />Happier Moments
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
                Shop trusted pet food, toys, grooming products, and more for a healthier, longer, happier life with your furry friends.
              </p>

              <div className="flex items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('products-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#e65c27] hover:bg-[#cf4f1e] text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-full flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* 3 mini bullet icons underneath button */}
              <div className="flex items-center flex-wrap gap-5 text-[11px] font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#e65c27]" />
                  <span>Vet-Approved Products</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck size={16} className="text-[#107b5a]" />
                  <span>Fast & Reliable Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={16} className="text-[#e65c27]" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Right Banner Content: Cutout Pets + Green 60% OFF Tile */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end gap-4 relative">
              
              {/* Pet Photo Montage */}
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=480"
                  alt="Happy Dog"
                  className="w-44 sm:w-56 h-48 sm:h-60 object-cover rounded-3xl shadow-sm border-2 border-white"
                />
                <span className="absolute -top-3 left-4 bg-white/95 backdrop-blur-xs text-[#0b463a] font-serif italic text-xs px-3 py-1 rounded-full shadow-xs border border-orange-100">
                  Good Food, Brighter Days ✨
                </span>
              </div>

              {/* Dark Green Badge: Special Offer Up to 60% OFF */}
              <div className="bg-[#055a43] text-white p-6 rounded-3xl shadow-md text-center flex flex-col items-center justify-center w-36 sm:w-44 flex-shrink-0">
                <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wide">
                  Special Offer
                </span>
                <span className="text-xl sm:text-2xl font-black leading-tight my-1">
                  Up to<br /><span className="text-amber-300">60% OFF</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPriceMax(100)}
                  className="bg-white text-slate-900 text-[11px] font-bold py-1.5 px-3 rounded-full hover:bg-slate-100 transition mt-2 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Shop Deals →
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* 3. Horizontal Category Carousel / Pods */}
        <section className="mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-3 min-w-max">
            {CATEGORY_PODS.map(pod => (
              <button
                key={pod.id}
                type="button"
                onClick={() => setActiveCategoryPod(pod.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer min-w-[92px] ${
                  activeCategoryPod === pod.id
                    ? 'bg-[#eaf5ef] border-2 border-[#107b5a] text-[#0b463a] font-bold shadow-xs'
                    : 'bg-white border border-slate-200/70 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="text-2xl mb-1.5">{pod.icon}</span>
                <span className="text-[11px] leading-tight text-center truncate max-w-[80px]">
                  {pod.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. Main 3-Column Marketplace Body (Left Filters + Middle Products + Right Promos) */}
        <div id="products-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* A. Left Sidebar: Filters (~22% width, col-span-3) */}
          <aside className="lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Pet Type */}
            <div className="mb-6">
              <h4 className="font-bold text-xs text-slate-900 mb-3">Pet Type</h4>
              <div className="space-y-2">
                {PET_TYPES.map(pt => (
                  <label key={pt} className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPetTypes.includes(pt)}
                      onChange={() => togglePetType(pt)}
                      className="rounded text-[#107b5a] focus:ring-[#107b5a] w-3.5 h-3.5"
                    />
                    <span>{pt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <h4 className="font-bold text-xs text-slate-900 mb-3">Category</h4>
              <div className="space-y-2">
                {CATEGORY_FILTERS.map(cat => (
                  <label key={cat} className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded text-[#107b5a] focus:ring-[#107b5a] w-3.5 h-3.5"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Dropdown */}
            <div className="mb-6">
              <h4 className="font-bold text-xs text-slate-900 mb-2">Brand</h4>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#107b5a]"
              >
                {BRAND_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                <span>Price Range</span>
                <span className="text-[#107b5a]">Up to ₹{priceMax}</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#107b5a] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>₹0</span>
                <span>₹300+</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast(`Filtered ${displayProducts.length} items`, 'success')}
              className="w-full bg-[#055a43] hover:bg-[#034432] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition active:scale-98 cursor-pointer"
            >
              Apply Filters
            </button>
          </aside>

          {/* B. Center Column: Featured Products Grid (~56% width, col-span-6) */}
          <main className="lg:col-span-6">
            
            {/* Header: Title, Subtitle, Sort by, View Mode */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Featured Products</h2>
                <p className="text-xs text-slate-500">Popular picks for happy, healthy pets.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:border-[#107b5a]"
                  >
                    <option value="featured">Featured</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                {/* View toggle */}
                <div className="hidden sm:flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                    title="Grid View"
                  >
                    <Grid size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                    title="List View"
                  >
                    <List size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {displayProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80">
                <p className="text-sm font-bold text-slate-700 mb-2">No matching products found</p>
                <p className="text-xs text-slate-400 mb-4">Try adjusting your filters or search terms.</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-[#107b5a] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {displayProducts.map(product => {
                  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
                  const currentPrice = hasDiscount ? product.discountPrice : product.price;
                  const discountPercent = product.discountPercent || (hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0);
                  const isWishlisted = !!wishlistItems[product.id];

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200/70 p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                    >
                      <Link to={`/marketplace/products/${product.id}`} className="absolute inset-0 z-0" aria-label={product.name} />

                      {/* Top Badges & Wishlist Heart */}
                      <div className="flex items-center justify-between mb-2 z-10 pointer-events-none">
                        {discountPercent > 0 ? (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md text-white ${
                            discountPercent >= 50 ? 'bg-orange-600' : 'bg-[#107b5a]'
                          }`}>
                            {discountPercent}% OFF
                          </span>
                        ) : <span />}

                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(e, product.id)}
                          className="pointer-events-auto p-1 rounded-full text-slate-300 hover:text-rose-500 transition cursor-pointer"
                          title="Wishlist"
                        >
                          <Heart size={15} className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''} />
                        </button>
                      </div>

                      {/* Image */}
                      <div className="relative aspect-square w-full flex items-center justify-center p-2 mb-2 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-col flex-1">
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-[#107b5a] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">
                          {product.description}
                        </p>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1 text-amber-500 text-[10px] font-semibold mb-2">
                          <span>★★★★★</span>
                          <span className="text-slate-400">({product.reviewCount || 100})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 mb-3">
                          <span className="font-extrabold text-sm text-slate-900">
                            ₹{Number(currentPrice).toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{Number(product.price).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Solid Green Add to Cart Button (NO Buy Now, exactly as requested) */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={cartAddingId === product.id || product.stockQuantity === 0}
                          className="mt-auto w-full bg-[#107b5a] hover:bg-[#0c6248] text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-50 z-10 shadow-xs"
                        >
                          {cartAddingId === product.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <ShoppingCart size={13} />
                          )}
                          <span>{product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </main>

          {/* C. Right Column: Promo Stack & Brands (~22% width, col-span-3) */}
          <aside className="lg:col-span-3 space-y-5">
            
            {/* Promo 1: For the Cats We Love */}
            <div className="bg-[#fef3ea] rounded-3xl p-5 border border-orange-100/80 text-center flex flex-col items-center shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=350"
                alt="For Cats"
                className="w-36 h-36 object-cover rounded-2xl mb-3 border-2 border-white shadow-xs"
              />
              <h3 className="font-black text-slate-900 text-sm mb-1">For the Cats We Love</h3>
              <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                Nutritious food, fun toys and cozy essentials.
              </p>
              <button
                type="button"
                onClick={() => { setActiveCategoryPod('cats'); }}
                className="w-full bg-[#f05a28] hover:bg-[#d84e1f] text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition active:scale-98 cursor-pointer"
              >
                Shop Cat Supplies →
              </button>
            </div>

            {/* Promo 2: For the Dogs We Love */}
            <div className="bg-[#edf6f0] rounded-3xl p-5 border border-emerald-100/80 text-center flex flex-col items-center shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=350"
                alt="For Dogs"
                className="w-36 h-36 object-cover rounded-2xl mb-3 border-2 border-white shadow-xs"
              />
              <h3 className="font-black text-slate-900 text-sm mb-1">For the Dogs We Love</h3>
              <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                Premium food, treats, toys and more.
              </p>
              <button
                type="button"
                onClick={() => { setActiveCategoryPod('dogs'); }}
                className="w-full bg-[#055a43] hover:bg-[#034432] text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition active:scale-98 cursor-pointer"
              >
                Shop Dog Supplies →
              </button>
            </div>

            {/* Promo 3: Trusted Pet Brands */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-3">
                Trusted Pet Brands
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold text-slate-600">
                {['Royal Canin', 'Purina', 'Hill\'s', 'Pedigree', 'Whiskas', 'Frontline'].map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 hover:border-slate-300 transition text-[11px] truncate cursor-pointer"
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-center text-slate-300 text-lg">
                🐾 🐾 🐾
              </div>
            </div>

          </aside>

        </div>

        {/* 5. Value Props Strip (Bottom) */}
        <section className="mt-14 mb-12 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                <ShieldCheck size={20} />
              </div>
              <h5 className="font-black text-xs text-slate-900">Vet-Approved</h5>
              <p className="text-[11px] text-slate-500">Products</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#107b5a] flex items-center justify-center mb-2">
                <Truck size={20} />
              </div>
              <h5 className="font-black text-xs text-slate-900">Fast & Reliable</h5>
              <p className="text-[11px] text-slate-500">Delivery</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <RotateCcw size={20} />
              </div>
              <h5 className="font-black text-xs text-slate-900">Easy Returns</h5>
              <p className="text-[11px] text-slate-500">Hassle-free process</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
                <Lock size={20} />
              </div>
              <h5 className="font-black text-xs text-slate-900">Secure Payment</h5>
              <p className="text-[11px] text-slate-500">100% safe & encrypted</p>
            </div>

            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Headphones size={20} />
              </div>
              <h5 className="font-black text-xs text-slate-900">Dedicated Support</h5>
              <p className="text-[11px] text-slate-500">Here for you and your pets</p>
            </div>
          </div>
        </section>

        {/* 6. Clean PetZoe Marketplace Footer */}
        <footer className="border-t border-slate-200/80 pt-10 text-xs text-slate-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Newsletter */}
            <div>
              <h5 className="font-black text-sm text-slate-900 mb-2">Stay Updated</h5>
              <p className="text-[11px] text-slate-500 mb-3">
                Get the latest deals, new arrivals and pet care tips.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#107b5a] flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#107b5a] hover:bg-[#0c6248] text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Shop Links */}
            <div>
              <h5 className="font-black text-sm text-slate-900 mb-2">Shop</h5>
              <ul className="space-y-1.5 text-xs">
                <li><button onClick={() => navigate('/marketplace/products')} className="hover:text-slate-900">All Products</button></li>
                <li><button onClick={() => setActiveCategoryPod('dogs')} className="hover:text-slate-900">Dog Supplies</button></li>
                <li><button onClick={() => setActiveCategoryPod('cats')} className="hover:text-slate-900">Cat Supplies</button></li>
                <li><button onClick={() => setActiveCategoryPod('small')} className="hover:text-slate-900">Small Pets</button></li>
                <li><button onClick={() => setPriceMax(80)} className="hover:text-slate-900">Deals</button></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h5 className="font-black text-sm text-slate-900 mb-2">Customer Care</h5>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#shipping" className="hover:text-slate-900">Shipping & Delivery</a></li>
                <li><a href="#returns" className="hover:text-slate-900">Returns & Refunds</a></li>
                <li><a href="#track" className="hover:text-slate-900">Track Order</a></li>
                <li><a href="#faqs" className="hover:text-slate-900">FAQs</a></li>
                <li><a href="#contact" className="hover:text-slate-900">Contact Us</a></li>
              </ul>
            </div>

            {/* About PetZoe & Social */}
            <div>
              <h5 className="font-black text-sm text-slate-900 mb-2">About PetZoe</h5>
              <ul className="space-y-1.5 text-xs mb-4">
                <li><a href="#story" className="hover:text-slate-900">Our Story</a></li>
                <li><a href="#rewards" className="hover:text-slate-900">Rewards Program</a></li>
                <li><a href="#blog" className="hover:text-slate-900">Blog & Pet Care Tips</a></li>
                <li><a href="#terms" className="hover:text-slate-900">Terms & Conditions</a></li>
                <li><a href="#privacy" className="hover:text-slate-900">Privacy Policy</a></li>
              </ul>
              <div>
                <span className="font-bold text-[11px] text-slate-700 block mb-1.5">Follow Us</span>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="hover:text-slate-800 cursor-pointer">🌐</span>
                  <span className="hover:text-slate-800 cursor-pointer">📸</span>
                  <span className="hover:text-slate-800 cursor-pointer">▶️</span>
                  <span className="hover:text-slate-800 cursor-pointer">🎵</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} PetZoe. All rights reserved.</p>
            <p>Crafted for Happy & Healthy Pets 🐾</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
