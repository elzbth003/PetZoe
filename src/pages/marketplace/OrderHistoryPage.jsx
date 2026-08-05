import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, Receipt } from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';
import { useAuth } from '../../hooks/useAuth';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
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
        <Link to="/login" className="bg-primary-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg">
          Login to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
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
            <Link to="/marketplace" className="bg-primary-50 text-primary-600 font-bold px-6 py-2.5 rounded-full hover:bg-primary-100 transition-colors">
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
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                        <StatusIcon size={18} />
                        <span className="font-bold">{order.status}</span>
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
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
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
