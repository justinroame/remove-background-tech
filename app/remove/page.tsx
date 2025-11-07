'use client';

import { useState } from 'react';
import { Upload, Download, Loader2, CreditCard } from 'lucide-react';

export default function RemoveBG() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const maxSize = 1024;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // Check file size (remove.bg limit: 22MB)
      if (file.size > 22 * 1024 * 1024) {
        alert('File too large (max 22MB). Try compressing it.');
        setLoading(false);
        return;
      }

      // Compress if >1MB
      let uploadFile = file;
      if (file.size > 1 * 1024 * 1024) {
        uploadFile = await compressImage(file);
      }

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('upload_preset', 'remove-bg');

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: 'POST', body: formData }
      );

      const { secure_url } = await uploadRes.json();

      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: secure_url, originalSize: file.size }),
      });

      const { result } = await res.json();
      setResult(result[0]);
      setPreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error:', error);
      alert('Error — check console or ask Grok');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
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
            <p className="text-gray-500">or click to browse (max 22MB)</p>
          </label>
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled= {loading}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold flex items-center mx-auto mb-10"
          >
            {loading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : 'Remove Background'}
          </button>
        )}

        {result && (
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="font-bold mb-2">Original</h3>
              <img src={preview} className="rounded-xl shadow-xl w-full" />
            </div>
            <div>
              <h3 className="font-bold mb-2">No Background</h3>
              <img src={result} className="rounded-xl shadow-xl w-full bg-gray-100 p-4" />
              <a
                href={result + '?w=800'}
                download
                className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                <Download className="inline w-5 h-5 mr-2" /> Download HD
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
