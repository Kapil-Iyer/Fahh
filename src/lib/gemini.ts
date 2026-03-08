/**
 * Gemini client — server-side only. Never import in frontend.
 * Uses GEMINI_API_KEY and optional GEMINI_MODEL (default: gemini-2.5-flash).
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  return genAI.getGenerativeModel({ model: modelId });
}

export { getGeminiModel };
