import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronRight, Check, AlertCircle } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import StarRating from '../../components/marketplace/StarRating';
import ProductCard from '../../components/marketplace/ProductCard';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // description, specs, reviews
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const isSeller = user?.role === 'Marketplace Seller';

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getProductById(id);
      setProduct(res.data);
      
      // Fetch related products (same category)
      const relatedRes = await marketplaceService.getProductsByCategory(res.data.categoryId, 0, 4);
      setRelatedProducts(relatedRes.data.content.filter(p => p.id !== res.data.id).slice(0, 4));

      // Fetch reviews
      const reviewsRes = await marketplaceService.getProductReviews(id);
      setReviews(reviewsRes.data);
      
    } catch (err) {
      console.error("Failed to fetch product details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return;
    }
    if (isSeller) {
      showToast('Marketplace sellers cannot purchase products', 'error');
      return;
    }
    try {
      setIsAddingToCart(true);
      await marketplaceService.addToCart(product.id, quantity);
      showToast('Added to cart successfully', 'success');
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
    if (isSeller) {
      showToast('Marketplace sellers cannot purchase products', 'error');
      return;
    }
    try {
      setIsAddingToWishlist(true);
      await marketplaceService.addToWishlist(product.id);
      showToast('Added to wishlist', 'success');
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
    if (isSeller) {
      showToast('Marketplace sellers cannot write reviews', 'error');
      return;
    }
    try {
      await marketplaceService.addReview(product.id, newReview);
      showToast('Review submitted!', 'success');
      setNewReview({ rating: 5, comment: '' });
      fetchProductDetails(); // Refresh to show new review
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 flex justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Product not found</h2>
          <Link to="/marketplace" className="text-primary-600 hover:underline">Return to Marketplace</Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-8">
          <Link to="/marketplace" className="hover:text-primary-600">Marketplace</Link>
          <ChevronRight size={14} />
          <Link to={`/marketplace/products?category=${product.categoryId}`} className="hover:text-primary-600">
            {product.categoryName}
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 line-clamp-1">{product.name}</span>
        </div>

        {/* Product Top Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 mb-12">
          
          {/* Image */}
          <div className="md:w-1/2">
            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2 flex flex-col">
            <div className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-2">
              {product.brand}
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-slate-800 leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StarRating rating={product.averageRating} size={18} />
                <span className="text-sm font-bold text-slate-700">{product.averageRating.toFixed(1)}</span>
                <span className="text-sm text-slate-500">({product.reviewCount} reviews)</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="text-sm font-medium text-slate-500">SKU: {product.sku}</div>
            </div>

            <div className="mb-8">
              {hasDiscount && (
                <div className="text-lg text-slate-400 line-through mb-1">
                  ₹{product.price.toLocaleString()}
                </div>
              )}
              <div className="flex items-end gap-3">
                <span className="font-black text-4xl text-slate-900">₹{currentPrice.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="bg-rose-100 text-rose-600 text-sm font-bold px-2 py-1 rounded-lg mb-1">
                    Save ₹{(product.price - product.discountPrice).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Availability</h3>
              {product.stockQuantity > 10 ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 w-fit px-3 py-1.5 rounded-lg">
                  <Check size={18} /> In Stock ({product.stockQuantity})
                </div>
              ) : product.stockQuantity > 0 ? (
                <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 w-fit px-3 py-1.5 rounded-lg">
                  <AlertCircle size={18} /> Low Stock (Only {product.stockQuantity} left)
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-600 font-bold bg-rose-50 w-fit px-3 py-1.5 rounded-lg">
                  <AlertCircle size={18} /> Out of Stock
                </div>
              )}
            </div>

            {/* Actions */}
            {isSeller ? (
              <div className="mt-auto p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 font-medium">
                Marketplace seller accounts cannot purchase products.
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-white overflow-hidden h-14">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={product.stockQuantity === 0}
                      className="px-4 h-full text-slate-500 hover:bg-slate-50 font-bold disabled:opacity-50"
                    >-</button>
                    <span className="w-12 text-center font-bold text-slate-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                      disabled={product.stockQuantity === 0}
                      className="px-4 h-full text-slate-500 hover:bg-slate-50 font-bold disabled:opacity-50"
                    >+</button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.stockQuantity === 0}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <ShoppingCart size={20} />}
                    Add to Cart
                  </button>
                </div>

                <button
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Heart size={20} className={isAddingToWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                  Save to Wishlist
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 mb-12">
          <div className="flex items-center gap-8 border-b border-slate-100 mb-8 overflow-x-auto pb-2">
            {['description', 'specs', 'reviews'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-bold capitalize whitespace-nowrap pb-4 border-b-2 transition-colors ${
                  activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'specs' ? 'Specifications & Ingredients' : tab}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                <p>{product.description}</p>
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-2">Seller Information</h4>
                  <p>Sold by: <span className="font-bold text-primary-600">{product.sellerName}</span></p>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Specifications</h3>
                  {product.specifications ? (
                    <ul className="space-y-3">
                      {product.specifications.split('|').map((spec, i) => (
                        <li key={i} className="flex gap-2 text-slate-600 font-medium">
                          <Check size={18} className="text-primary-500 flex-shrink-0" />
                          {spec.trim()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No specifications provided.</p>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Ingredients</h3>
                  {product.ingredients ? (
                    <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {product.ingredients}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">No ingredients provided.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col md:flex-row gap-10 mb-10 pb-10 border-b border-slate-100">
                  <div className="md:w-1/3 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="font-black text-5xl text-slate-800 mb-2">{product.averageRating.toFixed(1)}</div>
                    <StarRating rating={product.averageRating} size={24} className="mb-2" />
                    <div className="text-slate-500 font-medium">Based on {product.reviewCount} reviews</div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Write a Review</h3>
                    {isSeller ? (
                      <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 font-medium">
                        Marketplace seller accounts cannot write reviews.
                      </div>
                    ) : user ? (
                      <form onSubmit={submitReview} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <label className="font-bold text-slate-700">Rating:</label>
                          <select 
                            value={newReview.rating} 
                            onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-bold text-slate-700"
                          >
                            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                          </select>
                        </div>
                        <textarea 
                          placeholder="Share your thoughts about this product..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-primary-500 font-medium h-24 resize-none"
                          required
                        />
                        <button type="submit" className="bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-slate-900 transition-colors">
                          Submit Review
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 font-medium">
                        Please <Link to="/login" className="font-bold underline">login</Link> to write a review.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-center text-slate-500 italic py-8">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-bold text-slate-800">{review.user.name}</div>
                            <div className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                          <StarRating rating={review.rating} size={16} />
                        </div>
                        <p className="text-slate-600 font-medium">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-display font-black text-2xl text-slate-800 mb-6">Related Products</h2>
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
