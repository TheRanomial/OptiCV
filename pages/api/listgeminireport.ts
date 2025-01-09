import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
const google_api_key = process.env.GOOGLE_API_KEY as string;
const genAI = new GoogleGenerativeAI(google_api_key);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const prompt = `
Attached is a resume document.

Go through the resume carefully and identify the candidate's key skills, qualifications, and experiences that align with potential roles or industries. 
Highlight strengths, unique achievements, certifications, and any leadership roles or projects that stand out.Write extremely detailed review of the resume with no word limit.
If the resume is detailed or spans multiple pages, you may extend the word limit appropriately.
Avoid personal details such as name, contact information, and address. Focus on presenting a clear and professional profile summary based on the content of the resume.
## Summary: `;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { base64 } = req.body;
  const filePart = fileToGenerativePart(base64);

  const result = await model.generateContent([prompt, filePart]);
  const textResponse =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log(textResponse);

  return res.status(200).json(textResponse);
}

function fileToGenerativePart(imageData: string) {
  return {
    inlineData: {
      data: imageData.split(",")[1],
      mimeType: imageData.substring(
        imageData.indexOf(":") + 1,
        imageData.lastIndexOf(";")
      ),
    },
  };
}
