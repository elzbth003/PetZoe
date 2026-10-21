import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, Receipt, CreditCard, AlertCircle } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState(null);

  useEffect(() => {
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
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

  const handleRetryPayment = async (orderId) => {
    try {
      setPayingOrderId(orderId);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast('Failed to load Razorpay SDK. Please check your connection.', 'error');
        setPayingOrderId(null);
        return;
      }

      // Re-initiate payment for this specific existing order
      const initRes = await marketplaceService.createPayment(orderId);
      const paymentData = initRes.data;

      const isMock = paymentData.razorpayOrderId?.startsWith('order_mock_') || paymentData.keyId?.includes('placeholder');

      // If order was generated with a simulated mock order ID from a local dev mock
      if (isMock) {
        // If window.Razorpay is available and key is configured, still try to open standard modal
        const hasValidKey = paymentData.keyId && !paymentData.keyId.includes('placeholder');
        if (!hasValidKey || paymentData.razorpayOrderId?.startsWith('order_mock_')) {
          const confirmed = window.confirm(`[PetZoe Test Mode Payment Retry]\n\nOrder #${paymentData.orderId}\nTotal Amount: ₹${paymentData.amount}\nSimulated Order ID: ${paymentData.razorpayOrderId}\n\nClick OK to simulate successful payment, or Cancel to abort.`);
          if (confirmed) {
            try {
              await marketplaceService.verifyPayment({
                orderId: paymentData.orderId,
                razorpayOrderId: paymentData.razorpayOrderId,
                razorpayPaymentId: `pay_mock_${Date.now()}`,
                razorpaySignature: 'simulated_valid_test_signature'
              });
              showToast('Test payment retry verified successfully!', 'success');
              fetchOrders();
            } catch (verifyErr) {
              console.error('Payment verification failed', verifyErr);
              showToast(verifyErr.response?.data?.message || 'Payment verification failed', 'error');
              fetchOrders();
            } finally {
              setPayingOrderId(null);
            }
          } else {
            setPayingOrderId(null);
            showToast('Payment retry aborted', 'warning');
          }
          return;
        }
      }

      if (!window.Razorpay) {
        showToast('Razorpay SDK could not be initialized in this browser.', 'error');
        setPayingOrderId(null);
        return;
      }

      const options = {
        key: paymentData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentData.amountInPaise,
        currency: paymentData.currency || 'INR',
        name: 'PetZoe Marketplace',
        description: `Order #${paymentData.orderId} Payment Retry`,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: paymentData.customerName || '',
          email: paymentData.customerEmail || '',
          contact: paymentData.customerPhone || ''
        },
        theme: {
          color: '#0d9488'
        },
        handler: async function (response) {
          try {
            await marketplaceService.verifyPayment({
              orderId: paymentData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            showToast('Payment verified successfully!', 'success');
            fetchOrders();
          } catch (verifyErr) {
            console.error('Payment verification failed', verifyErr);
            showToast(verifyErr.response?.data?.message || 'Payment verification failed', 'error');
            fetchOrders();
          } finally {
            setPayingOrderId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingOrderId(null);
            showToast('Payment cancelled or dismissed', 'warning');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        showToast(response.error?.description || 'Payment failed', 'error');
        setPayingOrderId(null);
      });
      rzp.open();
    } catch (err) {
      console.error('Failed to retry payment', err);
      showToast(err.response?.data?.message || err.message || 'Failed to retry payment', 'error');
      setPayingOrderId(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
      case 'Pending Payment':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
      case 'Payment Failed':
        return { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' };
      case 'Processing':
        return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
      case 'Shipped':
        return { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' };
      case 'Delivered':
        return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' };
      case 'Cancelled':
        return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' };
      default:
        return { icon: Package, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <Package size={40} />
        </div>
        <h2 className="font-display font-black text-3xl text-slate-800 mb-4">View Your Orders</h2>
        <p className="text-slate-500 font-medium mb-8">Please login to track your recent purchases.</p>
        <Link to="/login" className="bg-teal-600 text-white font-bold text-xs px-7 py-3 rounded-full hover:bg-teal-700 transition-colors shadow-md">
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

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="font-display font-black text-3xl text-slate-800 mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Package size={32} />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-500 mb-6">You haven't placed any orders yet.</p>
            <Link to="/marketplace" className="bg-teal-50 text-teal-700 font-bold px-6 py-2.5 rounded-full hover:bg-teal-100 transition-colors inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                  
                  {/* Order Header */}
                  <div className="bg-slate-50/50 p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="grid grid-cols-2 md:flex gap-6 md:gap-12 text-sm">
                      <div>
                        <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Order Date</div>
                        <div className="font-medium text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Total Amount</div>
                        <div className="font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</div>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Order ID</div>
                        <div className="font-medium text-slate-700">#ORD-{order.id.toString().padStart(6, '0')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button className="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                        <Receipt size={16} /> Invoice
                      </button>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          <StatusIcon size={18} />
                          <span className="font-bold">{order.status}</span>
                        </div>
                        {(order.status === 'Pending' || order.status === 'Pending Payment' || order.status === 'Payment Failed') && (
                          <button
                            onClick={() => handleRetryPayment(order.id)}
                            disabled={payingOrderId === order.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CreditCard size={14} />
                            {payingOrderId === order.id ? 'Opening Razorpay...' : 'Pay Now'}
                          </button>
                        )}
                      </div>
                      {order.status === 'Delivered' && (
                        <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                          Delivered on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 py-4 border-t border-slate-50">
                          <Link to={`/marketplace/products/${item.product.id}`} className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" loading="lazy" />
                          </Link>
                          <div className="flex-1">
                            <Link to={`/marketplace/products/${item.product.id}`}>
                              <h4 className="font-bold text-slate-800 hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                                {item.product.name}
                              </h4>
                            </Link>
                            <div className="text-sm text-slate-500 font-medium">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900">₹{item.priceAtPurchase.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Order Footer */}
                  <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-center">
                    <Link to={`/marketplace/products/${order.items[0].product.id}`} className="text-primary-600 font-bold hover:underline inline-flex items-center gap-1">
                      Buy it again <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
