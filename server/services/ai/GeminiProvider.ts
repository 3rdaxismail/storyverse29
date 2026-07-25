import { AIProviderError, type AIProvider, type GenerateReplyParams } from './AIProvider';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
}

export class GeminiProvider implements AIProvider {
  readonly providerName = 'gemini';
  readonly modelName: string;

  private readonly apiKey: string;

  constructor(apiKey: string, modelName = 'gemini-2.5-flash') {
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async generateReply(params: GenerateReplyParams): Promise<string> {
    if (!this.apiKey) {
      throw new AIProviderError('Gemini API key is missing.', 'INVALID_API_KEY', 500);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    const controller = new AbortController();
    const timeoutMs = Number(process.env.AI_PROVIDER_TIMEOUT_MS || 30000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const systemPrompt = [
      'You are Storyverse AI, a collaborative writing partner.',
      'Do not overwrite user content silently; propose concise, useful edits.',
      'When context is insufficient, ask a clarifying question.',
      'Be specific, actionable, and story-focused.',
    ].join(' ');

    const requestText = [
      systemPrompt,
      `Conversation: ${params.conversationId}`,
      `Context:\n${params.contextSummary}`,
      `User request:\n${params.prompt}`,
    ].join('\n\n');

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: requestText }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIProviderError('Gemini request timed out. Please try again.', 'TIMEOUT', 504);
      }
      throw new AIProviderError('Network error while contacting Gemini.', 'NETWORK_ERROR', 503);
    } finally {
      clearTimeout(timeoutId);
    }

    const data = (await response.json()) as GeminiResponse;

    if (!response.ok || data.error) {
      const message = data.error?.message || 'Gemini request failed.';
      const statusCode = response.status;

      if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
        if (message.toLowerCase().includes('model') || message.toLowerCase().includes('not found') || message.toLowerCase().includes('unsupported')) {
          throw new AIProviderError(`Configured Gemini model "${this.modelName}" is unavailable. Please update GEMINI_MODEL to a supported model.`, 'MODEL_UNAVAILABLE', 400);
        }
        throw new AIProviderError('Gemini API key appears invalid or unauthorized.', 'INVALID_API_KEY', 401);
      }
      if (statusCode === 429) {
        throw new AIProviderError('Gemini rate limit reached. Please wait and try again.', 'RATE_LIMIT', 429);
      }
      if (statusCode >= 500) {
        throw new AIProviderError('Gemini service is temporarily unavailable.', 'PROVIDER_UNAVAILABLE', 503);
      }

      throw new AIProviderError(message, 'PROVIDER_ERROR', 502);
    }

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!text) {
      throw new AIProviderError('Gemini returned an empty response.', 'EMPTY_RESPONSE', 502);
    }

    return text;
  }
}
