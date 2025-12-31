export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function GET() {
  console.log("[replicate-test] route hit");

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("[replicate-test] Missing REPLICATE_API_TOKEN");
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN is not set" },
      { status: 500 }
    );
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // Known-good public test image
  const IMAGE_URL =
    "https://replicate.delivery/pbxt/Kz8tVYp0J3zK5ZJkJ7KcJpC3oY5x9Yl7b6Q4M3w3mY/image.png";

  // Known-good stable rembg model
  const MODEL =
    "cjwbw/rembg:fb8af171cfa5504d5ceafdba8c0fe0c84b4c8b2ce1a42a7b1c304af22aa32b3a";

  try {
    console.log("[replicate-test] Calling replicate.run()");
    console.log("[replicate-test] Model:", MODEL);
    console.log("[replicate-test] Image:", IMAGE_URL);

    const output = await replicate.run(MODEL, {
      input: { image: IMAGE_URL },
    });

    console.log("[replicate-test] Output:", output);

    return NextResponse.json({
      success: true,
      output,
    });
  } catch (err: any) {
    console.error("[replicate-test] ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Replicate call failed",
        detail: err,
      },
      { status: 500 }
    );
  }
}
