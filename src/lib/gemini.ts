import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aiSummariseCommit = async (diff: string) => {
  //github.com/owner/repo/commit/commitHash.diff
  const response = await model.generateContent([
    `You are a master at programming a nd you are trying to summarize a git diff. 
    Reminders about the git diff format: 
    For every file, there are two metadata lines like (for example): 
    \'\'\'
    diff --git a/lib/index.js b/lib/index.js
    index aadf691...bfef603 100844
    --- a/lib/index.js
    +++ b/lib/index.js
    \'\'\'
    This means that 'lib/index.js' was modified in this commit. Note that this is only an example.
    Then there is a specifier of the lines that were modified.
    A line starting with '+' means it was added.
    A line starting with '-' means that the line was deleted.
    A line that starts with neither '+' nor '-' is code given for context and better understanding.
    It ]is not the part of the diff.
    EXAMPLE SUMMARY CONTENTS:
    \'\'\'
    * Raised the amount of returned recordings from \'10\' to \'100\' [packages/server/recordings_api.ts], [packages/server/constants.ts]
    * Fixed a typo in the github action name [.github/workflows.gpt-commit-summarizer.yml]
    * Moved the \'octokit\' initialization to a separate file [src/octokit.ts] [src/index.ts]
    * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
    * Lowered numiric tolerence for test files
    \'\'\'
    Most commits will have less comments than this examples list.
    The last comment does not include the file names,
    because there were more than two relevant files in the hypothetical commit.
    Do no include parts of the examples in your summary.
    It is given only as an example of appropriate comments.`,
    `Please summarise the following diff files: \n\n${diff}`,
  ]);
  return response.response.text();
};

export async function summariseCode(doc: Document) {
  console.log("Getting summary for", doc.metadata.source);
  try {
    const code = await doc.pageContent.slice(0, 10000);
    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.`,
      `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
      Here is the code:
      ---
      ${code}
      ---
      Give a summary in no more than 100 words of the code above`,
    ]);
    return response.response.text();
  } catch (err) {
    console.log(err);
  }
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  const result = await model.embedContent(summary); //generate vector representation of the summary
  const embedding = result.embedding;
  return embedding.values;
}
