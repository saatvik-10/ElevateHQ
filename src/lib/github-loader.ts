import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

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
    unknown:'warn',
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};
