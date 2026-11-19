import { Document } from "@langchain/core/documents";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
const CHAT_MODEL = "nvidia/nemotron-3.5-super:free";
const EMBEDDING_MODEL = "nvidia/nemotron-3.5-embed-1b:free";

function getApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
  return apiKey;
}

async function openRouterRequest(path: string, body: object) {
  const response = await fetch(`${OPENROUTER_API_URL}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "ElevateHQ",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed (${response.status}): ${await response.text()}`);
  }
  return response;
}

async function generateText(prompt: string) {
  const response = await openRouterRequest("chat/completions", {
    model: CHAT_MODEL,
    messages: [{ role: "user", content: prompt }],
  });
  const result = (await response.json()) as {
    choices: { message: { content: string | null } }[];
  };
  return result.choices[0]?.message.content ?? "";
}

export const aiSummariseCommit = async (diff: string) => {
  return generateText(`You are an expert programmer summarizing a git diff.
For each changed file, include its path in square brackets. Summarize the meaningful changes as concise bullet points. Do not copy the examples.

Diff:
${diff}`);
};

export async function summariseCode(doc: Document) {
  console.log("Getting summary for", doc.metadata.source);
  try {
    const code = doc.pageContent.slice(0, 10000);
    return await generateText(`You are a senior software engineer onboarding a junior engineer. Explain the purpose of ${doc.metadata.source} in no more than 100 words.

Code:
${code}`);
  } catch (err) {
    console.error(`Error summarizing ${doc.metadata.source}:`, err);
    return null;
  }
}

export async function generateEmbedding(input: string) {
  const response = await openRouterRequest("embeddings", {
    model: EMBEDDING_MODEL,
    dimensions: 768,
    input,
  });
  const result = (await response.json()) as {
    data: { embedding: number[] }[];
  };
  const embedding = result.data[0]?.embedding;
  if (!embedding || embedding.length !== 768) {
    throw new Error("OpenRouter returned an embedding with an unexpected dimension");
  }
  return embedding;
}

export async function streamChatCompletion(prompt: string, onDelta: (text: string) => void) {
  const response = await openRouterRequest("chat/completions", {
    model: CHAT_MODEL,
    stream: true,
    messages: [{ role: "user", content: prompt }],
  });
  if (!response.body) throw new Error("OpenRouter returned an empty response stream");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const data = event
        .split("\n")
        .find((line) => line.startsWith("data: "))
        ?.slice(6);
      if (!data || data === "[DONE]") continue;

      const chunk = JSON.parse(data) as {
        choices: { delta: { content?: string | null } }[];
      };
      const text = chunk.choices[0]?.delta.content;
      if (text) onDelta(text);
    }

    if (done) break;
  }
}
