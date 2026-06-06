import OpenAI from "openai";

const client = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://workshop1-woad.vercel.app",
    "X-Title": "Films Finder",
  },
});

const DEFAULT_MODEL = process.env.LLM_MODEL || "anthropic/claude-3.5-sonnet";

/**
 * Chat completion via OpenRouter.
 * @param {string|Array} prompt - string (user message) or full messages array
 * @param {object} opts - { model, temperature, max_tokens, system }
 */
export async function chat(prompt, opts = {}) {
  const messages = Array.isArray(prompt)
    ? prompt
    : [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        { role: "user", content: prompt },
      ];

  const response = await client.chat.completions.create({
    model: opts.model || DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.max_tokens ?? 1024,
  });

  return response.choices[0].message.content;
}

/**
 * Stream chat completion via OpenRouter.
 */
export async function chatStream(prompt, opts = {}) {
  const messages = Array.isArray(prompt)
    ? prompt
    : [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        { role: "user", content: prompt },
      ];

  return client.chat.completions.create({
    model: opts.model || DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.max_tokens ?? 1024,
    stream: true,
  });
}

export { DEFAULT_MODEL };
export default client;
