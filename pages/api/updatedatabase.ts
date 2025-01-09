import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Pinecone } from "@pinecone-database/pinecone";

import { NextApiRequest, NextApiResponse } from "next";
import { updateVectorDB } from "@/lib/utils2";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    const { index, namespace } = req.body;
    await handleUpload(index, namespace, res);
  }
};

export default handler;

async function handleUpload(
  index: string,
  namespace: string,
  res: NextApiResponse
) {
  const loader = new DirectoryLoader("./public/documents", {
    ".pdf": (path: string) => new PDFLoader(path),
    ".txt": (path: string) => new TextLoader(path),
  });

  //console.log(loader)
  const docs = await loader.load();

  const apiKey = process.env.PINECONE_API_KEY as string;

  if (!apiKey) {
    throw new Error("PINECONE_API_KEY is not defined");
  }
  const client = new Pinecone({
    apiKey: apiKey,
  });

  await updateVectorDB(
    client,
    docs,
    index,
    namespace,
    (filename, totalChunks, chunksUpserted, isComplete) => {
      if (!isComplete) {
        res.write(
          JSON.stringify({
            filename,
            totalChunks,
            chunksUpserted,
            isComplete,
          })
        );
      } else {
        res.end();
      }
    }
  );
}
