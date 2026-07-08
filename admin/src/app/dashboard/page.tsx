'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit, Trash2, RefreshCw, Plus, Search, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Deterministic unique product number generator (produces double or triple digit numbers)
  const getProductNumber = (id: string): string => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const num = Math.abs(hash) % 990 + 10; // Generates a number between 10 and 999
    return `#${num}`;
  };

  // Live filter by Name, Category, or #number (with or without # prefix)
  const filteredProducts = products.filter(product => {
    if (selectedCategoryFilter !== 'all' && product.category !== selectedCategoryFilter) {
      return false;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const prodNum = getProductNumber(product.id).toLowerCase();
    const prodName = product.name.toLowerCase();
    const prodCat = product.category.toLowerCase();

    return (
      prodName.includes(query) ||
      prodCat.includes(query) ||
      prodNum.includes(query) ||
      prodNum.replace('#', '').includes(query)
    );
  });

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
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteProduct = async (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    if (!productToDelete) return;

    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Safely trigger unlinking/deletion from UploadThing in the background
        if (productToDelete.image_url) {
          fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: [productToDelete.image_url] })
          }).catch(err => console.error('UploadThing delete error:', err));
        }

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
        // Collect image URLs of selected products to delete from UploadThing
        const urlsToDelete = products
          .filter(p => selectedIds.includes(p.id) && p.image_url)
          .map(p => p.image_url);

        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', selectedIds);

        if (error) throw error;

        // Trigger bulk unlinking/deletion from UploadThing in the background
        if (urlsToDelete.length > 0) {
          fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: urlsToDelete })
          }).catch(err => console.error('UploadThing bulk delete error:', err));
        }
        
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
        {/* Search & Filter Container */}
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/20 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by name, category, or #number (e.g. wedding, #120)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-gray-900 transition-all placeholder:text-gray-400 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="text-xs font-semibold text-gray-400 flex items-center gap-2">
              <span>Showing {filteredProducts.length} of {products.length} products</span>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 bg-white min-w-[200px]"
            >
              <option value="all">All Categories</option>
              <option value="birthday-combo-pack">Birthday Combo Pack</option>
              <option value="1st-birthday">1st Birthday</option>
              <option value="babyshower">Babyshower</option>
              <option value="anniversary">Anniversary</option>
              <option value="haldi-mehandi">Haldi & Mehandi</option>
              <option value="love-theme">Love Theme</option>
              <option value="office-decoration">Office Decoration</option>
              <option value="car-decoration">Car Decoration</option>
              <option value="decoration-booking">Decoration Booking</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4 font-semibold">Preview</th>
                <th className="px-6 py-4 font-semibold">Product Details</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-400">
                        {searchQuery ? <Search size={32} /> : <Plus size={32} />}
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        {searchQuery ? 'No matching products found' : 'No products yet'}
                      </p>
                      <p className="mt-1">
                        {searchQuery ? 'Try adjusting your search keywords or filter terms.' : 'Add your first product to see it appear here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
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
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold font-mono border border-gray-200 whitespace-nowrap shadow-sm">
                          {getProductNumber(product.id)}
                        </span>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-[200px] font-mono">{product.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {product.category}
                      </span>
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
