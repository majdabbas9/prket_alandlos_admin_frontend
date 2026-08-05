import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '@/api';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  dateOfUpload: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // The API returns { success: true, data: [...] }
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('Failed to delete product');
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
    } else {
      setCurrentProduct({ title: '', price: 0, category: 'General', description: '' });
    }
    setFile(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData();
    if (currentProduct?.title) formData.append('title', currentProduct.title);
    if (currentProduct?.price !== undefined) formData.append('price', String(currentProduct.price));
    if (currentProduct?.category) formData.append('category', currentProduct.category);
    if (currentProduct?.description) formData.append('description', currentProduct.description);
    if (file) formData.append('image', file);

    try {
      if (currentProduct?.id) {
        // Update
        await api.postFormData(`/products/${currentProduct.id}`, formData); // Assuming PUT with form-data might be tricky, wait, fetch API handles PUT with FormData if method is PUT. Wait! Our postFormData is just POST.
        // Let's use standard fetch for PUT FormData if needed, but standard HTML form with file usually uses POST. In REST it's PUT.
        await fetch(`${API_BASE_URL}/products/${currentProduct.id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        // Add
        await api.postFormData('/products', formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product', err);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="container-wide py-12 mt-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-display text-walnut-900">Manage Products</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden flex flex-col">
            <div className="h-48 bg-sand-100 relative">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE_URL.replace('/api', '')}${product.imageUrl}`} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-walnut-900 line-clamp-1">{product.title || 'Untitled'}</h3>
                <span className="font-medium text-walnut-700">${product.price || 0}</span>
              </div>
              <p className="text-sm text-ink-500 mb-4">{product.category}</p>
              <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-sand-100">
                <button 
                  onClick={() => handleOpenModal(product)}
                  className="p-2 text-ink-600 hover:text-walnut-700 hover:bg-sand-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-ink-500 bg-white rounded-2xl border border-sand-200">
            No products found. Click "Add Product" to create one.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-sand-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-walnut-900">
                {currentProduct?.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-400 hover:text-ink-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={currentProduct?.title || ''} 
                  onChange={e => setCurrentProduct(p => ({...p, title: e.target.value}))}
                  className="w-full rounded-xl border-sand-300 focus:border-walnut-500 focus:ring-walnut-500 p-2 border" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Price</label>
                  <input 
                    type="number" 
                    value={currentProduct?.price || 0} 
                    onChange={e => setCurrentProduct(p => ({...p, price: parseFloat(e.target.value)}))}
                    className="w-full rounded-xl border-sand-300 focus:border-walnut-500 focus:ring-walnut-500 p-2 border" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={currentProduct?.category || ''} 
                    onChange={e => setCurrentProduct(p => ({...p, category: e.target.value}))}
                    className="w-full rounded-xl border-sand-300 focus:border-walnut-500 focus:ring-walnut-500 p-2 border" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
                <textarea 
                  value={currentProduct?.description || ''} 
                  onChange={e => setCurrentProduct(p => ({...p, description: e.target.value}))}
                  className="w-full rounded-xl border-sand-300 focus:border-walnut-500 focus:ring-walnut-500 p-2 border h-24" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
                {currentProduct?.imageUrl && !file && (
                  <p className="text-xs text-ink-500 mt-2">Current image will be kept if no new file is selected.</p>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-ink-600 hover:bg-sand-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
