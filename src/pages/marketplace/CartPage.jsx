import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

export default function CartPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getCart();
      setCartItems(res.data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await marketplaceService.updateCartQuantity(id, newQuantity);
      setCartItems(items => items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    } catch (err) {
      showToast('Failed to update quantity', 'error');
    }
  };

  const removeItem = async (id) => {
    try {
      await marketplaceService.removeFromCart(id);
      setCartItems(items => items.filter(item => item.id !== id));
      showToast('Item removed', 'success');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      showToast('Failed to remove item', 'error');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    try {
      setProcessing(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast('Failed to load Razorpay SDK. Please check your connection.', 'error');
        setProcessing(false);
        return;
      }

      // Step 1: Initialize payment order on backend (locks inventory & gets Razorpay Order ID)
      const initRes = await marketplaceService.createPayment();
      const paymentData = initRes.data;

      const isMock = paymentData.razorpayOrderId?.startsWith('order_mock_') || paymentData.keyId?.includes('placeholder');

      if (isMock) {
        // Simulated test mode for development without live Razorpay account credentials
        const confirmed = window.confirm(`[PetZoe Test Mode Payment]\n\nOrder #${paymentData.orderId}\nTotal Amount: ₹${paymentData.amount}\nSimulated Order ID: ${paymentData.razorpayOrderId}\n\nClick OK to simulate successful payment, or Cancel to simulate user dismissal.`);
        if (confirmed) {
          try {
            setProcessing(true);
            await marketplaceService.verifyPayment({
              orderId: paymentData.orderId,
              razorpayOrderId: paymentData.razorpayOrderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: 'simulated_valid_test_signature'
            });
            showToast('Test payment successful! Order placed.', 'success');
            window.dispatchEvent(new Event('cart-updated'));
            navigate('/marketplace/orders');
          } catch (verifyErr) {
            console.error('Payment verification failed', verifyErr);
            showToast(verifyErr.response?.data?.message || 'Payment verification failed', 'error');
            navigate('/marketplace/orders');
          } finally {
            setProcessing(false);
          }
        } else {
          setProcessing(false);
          showToast('Payment was cancelled. You can retry from your Orders page.', 'warning');
          window.dispatchEvent(new Event('cart-updated'));
          navigate('/marketplace/orders');
        }
        return;
      }

      // Live / Sandbox Razorpay Checkout Modal Flow
      const options = {
        key: paymentData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentData.amountInPaise,
        currency: paymentData.currency || 'INR',
        name: 'PetZoe Marketplace',
        description: `Order #${paymentData.orderId} Checkout`,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: paymentData.customerName || '',
          email: paymentData.customerEmail || '',
          contact: paymentData.customerPhone || ''
        },
        theme: {
          color: '#0d9488' // primary teal
        },
        handler: async function (response) {
          try {
            setProcessing(true);
            // Step 3: Cryptographically verify signature on backend
            await marketplaceService.verifyPayment({
              orderId: paymentData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            showToast('Payment successful! Order placed.', 'success');
            window.dispatchEvent(new Event('cart-updated'));
            navigate('/marketplace/orders');
          } catch (verifyErr) {
            console.error('Payment verification failed', verifyErr);
            showToast(verifyErr.response?.data?.message || 'Payment verification failed', 'error');
            navigate('/marketplace/orders');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            showToast('Payment was not completed. You can retry from your Orders page.', 'warning');
            window.dispatchEvent(new Event('cart-updated'));
            navigate('/marketplace/orders');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        showToast(response.error.description || 'Payment failed', 'error');
        setProcessing(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout initialization failed', err);
      showToast(err.response?.data?.message || 'Failed to initialize payment', 'error');
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <ShoppingBag size={40} />
        </div>
        <h2 className="font-display font-black text-3xl text-slate-800 mb-4">Your Cart is Empty</h2>
        <p className="text-slate-500 font-medium mb-8">Please login to view your cart and start shopping.</p>
        <Link to="/login" className="bg-primary-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
          Login to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <ShoppingBag size={40} />
        </div>
        <h2 className="font-display font-black text-3xl text-slate-800 mb-4">Your Cart is Empty</h2>
        <p className="text-slate-500 font-medium mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Discover premium products for your pet today!</p>
        <Link to="/marketplace" className="bg-primary-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 flex items-center gap-2">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice != null ? item.product.discountPrice : item.product.price;
    return sum + (price * item.quantity);
  }, 0);
  const totalDiscount = cartItems.reduce((sum, item) => {
    if (item.product.discountPrice != null) {
      return sum + ((item.product.price - item.product.discountPrice) * item.quantity);
    }
    return sum;
  }, 0);
  const total = subtotal; // Assuming free shipping for now

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to="/marketplace" className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-900 shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display font-black text-3xl text-slate-800">Shopping Cart</h1>
          <span className="bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-full text-sm">
            {cartItems.length} items
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {cartItems.map((item) => {
              const hasDiscount = item.product.discountPrice != null;
              const currentPrice = hasDiscount ? item.product.discountPrice : item.product.price;
              
              return (
                <div key={item.id} className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Image */}
                  <Link to={`/marketplace/products/${item.product.id}`} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" loading="lazy" />
                  </Link>
                  
                  {/* Details */}
                  <div className="flex-1">
                    <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
                      {item.product.brand}
                    </div>
                    <Link to={`/marketplace/products/${item.product.id}`}>
                      <h3 className="font-bold text-slate-800 text-lg hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-end gap-3 mb-4 md:mb-0">
                      <span className="font-black text-xl text-slate-900">₹{currentPrice.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-sm text-slate-400 line-through mb-0.5">₹{item.product.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden h-12">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 h-full text-slate-500 hover:bg-slate-100 font-bold"
                      >-</button>
                      <span className="w-10 text-center font-bold text-slate-800 bg-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, Math.min(item.product.stockQuantity, item.quantity + 1))}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="px-3 h-full text-slate-500 hover:bg-slate-100 font-bold disabled:opacity-50"
                      >+</button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className={`p-3 text-slate-400 rounded-xl transition-colors
                        hover:text-rose-500 hover:bg-rose-50`}
                      title="Remove Item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-28">
              <h2 className="font-display font-black text-xl text-slate-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{(subtotal + totalDiscount).toLocaleString()}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-500 font-medium">
                    <span>Discount</span>
                    <span>-₹{totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-800">Total Amount</span>
                  <span className="font-black text-3xl text-slate-900">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-right text-xs text-slate-500 mt-1">Inclusive of all taxes</p>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
                ) : (
                  <>Proceed to Checkout <ArrowRight size={20} /></>
                )}
              </button>
              
              <div className="mt-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <Lock size={12} /> Secure Checkout Placeholder
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
