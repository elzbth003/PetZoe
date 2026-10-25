import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

import { getProductImageUrl, analyzeProductNameAndGetImage } from '../../utils/productImageHelper';

export default function ProductCard({ product, onWishlistUpdate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => getProductImageUrl(product));

  useEffect(() => {
    setImgSrc(getProductImageUrl(product));
  }, [product?.id, product?.imageUrl, product?.name]);

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const canBuy = !user || user.role === 'Pet Owner';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-400/60 transition-all duration-300 flex flex-col h-full relative">
      <Link
        to={`/marketplace/products/${product.id}`}
        className="absolute inset-0 z-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={product.name}
      />

      {/* Badges Container */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.featured && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles size={10} /> Featured
          </span>
        )}
        {product.stockQuantity < 5 && product.stockQuantity > 0 && (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Only {product.stockQuantity} left
          </span>
        )}
        {product.stockQuantity === 0 && (
          <span className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            Out of Stock
          </span>
        )}
      </div>

      {/* Quick Actions (Wishlist) */}
      {canBuy && (
        <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist}
            aria-label="Add to wishlist"
            title="Add to Wishlist"
            className="h-10 w-10 bg-white/95 backdrop-blur-md rounded-full text-slate-500 hover:text-rose-500 shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer active:scale-95 border border-slate-100"
          >
            {isAddingToWishlist ? (
              <Loader2 size={16} className="animate-spin text-primary-600" />
            ) : (
              <Heart size={16} />
            )}
          </button>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(analyzeProductNameAndGetImage(product))}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/[0.03] transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
          <span className="truncate">{product.brand || 'PetZoe'}</span>
          {product.categoryName && (
            <span className="text-[10px] font-medium text-slate-400 lowercase first-letter:uppercase">
              {product.categoryName}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating & Review Count */}
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.averageRating || 0} size={14} />
          <span className="text-xs text-slate-500 font-medium">
            {product.reviewCount > 0 ? `(${product.reviewCount})` : '(New)'}
          </span>
        </div>

        {/* Price & Cart Action */}
        <div className="mt-auto pt-3 flex items-end justify-between border-t border-slate-100">
          <div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through font-medium">
                ₹{Number(product.price).toLocaleString()}
              </div>
            )}
            <div className="font-extrabold text-lg text-slate-900 leading-tight">
              ₹{Number(currentPrice).toLocaleString()}
            </div>
          </div>

          {canBuy && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stockQuantity === 0}
              aria-label={product.stockQuantity === 0 ? 'Out of stock' : 'Add to cart'}
              title={product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              className={`relative z-10 h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                product.stockQuantity === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white shadow-sm hover:shadow active:scale-95'
              }`}
            >
              {isAddingToCart ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShoppingCart size={18} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
