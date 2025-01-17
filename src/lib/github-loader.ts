import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { summariseCode } from "./gemini";
import { generateEmbeddingAI } from "./gemini";
import { db } from "@/server/db";

//github token to access private repo
export const loadGithubRepo = async (
  githubURl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubURl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "bun.lockb",
      "pnpm-lock.yaml",
      "yarn.lock",
      "package-lock.json",
    ],
    recursive: true, //to get all files in the repo
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);

  const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(
      docs.map(async (doc) => {
        const summary = await summariseCode(doc);
        const embedding = await generateEmbeddingAI(summary);
        return {
          summary,
          embedding,
          sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
          fileName: doc.metadata.source,
        };
      }),
    );
  };

  const getAllEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(
    getAllEmbeddings.map(async (embedding, index) => {
      console.log(`Processing ${index} of ${getAllEmbeddings.length}`);

      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          projectId,
          sourceCode: embedding.sourceCode,
          summary: embedding.summary,
          fileName: embedding.fileName,
        },
      });
      //prisma doesn't support vectordata type
      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}`;
    }),
  );
};
