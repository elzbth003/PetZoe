import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

import { getProductImageUrl, analyzeProductNameAndGetImage } from '../../utils/productImageHelper';

export default function ProductCard({ product, onWishlistUpdate }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
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
      localStorage.setItem('petzoe_pending_buy_now', JSON.stringify({ productId: product.id, quantity: 1, name: product.name }));
      showToast('Please sign in as a Pet Owner to add items to your cart', 'info');
      navigate('/login?redirect=/marketplace/cart');
      return;
    }
    if (!canBuy) {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }
    if (product.stockQuantity != null && product.stockQuantity <= 0) {
      showToast('This product is currently out of stock', 'warning');
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
      if (onWishlistUpdate) onWishlistUpdate(product.id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to wishlist', 'error');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-100/80 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200/60 transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Clickable Image Container */}
      <Link to={`/marketplace/products/${product.id}`} className="block relative aspect-square w-full overflow-hidden bg-slate-50">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => {
            const fallback = analyzeProductNameAndGetImage(product);
            if (imgSrc !== fallback) {
              setImgSrc(fallback);
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="bg-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles size={10} /> Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {canBuy && (
          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs transition-colors z-10 cursor-pointer active:scale-95"
            aria-label="Add to wishlist"
          >
            {isAddingToWishlist ? (
              <Loader2 size={16} className="animate-spin text-slate-400" />
            ) : (
              <Heart size={16} />
            )}
          </button>
        )}

        {/* Stock Status Badge */}
        {product.stockQuantity != null && product.stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        {/* Category & Brand Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
          <span className="truncate max-w-[50%]">{product.brand || 'Brand'}</span>
          <span className="truncate max-w-[45%] text-slate-400 font-medium">
            {product.category?.name || 'Category'}
          </span>
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
            <div className="flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                aria-label="Add to cart"
                title="Add to Cart"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer bg-[#183d2e]/10 text-[#183d2e] hover:bg-[#183d2e] hover:text-white shadow-2xs active:scale-95"
              >
                {isAddingToCart ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShoppingCart size={16} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
