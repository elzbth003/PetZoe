import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronDown, X, Check, Search, RotateCcw, Sparkles } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import ProductCard from '../../components/marketplace/ProductCard';
import ProductSkeleton from '../../components/marketplace/ProductSkeleton';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search');

  const [rawProducts, setRawProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, priceAsc, priceDesc, averageRating
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  
  // Mobile drawer & dropdown state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'priceDesc', label: 'Price: High to Low' },
    { value: 'averageRating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync state if URL search parameters change externally
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    if (cat !== selectedCategory) setSelectedCategory(cat);
    if (q !== searchQuery) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    // Keep URL synchronized
    const newParams = new URLSearchParams();
    if (selectedCategory) newParams.set('category', selectedCategory);
    if (searchQuery) newParams.set('search', searchQuery);
    setSearchParams(newParams, { replace: true });
  }, [currentPage, selectedCategory, searchQuery, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await marketplaceService.getCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let res;
      
      const backendSort = sortBy === 'priceAsc' || sortBy === 'priceDesc' ? 'price' : sortBy;
      if (searchQuery.trim()) {
        res = await marketplaceService.searchProducts(searchQuery.trim(), currentPage, 12);
      } else if (selectedCategory) {
        res = await marketplaceService.getProductsByCategory(selectedCategory, currentPage, 12);
      } else {
        res = await marketplaceService.getProducts(currentPage, 12, backendSort);
      }

      if (res.data && res.data.content) {
        setRawProducts(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalElements);
      } else if (Array.isArray(res.data)) {
        setRawProducts(res.data);
        setTotalPages(1);
        setTotalItems(res.data.length);
      } else {
        setRawProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  // Derive available brands from current dataset
  const availableBrands = useMemo(() => {
    const brands = new Set();
    rawProducts.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [rawProducts]);

  // Client-side filtering & sorting refinement for fast, responsive UX
  const displayedProducts = useMemo(() => {
    let list = [...rawProducts];

    if (inStockOnly) {
      list = list.filter(p => (p.stockQuantity || 0) > 0);
    }

    if (selectedBrand) {
      list = list.filter(p => p.brand === selectedBrand);
    }

    if (sortBy === 'priceAsc') {
      list.sort((a, b) => {
        const pA = a.discountPrice != null && a.discountPrice < a.price ? a.discountPrice : a.price;
        const pB = b.discountPrice != null && b.discountPrice < b.price ? b.discountPrice : b.price;
        return pA - pB;
      });
    } else if (sortBy === 'priceDesc') {
      list.sort((a, b) => {
        const pA = a.discountPrice != null && a.discountPrice < a.price ? a.discountPrice : a.price;
        const pB = b.discountPrice != null && b.discountPrice < b.price ? b.discountPrice : b.price;
        return pB - pA;
      });
    } else if (sortBy === 'averageRating') {
      list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    return list;
  }, [rawProducts, inStockOnly, selectedBrand, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedBrand('');
    setInStockOnly(false);
    setCurrentPage(0);
    setSortBy('createdAt');
  };

  const hasActiveFilters = Boolean(selectedCategory || searchQuery || selectedBrand || inStockOnly);

  const selectedCategoryObj = categories.find(c => String(c.id) === String(selectedCategory));

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link to="/" className="hover:text-teal-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-teal-700 transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">
            {selectedCategoryObj ? selectedCategoryObj.name : searchQuery ? `Search "${searchQuery}"` : 'All Products'}
          </span>
        </nav>

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            {/* H1 header preserved for Selenium test assertion */}
            <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : 
               selectedCategoryObj ? selectedCategoryObj.name : 
               'All Products'}
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Showing {displayedProducts.length} of {totalItems} verified products
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button 
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl font-bold text-slate-700 shadow-sm text-sm active:scale-95 transition-all"
            >
              <Filter size={16} /> Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-teal-600" />
              )}
            </button>
            
            {/* Sort Dropdown */}
            <div className="relative flex-1 md:flex-none z-20">
              <button 
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="w-full flex items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm text-slate-700 font-bold hover:border-slate-300 transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-slate-400" />
                  <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-30">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                        sortBy === option.value 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && <Check size={14} className="text-teal-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
              Active Filters:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                Search: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-rose-600"><X size={12} /></button>
              </span>
            )}

            {selectedCategoryObj && (
              <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full border border-teal-200">
                Category: {selectedCategoryObj.name}
                <button type="button" onClick={() => setSelectedCategory('')} className="hover:text-rose-600"><X size={12} /></button>
              </span>
            )}

            {selectedBrand && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                Brand: {selectedBrand}
                <button type="button" onClick={() => setSelectedBrand('')} className="hover:text-rose-600"><X size={12} /></button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
                In Stock Only
                <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-rose-600"><X size={12} /></button>
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
            >
              <RotateCcw size={12} /> Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0 space-y-6">
            
            {/* Search Input Box — placeholder preserved for Selenium test */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Search Catalog</h3>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 outline-none focus:border-teal-500 font-medium text-xs text-slate-800"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* In-Stock Filter Toggle */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-bold text-slate-800">In-Stock Items Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 border-slate-300"
                />
              </label>
            </div>

            {/* Categories Filter */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm">Categories</h3>
                {selectedCategory && (
                  <button 
                    type="button" 
                    onClick={() => setSelectedCategory('')} 
                    className="text-xs text-rose-500 hover:underline font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <button 
                  type="button"
                  onClick={() => { setSelectedCategory(''); setCurrentPage(0); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    !selectedCategory 
                      ? 'bg-teal-50 text-teal-700 font-extrabold' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    type="button"
                    onClick={() => { setSelectedCategory(cat.id.toString()); setCurrentPage(0); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      selectedCategory == cat.id 
                        ? 'bg-teal-50 text-teal-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter (if available) */}
            {availableBrands.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Brands</h3>
                  {selectedBrand && (
                    <button 
                      type="button" 
                      onClick={() => setSelectedBrand('')} 
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableBrands.map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedBrand === brand 
                          ? 'bg-teal-50 text-teal-700 font-bold' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{brand}</span>
                      {selectedBrand === brand && <Check size={12} className="text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <ProductSkeleton count={8} />
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Filter size={28} />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mb-2">No matching products found</h3>
                <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto">
                  We couldn't find any products matching your selected criteria. Try resetting filters or search terms.
                </p>
                <button 
                  type="button"
                  onClick={resetAllFilters}
                  className="bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-xs px-6 py-3 rounded-full transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button 
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 rounded-2xl font-bold text-xs transition-all ${
                          currentPage === i 
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button 
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                      aria-label="Next Page"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
          
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowMobileFilters(false)} 
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col gap-6 z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-t-0 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Filters</h3>
              <button 
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* In-stock toggle */}
            <label className="flex items-center justify-between cursor-pointer py-2">
              <span className="text-xs font-bold text-slate-800">In-Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
            </label>

            {/* Category list */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setSelectedCategory(''); setShowMobileFilters(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${!selectedCategory ? 'bg-teal-50 text-teal-700' : 'text-slate-600'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setSelectedCategory(cat.id.toString()); setShowMobileFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${selectedCategory == cat.id ? 'bg-teal-50 text-teal-700' : 'text-slate-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action footer */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-teal-600 text-white rounded-2xl text-xs font-bold shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
