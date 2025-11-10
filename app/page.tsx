// app/page.tsx
'use client';

import { useState } from 'react';
import { Upload, Download, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function Home() {
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    let compressed = file;
    if (file.size > 5 * 1024 * 1024) {
      try {
        const options = {
          maxSizeMB: 4,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          initialQuality: 0.7,
        };
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
      const res = await fetch('/api/remove-background', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Processing failed');

      setProcessed(data.processed);
    } catch (err: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'removed-background.png';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Remove Background</h1>
        <p className="text-gray-600 mb-8">Upload an image to remove the background</p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 hover:border-blue-400 transition">
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
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-3" />
                <p className="text-lg font-medium text-gray-700">Processing...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-lg font-medium text-gray-700">Drop your image here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </>
            )}
          </label>
        </div>

        {error && (
          <p className="text-red-600 mb-4">{error}</p>
        )}

        {processed && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your image is ready!</h2>
            <div className="relative rounded-lg overflow-hidden max-w-md mx-auto mb-4">
              <img
                src={processed}
                alt="Result"
                className="w-full h-auto max-h-64 object-contain"
              />
            </div>
            <button
              onClick={() => handleDownload(processed)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Download PNG
            </button>
          </div>
        )}

        {/* Sample images below like remove.bg */}
        <div className="grid grid-cols-4 gap-4 mt-16">
          <img src="/sample1.jpg" alt="Sample 1" className="rounded-md" />
          <img src="/sample2.jpg" alt="Sample 2" className="rounded-md" />
          <img src="/sample3.jpg" alt="Sample 3" className="rounded-md" />
          <img src="/sample4.jpg" alt="Sample 4" className="rounded-md" />
        </div>
      </div>
    </div>
  );
}
