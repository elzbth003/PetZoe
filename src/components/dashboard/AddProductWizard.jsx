import React, { useState, useEffect } from 'react';
import { vendorProductService } from '../../services/vendorProductService';
import marketplaceService from '../../services/marketplaceService';
import { AlertCircle, ArrowLeft, ArrowRight, Save, Send, Loader2 } from 'lucide-react';

const AddProductWizard = ({ onCancel, onProductAdded }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    categoryName: '',
    shortDescription: '',
    description: '',
    petType: 'All Pets',
    imageUrl: '',
    price: '',
    mrp: '',
    stockQuantity: '',
    lowStockThreshold: '5',
    sku: '',
    // Category specific details
    healthDetails: { dosage: '', activeIngredients: '', warnings: '' },
    foodDetails: { flavor: '', ingredients: '', nutritionalInformation: '' },
    toyDetails: { material: '', safetyInstructions: '' },
    groomingDetails: { fragrance: '', volume: '' },
    accessoryDetails: { size: '', color: '', material: '' }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await marketplaceService.getCategories();
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setCategories(response.data);
        } else {
          setCategories([
            { id: 1, name: 'Pet Food' },
            { id: 2, name: 'Medicines' },
            { id: 3, name: 'Grooming' },
            { id: 4, name: 'Toys' },
            { id: 5, name: 'Accessories' },
            { id: 6, name: 'Healthcare Products' }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([
          { id: 1, name: 'Pet Food' },
          { id: 2, name: 'Medicines' },
          { id: 3, name: 'Grooming' },
          { id: 4, name: 'Toys' },
          { id: 5, name: 'Accessories' },
          { id: 6, name: 'Healthcare Products' }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCat = categories.find(c => String(c.id) === String(selectedId));
    setFormData(prev => ({
      ...prev,
      categoryId: selectedId,
      categoryName: selectedCat ? selectedCat.name : ''
    }));
    setErrorMessage('');
  };

  const handleDetailChange = (detailGroup, field, value) => {
    setFormData(prev => ({
      ...prev,
      [detailGroup]: {
        ...prev[detailGroup],
        [field]: value
      }
    }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.name.trim()) return "Product Name is required.";
      if (!formData.brand.trim()) return "Brand is required.";
      if (!formData.categoryId) return "Please select a Category.";
      if (!formData.sku.trim()) return "SKU is required.";
      if (!formData.shortDescription.trim()) return "Short Description is required.";
    } else if (currentStep === 2) {
      if (!formData.price || Number(formData.price) <= 0) return "Valid selling price is required.";
      if (!formData.mrp || Number(formData.mrp) <= 0) return "Valid MRP is required.";
      if (Number(formData.price) > Number(formData.mrp)) return "Selling price cannot exceed MRP.";
      if (formData.stockQuantity === '' || Number(formData.stockQuantity) < 0) return "Valid stock quantity is required.";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMessage('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (isDraft) => {
    const error = validateStep(1) || validateStep(2);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        categoryId: Number(formData.categoryId),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim() || formData.shortDescription.trim(),
        petType: formData.petType || 'All Pets',
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold || 5),
        sku: formData.sku.trim()
      };

      if (formData.imageUrl && formData.imageUrl.trim()) {
        payload.images = [{
          imageUrl: formData.imageUrl.trim(),
          isPrimary: true,
          sortOrder: 0
        }];
      }

      const catName = (formData.categoryName || '').toLowerCase();

      // Attach category specific details only if at least one field has value
      if (catName.includes('health') || catName.includes('medicine')) {
        const hd = formData.healthDetails;
        if (hd.dosage || hd.activeIngredients || hd.warnings) {
          payload.healthDetails = hd;
        }
      } else if (catName.includes('food')) {
        const fd = formData.foodDetails;
        if (fd.flavor || fd.ingredients || fd.nutritionalInformation) {
          payload.foodDetails = fd;
        }
      } else if (catName.includes('toy')) {
        const td = formData.toyDetails;
        if (td.material || td.safetyInstructions) {
          payload.toyDetails = td;
        }
      } else if (catName.includes('grooming')) {
        const gd = formData.groomingDetails;
        if (gd.fragrance || gd.volume) {
          payload.groomingDetails = gd;
        }
      } else if (catName.includes('accessor')) {
        const ad = formData.accessoryDetails;
        if (ad.size || ad.color || ad.material) {
          payload.accessoryDetails = ad;
        }
      }

      const response = await vendorProductService.createProduct(payload);
      const productId = response?.id || response?.data?.id;

      if (!isDraft && productId) {
        await vendorProductService.submitForReview(productId);
      }

      alert(`Product ${isDraft ? 'saved as draft' : 'submitted for review'} successfully!`);
      if (onProductAdded) onProductAdded();
    } catch (err) {
      console.error("Error creating product:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setErrorMessage(typeof serverMsg === 'string' ? serverMsg : "Failed to save product. Please verify all required fields.");
    } finally {
      setLoading(false);
    }
  };

  const catName = (formData.categoryName || '').toLowerCase();

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      {/* Wizard Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Add New Product</h2>
            <p className="text-sm text-slate-500 mt-1">Step {step} of 4: {
              step === 1 ? 'Basic Information' :
              step === 2 ? 'Pricing & Inventory' :
              step === 3 ? 'Category Details' : 'Review & Submit'
            }</p>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-2.5 rounded-full transition-all ${
                  s === step ? 'w-8 bg-blue-600' : s < step ? 'w-2.5 bg-emerald-500' : 'w-2.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Royal Canin Adult Dog Food"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Royal Canin"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">SKU (Stock Keeping Unit) *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. PZ-RC-001"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Target Pet Type</label>
              <select
                name="petType"
                value={formData.petType}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="All Pets">All Pets</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Fish">Fish</option>
                <option value="Small Pet">Small Pet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Short Description *</label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="Brief overview of the product for catalog view..."
              rows={3}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              required
            />
          </div>
        </div>
      )}

      {/* Step 2: Pricing & Inventory */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">MRP (₹) *</label>
              <input
                type="number"
                name="mrp"
                min="0"
                step="0.01"
                value={formData.mrp}
                onChange={handleChange}
                placeholder="e.g. 899"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 566"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Initial Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="e.g. 78"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Low Stock Alert Threshold</label>
              <input
                type="number"
                name="lowStockThreshold"
                min="1"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Category Specific Details */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-medium">
            Category: <strong className="capitalize">{formData.categoryName || 'General'}</strong>
          </div>

          {(catName.includes('health') || catName.includes('medicine')) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Dosage Instructions</label>
                <input
                  type="text"
                  value={formData.healthDetails.dosage}
                  onChange={(e) => handleDetailChange('healthDetails', 'dosage', e.target.value)}
                  placeholder="e.g. 1 tablet twice daily"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Active Ingredients</label>
                <input
                  type="text"
                  value={formData.healthDetails.activeIngredients}
                  onChange={(e) => handleDetailChange('healthDetails', 'activeIngredients', e.target.value)}
                  placeholder="e.g. Glucosamine, Chondroitin"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Warnings / Precautions</label>
                <textarea
                  value={formData.healthDetails.warnings}
                  onChange={(e) => handleDetailChange('healthDetails', 'warnings', e.target.value)}
                  placeholder="e.g. Consult a veterinarian before use."
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
            </div>
          )}

          {catName.includes('food') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Flavor</label>
                <input
                  type="text"
                  value={formData.foodDetails.flavor}
                  onChange={(e) => handleDetailChange('foodDetails', 'flavor', e.target.value)}
                  placeholder="e.g. Chicken & Rice, Salmon"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Key Ingredients</label>
                <input
                  type="text"
                  value={formData.foodDetails.ingredients}
                  onChange={(e) => handleDetailChange('foodDetails', 'ingredients', e.target.value)}
                  placeholder="e.g. Real Chicken, Brown Rice, Vegetables"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nutritional Information</label>
                <textarea
                  value={formData.foodDetails.nutritionalInformation}
                  onChange={(e) => handleDetailChange('foodDetails', 'nutritionalInformation', e.target.value)}
                  placeholder="e.g. Protein: 28%, Fat: 16%, Fiber: 4%"
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
            </div>
          )}

          {catName.includes('toy') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Material</label>
                <input
                  type="text"
                  value={formData.toyDetails.material}
                  onChange={(e) => handleDetailChange('toyDetails', 'material', e.target.value)}
                  placeholder="e.g. Natural Rubber, Plush, Rope"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Safety Instructions</label>
                <input
                  type="text"
                  value={formData.toyDetails.safetyInstructions}
                  onChange={(e) => handleDetailChange('toyDetails', 'safetyInstructions', e.target.value)}
                  placeholder="e.g. Supervised play only"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
            </div>
          )}

          {catName.includes('grooming') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Fragrance / Scent</label>
                <input
                  type="text"
                  value={formData.groomingDetails.fragrance}
                  onChange={(e) => handleDetailChange('groomingDetails', 'fragrance', e.target.value)}
                  placeholder="e.g. Lavender, Oatmeal & Aloe"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Volume / Net Weight</label>
                <input
                  type="text"
                  value={formData.groomingDetails.volume}
                  onChange={(e) => handleDetailChange('groomingDetails', 'volume', e.target.value)}
                  placeholder="e.g. 250ml, 500ml"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
            </div>
          )}

          {catName.includes('accessor') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Size</label>
                <input
                  type="text"
                  value={formData.accessoryDetails.size}
                  onChange={(e) => handleDetailChange('accessoryDetails', 'size', e.target.value)}
                  placeholder="e.g. S, M, L, XL"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Color</label>
                <input
                  type="text"
                  value={formData.accessoryDetails.color}
                  onChange={(e) => handleDetailChange('accessoryDetails', 'color', e.target.value)}
                  placeholder="e.g. Navy Blue, Red"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Material</label>
                <input
                  type="text"
                  value={formData.accessoryDetails.material}
                  onChange={(e) => handleDetailChange('accessoryDetails', 'material', e.target.value)}
                  placeholder="e.g. Genuine Leather, Nylon"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
                />
              </div>
            </div>
          )}

          {!catName.includes('health') && !catName.includes('medicine') && !catName.includes('food') && !catName.includes('toy') && !catName.includes('grooming') && !catName.includes('accessor') && (
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-500 text-sm">
              Standard specifications will be automatically configured for {formData.categoryName || 'this category'}. You can proceed to the next step.
            </div>
          )}
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-5">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Product Name</p>
                <p className="font-bold text-slate-800 mt-0.5">{formData.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Brand</p>
                <p className="font-bold text-slate-800 mt-0.5">{formData.brand}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Category</p>
                <p className="font-bold text-slate-800 mt-0.5">{formData.categoryName || 'None'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">SKU</p>
                <p className="font-mono text-xs font-bold text-slate-700 mt-0.5">{formData.sku}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Selling Price</p>
                <p className="font-black text-emerald-600 text-lg mt-0.5">₹{formData.price}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">MRP</p>
                <p className="text-slate-500 line-through mt-0.5">₹{formData.mrp}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Stock Quantity</p>
                <p className="font-bold text-slate-800 mt-0.5">{formData.stockQuantity} units</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Target Pet</p>
                <p className="font-bold text-slate-800 mt-0.5">{formData.petType}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs">
              <p className="text-slate-400 font-bold uppercase mb-1">Description</p>
              <p className="text-slate-600">{formData.shortDescription}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center pt-5 border-t border-slate-100">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}

        <div className="flex items-center gap-3">
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 border border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit for Review
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductWizard;
