// lib/removeBackground.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function removeBackground(imageUrl: string) {
  console.log("[removeBackground] Removing background via Cloudinary");

  const result = await cloudinary.uploader.upload(imageUrl, {
    background_removal: "cloudinary_ai",
    format: "png",
  });

  if (!result.secure_url) {
    throw new Error("Cloudinary background removal failed");
  }

  return {
    processed: result.secure_url,
    clean: result.secure_url,
  };
}
