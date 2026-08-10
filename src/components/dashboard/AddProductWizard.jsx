import React, { useState } from 'react';
import { vendorProductService } from '../../services/vendorProductService';

const AddProductWizard = ({ onCancel, onProductAdded }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    shortDescription: '',
    petType: [],
    price: '',
    mrp: '',
    stockQuantity: '',
    sku: '',
    categoryName: '', // internal use for dynamic fields
    healthDetails: {},
    foodDetails: {}
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const categoryName = e.target.options[e.target.selectedIndex].text;
    setFormData(prev => ({ ...prev, categoryId, categoryName }));
  };

  const handleHealthDetailChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      healthDetails: { ...prev.healthDetails, [name]: value }
    }));
  };

  const handleSubmit = async (isDraft) => {
    try {
      const payload = { ...formData };
      // cleanup internal fields
      delete payload.categoryName;
      if (payload.categoryName !== 'Health') delete payload.healthDetails;
      if (payload.categoryName !== 'Food') delete payload.foodDetails;

      const response = await vendorProductService.createProduct(payload);
      if (!isDraft) {
        await vendorProductService.submitForReview(response.id);
      }
      alert(`Product ${isDraft ? 'saved as draft' : 'submitted for review'} successfully!`);
      if (onProductAdded) onProductAdded();
    } catch (error) {
      alert("Failed to save product. Please check required fields.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product - Step {step} of 4</h2>
      
      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleCategoryChange} className="mt-1 w-full p-2 border rounded" required>
                <option value="">Select Category</option>
                <option value="1">Food</option>
                <option value="2">Toys</option>
                <option value="3">Health</option>
                <option value="4">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU *</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Short Description *</label>
            <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="mt-1 w-full p-2 border rounded" rows="3" required></textarea>
          </div>
        </div>
      )}

      {/* Step 2: Pricing & Inventory */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Pricing & Inventory</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">MRP (₹) *</label>
              <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Selling Price (₹) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Category Specific */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Category Specific Details ({formData.categoryName})</h3>
          
          {formData.categoryName === 'Health' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dosage</label>
                <input type="text" name="dosage" value={formData.healthDetails.dosage || ''} onChange={handleHealthDetailChange} className="mt-1 w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Active Ingredients</label>
                <input type="text" name="activeIngredients" value={formData.healthDetails.activeIngredients || ''} onChange={handleHealthDetailChange} className="mt-1 w-full p-2 border rounded" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Warnings</label>
                <textarea name="warnings" value={formData.healthDetails.warnings || ''} onChange={handleHealthDetailChange} className="mt-1 w-full p-2 border rounded" rows="2"></textarea>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 text-gray-600 rounded">
              Additional fields for {formData.categoryName || 'this category'} will be displayed here.
            </div>
          )}
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Review Product</h3>
          <div className="bg-gray-50 p-4 rounded text-sm">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Category:</strong> {formData.categoryName}</p>
            <p><strong>Price:</strong> ₹{formData.price} (MRP: ₹{formData.mrp})</p>
            <p><strong>Stock:</strong> {formData.stockQuantity}</p>
            <p><strong>SKU:</strong> {formData.sku}</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button onClick={handleBack} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Back</button>
        ) : (
          <button onClick={onCancel} className="px-4 py-2 border rounded text-red-600 hover:bg-red-50">Cancel</button>
        )}
        
        <div className="space-x-3">
          {step < 4 ? (
            <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Next Step</button>
          ) : (
            <>
              <button onClick={() => handleSubmit(true)} className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">Save as Draft</button>
              <button onClick={() => handleSubmit(false)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit for Review</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductWizard;
