export const runtime = "edge";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { StreamData, streamText } from "ai";
import { queryPineconeDatabase } from "@/lib/pinecone";

const google_api_key = process.env.GOOGLE_API_KEY as string;

export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
  apiKey: google_api_key,
});

const model = google("gemini-1.5-flash", {
  safetySettings: [
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_LOW_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_LOW_AND_ABOVE",
    },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
    {
      category: "HARM_CATEGORY_CIVIC_INTEGRITY",
      threshold: "BLOCK_LOW_AND_ABOVE",
    },
  ],
});

export default async function handler(req: Request) {
  const { messages, data } = await req.json();
  console.log(data.reportData);

  const userQuestion = `${messages[messages.length - 1].content}`;

  const query = `Represent this for searching relevant passages: candidate resume says: \n${data.reportData}. \n\n${userQuestion}`;
  const retrievals = await queryPineconeDatabase(
    "medicalrag",
    "example2",
    query
  );

  const finalPrompt = `Here is a summary of a resume, and a user query. Some generic resume tips are also provided that may or may not be relevant for the resume.
Go through the resume and answer the user query.
Ensure the response is factually accurate, and demonstrates a thorough understanding of the query topic and the resume.
The resume tips are general advice and not part of the candidate's resume. Do not include any tips if it is not relevant for the candidate's case.

\n\n**Resume Summary:**\n${data.reportData}. 
\n**end of resume summary**

\n\n**User Query:**\n${userQuestion}?
\n**end of user query**

\n\n**Generic improvement findings:**
  \n\n${retrievals}. 
  \n\n**end of generic improvement findings** 


\n\nProvide thorough justification for your answer.

\n\n**Answer:**
  `;

  const rawdata = new StreamData();
  rawdata.append({
    retrievals: retrievals,
  });

  const result = await streamText({
    model: model,
    prompt: finalPrompt,
    onFinish() {
      rawdata.close();
    },
  });

  for await (const textPart of result.textStream) {
    console.log(textPart);
  }

  return result.toDataStreamResponse({ data: rawdata });
}
