import React, { useState, useEffect } from 'react';
import { vendorProductService } from '../../services/vendorProductService';

const VendorProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await vendorProductService.getVendorProducts(0, 50, 'createdAt');
      setProducts(data.content || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (id, currentStock) => {
    const newStock = prompt("Enter new stock quantity:", currentStock);
    if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
      try {
        await vendorProductService.updateStock(id, parseInt(newStock));
        fetchProducts();
      } catch (error) {
        alert("Failed to update stock");
      }
    }
  };

  const handleSubmitReview = async (id) => {
    if (window.confirm("Submit product for admin review?")) {
      try {
        await vendorProductService.submitForReview(id);
        fetchProducts();
      } catch (error) {
        alert("Failed to submit for review");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await vendorProductService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        alert("Cannot delete an approved product.");
      }
    }
  };

  if (loading) return <div className="p-8">Loading products...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add New Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 text-sm font-semibold text-gray-600">Product Name</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Category</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Price</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Stock</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-3 text-sm font-semibold text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">No products found. Start by adding one!</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded mr-3 overflow-hidden">
                        {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-700">{product.categoryName}</td>
                  <td className="p-3 text-sm text-gray-700">₹{product.price}</td>
                  <td className="p-3">
                    <span className={`text-sm px-2 py-1 rounded-full ${product.stockQuantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      product.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      product.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                      product.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => handleStockUpdate(product.id, product.stockQuantity)} className="text-blue-600 hover:text-blue-800 text-sm">Stock</button>
                      {(product.status === 'DRAFT' || product.status === 'REJECTED') && (
                        <>
                          <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
                          <button onClick={() => handleSubmitReview(product.id)} className="text-green-600 hover:text-green-800 text-sm">Submit</button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorProductDashboard;
