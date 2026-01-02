import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function removeBackground(base64Image: string) {
  const output = await replicate.run(
    "851-labs/background-remover",
    {
      input: {
        image: base64Image,
      },
    }
  );

  // Model returns a single URL string
  if (typeof output !== "string") {
    throw new Error("Unexpected Replicate output");
  }

  return { clean: output };
}
