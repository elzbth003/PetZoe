import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Check } from 'lucide-react';
import StarRating from './StarRating';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

export default function ProductCard({ product, onWishlistUpdate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const canBuy = !user || user.role === 'Pet Owner';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return;
    }
    if (!canBuy) {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }

    try {
      setIsAddingToCart(true);
      await marketplaceService.addToCart(product.id, 1);
      showToast('Added to cart successfully', 'success');
      // Trigger a custom event so Navbar can update cart count
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to add to wishlist', 'error');
      return;
    }
    if (!canBuy) {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }

    try {
      setIsAddingToWishlist(true);
      await marketplaceService.addToWishlist(product.id);
      showToast('Added to wishlist', 'success');
      if (onWishlistUpdate) onWishlistUpdate();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to wishlist', 'error');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <Link 
      to={`/marketplace/products/${product.id}`}
      className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.stockQuantity < 5 && product.stockQuantity > 0 && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Low Stock
          </span>
        )}
        {product.stockQuantity === 0 && (
          <span className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Out of Stock
          </span>
        )}
      </div>

      {/* Quick Actions (Hover) */}
      {canBuy && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-500 hover:text-rose-500 shadow-sm hover:shadow transition-colors"
            title="Add to Wishlist"
          >
            {isAddingToWishlist ? <Check size={16} /> : <Heart size={16} />}
          </button>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
          {product.brand}
        </div>
        
        <h3 className="font-bold text-slate-800 text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.averageRating} size={14} />
          <span className="text-xs text-slate-500 font-medium">({product.reviewCount})</span>
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-50">
          <div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through mb-0.5">
                ₹{product.price.toLocaleString()}
              </div>
            )}
            <div className="font-black text-lg text-slate-900">
              ₹{currentPrice.toLocaleString()}
            </div>
          </div>
          
          {canBuy && (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stockQuantity === 0}
              className={`p-2.5 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                product.stockQuantity === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white'
              }`}
              title={product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            >
              {isAddingToCart ? <Check size={20} /> : <ShoppingCart size={20} />}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
