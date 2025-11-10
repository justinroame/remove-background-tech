// app/page.tsx
'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function Home() {
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    let compressed = file;
    if (file.size > 5 * 1024 * 1024) {
      try {
        const options = { maxSizeMB: 4, maxWidthOrHeight: 1024, useWebWorker: true };
        compressed = await imageCompression(file, options);
      } catch {
        setError('Compression failed.');
        return;
      }
    }

    setError(null);
    setLoading(true);

    const form = new FormData();
    form.append('image', compressed);

    try {
      const res = await fetch('/api/remove-background', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setProcessed(data.processed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'removed-background.png';
    a.click();
  };

  return (
    <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Upload an image to remove the background
        </h1>

        {/* Upload Zone – EXACT remove.bg */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-8 hover:border-blue-400 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
                <p className="text-xl text-gray-700">Processing...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-2xl font-medium text-gray-700 mb-2">Drop your image here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </>
            )}
          </label>
        </div>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        {processed && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your image is ready!</h2>
            <div className="relative rounded-lg overflow-hidden max-w-md mx-auto mb-4 border border-gray-200">
              <img src={processed} alt="Result" className="w-full h-auto object-contain" />
            </div>
            <button
              onClick={() => handleDownload(processed)}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              Download PNG
            </button>
          </div>
        )}

        {/* Sample Images – EXACT remove.bg */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="rounded-md overflow-hidden mb-2 border border-gray-200">
              <img src="/sample1.jpg" alt="Person" className="w-full h-32 object-cover" />
            </div>
            <p className="text-sm text-gray-600">Person</p>
          </div>
          <div className="text-center">
            <div className="rounded-md overflow-hidden mb-2 border border-gray-200">
              <img src="/sample2.jpg" alt="Product" className="w-full h-32 object-cover" />
            </div>
            <p className="text-sm text-gray-600">Product</p>
          </div>
          <div className="text-center">
            <div className="rounded-md overflow-hidden mb-2 border border-gray-200">
              <img src="/sample3.jpg" alt="Animal" className="w-full h-32 object-cover" />
            </div>
            <p className="text-sm text-gray-600">Animal</p>
          </div>
          <div className="text-center">
            <div className="rounded-md overflow-hidden mb-2 border border-gray-200">
              <img src="/sample4.jpg" alt="Object" className="w-full h-32 object-cover" />
            </div>
            <p className="text-sm text-gray-600">Object</p>
          </div>
        </div>
      </div>
    </div>
  );
}
