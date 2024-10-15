// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { pinata } from "@/utils/config";

type Data = {
  message: string;
  keyData?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === "GET") {
    try {
      const uuid = crypto.randomUUID();
      const keyData = await pinata.keys.create({
        keyName: uuid.toString(),
        permissions: {
          endpoints: {
            pinning: {
              pinFileToIPFS: true,
            },
          },
        },
        maxUses: 1,
      });
      res.status(200).json({ message: "API Key created successfully", keyData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating API Key" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
