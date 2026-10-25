import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ChevronRight, Check, AlertCircle, Loader2, Star } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { vendorProductService } from '../../services/vendorProductService';
import StarRating from '../../components/marketplace/StarRating';
import SelectDropdown from '../../components/ui/SelectDropdown';
import ProductCard from '../../components/marketplace/ProductCard';
import SellerProductEditPanel from '../../components/marketplace/SellerProductEditPanel';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getProductImageUrl, analyzeProductNameAndGetImage } from '../../utils/productImageHelper';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // description, specs, reviews

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const [ownVendorProduct, setOwnVendorProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const isSeller = user?.role === 'Marketplace Seller';
  const isNonBuyer = !!user && user.role !== 'Pet Owner' && !isSeller;

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getProductById(id);
      setProduct(res.data);
      setImgSrc(getProductImageUrl(res.data));

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
      console.error('Failed to fetch product details', err);
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

  // Derive contextual size/volume options based on product type & specs
  const sizeOptions = useMemo(() => {
    if (!product) return ['Standard'];
    const text = `${product.name} ${product.categoryName || ''} ${product.specifications || ''}`.toLowerCase();
    
    if (text.includes('shampoo') || text.includes('gel') || text.includes('liquid') || text.includes('spray') || text.includes('serum') || text.includes('drop')) {
      return ['30 ml', '60 ml', '80 ml', '100 ml'];
    }
    if (text.includes('wipe')) {
      return ['40 Pack', '80 Pack', '100 Pack', '150 Pack'];
    }
    if (text.includes('kibble') || text.includes('food') || text.includes('treat') || text.includes('chew') || text.includes('bone')) {
      if (product.weight) {
        const w = Number(product.weight);
        return [`${w}g`, `${w * 2}g`, `${w * 5}g`];
      }
      return ['100g', '500g', '1 kg', '3 kg'];
    }
    if (text.includes('bed') || text.includes('collar') || text.includes('harness') || text.includes('crate')) {
      return ['Small', 'Medium', 'Large', 'XL'];
    }
    return ['Single Unit', 'Pack of 2', 'Pack of 3'];
  }, [product]);

  useEffect(() => {
    if (sizeOptions && sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions]);

  const isLiquidOrSpray = useMemo(() => {
    if (!product) return false;
    const text = `${product.name} ${product.categoryName || ''}`.toLowerCase();
    return text.includes('shampoo') || text.includes('gel') || text.includes('liquid') || text.includes('spray') || text.includes('serum') || text.includes('drop');
  }, [product]);

  const handleAddToCart = async () => {
    if (!user) {
      localStorage.setItem('petzoe_pending_buy_now', JSON.stringify({ productId: product.id, quantity, name: product.name }));
      showToast('Please sign in as a Pet Owner to add items to your cart', 'info');
      navigate('/login?redirect=/marketplace/cart');
      return;
    }
    if (isSeller || isNonBuyer) {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }
    if (product.stockQuantity != null && product.stockQuantity <= 0) {
      showToast('This product is currently out of stock', 'warning');
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
      localStorage.setItem('petzoe_pending_buy_now', JSON.stringify({ productId: product.id, quantity, name: product.name }));
      showToast('Please sign in as a Pet Owner to complete your purchase', 'info');
      navigate('/login?redirect=/marketplace/cart');
      return;
    }
    if (isSeller || isNonBuyer) {
      showToast('Only Pet Owner accounts can purchase products', 'error');
      return;
    }
    if (product.stockQuantity != null && product.stockQuantity <= 0) {
      showToast('This product is currently out of stock', 'warning');
      return;
    }
    try {
      setIsBuyingNow(true);
      await marketplaceService.addToCart(product.id, quantity);
      window.dispatchEvent(new Event('cart-updated'));
      navigate('/marketplace/cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process purchase', 'error');
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

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh] bg-[#fbfbf9]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-[#183d2e]"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center text-center px-6 min-h-[50vh] bg-[#fbfbf9]">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm">
          The requested product may have been archived or removed by its seller.
        </p>
        <Link 
          to="/marketplace/products" 
          className="bg-[#183d2e] text-white font-bold text-xs px-6 py-3 rounded-full hover:bg-[#122e23] transition-colors shadow-md"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="pt-24 pb-20 bg-[#fbfbf9] min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Subtle Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/marketplace" className="hover:text-slate-700 transition-colors">Marketplace</Link>
          <ChevronRight size={12} />
          {product.categoryId && (
            <>
              <Link to={`/marketplace/products?category=${product.categoryId}`} className="hover:text-slate-700 transition-colors">
                {product.categoryName || 'Category'}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-slate-700 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase Card — Matches Reference UI */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/70 flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          
          {/* Left Column: Clean Single Product Image Display (No multiple images, No slider arrows) */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="rounded-3xl overflow-hidden bg-[#f7f5f0] border border-slate-100 aspect-square relative shadow-inner flex items-center justify-center">
              <img 
                src={imgSrc} 
                alt={product.name} 
                onError={() => setImgSrc(analyzeProductNameAndGetImage(product))}
                className="w-full h-full object-cover object-center" 
              />
            </div>
          </div>

          {/* Right Column: Reference Product Details & Purchasing UI */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            {/* Category Eyebrow */}
            <span className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide mb-1 block">
              {product.categoryName || 'Pet Care'}
            </span>

            {/* Title & In Stock Badge */}
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-[32px] text-slate-900 leading-tight">
                {product.name}
              </h1>
              {product.stockQuantity == null || product.stockQuantity > 0 ? (
                <span className="bg-[#e6f7ef] text-[#1e824c] border border-[#a2dfbe]/70 text-[11px] font-semibold px-3 py-0.5 rounded-full inline-flex items-center">
                  In Stock
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-semibold px-3 py-0.5 rounded-full inline-flex items-center">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.round(product.averageRating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }
                  />
                ))}
              </div>
              <span className="font-bold text-slate-800">
                {Number(product.averageRating || 4.8).toFixed(1)}
              </span>
              <span className="text-slate-400 font-normal">
                ({product.reviewCount || 24} {product.reviewCount === 1 ? 'Review' : 'Reviews'})
              </span>
            </div>

            {/* Price Row: Warm Caramel Price & Strikethrough MRP */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-bold text-2xl sm:text-3xl text-[#b5833a]">
                ₹{Number(currentPrice).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base sm:text-lg text-slate-400 line-through font-normal">
                  ₹{Number(product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Description Text */}
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              {product.shortDescription || product.description || 'Premium pet care formula designed to ensure companion vitality, health, and comfort.'}
            </p>

            {/* Size / Volume Pills (No color options) */}
            <div className="mb-6">
              <span className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2.5">
                {isLiquidOrSpray ? 'Size/Volume' : 'Size/Weight'}
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#183d2e] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions / Seller Guard */}
            {isSeller ? (
              ownVendorProduct ? (
                <SellerProductEditPanel
                  vendorProduct={ownVendorProduct}
                  categories={categories}
                  onUpdated={(updated) => setOwnVendorProduct(updated)}
                />
              ) : (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 text-xs font-semibold mb-6">
                  Marketplace seller accounts are restricted to catalog management and cannot purchase products.
                </div>
              )
            ) : isNonBuyer ? (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 text-xs font-semibold mb-6">
                Only authenticated Pet Owner accounts can complete marketplace purchases.
              </div>
            ) : (
              /* Quantity, Add To Cart, Buy Now, and Wishlist Row */
              <div className="flex items-center gap-3 flex-wrap mb-8">
                {/* Quantity Selector Pill */}
                <div className="flex items-center border border-slate-200 rounded-full bg-white h-11 px-3 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="text-slate-400 hover:text-slate-700 font-bold px-2 disabled:opacity-30 cursor-pointer select-none text-base"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-slate-800 text-sm select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q + 1))}
                    disabled={product.stockQuantity != null && product.stockQuantity > 0 && quantity >= product.stockQuantity}
                    className="text-slate-400 hover:text-slate-700 font-bold px-2 disabled:opacity-30 cursor-pointer select-none text-base"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add To Cart Button (Dark Forest Green Pill) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="bg-[#183d2e] hover:bg-[#122e23] text-white font-medium text-xs sm:text-sm px-7 h-11 rounded-full flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer active:scale-98"
                >
                  {isAddingToCart ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>Add To Cart</span>
                </button>

                {/* Buy Now Button (Warm Caramel / Golden-Brown Pill) */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isBuyingNow}
                  className="bg-[#b5833a] hover:bg-[#a17431] text-white font-medium text-xs sm:text-sm px-7 h-11 rounded-full flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer active:scale-98"
                >
                  {isBuyingNow ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>{isBuyingNow ? 'Processing...' : 'Buy Now'}</span>
                </button>

                {/* Wishlist Button (Circular Outline) */}
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  className="w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-300 transition-colors cursor-pointer shadow-2xs active:scale-95"
                  title="Save to Wishlist"
                  aria-label="Save to Wishlist"
                >
                  <Heart size={18} className={isAddingToWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                </button>
              </div>
            )}

            {/* Metadata Footer: SKU, Tags, Share */}
            <div className="pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 min-w-[55px]">SKU :</span>
                <span className="text-slate-500">{product.sku || `PZ-${product.id}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 min-w-[55px]">Tags :</span>
                <span className="text-slate-500">
                  {[product.categoryName, product.brand, product.petType, 'Pet Care'].filter(Boolean).join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="font-semibold text-slate-700 min-w-[55px]">Share :</span>
                <div className="flex items-center gap-2 text-slate-600">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#183d2e] hover:text-white flex items-center justify-center transition-colors text-[11px] font-bold"
                    title="Share on Facebook"
                  >
                    f
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#183d2e] hover:text-white flex items-center justify-center transition-colors text-[11px] font-bold"
                    title="Share on X"
                  >
                    𝕏
                  </a>
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&description=${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#183d2e] hover:text-white flex items-center justify-center transition-colors text-[11px] font-bold"
                    title="Share on Pinterest"
                  >
                    p
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#183d2e] hover:text-white flex items-center justify-center transition-colors text-[11px] font-bold"
                    title="Share on WhatsApp"
                  >
                    wa
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Structured Tabs Section: Description, Specifications, Reviews */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/70 mb-12">
          {/* Tab Navigation */}
          <div className="flex items-center gap-6 border-b border-slate-100 mb-8 overflow-x-auto pb-1">
            {[
              { id: 'description', label: 'Product Description' },
              { id: 'specs', label: 'Specifications & Details' },
              { id: 'reviews', label: `Reviews (${reviews.length})` }
            ].map(tab => (
              <button 
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`font-semibold text-xs sm:text-sm whitespace-nowrap pb-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-[#183d2e] text-[#183d2e]' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[180px]">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6 max-w-4xl text-slate-700 leading-relaxed text-sm">
                <p className="font-normal text-slate-600">{product.description || product.shortDescription}</p>
                
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Verified Merchant
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{product.sellerName || 'PetZoe Official Store'}</h4>
                    <p className="text-xs text-slate-500">Authorized Veterinary Healthcare Distributor</p>
                  </div>
                  <div className="flex items-center gap-2 text-[#183d2e] bg-[#e6f7ef] px-3.5 py-1.5 rounded-full border border-[#a2dfbe]/60 text-xs font-bold w-fit">
                    <Check size={14} /> Certified Authenticity
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Specifications</h3>
                  {product.specifications ? (
                    <ul className="space-y-2.5">
                      {product.specifications.split('|').map((spec, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <Check size={14} className="text-[#183d2e] flex-shrink-0" />
                          <span>{spec.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic text-xs">Standard veterinary retail packaging.</p>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Ingredients / Formula</h3>
                  {product.ingredients ? (
                    <div className="text-slate-700 text-xs font-normal leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {product.ingredients}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-xs">Refer to physical packaging for full chemical or clinical composition.</p>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-slate-100">
                  {/* Rating summary */}
                  <div className="md:w-1/3 flex flex-col items-center justify-center text-center p-6 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="font-black text-5xl text-slate-900 mb-1">
                      {Number(product.averageRating || 0).toFixed(1)}
                    </div>
                    <StarRating rating={product.averageRating || 0} size={18} className="mb-2" />
                    <div className="text-slate-500 font-medium text-xs">
                      Based on {reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                  
                  {/* Review form */}
                  <div className="md:w-2/3">
                    <h3 className="font-bold text-xs text-slate-900 mb-3 uppercase tracking-wider">Leave a Review</h3>
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-[#183d2e] font-medium text-xs h-20 resize-none text-slate-800"
                          required
                        />
                        <button 
                          type="submit" 
                          className="bg-[#183d2e] text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-[#122e23] transition-colors shadow-2xs cursor-pointer"
                        >
                          Submit Review
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 text-xs font-medium">
                        Please <Link to="/login" className="font-bold text-[#183d2e] underline">login</Link> to share your verified review.
                      </div>
                    )}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-slate-400 italic py-6 text-xs">
                      No reviews submitted yet for this product. Be the first to review!
                    </p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#e6f7ef] text-[#183d2e] flex items-center justify-center font-bold text-xs">
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
                        <p className="text-slate-700 text-xs font-normal pl-9">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-slate-900">
                Related Selections
              </h2>
              <Link 
                to={`/marketplace/products?category=${product.categoryId}`}
                className="text-xs font-semibold text-[#183d2e] hover:underline"
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
