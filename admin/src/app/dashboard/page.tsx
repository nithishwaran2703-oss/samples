'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit, Trash2, RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setSelectedIds([]); // Clear selection on refresh
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product', error);
        alert('Failed to delete product');
      }
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products? This cannot be undone.`)) {
      setIsDeleting(true);
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', selectedIds);

        if (error) throw error;
        
        // Optimistic update
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        alert('Selected products deleted successfully');
      } catch (error) {
        console.error('Error deleting multiple products', error);
        alert('Failed to delete some products');
      } finally {
        setIsDeleting(false);
        fetchProducts();
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm md:text-base text-gray-500">Manage your store's inventory and categories.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={deleteSelected}
              disabled={isDeleting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-semibold"
            >
              {isDeleting ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
              Delete ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={fetchProducts}
            disabled={isRefreshing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link 
            href="/dashboard/add"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4 font-semibold">Preview</th>
                <th className="px-6 py-4 font-semibold">Product Details</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-400">
                        <Plus size={32} />
                      </div>
                      <p className="text-lg font-medium text-gray-900">No products yet</p>
                      <p className="mt-1">Add your first product to see it appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50/80 transition-colors ${selectedIds.includes(product.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{product.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/dashboard/edit/${product.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
