import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export const openRouterApiKey =
  process.env.OPENROUTER_API_KEY ||
  process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY ||
  "";

if (!openRouterApiKey) {
  console.warn(
    "[AI] OPENROUTER_API_KEY is not set — chat and summarisation calls will fail. " +
      "Add it to your environment (see .env.example).",
  );
}

export const openRouterModel =
  process.env.OPENROUTER_MODEL ||
  process.env.DEEPSEEK_MODEL ||
  "deepseek/deepseek-chat";

export const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: openRouterApiKey || "missing-openrouter-api-key",
  defaultHeaders: {
    "HTTP-Referer": "https://leadcatcher.local",
    "X-Title": "Persona Lead Catcher",
  },
});

const anthropicApiKey =
  process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY ||
  "dummy-key-for-initialization";

const anthropicBaseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined;

export const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
  baseURL: anthropicBaseURL,
});
