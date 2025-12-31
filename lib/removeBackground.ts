const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN not set");
}

const MODEL_VERSION =
  "5c7d5dc6c3c8f7b9c8b1a9a1e87d1fbc5d9a4f2e2c1d3f2e9b6d5e2c3b1a"; 
// cjwbw/rembg stable version

export async function removeBackground(base64: string) {
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        image: base64,
      },
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Replicate API error:", json);
    throw new Error("Replicate request failed");
  }

  // Wait for prediction to finish
  let prediction = json;
  while (prediction.status !== "succeeded" && prediction.status !== "failed") {
    await new Promise((r) => setTimeout(r, 1000));
    const poll = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
      }
    );
    prediction = await poll.json();
  }

  if (prediction.status === "failed") {
    console.error("Replicate prediction failed:", prediction.error);
    throw new Error("Prediction failed");
  }

  const output = prediction.output;

  if (!output || typeof output !== "string") {
    throw new Error("Invalid output from Replicate");
  }

  return {
    processed: output,
    clean: output,
  };
}
