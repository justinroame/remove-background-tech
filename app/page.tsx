// app/page.tsx
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setProcessed(null);

    // Optional: Compress large files
    let uploadFile = file;
    if (file.size > 5 * 1024 * 1024) {
      try {
        const options = { maxSizeMB: 4, maxWidthOrHeight: 1024, useWebWorker: true };
        uploadFile = await imageCompression(file, options);
      } catch {
        setError('Compression failed.');
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('image', uploadFile); // Must match route.ts

      const res = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Processing failed');
      }

      const blob = await res.blob();
      setProcessed(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message || 'Failed to process image.');
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <main className="bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <h1 className="text-lg font-semibold text-gray-800 tracking-tight">Remove Background Tech</h1>
        <nav className="flex gap-6 text-gray-500 text-sm">
          <a href="#" className="hover:text-gray-700 transition-colors">Pricing</a>
          <a href="#" className="hover:text-gray-700 transition-colors">Login</a>
          <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Sign Up</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-24 animate-fadeIn">
        <div className="max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            Remove Image Background Instantly
          </h2>
          <p className="text-gray-500 text-lg sm:text-xl mb-10">
            Upload your images and get transparent backgrounds in seconds.
          </p>
        </div>

        {/* Upload Card */}
        <div className="max-w-lg w-full bg-white/90 backdrop-blur-md p-12 border-2 border-dashed border-gray-300 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500">Processing your image...</p>
            </div>
          ) : processed ? (
            <div className="flex flex-col items-center gap-4">
              <img src={processed} alt="Processed" className="max-w-full rounded-lg shadow-md" />
              <a
                href={processed}
                download="background-removed.png"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 duration-200"
              >
                Download Image
              </a>
            </div>
          ) : (
            <>
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0-6l-4 4m4-4l4 4M12 4v4" />
                </svg>
                <p className="mb-4">Drag & Drop your image here or click to upload</p>
                <input id="file-upload" type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                <span className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 duration-200">
                  Upload Image
                </span>
              </label>
            </>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 w-full animate-fadeInSlow">
        <div className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-3 text-center">
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Fast & Reliable</h3>
            <p className="text-gray-500">Remove backgrounds in seconds with a fully automated tool.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">High Quality</h3>
            <p className="text-gray-500">Preserve edges and details for professional results every time.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Free & Easy</h3>
            <p className="text-gray-500">Upload, process, and download your image with one click.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 text-center text-gray-400 text-sm border-t border-gray-100">
        &copy; {new Date().getFullYear()} Remove Background Tech. All rights reserved.
      </footer>
    </main>
  );
}
