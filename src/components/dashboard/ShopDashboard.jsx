import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Heart, Package, Trash2, Plus, Minus,
  ArrowRight, ShoppingBag, Loader2, Sparkles, Clock,
  Truck, CheckCircle2, XCircle, ExternalLink, RefreshCw,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import marketplaceService from '../../services/marketplaceService';
import { useToast } from '../../hooks/useToast';
import { getProductImageUrl, analyzeProductNameAndGetImage } from '../../utils/productImageHelper';

/* ─── Helpers ────────────────────────────────────────────── */
function price(p) {
  return `₹${Number(p).toLocaleString('en-IN')}`;
}

function OrderStatusBadge({ status }) {
  const map = {
    Pending:    { icon: Clock,        bg: 'bg-amber-50  border-amber-200  text-amber-700'  },
    Processing: { icon: RefreshCw,    bg: 'bg-blue-50   border-blue-200   text-blue-700'   },
    Shipped:    { icon: Truck,        bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    Delivered:  { icon: CheckCircle2, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    Cancelled:  { icon: XCircle,      bg: 'bg-rose-50   border-rose-200   text-rose-700'   },
  };
  const cfg = map[status] || map.Pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold ${cfg.bg}`}>
      <Icon size={12} /> {status}
    </span>
  );
}

/* ─── Empty state ────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, body, linkTo, linkLabel }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-14 text-center space-y-3 animate-in fade-in duration-200">
      <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
        <Icon size={28} className="text-slate-300" />
      </div>
      <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
      <p className="text-xs text-slate-400 max-w-xs mx-auto">{body}</p>
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] text-white font-bold text-xs mt-2 hover:bg-[#162e4d] transition-all"
        >
          {linkLabel} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* ─── CartTab ────────────────────────────────────────────── */
function CartTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.getCart();
      setItems(res.data);
    } catch { showToast('Could not load cart', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const changeQty = async (id, qty, max) => {
    if (qty < 1 || qty > max) return;
    try {
      await marketplaceService.updateCartQuantity(id, qty);
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    } catch { showToast('Failed to update quantity', 'error'); }
  };

  const remove = async (id) => {
    try {
      await marketplaceService.removeFromCart(id);
      setItems(prev => prev.filter(i => i.id !== id));
      window.dispatchEvent(new Event('cart-updated'));
      showToast('Item removed from cart', 'success');
    } catch { showToast('Failed to remove item', 'error'); }
  };

  const checkout = async () => {
    setChecking(true);
    try {
      await marketplaceService.placeOrder();
      showToast('Order placed successfully!', 'success');
      window.dispatchEvent(new Event('cart-updated'));
      setItems([]);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally { setChecking(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1E3A5F]" size={36} /></div>;

  if (items.length === 0) return (
    <EmptyState
      icon={ShoppingCart}
      title="Your cart is empty"
      body="Browse the marketplace and add products for your pets to get started."
      linkTo="/marketplace"
      linkLabel="Shop Now"
    />
  );

  const subtotal = items.reduce((s, i) => {
    const p = i.product.discountPrice ?? i.product.price;
    return s + p * i.quantity;
  }, 0);
  const saved = items.reduce((s, i) => {
    if (i.product.discountPrice != null) {
      return s + (i.product.price - i.product.discountPrice) * i.quantity;
    }
    return s;
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Items */}
      <div className="lg:col-span-8 space-y-3">
        {items.map(item => {
          const p = item.product;
          const currentPrice = p.discountPrice ?? p.price;
          return (
            <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <Link to={`/marketplace/products/${p.id}`} target="_blank">
                <img
                  src={getProductImageUrl(p)}
                  alt={p.name}
                  onError={(e) => { e.target.src = analyzeProductNameAndGetImage(p); }}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0 hover:scale-105 transition-transform"
                />
              </Link>
              <div className="flex-1 min-w-0 text-left space-y-1">
                <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">{p.brand}</p>
                <Link to={`/marketplace/products/${p.id}`} target="_blank">
                  <p className="text-sm font-bold text-slate-800 line-clamp-1 hover:text-[#1E3A5F]">{p.name}</p>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm">{price(currentPrice)}</span>
                  {p.discountPrice != null && (
                    <span className="text-[10px] text-slate-400 line-through">{price(p.price)}</span>
                  )}
                </div>
              </div>
              {/* Qty stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => changeQty(item.id, item.quantity - 1, p.stockQuantity)}
                  className="h-8 w-8 text-slate-500 hover:bg-slate-50 flex items-center justify-center font-bold transition-all cursor-pointer"
                >
                  <Minus size={12} />
                </button>
                <span className="h-8 w-8 text-center text-xs font-bold text-slate-800 flex items-center justify-center bg-white">{item.quantity}</span>
                <button
                  onClick={() => changeQty(item.id, item.quantity + 1, p.stockQuantity)}
                  disabled={item.quantity >= p.stockQuantity}
                  className="h-8 w-8 text-slate-500 hover:bg-slate-50 flex items-center justify-center font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  <Plus size={12} />
                </button>
              </div>
              {/* Line total */}
              <span className="text-sm font-black text-slate-900 shrink-0 w-20 text-right">
                {price(currentPrice * item.quantity)}
              </span>
              <button
                onClick={() => remove(item.id)}
                className={`h-8 w-8 rounded-xl text-slate-400 flex items-center justify-center transition-all cursor-pointer shrink-0
                  hover:bg-rose-50 hover:text-rose-500`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm sticky top-8 space-y-5">
          <h3 className="font-bold text-slate-800 text-sm text-left">Order Summary</h3>
          <div className="space-y-3 text-xs text-slate-600 font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal ({items.length} items)</span>
              <span>{price(subtotal + saved)}</span>
            </div>
            {saved > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{price(saved)}</span>
              </div>
            )}
            <div className="flex justify-between text-emerald-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="font-bold text-slate-700 text-sm">Total</span>
            <span className="font-black text-xl text-slate-900">{price(subtotal)}</span>
          </div>
          <button
            onClick={checkout}
            disabled={checking}
            className="w-full py-3 rounded-xl bg-[#1E3A5F] hover:bg-[#162e4d] text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {checking
              ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
              : <><ShoppingBag size={14} /> Place Order</>
            }
          </button>
          <Link
            to="/marketplace"
            className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-700 font-bold transition-all"
          >
            Continue Shopping <ExternalLink size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── WishlistTab ─────────────────────────────────────────── */
function WishlistTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.getWishlist();
      setItems(res.data);
    } catch { showToast('Could not load wishlist', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const remove = async (id) => {
    try {
      await marketplaceService.removeFromWishlist(id);
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('Removed from wishlist', 'success');
    } catch { showToast('Failed to remove', 'error'); }
  };

  const moveToCart = async (id) => {
    try {
      await marketplaceService.moveToCart(id);
      setItems(prev => prev.filter(i => i.id !== id));
      window.dispatchEvent(new Event('cart-updated'));
      showToast('Moved to cart!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to move to cart', 'error');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1E3A5F]" size={36} /></div>;

  if (items.length === 0) return (
    <EmptyState
      icon={Heart}
      title="Your wishlist is empty"
      body="Save products you love to buy them later when you're ready."
      linkTo="/marketplace"
      linkLabel="Explore Products"
    />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-200">
      {items.map(item => {
        const p = item.product;
        const currentPrice = p.discountPrice ?? p.price;
        const hasDiscount = p.discountPrice != null;
        const discountPct = hasDiscount ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;

        return (
          <div key={item.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative group">
            {/* Remove */}
            <button
              onClick={() => remove(item.id)}
              className={`absolute top-3 right-3 z-10 h-7 w-7 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 flex items-center justify-center shadow-sm transition-all cursor-pointer
                hover:bg-rose-50 hover:text-rose-500`}
            >
              <Trash2 size={13} />
            </button>

            {/* Image */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
              <img 
                src={getProductImageUrl(p)} 
                alt={p.name} 
                onError={(e) => { e.target.src = analyzeProductNameAndGetImage(p); }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {discountPct}% OFF
                </span>
              )}
              {p.stockQuantity === 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 space-y-2 text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</p>
              <Link to={`/marketplace/products/${p.id}`} target="_blank">
                <p className="text-xs font-bold text-slate-800 line-clamp-2 hover:text-[#1E3A5F]">{p.name}</p>
              </Link>
              {p.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] text-slate-500 font-semibold">{p.averageRating.toFixed(1)} ({p.reviewCount})</span>
                </div>
              )}
              <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                <div>
                  {hasDiscount && <p className="text-[9px] text-slate-400 line-through">{price(p.price)}</p>}
                  <p className="font-black text-slate-900 text-sm">{price(currentPrice)}</p>
                </div>
                <button
                  onClick={() => moveToCart(item.id)}
                  disabled={p.stockQuantity === 0}
                  className="h-8 w-8 rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                  title="Move to Cart"
                >
                  <ShoppingCart size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── OrdersTab ───────────────────────────────────────────── */
function OrdersTab() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await marketplaceService.getOrders();
        setOrders(res.data);
      } catch { showToast('Could not load orders', 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1E3A5F]" size={36} /></div>;

  if (orders.length === 0) return (
    <EmptyState
      icon={Package}
      title="No orders yet"
      body="Your purchase history will appear here once you place your first order."
      linkTo="/marketplace"
      linkLabel="Start Shopping"
    />
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {orders.map(order => (
        <div key={order.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-slate-50/60 px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-5 text-left">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                <p className="text-xs font-bold text-slate-700">#ORD-{String(order.id).padStart(6, '0')}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Date</p>
                <p className="text-xs font-semibold text-slate-700">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
                <p className="text-xs font-black text-slate-900">{price(order.totalAmount)}</p>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          {/* Items */}
          <div className="px-5 py-4 space-y-3">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={getProductImageUrl(item.product)}
                  alt={item.product?.name}
                  onError={(e) => { e.target.src = analyzeProductNameAndGetImage(item.product); }}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="flex-1 text-left">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.product?.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Qty: {item.quantity} × {price(item.priceAtPurchase)}</p>
                </div>
                <p className="text-xs font-black text-slate-900 shrink-0">{price(item.quantity * item.priceAtPurchase)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main ShopDashboard ────────────────────────────────── */
export default function ShopDashboard() {
  const [tab, setTab] = useState('cart');
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await marketplaceService.getCart();
      setCartCount(res.data.reduce((s, i) => s + i.quantity, 0));
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    fetchCartCount();
    window.addEventListener('cart-updated', fetchCartCount);
    return () => window.removeEventListener('cart-updated', fetchCartCount);
  }, [fetchCartCount]);

  const TABS = [
    { key: 'cart',     label: 'Cart',     icon: ShoppingCart, badge: cartCount },
    { key: 'wishlist', label: 'Wishlist',  icon: Heart },
    { key: 'orders',   label: 'Orders',   icon: Package },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-left">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Sparkles size={16} className="text-[#38BDF8]" /> My Shop
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Cart · Wishlist · Orders</p>
        </div>
        <Link
          to="/marketplace"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] text-white font-bold text-xs hover:bg-[#162e4d] transition-all cursor-pointer"
        >
          Browse Marketplace <ExternalLink size={12} />
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-slate-100/60 p-1 rounded-2xl w-fit">
        {TABS.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              tab === key
                ? 'bg-white text-[#1E3A5F] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={13} />
            {label}
            {badge > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'cart'     && <CartTab />}
      {tab === 'wishlist' && <WishlistTab />}
      {tab === 'orders'   && <OrdersTab />}
    </div>
  );
}
