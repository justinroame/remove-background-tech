import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { image } = await req.json();

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "birefnet-human-seg",
      input: { image }
    }),
  });

  let prediction = await response.json();

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    await new Promise(r => setTimeout(r, 1000));
    const poll = await fetch(prediction.urls.get, {
      headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    prediction = await poll.json();
  }

  return Response.json({ output: prediction.output });
}
