import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, DollarSign,
  Settings, LogOut, Plus, Edit, Trash2, CheckCircle, XCircle, Menu, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { vendorProductService } from '../../services/vendorProductService';
import verificationService from '../../services/verificationService';
import { useToast } from '../../hooks/useToast';
import AddProductWizard from '../../components/dashboard/AddProductWizard';

export default function SellerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showAddProductWizard, setShowAddProductWizard] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [verification, setVerification] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationFile, setVerificationFile] = useState(null);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  useEffect(() => {
    if (user?.role !== 'Marketplace Seller' && user?.role !== 'Admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'My Products') {
      fetchMyProducts();
    }
    if (activeTab === 'Settings') {
      fetchVerification();
    }
  }, [activeTab]);

  const fetchVerification = async () => {
    try {
      setVerificationLoading(true);
      const res = await verificationService.getMyVerification();
      setVerification(res.data);
    } catch (err) {
      console.error("Failed to fetch verification status", err);
    } finally {
      setVerificationLoading(false);
    }
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!verificationFile) {
      showToast('Please choose a document to upload', 'error');
      return;
    }
    try {
      setSubmittingVerification(true);
      const documentBase64 = await fileToBase64(verificationFile);
      const res = await verificationService.submitVerification(documentBase64);
      setVerification(res.data);
      setVerificationFile(null);
      showToast('Verification request submitted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit verification request', 'error');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await vendorProductService.getVendorProducts();
      setProducts(res.content || []);
    } catch (err) {
      console.error("Failed to fetch seller products", err);
      showToast(err.response?.data?.message || 'Failed to load your products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await vendorProductService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        showToast('Product deleted successfully', 'success');
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to delete product', 'error');
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Total Products</p>
                  <h3 className="text-2xl font-black text-slate-800">{products.length}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Orders Today</p>
                  <h3 className="text-2xl font-black text-slate-800">0</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Revenue</p>
                  <h3 className="text-2xl font-black text-slate-800">₹0</h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center py-16">
               <Package size={48} className="mx-auto text-slate-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to Seller Dashboard</h3>
               <p className="text-slate-500">Manage your inventory, track orders, and grow your pet business.</p>
               <button
                 onClick={() => setActiveTab('My Products')}
                 className="mt-6 bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
               >
                 View My Inventory
               </button>
            </div>
          </div>
        );
      case 'My Products':
        if (showAddProductWizard) {
          return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <AddProductWizard 
                onCancel={() => setShowAddProductWizard(false)} 
                onProductAdded={() => {
                  setShowAddProductWizard(false);
                  fetchMyProducts();
                }} 
              />
            </div>
          );
        }
        
        return (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Product Inventory</h2>
              <button
                onClick={() => setShowAddProductWizard(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-700 transition-all duration-200 hover:shadow-md active:scale-95 cursor-pointer"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-slate-500 animate-in fade-in duration-300">
                <Package size={40} className="mx-auto text-slate-200 mb-3" />
                No products found. Start by adding one!
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-white shadow-sm">
                    <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider bg-white">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{product.name}</div>
                              <div className="text-xs text-slate-500">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          ₹{product.price}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-600">
                          {product.stockQuantity} units
                        </td>
                        <td className="py-3 px-4">
                          {product.status === 'APPROVED' ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md w-fit">
                              <CheckCircle size={12} /> Approved
                            </span>
                          ) : product.status === 'REJECTED' ? (
                            <span className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-md w-fit">
                              <XCircle size={12} /> Rejected
                            </span>
                          ) : product.status === 'PENDING_REVIEW' ? (
                            <span className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-md w-fit">
                              <XCircle size={12} /> Pending Review
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-600 text-xs font-bold bg-slate-100 px-2 py-1 rounded-md w-fit">
                              {(product.status || 'DRAFT').replace(/_/g, ' ')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/marketplace/products/${product.id}`)}
                              title="Edit product"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:border-blue-200 bg-white rounded-lg border border-slate-200 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              title="Delete product"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:border-rose-200 bg-white rounded-lg border border-slate-200 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'Settings': {
        const status = verification?.status || 'NOT_SUBMITTED';
        const canSubmit = ['NOT_SUBMITTED', 'REJECTED', 'CHANGES_REQUIRED', 'RESUBMISSION_REQUIRED'].includes(status);
        const statusStyles = {
          NOT_SUBMITTED: 'bg-slate-100 text-slate-600',
          PENDING: 'bg-amber-50 text-amber-600',
          UNDER_REVIEW: 'bg-amber-50 text-amber-600',
          APPROVED: 'bg-emerald-50 text-emerald-600',
          REJECTED: 'bg-rose-50 text-rose-600',
          CHANGES_REQUIRED: 'bg-rose-50 text-rose-600',
          RESUBMISSION_REQUIRED: 'bg-rose-50 text-rose-600',
          SUSPENDED: 'bg-rose-50 text-rose-600',
        };

        return (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Seller Verification</h2>
            <p className="text-sm text-slate-500 mb-4">
              You must be verified before you can submit products for review.
            </p>

            {verificationLoading ? (
              <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary-600"></div></div>
            ) : (
              <>
                <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-md mb-4 ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
                  Status: {status.replace(/_/g, ' ')}
                </span>

                {status === 'REJECTED' && verification?.reviewerNotes && (
                  <div className="mb-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-xl">
                    Reason: {verification.reviewerNotes}
                  </div>
                )}

                {canSubmit ? (
                  <form onSubmit={handleSubmitVerification} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Verification Document (ID proof, business license, etc.)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setVerificationFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingVerification}
                      className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all duration-200 hover:shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {submittingVerification ? 'Submitting...' : 'Submit for Verification'}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-slate-500">
                    {status === 'APPROVED'
                      ? 'Your seller account is verified.'
                      : 'Your request is being reviewed by our team.'}
                  </p>
                )}
              </>
            )}
          </div>
        );
      }
      default:
        return (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm text-slate-500">
            Coming Soon
          </div>
        );
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Products', icon: Package },
    { name: 'Orders', icon: ShoppingCart },
    { name: 'Settings', icon: Settings }
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-6 shrink-0 shadow-xl border-r border-slate-800 fixed md:relative inset-y-0 left-0 z-30 h-screen transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-1.5 px-2 select-none">
            <span className="font-display font-black text-xl text-white flex items-center">
              PetZoe <span className="text-primary-500 ml-1 text-sm bg-primary-500/20 px-2 py-0.5 rounded">Seller</span>
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => { setActiveTab(item.name); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-primary-900 text-white border-l-2 border-primary-500'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-bold text-xs transition-all cursor-pointer text-left w-full
            hover:bg-rose-950/20 hover:text-rose-300`}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm flex justify-between items-center border-b border-slate-200 px-4 sm:px-8 py-5 gap-3">
          <div className="flex items-center gap-3 text-left min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">{activeTab}</h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5 hidden sm:block">
                Marketplace Seller Center • {user?.name}
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 pb-10 space-y-6 animate-in fade-in duration-300">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
