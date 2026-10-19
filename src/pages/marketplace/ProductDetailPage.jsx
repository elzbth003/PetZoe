import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronRight, Check, AlertCircle, ShieldCheck, Truck, Sparkles, Loader2, Star, User } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { vendorProductService } from '../../services/vendorProductService';
import StarRating from '../../components/marketplace/StarRating';
import ProductCard from '../../components/marketplace/ProductCard';
import SellerProductEditPanel from '../../components/marketplace/SellerProductEditPanel';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMAGE);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // description, specs, reviews

  const [isAddingToCart, setIsAddingToCart] = useState(false);
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
      setImgSrc(res.data.imageUrl || FALLBACK_IMAGE);

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
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-teal-600"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center text-center px-6 min-h-[50vh]">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm">
          The requested product may have been archived or removed by its seller.
        </p>
        <Link 
          to="/marketplace/products" 
          className="bg-teal-600 text-white font-bold text-xs px-6 py-3 rounded-full hover:bg-teal-700 transition-colors shadow-md"
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

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link to="/" className="hover:text-teal-700 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/marketplace" className="hover:text-teal-700 transition-colors">Marketplace</Link>
          <ChevronRight size={12} />
          {product.categoryId && (
            <>
              <Link to={`/marketplace/products?category=${product.categoryId}`} className="hover:text-teal-700 transition-colors">
                {product.categoryName || 'Category'}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-slate-800 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 flex flex-col lg:flex-row gap-10 lg:gap-14 mb-12">
          
          {/* Left Column: Image Showcase */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 aspect-square relative shadow-inner">
              <img 
                src={imgSrc} 
                alt={product.name} 
                onError={() => setImgSrc(FALLBACK_IMAGE)}
                className="w-full h-full object-cover object-center" 
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Quality & Safe Shipping Guarantee */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Truck size={16} className="text-teal-600 flex-shrink-0" />
                <span>Express Inspected Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <ShieldCheck size={16} className="text-teal-600 flex-shrink-0" />
                <span>100% Genuine Sealed Batch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Purchase Panel */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Brand & Sku */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span className="text-teal-700">{product.brand || 'PetZoe Curated'}</span>
              <span>SKU: {product.sku || `PZ-${product.id}`}</span>
            </div>

            {/* Title */}
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight mb-3">
              {product.name}
            </h1>
            
            {/* Rating & Review summary */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <StarRating rating={product.averageRating || 0} size={16} />
                <span className="text-xs font-extrabold text-slate-800">
                  {Number(product.averageRating || 0).toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({product.reviewCount || 0} {product.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                Verified Seller: {product.sellerName || 'PetZoe Direct'}
              </span>
            </div>

            {/* Price Box */}
            <div className="mb-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-black text-3xl sm:text-4xl text-slate-900">
                  ₹{Number(currentPrice).toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-base text-slate-400 line-through font-semibold">
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-extrabold px-2 py-0.5 rounded-md">
                    Save ₹{Number(savings).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Inclusive of all taxes. Free shipping on certified prescription orders.
              </p>
            </div>

            {/* Real Stock Status */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Availability</div>
              {product.stockQuantity > 5 ? (
                <div className="inline-flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs">
                  <Check size={14} /> In Stock ({product.stockQuantity} units available)
                </div>
              ) : product.stockQuantity > 0 ? (
                <div className="inline-flex items-center gap-2 text-amber-800 font-bold bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-xs">
                  <AlertCircle size={14} /> Low Stock (Only {product.stockQuantity} units remaining)
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-slate-700 font-bold bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <AlertCircle size={14} /> Out of Stock
                </div>
              )}
            </div>

            {/* Actions / Seller Panel */}
            {isSeller ? (
              ownVendorProduct ? (
                <SellerProductEditPanel
                  vendorProduct={ownVendorProduct}
                  categories={categories}
                  onUpdated={(updated) => setOwnVendorProduct(updated)}
                />
              ) : (
                <div className="mt-auto p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 text-xs font-semibold">
                  Marketplace seller accounts are restricted to catalog management and cannot purchase products.
                </div>
              )
            ) : isNonBuyer ? (
              <div className="mt-auto p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 text-xs font-semibold">
                Only authenticated Pet Owner accounts can complete marketplace purchases.
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-white overflow-hidden h-12 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={product.stockQuantity === 0}
                      className="px-3.5 h-full text-slate-600 hover:bg-slate-50 font-bold text-sm disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-slate-800 text-sm select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.min(product.stockQuantity || 1, q + 1))}
                      disabled={product.stockQuantity === 0 || quantity >= product.stockQuantity}
                      className="px-3.5 h-full text-slate-600 hover:bg-slate-50 font-bold text-sm disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add To Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.stockQuantity === 0}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm active:scale-98"
                  >
                    {isAddingToCart ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                    <span>{product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  className="w-full h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <Heart size={16} className={isAddingToWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-500'} />
                  <span>Save to Wishlist</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Structured Tabs Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 mb-12">
          {/* Tab Navigation */}
          <div className="flex items-center gap-6 border-b border-slate-100 mb-8 overflow-x-auto pb-1">
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
                    ? 'border-teal-600 text-teal-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[220px]">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6 max-w-4xl text-slate-700 leading-relaxed text-sm">
                <p className="font-medium text-base text-slate-800">{product.description}</p>
                
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Certified Merchant
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base">{product.sellerName || 'PetZoe Official Store'}</h4>
                    <p className="text-xs text-slate-500">Authorized Veterinary Healthcare Distributor</p>
                  </div>
                  <div className="flex items-center gap-2 text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200 text-xs font-bold w-fit">
                    <ShieldCheck size={16} /> Certified Authenticity
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Specifications</h3>
                  {product.specifications ? (
                    <ul className="space-y-2.5">
                      {product.specifications.split('|').map((spec, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 text-xs font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <Check size={14} className="text-teal-600 flex-shrink-0" />
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
                    <div className="text-slate-700 text-xs font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
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
                  <div className="md:w-1/3 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="font-black text-5xl text-slate-900 mb-1">
                      {Number(product.averageRating || 0).toFixed(1)}
                    </div>
                    <StarRating rating={product.averageRating || 0} size={20} className="mb-2" />
                    <div className="text-slate-500 font-semibold text-xs">
                      Based on {reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                  
                  {/* Review form */}
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
                          <select 
                            value={newReview.rating} 
                            onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none font-bold text-slate-800 text-xs"
                          >
                            {[5, 4, 3, 2, 1].map(num => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'Star' : 'Stars'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea 
                          placeholder="How did this product perform for your pet? Share genuine feedback..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-teal-500 font-medium text-xs h-20 resize-none text-slate-800"
                          required
                        />
                        <button 
                          type="submit" 
                          className="bg-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Submit Review
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 text-xs font-medium">
                        Please <Link to="/login" className="font-bold text-teal-700 underline">login</Link> to share your verified review.
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
                            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
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

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-black text-2xl text-slate-900">
                Related Category Selections
              </h2>
              <Link 
                to={`/marketplace/products?category=${product.categoryId}`}
                className="text-xs font-bold text-teal-700 hover:underline"
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
