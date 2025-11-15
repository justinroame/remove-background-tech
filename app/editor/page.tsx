"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const params = useSearchParams();
  const imageUrl = params.get("img");

  const [selectedBackground, setSelectedBackground] =
    useState<"transparent" | "white" | "black">("transparent");

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setUploadedImage(imageUrl);
    }
  }, [imageUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setUploadedImage("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F6]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-gray-700">remove-background</span>
                <span className="text-blue-700 font-bold">.tech</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/pricing" className="text-sm text-gray-700 hover:text-gray-900">
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-gray-700 hover:text-gray-900">
              Log in
            </Link>
            <Link href="#" className="text-sm text-gray-700 hover:text-gray-900">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Background
          </span>

          <Button className="rounded-full bg-blue-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Download className="mr-2 size-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1">
        {/* Canvas */}
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div
            className="relative flex h-full w-full items-center justify-center rounded-xl shadow-lg"
            style={{
              backgroundColor:
                selectedBackground === "transparent"
                  ? "#FFFFFF"
                  : selectedBackground === "white"
                  ? "#FFFFFF"
                  : "#000000",
              backgroundImage:
                selectedBackground === "transparent"
                  ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                  : "none",
              backgroundSize: selectedBackground === "transparent" ? "20px 20px" : "auto",
              backgroundPosition:
                selectedBackground === "transparent"
                  ? "0 0, 0 10px, 10px -10px, -10px 0px"
                  : "0 0",
            }}
          >
            {uploadedImage && (
              <img
                src={uploadedImage}
                alt="Processed"
                className="max-h-full max-w-full object-contain rounded"
              />
            )}
          </div>

          {/* Upload / Replace */}
          <div className="mt-6 flex items-center gap-3">
            <label htmlFor="image-upload">
              <div className="flex size-12 cursor-pointer items-center justify-center rounded-lg border-2 border-gray-300 bg-white text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600">
                +
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {uploadedImage && (
              <button
                onClick={handleDeleteImage}
                className="flex size-12 items-center justify-center rounded-lg border-2 border-gray-300 bg-white text-gray-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
              >
                -
              </button>
            )}

            {uploadedImage && (
              <div className="size-12 overflow-hidden rounded-lg border-2 border-blue-600 shadow-sm">
                <img src={uploadedImage} alt="Current" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white p-8">
          <h3 className="mb-6 text-center text-sm font-semibold text-gray-600">Color</h3>

          <div className="flex justify-center gap-4">

            {/* Transparent */}
            <button
              onClick={() => setSelectedBackground("transparent")}
              className={`flex size-20 rounded-xl border-4 transition-all hover:scale-105 ${
                selectedBackground === "transparent"
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
              }}
            />

            {/* White */}
            <button
              onClick={() => setSelectedBackground("white")}
              className={`size-20 rounded-xl border-4 bg-white transition-all hover:scale-105 ${
                selectedBackground === "white" ? "border-blue-600" : "border-gray-300"
              }`}
            />

            {/* Black */}
            <button
              onClick={() => setSelectedBackground("black")}
              className={`size-20 rounded-xl border-4 bg-black transition-all hover:scale-105 ${
                selectedBackground === "black" ? "border-blue-600" : "border-gray-300"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
