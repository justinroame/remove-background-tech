// lib/removeBackground.ts
import Replicate from "replicate";

const token = process.env.REPLICATE_API_TOKEN;
if (!token) {
  throw new Error("REPLICATE_API_TOKEN is not set");
}

const replicate = new Replicate({ auth: token });

/**
 * NOTE:
 * Use a known-valid version hash from Replicate's cjwbw/rembg versions page.
 * If you still get 422 "not permitted", that is almost always billing/account permission.
 */
const MODEL = "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

export async function removeBackground(imageUrl: string) {
  console.log("[removeBackground] input url:", imageUrl);

  try {
    const output = await replicate.run(MODEL, {
      input: { image: imageUrl },
    });

    console.log("[removeBackground] raw output:", output);

    const url =
      typeof output === "string"
        ? output
        : Array.isArray(output)
        ? output[0]
        : null;

    if (!url) {
      throw new Error("Replicate returned no output image URL");
    }

    return { clean: url };
  } catch (err: any) {
    // Replicate JS SDK errors often carry useful fields
    const detail =
      err?.response?.data?.detail ||
      err?.response?.data?.title ||
      err?.message ||
      String(err);

    console.error("[removeBackground] ERROR:", detail);
    throw new Error(detail);
  }
}
