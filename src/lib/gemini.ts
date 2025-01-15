import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aiSummariseCommit = async (diff: string) => {
  //github.com/owner/repo/commit/commitHash.diff
  const response = await model.generateContent([
    `You are a master at programming and you are trying to summarize a git diff. 
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
