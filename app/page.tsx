// app/page.tsx
'use client';

import { useState } from 'react';
import { Upload, Download, Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Show original preview
    setOriginal(URL.createObjectURL(file));
    setProcessed(null);
    setError(null);
    setLoading(true);

    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch('/api/remove-background', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Processing failed');
      }

      setProcessed(data.processed);
    } catch (err: any) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Remove Background
          </h1>
          <p className="text-lg text-gray-600">Upload any image → Get transparent PNG instantly</p>
        </div>

        {/* Upload Zone */}
        <label
          htmlFor="dropzone-file"
          className={`
            relative flex flex-col items-center justify-center w-full h-64 
            border-4 border-dashed rounded-2xl cursor-pointer
            bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all
            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          <input
            id="dropzone-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            disabled={loading}
          />

          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-3" />
              <p className="text-lg font-medium text-gray-700">Removing background...</p>
            </div>
          ) : (
            <>
              <Upload className="w-14 h-14 mb-4 text-indigo-600" />
              <p className="text-lg font-medium text-gray-700">Drop image here or click to upload</p>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP • Max 10MB</p>
            </>
          )}
        </label>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3
