'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUploadThing } from '@/utils/uploadthing';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('birthday');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        await saveToSupabase(res[0].url);
      }
    },
    onUploadError: (error) => {
      alert(`Upload failed: ${error.message}`);
      setLoading(false);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large (max 5MB)');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const saveToSupabase = async (url: string) => {
    try {
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          name,
          price: parseFloat(price),
          category,
          description,
          image_url: url
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Database Error:', error);
      alert(`Error saving to database: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8); // 80% quality for single uploads
        };
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image first!');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const compressedImage = await compressImage(image);
      const res = await startUpload([compressedImage]);
      console.log('Single upload response:', res);
    } catch (error: any) {
      console.error('Upload Process Error Details:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}. Check console for details.`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 md:py-8 px-4 md:px-0">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors group text-sm md:text-base">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Add New Product</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Provide the details to add this item to your collection.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 md:space-y-8">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 md:py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 text-sm md:text-base">
              <CheckCircle2 size={24} className="shrink-0" />
              <div className="font-medium">Product added successfully! Redirecting...</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Product Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Traditional Brass Lamp"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 text-sm md:text-base" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Price (₹)</label>
              <input 
                type="number" 
                required 
                min="0" 
                step="0.01"
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 text-sm md:text-base" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white transition-all text-gray-900 text-sm md:text-base"
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
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea 
              rows={4} 
              required 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Write a brief description of the product..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-gray-900 text-sm md:text-base"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Product Image</label>
            <div className={`mt-1 flex justify-center px-4 md:px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all ${imagePreview ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400'}`}>
              <div className="space-y-1 text-center w-full">
                {imagePreview ? (
                  <div className="relative inline-block w-full">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 md:h-56 rounded-lg object-contain shadow-lg" />
                    <button 
                      type="button"
                      onClick={() => { setImage(null); setImagePreview(null); }}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="py-6 md:py-10">
                    <div className="bg-gray-100 p-3 md:p-4 rounded-full inline-block mb-4 text-gray-400">
                      <Upload size={28} />
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer font-bold text-blue-600 hover:text-blue-500 transition-colors">
                        <span>Click here to upload product image</span>
                        <input type="file" required accept="image/*" className="sr-only" onChange={handleImageChange} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Maximum file size: 5MB (JPG, PNG, WEBP)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4 pt-6 border-t border-gray-100">
            <Link 
              href="/dashboard"
              className="w-full md:w-auto text-center px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading || isUploading || success} 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 shadow-xl shadow-blue-200 transition-all transform active:scale-95"
            >
              {(loading || isUploading) && <Loader2 size={20} className="animate-spin" />}
              {isUploading ? 'Uploading Image...' : loading ? 'Creating Product...' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
