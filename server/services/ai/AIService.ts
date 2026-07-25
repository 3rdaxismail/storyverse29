import type { ChatRequest } from '../../types/ChatRequest';
import type { ChatResponse } from '../../types/ChatResponse';
import { GeminiProvider } from './GeminiProvider';
import type { AIProvider } from './AIProvider';

function summarizeContext(request: ChatRequest): string {
  const context = request.selectedContext;
  const sceneHint = context.currentSceneText ? `Current scene text:\n${context.currentSceneText}` : 'Current scene text not provided.';
  const selectedTextHint = context.selectedText ? `Selected text:\n${context.selectedText}` : 'No selected text.';

  return [
    `Project: ${request.projectId}`,
    `Current scene id: ${context.currentSceneId || 'unknown'}`,
    `Scene ids: ${context.selectedSceneIds.join(', ') || 'none'}`,
    `Character ids: ${context.selectedCharacterIds.join(', ') || 'none'}`,
    `Location ids: ${context.selectedLocationIds.join(', ') || 'none'}`,
    `Timeline ids: ${context.selectedTimelineIds.join(', ') || 'none'}`,
    `Bible section ids: ${context.bibleSectionIds.join(', ') || 'none'}`,
    `Research ids: ${context.researchIds.join(', ') || 'none'}`,
    sceneHint,
    selectedTextHint,
  ].join('\n');
}

export class AIService {
  private readonly provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || new GeminiProvider(process.env.GEMINI_API_KEY || '', process.env.GEMINI_MODEL || 'gemini-1.5-flash');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const contextSummary = summarizeContext(request);
    const message = await this.provider.generateReply({
      prompt: request.prompt,
      contextSummary,
      conversationId: request.conversationId,
    });

    return {
      conversationId: request.conversationId,
      message,
      provider: this.provider.providerName,
      model: this.provider.modelName,
      streamingSupported: false,
    };
  }
}
