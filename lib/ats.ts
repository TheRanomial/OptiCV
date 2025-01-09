/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipeline } from "@xenova/transformers";

export const analyzeResumeText = async (
  resumeText: string
): Promise<string> => {
  try {
    const summarizer = await pipeline("ner", "xenova/bert-base-NER");

    const nerResults = await summarizer(resumeText);

    const skillsCount = nerResults.filter((entity: any) =>
      entity.entity.includes("SKILL")
    ).length;

    return `Skills detected: ${skillsCount}. Add more relevant skills for better ATS compatibility.`;
  } catch (error) {
    console.error("Error analyzing the resume:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
};
