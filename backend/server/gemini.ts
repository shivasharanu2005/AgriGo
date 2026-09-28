import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
let isGeminiDisabled = false;

export function getGeminiClient(): GoogleGenAI | null {
  if (isGeminiDisabled) {
    return null;
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch {
      return null;
    }
  }
  return geminiClient;
}

export function disableGeminiClient(): void {
  isGeminiDisabled = true;
  geminiClient = null;
}

