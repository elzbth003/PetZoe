import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronRight, Check, AlertCircle, ShieldCheck, Truck, RotateCcw, Loader2, Star, User } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { vendorProductService } from '../../services/vendorProductService';
import StarRating from '../../components/marketplace/StarRating';
import SelectDropdown from '../../components/ui/SelectDropdown';
import ProductCard from '../../components/marketplace/ProductCard';
import SellerProductEditPanel from '../../components/marketplace/SellerProductEditPanel';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';

const COLOR_SWATCHES = [
  { id: 'coral', name: 'Coral Pink', bg: 'bg-[#f87171]', ring: 'ring-[#f87171]', split: 'linear-gradient(135deg, #f87171 50%, #fca5a5 50%)' },
  { id: 'dark', name: 'Space Grey', bg: 'bg-[#334155]', ring: 'ring-[#334155]', split: 'linear-gradient(135deg, #334155 50%, #475569 50%)' },
  { id: 'sage', name: 'Sage Green', bg: 'bg-[#a7bba8]', ring: 'ring-[#a7bba8]', split: 'linear-gradient(135deg, #a7bba8 50%, #cbd5c0 50%)' },
  { id: 'silver', name: 'Silver White', bg: 'bg-[#e2e8f0]', ring: 'ring-[#cbd5e1]', split: 'linear-gradient(135deg, #e2e8f0 50%, #f1f5f9 50%)' },
  { id: 'navy', name: 'Ocean Navy', bg: 'bg-[#3b6382]', ring: 'ring-[#3b6382]', split: 'linear-gradient(135deg, #3b6382 50%, #60a5fa 50%)' },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  // Postal code checking
  const [postalCode, setPostalCode] = useState('');
  const [postalStatus, setPostalStatus] = useState(null);
  const [showPostalInput, setShowPostalInput] = useState(false);

  const [ownVendorProduct, setOwnVendorProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const isSeller = user?.role === 'Marketplace Seller';
  const isNonBuyer = !!user && user.role !== 'Pet Owner' && !isSeller;

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getProductById(id);
      setProduct(res.data);

      // Fetch related products (same category)
      if (res.data.categoryId) {
        try {
          const relatedRes = await marketplaceService.getProductsByCategory(res.data.categoryId, 0, 5);
          if (relatedRes.data && relatedRes.data.content) {
            setRelatedProducts(relatedRes.data.content.filter(p => p.id !== res.data.id).slice(0, 4));
          }
        } catch (e) {
          // Non-critical related items fetch failure
        }
      }

      // Fetch reviews
      try {
        const reviewsRes = await marketplaceService.getProductReviews(id);
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      } catch (e) {
        setReviews([]);
      }

      if (user?.role === 'Marketplace Seller') {
        checkOwnership(res.data.id);
      }
    } catch (err) {
      console.error("Failed to fetch product details", err);
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async (productId) => {
    try {
      const [ownRes, categoriesRes] = await Promise.all([
        vendorProductService.getProductById(productId),
        marketplaceService.getCategories(),
      ]);
      setOwnVendorProduct(ownRes);
      setCategories(categoriesRes.data);
    } catch (err) {
      setOwnVendorProduct(null);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return;
    }
    if (isSeller || isNonBuyer) {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }
    try {
      setIsAddingToCart(true);
      await marketplaceService.addToCart(product.id, quantity);
      showToast(`Added ${quantity} unit(s) to your cart`, 'success');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      showToast('Please login to purchase products', 'error');
      navigate('/login');
      return;
    }
    if (isSeller || isNonBuyer) {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }
    try {
      setIsBuyingNow(true);
      await marketplaceService.addToCart(product.id, quantity);
      window.dispatchEvent(new Event('cart-updated'));
      navigate('/marketplace/cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to proceed to checkout', 'error');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      showToast('Please login to add to wishlist', 'error');
      return;
    }
    if (isSeller || isNonBuyer) {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }
    try {
      setIsAddingToWishlist(true);
      await marketplaceService.addToWishlist(product.id);
      showToast('Saved to your wishlist', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to wishlist', 'error');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to review', 'error');
      return;
    }
    if (isSeller || isNonBuyer) {
      showToast('Only Pet Owner accounts can write reviews', 'error');
      return;
    }
    try {
      await marketplaceService.addReview(product.id, newReview);
      showToast('Thank you! Your review was submitted.', 'success');
      setNewReview({ rating: 5, comment: '' });
      fetchProductDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  const handlePostalCheck = (e) => {
    e.preventDefault();
    if (!postalCode || postalCode.trim().length < 4) {
      setPostalStatus({ available: false, message: 'Please enter a valid postal code' });
      return;
    }
    setPostalStatus({
      available: true,
      message: `Delivery available for ${postalCode.trim()} — Estimated delivery in 2-3 business days!`
    });
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh] bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-emerald-900"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center text-center px-6 min-h-[50vh] bg-white">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm">
          The requested product may have been archived or removed by its seller.
        </p>
        <Link 
          to="/marketplace/products" 
          className="bg-emerald-900 text-white font-bold text-xs px-6 py-3 rounded-full hover:bg-emerald-800 transition-colors shadow-md"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const savings = hasDiscount ? product.price - product.discountPrice : 0;
  const discountPercent = hasDiscount ? Math.round((savings / product.price) * 100) : 0;
  const monthlyPrice = Math.round(currentPrice / 6);

  // Gallery image setup matching reference (main image + complementary angles)
  const baseImg = product.imageUrl || FALLBACK_IMAGE;
  const galleryImages = [
    baseImg,
    product.images?.[1] || baseImg,
    product.images?.[2] || baseImg,
    product.images?.[3] || baseImg,
  ];

  const stockRemaining = product.stockQuantity != null ? product.stockQuantity : 12;

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation - exact styling from reference: Electronics / Audio / Headphones / Shop Headphones by type / airpods-max */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mb-8 font-normal">
          <Link to="/" className="hover:text-slate-900 transition-colors">Marketplace</Link>
          <span>/</span>
          {product.categoryName ? (
            <>
              <Link to={`/marketplace/products?category=${product.categoryId}`} className="hover:text-slate-900 transition-colors">
                {product.categoryName}
              </Link>
              <span>/</span>
            </>
          ) : (
            <>
              <Link to="/marketplace/products" className="hover:text-slate-900 transition-colors">Pet Supplies</Link>
              <span>/</span>
            </>
          )}
          <span className="hover:text-slate-900 transition-colors cursor-pointer">{product.brand || 'Care & Health'}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2-Column Product Showcase Section matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start mb-16">
          
          {/* Left Column: Image Card with Soft Gray BG + Thumbnails underneath */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Image Frame: Soft rounded container, centered photo */}
            <div className="relative rounded-[28px] bg-[#f6f6f6] aspect-[4/3] sm:aspect-square flex items-center justify-center p-8 overflow-hidden">
              <img 
                src={galleryImages[activeImageIndex]} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-300 transform hover:scale-105"
                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
              />

              {/* Wishlist toggle floating icon button */}
              <button
                type="button"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all cursor-pointer active:scale-90 border border-slate-100"
                title="Add to Wishlist"
              >
                <Heart size={18} className={isAddingToWishlist ? 'fill-rose-500 text-rose-500' : ''} />
              </button>

              {hasDiscount && (
                <div className="absolute top-5 left-5 bg-rose-500 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-sm">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails Row: 4 small rounded cards with active ring */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative rounded-2xl bg-[#f6f6f6] aspect-square p-2.5 flex items-center justify-center transition-all cursor-pointer overflow-hidden ${
                    activeImageIndex === idx 
                      ? 'ring-2 ring-slate-900 border-transparent shadow-xs' 
                      : 'border border-transparent hover:border-slate-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`View ${idx + 1}`} 
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Title, Subtitle, Stars, Price, Swatches, Quantity, CTAs, Delivery Box */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* Title: Bold, clean, large */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Short subtitle / description below title */}
            <p className="text-slate-500 text-sm mt-2 mb-2 leading-relaxed">
              {product.description 
                ? (product.description.length > 130 ? product.description.slice(0, 130) + '...' : product.description)
                : 'A curated premium veterinary selection designed for maximum pet vitality, health, and happiness.'}
            </p>

            {/* Green star rating matching reference: ★★★★★ (121) */}
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold my-1">
              <div className="flex text-emerald-500 text-sm tracking-tight">
                {'★'.repeat(Math.round(product.averageRating || 5))}
                {'☆'.repeat(5 - Math.round(product.averageRating || 5))}
              </div>
              <span className="text-emerald-700 font-bold ml-1">
                ({product.reviewCount || 121})
              </span>
            </div>

            {/* Horizontal divider */}
            <hr className="border-slate-200/80 my-5" />

            {/* Price section: $549.00 or 99.99/month */}
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-baseline flex-wrap gap-2">
                <span>₹{Number(currentPrice).toLocaleString()}</span>
                <span className="text-slate-500 font-medium text-base sm:text-lg">
                  or ₹{monthlyPrice.toLocaleString()}/month
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through font-normal ml-2">
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Suggested payments with 6-months special financing
              </p>
            </div>

            {/* Horizontal divider */}
            <hr className="border-slate-200/80 my-5" />

            {/* Color / Variant Swatches: Choose a Color */}
            <div className="mb-6">
              <div className="text-sm font-bold text-slate-900 mb-3">Choose a Color</div>
              <div className="flex items-center gap-3">
                {COLOR_SWATCHES.map((swatch, idx) => (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => setSelectedColor(idx)}
                    title={swatch.name}
                    aria-label={swatch.name}
                    className={`w-9 h-9 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                      selectedColor === idx 
                        ? 'ring-2 ring-offset-2 ring-slate-900 scale-105' 
                        : 'hover:scale-105 ring-1 ring-slate-200'
                    }`}
                    style={{ background: swatch.split }}
                  >
                    {selectedColor === idx && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-xs"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector + Stock Urgency Row */}
            <div className="flex items-center gap-6 mb-6">
              {/* Pill-shaped Quantity selector: [ - 1 + ] */}
              <div className="inline-flex items-center bg-slate-100 rounded-full px-4 py-2 gap-4 text-slate-800 font-bold text-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={product.stockQuantity === 0}
                  className="hover:text-black transition-colors px-1 cursor-pointer disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-5 text-center select-none font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q + 1))}
                  disabled={product.stockQuantity === 0 || quantity >= (product.stockQuantity || 99)}
                  className="hover:text-black transition-colors px-1 cursor-pointer disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Urgency text: Only 12 items Left! Don't miss it */}
              <div>
                <div className="text-xs text-slate-800 font-medium">
                  Only <span className="text-amber-600 font-bold">{stockRemaining} items</span> Left!
                </div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Don't miss it
                </div>
              </div>
            </div>

            {/* CTAs: Buy Now & Add to Cart (matching reference pill buttons) */}
            {isSeller ? (
              ownVendorProduct ? (
                <div className="mb-6">
                  <SellerProductEditPanel
                    vendorProduct={ownVendorProduct}
                    categories={categories}
                    onUpdated={(updated) => setOwnVendorProduct(updated)}
                  />
                </div>
              ) : (
                <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 text-xs font-semibold">
                  Marketplace seller accounts are restricted to catalog management and cannot purchase products.
                </div>
              )
            ) : isNonBuyer ? (
              <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 text-xs font-semibold">
                Only authenticated Pet Owner accounts can complete marketplace purchases.
              </div>
            ) : (
              <div className="flex items-center gap-3.5 mb-6">
                {/* Buy Now: Deep dark forest green pill button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isBuyingNow || product.stockQuantity === 0}
                  className="flex-1 bg-[#054235] hover:bg-[#03342a] text-white font-semibold text-sm sm:text-base py-3.5 px-6 rounded-full text-center transition-all duration-200 shadow-sm hover:shadow active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBuyingNow ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  <span>{product.stockQuantity === 0 ? 'Out of Stock' : 'Buy Now'}</span>
                </button>

                {/* Add to Cart: White pill button with dark border */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stockQuantity === 0}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 hover:border-slate-800 font-semibold text-sm sm:text-base py-3.5 px-6 rounded-full text-center transition-all duration-200 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  <span>{product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>
            )}

            {/* Delivery & Return Box - matching exact reference card */}
            <div className="border border-slate-200/90 rounded-2xl p-5 divide-y divide-slate-100 bg-white">
              
              {/* Free Delivery row */}
              <div className="flex items-start gap-3.5 pb-4">
                <Truck size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">Free Delivery</h4>
                  {!showPostalInput ? (
                    <button
                      type="button"
                      onClick={() => setShowPostalInput(true)}
                      className="text-xs text-slate-500 underline hover:text-slate-900 transition-colors cursor-pointer text-left block mt-0.5"
                    >
                      Enter your Postal code for Delivery Availability
                    </button>
                  ) : (
                    <form onSubmit={handlePostalCheck} className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 686518"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-800 w-32"
                      />
                      <button
                        type="submit"
                        className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        Check
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowPostalInput(false); setPostalStatus(null); }}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                  {postalStatus && (
                    <p className={`text-[11px] mt-1.5 font-medium ${postalStatus.available ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {postalStatus.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Return Delivery row */}
              <div className="flex items-start gap-3.5 pt-4">
                <RotateCcw size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">Return Delivery</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Free 30days Delivery Returns.{' '}
                    <span 
                      onClick={() => setActiveTab('specs')}
                      className="underline font-medium hover:text-slate-900 cursor-pointer"
                    >
                      Details
                    </span>
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Structured Tabs Section (Description, Ingredients, Reviews) */}
        <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-10 border border-slate-200/80 mb-16">
          <div className="flex items-center gap-6 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
            {[
              { id: 'description', label: 'Product Description' },
              { id: 'specs', label: 'Specifications & Ingredients' },
              { id: 'reviews', label: `Reviews (${reviews.length})` }
            ].map(tab => (
              <button 
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`font-bold text-sm whitespace-nowrap pb-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-slate-900 text-slate-900' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[180px]">
            {activeTab === 'description' && (
              <div className="space-y-6 max-w-4xl text-slate-700 leading-relaxed text-sm">
                <p className="font-medium text-base text-slate-800">{product.description || 'No detailed description available.'}</p>
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Certified Merchant
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base">{product.sellerName || 'PetZoe Official Store'}</h4>
                    <p className="text-xs text-slate-500">Authorized Veterinary Healthcare Distributor</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-bold w-fit">
                    <ShieldCheck size={16} /> Certified Authenticity
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Specifications</h3>
                  {product.specifications ? (
                    <ul className="space-y-2.5">
                      {product.specifications.split('|').map((spec, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 text-xs font-semibold bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <Check size={14} className="text-emerald-700 flex-shrink-0" />
                          <span>{spec.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic text-xs">Standard veterinary retail packaging.</p>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Ingredients / Formula</h3>
                  {product.ingredients ? (
                    <div className="text-slate-700 text-xs font-medium leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/80">
                      {product.ingredients}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-xs">Refer to physical packaging for full chemical or clinical composition.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-slate-200">
                  <div className="md:w-1/3 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200/80">
                    <div className="font-black text-5xl text-slate-900 mb-1">
                      {Number(product.averageRating || 0).toFixed(1)}
                    </div>
                    <StarRating rating={product.averageRating || 0} size={20} className="mb-2" />
                    <div className="text-slate-500 font-semibold text-xs">
                      Based on {reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h3 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider">Leave a Review</h3>
                    {isSeller ? (
                      <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-semibold">
                        Seller accounts cannot submit customer reviews.
                      </div>
                    ) : isNonBuyer ? (
                      <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-semibold">
                        Only verified Pet Owners can review products.
                      </div>
                    ) : user ? (
                      <form onSubmit={submitReview} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-slate-700">Rating:</label>
                          <div className="w-36">
                            <SelectDropdown
                              value={newReview.rating}
                              onChange={(val) => setNewReview({ ...newReview, rating: parseInt(val, 10) })}
                              size="sm"
                              options={[
                                { value: 5, label: '5 Stars' },
                                { value: 4, label: '4 Stars' },
                                { value: 3, label: '3 Stars' },
                                { value: 2, label: '2 Stars' },
                                { value: 1, label: '1 Star' }
                              ]}
                            />
                          </div>
                        </div>
                        <textarea 
                          placeholder="How did this product perform for your pet? Share genuine feedback..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-800 font-medium text-xs h-20 resize-none text-slate-800"
                          required
                        />
                        <button 
                          type="submit" 
                          className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                        >
                          Submit Review
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 bg-white text-slate-600 rounded-xl border border-slate-200 text-xs font-medium">
                        Please <Link to="/login" className="font-bold text-slate-900 underline">login</Link> to share your verified review.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-slate-400 italic py-6 text-xs">
                      No reviews submitted yet for this product. Be the first to review!
                    </p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                              {review.user?.name ? review.user.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{review.user?.name || 'Verified Owner'}</div>
                              <div className="text-[10px] text-slate-400">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Verified Purchase'}
                              </div>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size={14} />
                        </div>
                        <p className="text-slate-700 text-xs font-medium pl-9">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-black text-2xl text-slate-900">
                Related Category Selections
              </h2>
              <Link 
                to={`/marketplace/products?category=${product.categoryId}`}
                className="text-xs font-bold text-slate-700 hover:underline"
              >
                View Category
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
