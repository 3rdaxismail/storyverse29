type RuntimeEnv = Record<string, string | undefined>;

type ImportMetaWithEnv = ImportMeta & {
  env?: RuntimeEnv;
};

const viteEnv = (import.meta as ImportMetaWithEnv).env;
const runtimeEnv = (globalThis as typeof globalThis & {
  process?: { env?: RuntimeEnv };
}).process?.env;

function readConfigValue(primary?: string, fallback?: string): string {
  const value = primary ?? fallback ?? '';
  return value.trim();
}

export const AI_CONFIG = {
  provider: 'gemini' as const,
  model: readConfigValue(
    viteEnv?.VITE_GEMINI_MODEL,
    runtimeEnv?.GEMINI_MODEL,
  ) || 'gemini-2.5-flash',
  apiKey: readConfigValue(
    viteEnv?.VITE_GEMINI_API_KEY,
    runtimeEnv?.GEMINI_API_KEY,
  ),
};

export function getConfiguredModelName(): string {
  return AI_CONFIG.model;
}
