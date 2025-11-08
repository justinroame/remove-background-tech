// app/remove/page.tsx
'use client';

import { useState } from 'react';
import { Upload, Loader2, Download } from 'lucide-react';

export default function RemoveBGPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const compressImage = (file: File): Promise<File> => {
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
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressed = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, '.jpg'),
                  { type: 'image/jpeg' }
                );
                resolve(compressed);
              }
            },
            'image/jpeg',
            0.8
          );
        };
      };

      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult('');
    setPreview(URL.createObjectURL(file));

    try {
      let uploadFile = file;
      if (file.size > 1 * 1024 * 1024) {
        console.log('Compressing large image…');
        uploadFile = await compressImage(file);
        console.log('Compressed to', uploadFile.size / 1024 / 1024, 'MB');
      }

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('upload_preset', 'remove-bg');

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/dzlfcmuuf/upload`,
        { method: 'POST', body: formData }
      );

      if (!uploadRes.ok) throw new Error('Cloudinary upload failed');

      const { secure_url } = await uploadRes.json();

      const apiRes = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: secure_url }),
      });

      if (!apiRes.ok) {
        const err = await apiRes.json();
        throw new Error(err.error || 'Background removal failed');
      }

      const { result } = await apiRes.json();
      setResult(result);
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-5xl font-bold.mb-4">Remove Background</h1>
        <p className="text-xl text-gray-600 mb-8">
          Free AI tool — HD for Pro ($9/mo)
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
            <p className="text-gray-500">or click to browse (any size, any type)</p>
          </label>
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg flex items-center mx-auto mb-8"
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
