// app/remove/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, Download } from 'lucide-react';

export default function RemoveBGPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('') ;
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadAI = async () => {
      if (window.removeBackground) {
        setAiReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/browser.js';
      script.async = true;

      script.onload = () => {
        setAiReady(true);
      };

      script.onerror = () => {
        alert('Failed to load AI. Please refresh the page or try a different browser.');
      };

      document.head.appendChild(script);
    };

    loadAI();
  }, []);

  const handleUpload = async () => {
    if (!file || !aiReady) return;
    setLoading(true);
    setResult('');
    setPreview(URL.createObjectURL(file));

    try {
      const resultBlob = await window.removeBackground(file);
      const resultUrl = URL.createObjectURL(resultBlob);
      setResult(resultUrl);
    } catch (err: any) {
      console.error(err);
      alert('Failed to remove background. Try a different image or refresh.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-5xl font-bold mb-4">Remove Background</h1>
        <p className="text-xl text-gray-600 mb-8">
          Free AI tool - HD for Pro ($9/mo)
        </p>

        <div className="border-4 border-dashed border-blue-400 rounded-xl p-12 mb-8 hover:border-blue-600 transition">
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-16 h-16 text-blue-600 mb-4" />
            <p className="text-2xl font-medium">Drop your image here</p>
            <p className="text-gray-500">
              or click to browse (any size, any type)
            </p>
          </label>
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={loading || !aiReady}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg flex items-center mx-auto mb-8"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Processing…
              </>
            ) : (
              'Remove Background'
            )}
          </button>
        )}

        {result && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Original</h3>
              <img
                src={preview}
                alt="Original"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">No Background</h3>
              <div className="bg-gray-200 p-4 rounded-lg">
                <img
                  src={result}
                  alt="Result"
                  className="rounded-lg shadow-lg w-full bg-transparent"
                />
              </div>
              <a
                href={result}
                download="transparent.png"
                className="mt-4 inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                <Download className="mr-2" />
                Download HD PNG
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
