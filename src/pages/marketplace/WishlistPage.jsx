import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

import { getProductImageUrl, analyzeProductNameAndGetImage } from '../../utils/productImageHelper';

export default function WishlistPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchWishlist();
    else setLoading(false);
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getWishlist();
      setWishlistItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await marketplaceService.removeFromWishlist(id);
      setWishlistItems(items => items.filter(item => item.id !== id));
      showToast('Removed from wishlist', 'info');
    } catch (err) {
      showToast('Failed to remove item', 'error');
    }
  };

  const moveToCart = async (id) => {
    try {
      await marketplaceService.moveToCart(id);
      setWishlistItems(items => items.filter(item => item.id !== id));
      showToast('Moved to cart successfully', 'success');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to move to cart', 'error');
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 mb-5">
          <Heart size={36} className="fill-current" />
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-800 mb-2">Login to View Wishlist</h2>
        <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm">Sign in to access your saved pet supplies across all devices.</p>
        <Link to="/login" className="bg-teal-600 text-white font-bold text-xs px-7 py-3 rounded-full hover:bg-teal-700 transition-colors shadow-md">
          Login to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-teal-600"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 mb-5">
          <Heart size={36} />
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-800 mb-2">Your Wishlist is Empty</h2>
        <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm">Save items you love while browsing to buy them whenever you're ready.</p>
        <Link to="/marketplace/products" className="bg-teal-600 text-white font-bold text-xs px-7 py-3 rounded-full hover:bg-teal-700 transition-colors shadow-md inline-flex items-center gap-2">
          <span>Explore Products</span> <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link to="/" className="hover:text-teal-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-teal-700 transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">My Wishlist</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight">My Wishlist</h1>
          <span className="bg-rose-100 text-rose-700 font-bold px-3 py-0.5 rounded-full text-xs">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const hasDiscount = item.product?.discountPrice != null && item.product.discountPrice < item.product.price;
            const currentPrice = hasDiscount ? item.product.discountPrice : item.product?.price;

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-400/60 transition-all duration-300 flex flex-col relative group"
              >
                {/* Remove button */}
                <button 
                  type="button"
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3.5 right-3.5 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-600 shadow-sm transition-all cursor-pointer border border-slate-100"
                  title="Remove from Wishlist"
                  aria-label="Remove from Wishlist"
                >
                  <Trash2 size={15} />
                </button>

                {/* Product image */}
                <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                  <img 
                    src={getProductImageUrl(item.product)} 
                    alt={item.product?.name || 'Product'} 
                    onError={(e) => { e.target.src = analyzeProductNameAndGetImage(item.product); }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy" 
                  />
                  {item.product?.stockQuantity === 0 && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-slate-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product details */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    {item.product?.brand || 'PetZoe'}
                  </div>
                  <Link to={`/marketplace/products/${item.product?.id}`}>
                    <h3 className="font-bold text-slate-800 text-sm leading-snug mb-3 line-clamp-2 hover:text-teal-700 transition-colors">
                      {item.product?.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {hasDiscount && (
                        <div className="text-xs text-slate-400 line-through">
                          ₹{Number(item.product.price).toLocaleString()}
                        </div>
                      )}
                      <div className="font-extrabold text-lg text-slate-900">
                        ₹{Number(currentPrice || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => moveToCart(item.id)}
                      disabled={item.product?.stockQuantity === 0}
                      className="bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white font-bold p-2.5 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 cursor-pointer"
                      title="Move to Cart"
                      aria-label="Move to Cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
