const DEFAULT_MODEL = 'gemini-2.5-flash';

export const AI_SERVER_CONFIG = {
  provider: 'gemini' as const,
  model: process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
  apiKey: process.env.GEMINI_API_KEY?.trim() || '',
};

export function getServerConfiguredModelName(): string {
  return AI_SERVER_CONFIG.model;
}
