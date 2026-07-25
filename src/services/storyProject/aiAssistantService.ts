import { storyProjectService } from './storyProjectService';
import type { StoryProjectAiSuggestion } from './types';

export const aiAssistantService = {
  list(storyId: string): StoryProjectAiSuggestion[] {
    return storyProjectService.getAiSuggestions(storyId);
  },

  add(storyId: string, suggestion: Omit<StoryProjectAiSuggestion, 'id' | 'createdAt' | 'storyId'>) {
    const entry: StoryProjectAiSuggestion = {
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      storyId,
      createdAt: Date.now(),
      ...suggestion,
    };

    const suggestions = storyProjectService.getAiSuggestions(storyId);
    const next = [entry, ...suggestions];
    storyProjectService.saveAiSuggestions(storyId, next);
    return entry;
  },

  createContextPrompt(storyId: string, sceneTitle: string, type: StoryProjectAiSuggestion['type']) {
    const metadata = storyProjectService.getMetadata(storyId);
    return {
      prompt: `Assist the writer with ${type} for ${sceneTitle || 'the current scene'}. Use the Story Bible, current scene context, characters, locations, timeline, and story rules when available. Ask clarifying questions if the context is insufficient.`,
      context: metadata ? [metadata.title, metadata.premise, metadata.theme].filter(Boolean) : [],
    };
  },
};
