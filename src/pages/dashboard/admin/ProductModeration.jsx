import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { CheckCircle, XCircle, Search, Eye } from 'lucide-react';

export default function ProductModeration() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [activeProductId, setActiveProductId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingProducts(0, 50); // Get first 50
      setProducts(res.data.content);
    } catch (err) {
      showToast("Failed to fetch pending products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveProduct(id);
      showToast("Product approved successfully", "success");
      fetchProducts();
    } catch (err) {
      showToast("Failed to approve product", "error");
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason) {
      showToast("Please provide a rejection reason", "error");
      return;
    }
    try {
      await adminApi.rejectProduct(id, rejectReason);
      showToast("Product rejected", "success");
      setRejectReason('');
      setActiveProductId(null);
      fetchProducts();
    } catch (err) {
      showToast("Failed to reject product", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Product Moderation</h2>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Seller</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No pending products to review.</td>
                </tr>
              ) : (
                products.map(product => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500">Brand: {product.brand}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          {product.categoryName}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-700">{product.sellerName}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-slate-800">₹{product.price}</p>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(product.id)}
                            className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={18}/>
                          </button>
                          <button 
                            onClick={() => setActiveProductId(activeProductId === product.id ? null : product.id)}
                            className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {activeProductId === product.id && (
                      <tr className="bg-slate-50">
                        <td colSpan="5" className="p-4">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Reason for rejection..." 
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                            <button 
                              onClick={() => handleReject(product.id)}
                              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
