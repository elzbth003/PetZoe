import React, { useState, useEffect } from 'react';
import { Pencil, Send, Save } from 'lucide-react';
import { vendorProductService } from '../../services/vendorProductService';
import { useToast } from '../../hooks/useToast';

const STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_REVIEW: 'bg-amber-50 text-amber-600',
  APPROVED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-rose-50 text-rose-600',
  OUT_OF_STOCK: 'bg-slate-100 text-slate-600',
  DISCONTINUED: 'bg-rose-50 text-rose-600',
};

const EDITABLE_STATUSES = ['DRAFT', 'APPROVED', 'REJECTED', 'OUT_OF_STOCK'];
const SUBMITTABLE_STATUSES = ['DRAFT', 'REJECTED'];

export default function SellerProductEditPanel({ vendorProduct, categories, onUpdated }) {
  const [form, setForm] = useState({
    name: '', brand: '', shortDescription: '', description: '',
    price: '', mrp: '', sku: '', stockQuantity: '', categoryId: '',
  });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setForm({
      name: vendorProduct.name || '',
      brand: vendorProduct.brand || '',
      shortDescription: vendorProduct.shortDescription || '',
      description: vendorProduct.description || '',
      price: vendorProduct.price ?? '',
      mrp: vendorProduct.mrp ?? '',
      sku: vendorProduct.sku || '',
      stockQuantity: vendorProduct.stockQuantity ?? '',
      categoryId: vendorProduct.categoryId || '',
    });
  }, [vendorProduct]);

  const status = vendorProduct.status;
  const wasLive = status === 'APPROVED' || status === 'OUT_OF_STOCK';
  const canEdit = EDITABLE_STATUSES.includes(status);
  const canSubmit = SUBMITTABLE_STATUSES.includes(status);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        price: form.price === '' ? null : parseFloat(form.price),
        mrp: form.mrp === '' ? null : parseFloat(form.mrp),
        stockQuantity: form.stockQuantity === '' ? 0 : parseInt(form.stockQuantity, 10),
        categoryId: form.categoryId === '' ? null : parseInt(form.categoryId, 10),
      };
      const res = await vendorProductService.updateProduct(vendorProduct.id, payload);
      onUpdated(res);
      showToast(
        wasLive ? 'Changes saved — this listing now needs admin re-approval before it can be sold again.' : 'Changes saved',
        'success'
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await vendorProductService.submitForReview(vendorProduct.id);
      onUpdated(res);
      showToast('Submitted for admin review', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit for review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-auto p-5 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
          <Pencil size={14} /> Edit Your Listing
        </p>
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      {status === 'REJECTED' && vendorProduct.rejectionReason && (
        <div className="mb-3 text-sm text-rose-600 bg-rose-50 p-3 rounded-xl">
          Admin feedback: {vendorProduct.rejectionReason}
        </div>
      )}
      {status === 'PENDING_REVIEW' && (
        <p className="text-sm text-slate-500 mb-3">This listing is awaiting admin review — editing is disabled until a decision is made.</p>
      )}
      {status === 'DISCONTINUED' && (
        <p className="text-sm text-slate-500 mb-3">This product has been discontinued and can no longer be edited.</p>
      )}
      {wasLive && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg mb-3">
          Saving changes to this live listing will unpublish it until admin re-approves the update.
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-3">
        <fieldset disabled={!canEdit} className="space-y-3 disabled:opacity-60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder="Product name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
            <input required placeholder="Brand" value={form.brand}
              onChange={e => setForm({ ...form, brand: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
          </div>
          <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150">
            <option value="" disabled>Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Short description" value={form.shortDescription}
            onChange={e => setForm({ ...form, shortDescription: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
          <textarea placeholder="Full description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150 h-20 resize-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input required type="number" min="0" step="0.01" placeholder="Price" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
            <input type="number" min="0" step="0.01" placeholder="MRP" value={form.mrp}
              onChange={e => setForm({ ...form, mrp: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
            <input required type="number" min="0" placeholder="Stock" value={form.stockQuantity}
              onChange={e => setForm({ ...form, stockQuantity: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
            <input required placeholder="SKU" value={form.sku}
              onChange={e => setForm({ ...form, sku: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
          </div>
        </fieldset>

        {canEdit && (
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center justify-center gap-2 bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-slate-900 disabled:opacity-50 text-sm transition-all duration-200 hover:shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting}
              title={!canSubmit ? 'Save your changes first' : undefined}
              className="flex items-center justify-center gap-2 bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm transition-all duration-200 hover:shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed">
              <Send size={14} /> {submitting ? 'Submitting...' : 'Submit for Admin Review'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
