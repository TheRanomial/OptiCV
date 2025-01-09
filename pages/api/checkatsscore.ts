import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const google_api_key = process.env.GOOGLE_API_KEY as string;
const genAI = new GoogleGenerativeAI(google_api_key); 

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `
Attached is a resume document.

Go through the resume carefully and analyze its content for the purpose of ATS (Applicant Tracking System) compatibility. 
Evaluate the resume based on key factors such as:

- Keyword relevance to common industry-specific skills
- Proper use of action verbs
- Relevant experience and qualifications alignment with job descriptions
- Formatting and structure (clarity, ease of reading, and ATS-friendly formatting)
- Use of relevant certifications, education, and achievements

Provide the ATS score of the resume in numerical form, with a score from 0 to 100. A higher score indicates better compatibility with ATS systems based on the analysis criteria mentioned above.

If the resume is detailed or spans multiple pages, you may extend the analysis appropriately.
Avoid personal details such as name, contact information, and address. Focus on providing an objective assessment based on the resume content.
## ATS Score: `;

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
