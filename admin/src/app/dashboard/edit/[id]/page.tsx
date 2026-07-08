'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUploadThing } from '@/utils/uploadthing';

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('birthday-combo-pack');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const generateAIMetadata = async (source: File | string, currentCategory: string) => {
    setIsGenerating(true);
    setName('');
    setDescription('');
    setAltText('');
    try {
      let imageParam = '';
      let fileNameParam = 'product_image';

      if (typeof source === 'string') {
        imageParam = source;
      } else {
        fileNameParam = source.name;
        imageParam = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(source);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      }

      const res = await fetch('/api/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageParam,
          fileName: fileNameParam,
          category: currentCategory
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) setName(data.title);
        if (data.description) setDescription(data.description);
        if (data.altText) setAltText(data.altText);
      }
    } catch (err) {
      console.error('Failed to generate AI metadata', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const { startUpload, isUploading } = useUploadThing("productImage", {
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
          let desc = data.description || '';
          let parsedAlt = '';
          if (desc.includes('[Alt Text:')) {
            const parts = desc.split('[Alt Text:');
            desc = parts[0].trim();
            parsedAlt = parts[1].replace(']', '').trim();
          }

          setName(data.name);
          setCategory(data.category);
          setDescription(desc);
          setAltText(parsedAlt);
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
      generateAIMetadata(file, category);
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
          const oldImageUrl = imageURL;
          finalImageUrl = res[0].url;

          // Trigger unlinking/deletion of the old replaced image in the background
          if (oldImageUrl) {
            fetch('/api/delete-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ urls: [oldImageUrl] })
            }).catch(err => console.error('UploadThing delete old image error:', err));
          }
        } else {
          throw new Error('Image upload failed');
        }
      }

      // 2. Update product record
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          price: 0,
          category,
          description: description + (altText ? `\n\n[Alt Text: ${altText}]` : ''),
          image_url: finalImageUrl
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      console.warn('Failed to update product', error);
      alert(`Failed to update product: ${error.message || error.details || JSON.stringify(error)}`);
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
              <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>Product Name</span>
                {isGenerating && <span className="text-xs text-blue-500 font-medium animate-pulse">AI is writing...</span>}
              </label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder={isGenerating ? "✨ AI is generating Title..." : "e.g. Traditional Brass Lamp"}
                disabled={isGenerating}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 ${isGenerating ? 'animate-pulse bg-blue-50/20 border-blue-300 text-blue-400' : ''}`} 
              />
            </div>
            

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white transition-all text-gray-900"
              >
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Description</span>
              {isGenerating && <span className="text-xs text-blue-500 font-medium animate-pulse">AI is writing...</span>}
            </label>
            <textarea 
              rows={4} 
              required 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder={isGenerating ? "✨ AI is writing description..." : "Write a brief description of the product..."}
              disabled={isGenerating}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-gray-900 ${isGenerating ? 'animate-pulse bg-blue-50/20 border-blue-300 text-blue-400' : ''}`}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Image Alt Text (SEO)</span>
              {isGenerating ? (
                <span className="text-xs text-blue-500 font-medium animate-pulse">AI is writing...</span>
              ) : (
                <span className="text-xs font-normal text-gray-400">Guarantees distinct SEO metadata for this image</span>
              )}
            </label>
            <input 
              type="text" 
              required 
              value={altText} 
              onChange={e => setAltText(e.target.value)} 
              placeholder={isGenerating ? "✨ AI is generating Alt Text..." : "e.g. Elegant decorative item for festive styling"}
              disabled={isGenerating}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 ${isGenerating ? 'animate-pulse bg-blue-50/20 border-blue-300 text-blue-400' : ''}`} 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-colors ${imagePreview ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400'}`}>
              <div className="space-y-1 text-center w-full">
                {imagePreview ? (
                  <div className="relative inline-block w-full">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 rounded-lg object-contain shadow-md" />
                    <label className="absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 cursor-pointer transition-colors">
                      <Upload size={16} />
                      <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </label>
                    {(newImage || imageURL) && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => generateAIMetadata(newImage || imageURL, category)}
                          disabled={isGenerating}
                          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-xs shadow-md disabled:opacity-50 active:scale-95 transform cursor-pointer"
                        >
                          {isGenerating ? <Loader2 size={12} className="animate-spin" /> : '✨'}
                          {isGenerating ? 'Generating Metadata...' : 'Regenerate AI Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-gray-400">No image available</div>
                )}
                <p className="text-xs text-gray-500 mt-2">Click the icon to replace the current image</p>
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
              disabled={saving || isUploading || success} 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 shadow-xl shadow-blue-200 transition-all transform active:scale-95 text-sm md:text-base"
            >
              {isUploading ? 'Uploading Image...' : saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
