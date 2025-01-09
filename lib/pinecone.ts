/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from "@huggingface/inference";

const hf_key = process.env.HF_TOKEN as string;
const hf_embeddings = new HfInference(hf_key);
const apiKey = process.env.PINECONE_API_KEY as string;

const client = new Pinecone({
  apiKey: apiKey,
});

export async function queryPineconeDatabase(
  index: string,
  namespace: string,
  query: string
): Promise<string> {
  const embedder = await hf_embeddings.featureExtraction({
    model: "mixedbread-ai/mxbai-embed-large-v1",
    inputs: query,
  });

  const embeddings = Array.from(embedder);

  const idx = client.index(index);

  const result = await idx.namespace(namespace).query({
    topK: 3,
    vector: embeddings as any,
    includeMetadata: true,
    includeValues: false,
  });

  if (result.matches.length > 0) {
    const concatenatedRetrievals = result.matches
      .map(
        (match, index) => `\n Finding ${index + 1}: \n ${match.metadata?.chunk}`
      )
      .join(". \n\n");
    return concatenatedRetrievals;
  } else {
    return "<nomatches>";
  }
  return "";
}
