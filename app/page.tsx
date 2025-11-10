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
    <main className="bg-gray-50 text-gray-900 font-sans min-h-screen flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 text-center py-20">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          Remove Image Background Instantly
        </h1>
        <p className="text-gray-600 text-lg sm:text-xl mb-8 max-w-xl">
          Upload your images and get transparent backgrounds in seconds.
        </p>

        {/* Upload / Drop Zone Card */}
        <div className="w-full max-w-lg p-10 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 transition-shadow shadow-md hover:shadow-lg cursor-pointer">
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
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-700 font-medium">Processing...</p>
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0-6l-4 4m4-4l4 4M12 4v4"
                  />
                </svg>
                <p className="text-gray-500 mb-4">Drag & Drop your image here</p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 duration-200">
                  Upload Image
                </button>
              </>
            )}
          </label>
        </div>

        {error && <p className="text-red-600 mt-6">{error}</p>}

        {processed && (
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your image is ready!</h2>
            <div className="max-w-md mx-auto mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <img src={processed} alt="Result" className="w-full h-auto" />
            </div>
            <button
              onClick={() => handleDownload(processed)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Download PNG
            </button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 w-full">
        <div className="max-w-6xl mx-auto px-4 grid gap-10 md:grid-cols-3 text-center">
          <div>
            <h3 className="text-xl font-bold mb-2">Fast & Reliable</h3>
            <p className="text-gray-600">Remove backgrounds in seconds with a fully automated tool.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">High Quality</h3>
            <p className="text-gray-600">Preserve edges and details for professional results every time.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Free & Easy</h3>
            <p className="text-gray-600">Upload, process, and download your image with just one click.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm w-full">
        &copy; 2025 Remove Background Tech. All rights reserved.
      </footer>
    </main>
  );
}
