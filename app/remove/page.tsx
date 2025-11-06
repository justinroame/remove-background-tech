'use client';

import { useState } from 'react';
import { Upload, Download, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function RemoveBG() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Processing failed');

      const { result } = await res.json();
      setResult(result);
    } catch (error) {
      alert('Error — check console or ask Grok');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-bold mb-3">Remove Background</h1>
        <p className="text-xl text-gray-600 mb-10">Free AI tool — HD for Pro ($9/mo)</p>

        <div className="border-4 border-dashed border-blue-300 rounded-3xl p-16 mb-10 hover:border-blue-500 transition">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            className="hidden"
            id="upload"
          />
          <label htmlFor="upload" className="cursor-pointer">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <p className="text-2xl font-semibold">Drop your image here</p>
            <p className="text-gray-500">or click to browse</p>
          </label>
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold flex items-center mx-auto mb-10 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Remove Background'
            )}
          </button>
        )}

        {result && (
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="font-bold mb-2">Original</h3>
              <img src={preview} alt="Original" className="rounded-xl shadow-xl w-full" />
            </div>
            <div>
              <h3 className="font-bold mb-2">No Background</h3>
              <img src={result} alt="Result" className="rounded-xl shadow-xl w-full bg-gray-100 p-4" />
              <a
                href={result}
                download
                className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" /> Download HD
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
