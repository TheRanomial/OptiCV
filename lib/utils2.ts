import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { FeatureExtractionPipeline, pipeline } from "@xenova/transformers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

let callback: (
  filename: string,
  totalChunks: number,
  chunksUpserted: number,
  isComplete: boolean
) => void = () => {};
let totalNumberChunks: number;
let numberChunksupserted: number = 0;

export async function updateVectorDB(
  client: Pinecone,
  docs: Document[],
  index: string,
  namespace: string,
  progressCallback: (
    filename: string,
    totalChunks: number,
    chunksUpserted: number,
    isComplete: boolean
  ) => void
) {
  callback = progressCallback;
  const model = "mixedbread-ai/mxbai-embed-large-v1";
  const extractor = await pipeline("feature-extraction", model, {
    quantized: false,
  });

  for (const doc of docs) {
    await processDocument(client, doc, index, namespace, extractor);
  }

  if (callback != undefined) {
    callback("filename", totalNumberChunks, numberChunksupserted, true);
  }
}

async function processDocument(
  client: Pinecone,
  doc: Document<Record<string, unknown>>,
  index: string,
  namespace: string,
  extractor: FeatureExtractionPipeline
) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 50,
    chunkOverlap: 1,
  });

  const documentChunks = await splitter.splitText(doc.pageContent);
  totalNumberChunks = documentChunks.length;
  numberChunksupserted = 0;

  let chunkBatchIndex = 0;
  while (documentChunks.length > 0) {
    chunkBatchIndex++;

    const filename = extractFileName(doc.metadata.source as string);
    const chunkBatch = documentChunks.splice(0, 50);
    await processOneBatch(
      client,
      index,
      namespace,
      chunkBatchIndex,
      chunkBatch,
      extractor,
      filename
    );
  }
}

function extractFileName(filename: string): string {
  return filename.split("/").pop() || "";
}

async function processOneBatch(
  client: Pinecone,
  index: string,
  namespace: string,
  chunkBatchIndex: number,
  chunkBatch: string[],
  extractor: FeatureExtractionPipeline,
  filename: string
) {
  const result = await extractor(
    chunkBatch.map((str) => str.replace(/\n/g, " ")),
    { pooling: "cls" }
  );

  const embeddingsBatch = result.tolist();
  let vectorBatch: PineconeRecord<RecordMetadata>[] = [];

  for (let i = 0; i < chunkBatch.length; i++) {
    const chunk = chunkBatch[i];
    const embeddings = embeddingsBatch[i];

    const vector: PineconeRecord<RecordMetadata> = {
      id: `${filename}-${chunkBatchIndex}-${i}`,
      values: embeddings,
      metadata: {
        chunk,
      },
    };
    vectorBatch.push(vector);
  }

  //const idx = client.Index(index).namespace(namespace);
  //await idx.upsert(vectorBatch);
  numberChunksupserted += vectorBatch.length;

  if (callback !== undefined) {
    callback(filename, totalNumberChunks, numberChunksupserted, false);
  }
  vectorBatch = [];
}
