import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, Receipt, CreditCard, AlertCircle } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import PaymentModal from '../../components/marketplace/PaymentModal';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const handleRetryPayment = async (orderId) => {
    try {
      setPayingOrderId(orderId);
      const initRes = await marketplaceService.createPayment(orderId);
      const paymentData = initRes.data;
      setPaymentModalData(paymentData);
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Failed to retry payment', err);
      showToast(err.response?.data?.message || err.message || 'Failed to retry payment', 'error');
    } finally {
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
          <Receipt size={40} />
        </div>
        <h2 className="font-display font-black text-3xl text-slate-800 mb-4">View Your Orders</h2>
        <p className="text-slate-500 font-medium mb-8">Please login to track your orders and view order history.</p>
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

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-slate-800">My Orders</h1>
            <p className="text-slate-500 font-medium mt-1">Track and manage your marketplace purchases</p>
          </div>
          <Link to="/marketplace" className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm self-start md:self-auto">
            Browse More Products <ChevronRight size={16} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Package size={36} />
            </div>
            <h3 className="font-bold text-2xl text-slate-800 mb-2">No Orders Yet</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">You haven't placed any orders yet. Discover our quality pet supplies and care essentials today!</p>
            <Link to="/marketplace" className="bg-primary-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 inline-flex items-center gap-2">
              Start Shopping <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const StatusIcon = statusCfg.icon;

              return (
                <div key={order.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                  {/* Order Header */}
                  <div className="bg-slate-50/70 p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6 md:gap-10">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Placed</div>
                        <div className="text-sm font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</div>
                        <div className="text-sm font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order #</div>
                        <div className="text-sm font-bold text-slate-800 font-mono">ORD-{order.id.toString().padStart(6, '0')}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                        <StatusIcon size={14} />
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800 text-sm">Status:</span>
                        <span className={`font-semibold text-sm ${statusCfg.color}`}>{order.status}</span>
                        {(order.status === 'Pending Payment' || order.status === 'Pending' || order.status === 'Payment Failed') && (
                          <button
                            onClick={() => handleRetryPayment(order.id)}
                            disabled={payingOrderId === order.id}
                            className="ml-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <CreditCard size={14} />
                            {payingOrderId === order.id ? 'Processing...' : 'Pay Now'}
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
                    <Link to={`/marketplace/products/${order.items[0]?.product?.id}`} className="text-primary-600 font-bold hover:underline inline-flex items-center gap-1">
                      Buy it again <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Payment Checkout Modal for Retry Payment */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPayingOrderId(null);
        }}
        paymentData={paymentModalData}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          setPaymentModalData(null);
          setPayingOrderId(null);
          fetchOrders();
        }}
      />
    </div>
  );
}
