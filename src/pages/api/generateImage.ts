import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  const height = req.body.height || 512;
  const width = req.body.width || 512

  // Check if prompt exists
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVEPEER_TOKEN}`, // Secure token via environment variable
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_id: 'stabilityai/stable-diffusion-3-medium-diffusers', // Static model ID
      prompt, // Use dynamic prompt from request body
      height,
        width,
    }),
  };

  try {
    const response = await fetch('https://dream-gateway.livepeer.cloud/text-to-image', options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Error generating image' });
    }

    // Return the generated image data to the frontend
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
