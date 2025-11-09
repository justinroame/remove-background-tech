// app/page.tsx
// FULL FILE REBUILD: 2025-11-09-1600
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Remove Background
          </h1>
          <p className="text-lg text-gray-600">Upload any image → Get transparent PNG instantly</p>
        </div>

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

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {(original || processed) && (
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {original && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Original</h2>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={original} alt="Original" className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            {processed && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-800">Result</h2>
                  <a
                    href={processed}
                    download="removed-background.png"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </a>
                </div>
                <div
                  className="relative aspect-video rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: 'repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%)',
                    backgroundSize: '30px 30px',
                  }}
                >
                  <img src={processed} alt="Background removed" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
