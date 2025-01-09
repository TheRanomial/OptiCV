import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const directoryPath = path.join(process.cwd(), "public", "documents");

  try {
    const files = fs
      .readdirSync(directoryPath)
      .filter((file) => file.toLowerCase().endsWith(".pdf"));

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error reading files:", error);
    res.status(500).json({ message: "Error reading files" });
  }
}
