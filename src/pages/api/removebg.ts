import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageUrl } = req.body;

    // Check if imageUrl exists
    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    // Check if API key exists
    if (!process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY) {
        return res.status(500).json({ error: 'Remove.bg API key is required to use this feature' });
    }

    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_url", imageUrl);

    const options = {
        method: 'POST',
        headers: {
            "X-Api-Key": process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY
        },
        body: formData,
    };

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', options);

        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();


        const base64Image = Buffer.from(arrayBuffer).toString('base64');

        // Return the image as a base64-encoded string
        return res.status(200).json({ image: `data:image/png;base64,${base64Image}` });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}