'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUploadThing } from '@/utils/uploadthing';

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('birthday');
  const [description, setDescription] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (error) => {
      alert(`Upload failed: ${error.message}`);
      setSaving(false);
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setName(data.name);
          setPrice(data.price.toString());
          setCategory(data.category);
          setDescription(data.description);
          setImageURL(data.image_url);
          setImagePreview(data.image_url);
        }
      } catch (error) {
        console.error('Error fetching product', error);
        alert('Product not found');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = imageURL;

      // 1. Upload new image if selected
      if (newImage) {
        const res = await startUpload([newImage]);
        if (res && res[0]) {
          finalImageUrl = res[0].url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // 2. Update product record
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          price: parseFloat(price),
          category,
          description,
          image_url: finalImageUrl
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Failed to update product', error);
      alert(error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading product details...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
          <p className="text-sm text-gray-500 mt-1">Update the details for "{name}"</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={20} />
              Product updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
              <input 
                type="number" 
                required 
                min="0" 
                step="0.01"
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white transition-all text-gray-900"
              >
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
                <option value="housewarming">Housewarming</option>
                <option value="corporate">Corporate</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              rows={4} 
              required 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-gray-900"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-colors ${imagePreview ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400'}`}>
              <div className="space-y-1 text-center w-full">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 rounded-lg object-contain shadow-md" />
                    <label className="absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 cursor-pointer transition-colors">
                      <Upload size={16} />
                      <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </label>
                  </div>
                ) : (
                  <div className="py-8 text-gray-400">No image available</div>
                )}
                <p className="text-xs text-gray-500 mt-2">Click the icon to replace the current image</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link 
              href="/dashboard"
              className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
             <button 
              type="submit" 
              disabled={saving || isUploading || success} 
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all transform active:scale-95"
            >
              {isUploading ? 'Uploading Image...' : saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
