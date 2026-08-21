import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const defaultOpenRouterKey = "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";

export const openRouterApiKey =
  process.env.OPENROUTER_API_KEY ||
  process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY ||
  defaultOpenRouterKey;

export const openRouterModel =
  process.env.OPENROUTER_MODEL ||
  process.env.DEEPSEEK_MODEL ||
  "deepseek/deepseek-chat";

export const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: openRouterApiKey,
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
