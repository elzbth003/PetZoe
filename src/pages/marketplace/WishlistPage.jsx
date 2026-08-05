import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

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
      setWishlistItems(res.data);
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
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mb-6">
          <Heart size={40} className="fill-current" />
        </div>
        <h2 className="font-display font-black text-3xl text-slate-800 mb-4">Your Wishlist is Empty</h2>
        <p className="text-slate-500 font-medium mb-8">Please login to view your saved items.</p>
        <Link to="/login" className="bg-primary-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg">
          Login to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mb-6">
          <Heart size={40} className="fill-current" />
        </div>
        <h2 className="font-display font-black text-3xl text-slate-800 mb-4">Your Wishlist is Empty</h2>
        <p className="text-slate-500 font-medium mb-8 max-w-md">Save items you love and buy them later when you're ready.</p>
        <Link to="/marketplace" className="bg-primary-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="font-display font-black text-3xl text-slate-800">My Wishlist</h1>
          <span className="bg-rose-100 text-rose-600 font-bold px-3 py-1 rounded-full text-sm">
            {wishlistItems.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const hasDiscount = item.product.discountPrice != null;
            const currentPrice = hasDiscount ? item.product.discountPrice : item.product.price;

            return (
              <div key={item.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative group">
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm transition-colors"
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>

                <div className="relative aspect-square w-full bg-slate-50">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  {item.product.stockQuantity === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-slate-800 text-white font-bold px-4 py-2 rounded-xl shadow-lg">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{item.product.brand}</div>
                  <Link to={`/marketplace/products/${item.product.id}`}>
                    <h3 className="font-bold text-slate-800 text-base leading-tight mb-3 line-clamp-2 hover:text-primary-600 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      {hasDiscount && (
                        <div className="text-xs text-slate-400 line-through mb-0.5">₹{item.product.price.toLocaleString()}</div>
                      )}
                      <div className="font-black text-lg text-slate-900">₹{currentPrice.toLocaleString()}</div>
                    </div>
                    
                    <button 
                      onClick={() => moveToCart(item.id)}
                      disabled={item.product.stockQuantity === 0}
                      className="bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white font-bold p-2.5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move to Cart"
                    >
                      <ShoppingCart size={20} />
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
