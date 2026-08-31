import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import ProductCard from '../../components/marketplace/ProductCard';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, price, averageRating
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'averageRating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // Update URL if filters change locally
    const newParams = new URLSearchParams();
    if (selectedCategory) newParams.set('category', selectedCategory);
    if (searchQuery) newParams.set('search', searchQuery);
    setSearchParams(newParams);
  }, [currentPage, selectedCategory, searchQuery, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await marketplaceService.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let res;
      
      if (searchQuery) {
        res = await marketplaceService.searchProducts(searchQuery, currentPage, 12);
      } else if (selectedCategory) {
        res = await marketplaceService.getProductsByCategory(selectedCategory, currentPage, 12);
      } else {
        res = await marketplaceService.getProducts(currentPage, 12, sortBy);
      }

      // If it's a paginated response (Page<T>)
      if (res.data && res.data.content) {
        // If sorting was requested but we are using search/category endpoints which don't support sorting directly in our current backend setup,
        // we will sort the page locally as a fallback. (In a real production app, backend endpoints should all support Pageable with sort)
        let content = [...res.data.content];
        if (sortBy === 'price') {
            content.sort((a,b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sortBy === 'averageRating') {
            content.sort((a,b) => b.averageRating - a.averageRating);
        }
        
        setProducts(content);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalElements);
      } else {
        // Fallback for non-paginated lists if any
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-slate-800">
              {searchQuery ? `Search Results for "${searchQuery}"` : 
               selectedCategory ? categories.find(c => c.id == selectedCategory)?.name || 'Products' : 
               'All Products'}
            </h1>
            <p className="text-slate-500 font-medium mt-1">Showing {products.length} of {totalItems} products</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl font-bold text-slate-700 shadow-sm"
            >
              <Filter size={18} /> Filters
            </button>
            
            <div className="relative flex-1 md:flex-none z-20">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                onBlur={() => setTimeout(() => setShowSortDropdown(false), 200)}
                className="w-full flex items-center justify-between gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm text-slate-700 font-bold hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-slate-400" />
                  <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full mt-2 left-0 right-0 md:w-56 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        sortBy === option.value 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className={`md:w-64 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
            {/* Search Filter */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Search</h3>
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedCategory(''); // clear category when searching
                  setCurrentPage(0);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 font-medium"
              />
            </div>

            {/* Categories Filter */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                Categories
                {selectedCategory && (
                  <button onClick={() => setSelectedCategory('')} className="text-xs text-rose-500 hover:underline">Clear</button>
                )}
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => { setSelectedCategory(''); setSearchQuery(''); setCurrentPage(0); }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors ${!selectedCategory && !searchQuery ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id.toString()); setSearchQuery(''); setCurrentPage(0); }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors ${selectedCategory == cat.id ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Filter size={32} />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mb-2">No products found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
                  className="bg-primary-50 text-primary-600 font-bold px-6 py-2.5 rounded-full hover:bg-primary-100 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 rounded-xl font-bold transition-colors ${
                          currentPage === i 
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' 
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
