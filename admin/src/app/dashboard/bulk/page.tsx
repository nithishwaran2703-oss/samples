'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle2, ArrowLeft, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { useUploadThing } from '@/utils/uploadthing';

interface PendingUpload {
  file: File;
  preview: string;
  name: string;
  category: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function BulkUpload() {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalCategory, setGlobalCategory] = useState('birthday');
  const router = useRouter();

  const { startUpload, isUploading: isUTUploading } = useUploadThing("bulkProductImage", {
    onUploadError: (error) => {
      alert(`Upload failed: ${error.message}`);
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPending = newFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name.split('.')[0].replace(/[-_]/g, ' '),
        category: globalCategory,
        status: 'pending' as const
      }));
      setPendingUploads(prev => [...prev, ...newPending]);
    }
  };

  const removeFile = (index: number) => {
    setPendingUploads(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateItem = (index: number, updates: Partial<PendingUpload>) => {
    setPendingUploads(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
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
          }, 'image/jpeg', 0.7); // 70% quality
        };
      };
    });
  };

  const uploadAll = async () => {
    if (pendingUploads.length === 0) return;
    
    setIsUploading(true);
    
    // Filter out already successful uploads
    const toUpload = pendingUploads.filter(item => item.status !== 'success');
    
    try {
      // 1. COMPRESS IMAGES FIRST for massive speedup
      console.log('Compressing images...');
      const compressedFiles = await Promise.all(toUpload.map(item => compressImage(item.file)));
      
      // 2. Start the actual upload
      console.log('Starting upload for files:', compressedFiles.length);
      const res = await startUpload(compressedFiles);
      
      console.log('Upload response:', res);
      if (!res) return; // onUploadError will handle the alert

      // Process all uploaded files in parallel for maximum speed
      await Promise.all(res.map(async (uploadedFile, i) => {
        const pendingItem = toUpload[i];
        if (!pendingItem || !uploadedFile) return;

        const globalIndex = pendingUploads.findIndex(item => item.file === pendingItem.file);

        if (globalIndex !== -1) {
          updateItem(globalIndex, { status: 'uploading' });

          try {
            const fileUrl = uploadedFile.url;
            if (!fileUrl) throw new Error('Missing file URL from upload response');

            // Insert into Supabase DB
            const { error: insertError } = await supabase
              .from('products')
              .insert([{
                name: pendingItem.name,
                price: 0,
                category: pendingItem.category,
                description: `Bulk uploaded product: ${pendingItem.name}`,
                image_url: fileUrl
              }]);

            if (insertError) throw insertError;

            updateItem(globalIndex, { status: 'success' });
          } catch (error: any) {
            console.error('DB Insert failed for', pendingItem.name, error);
            updateItem(globalIndex, { status: 'error', error: error.message });
          }
        }
      }));
    } catch (error: any) {
      console.error('Bulk Upload Error details:', error);
      alert(`Bulk upload failed: ${error.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setIsUploading(false);
    }
  };

  const successCount = pendingUploads.filter(u => u.status === 'success').length;

  return (
    <div className="max-w-5xl mx-auto py-4 md:py-8 px-4 md:px-0">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors group text-sm md:text-base">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-200 bg-gray-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Bulk Image Upload</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Upload multiple images at once to create products quickly.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select 
              value={globalCategory} 
              onChange={e => setGlobalCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 bg-white"
            >
              <option value="birthday">Default: Birthday</option>
              <option value="wedding">Default: Wedding</option>
              <option value="housewarming">Default: Housewarming</option>
              <option value="corporate">Default: Corporate</option>
              <option value="custom">Default: Custom</option>
            </select>
            
            <button 
              onClick={uploadAll}
              disabled={isUploading || isUTUploading || pendingUploads.length === 0 || successCount === pendingUploads.length}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 text-sm md:text-base"
            >
              {(isUploading || isUTUploading) ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {(isUploading || isUTUploading) ? 'Uploading...' : `Upload ${pendingUploads.length} Products`}
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {pendingUploads.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl py-12 md:py-20 text-center px-4">
              <div className="bg-blue-50 p-4 md:p-6 rounded-full inline-block mb-4 text-blue-500">
                <ImageIcon size={40} className="md:w-12 md:h-12" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-gray-900">Select Multiple Images</h4>
              <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-xs mx-auto">Drop your product images here or click the button below.</p>
              <label className="mt-6 inline-flex items-center gap-2 px-6 md:px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 cursor-pointer transition-all text-sm md:text-base">
                <Plus size={20} />
                <span>Select Images</span>
                <input type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {pendingUploads.map((item, index) => (
                  <div key={index} className={`relative bg-gray-50 rounded-xl border p-3 md:p-4 transition-all ${item.status === 'success' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                    <div className="aspect-square rounded-lg overflow-hidden mb-4 relative">
                      <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />
                      {(item.status === 'uploading' || isUTUploading) && item.status !== 'success' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 size={32} className="text-white animate-spin" />
                        </div>
                      )}
                      {item.status === 'success' && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="bg-white rounded-full p-2 text-green-500 shadow-lg">
                            <CheckCircle2 size={32} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={e => updateItem(index, { name: e.target.value })}
                        className="w-full text-sm font-bold bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1 text-gray-900"
                        placeholder="Product Name"
                      />
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Category:</span>
                        <select 
                          value={item.category}
                          onChange={e => updateItem(index, { category: e.target.value })}
                          className="bg-transparent font-medium text-blue-600 outline-none cursor-pointer"
                        >
                          <option value="birthday">Birthday</option>
                          <option value="wedding">Wedding</option>
                          <option value="housewarming">Housewarming</option>
                          <option value="corporate">Corporate</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    {item.status === 'pending' && (
                      <button 
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 p-1.5 rounded-full shadow-md border border-gray-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                    
                    {item.status === 'error' && (
                      <p className="text-[10px] text-red-500 mt-2 font-medium">{item.error}</p>
                    )}
                  </div>
                ))}
                
                <label className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[250px] md:min-h-[300px]">
                  <div className="bg-gray-100 p-3 rounded-full text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 mt-3">Add More</span>
                  <input type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
                </label>
              </div>

              {successCount === pendingUploads.length && successCount > 0 && (
                <div className="flex justify-center pt-8">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200"
                  >
                    Finish & View Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
