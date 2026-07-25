import { storyProjectService } from './storyProjectService';
import type { StoryBrainIndexEntry } from './types';

export const storyBrainService = {
  list(storyId: string): StoryBrainIndexEntry[] {
    return storyProjectService.getBrainIndex(storyId);
  },

  index(storyId: string, item: Omit<StoryBrainIndexEntry, 'id' | 'createdAt' | 'storyId'>) {
    const entry: StoryBrainIndexEntry = {
      id: `brain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      storyId,
      createdAt: Date.now(),
      ...item,
    };

    const entries = storyProjectService.getBrainIndex(storyId);
    const next = [entry, ...entries.filter(existing => existing.sourceId !== item.sourceId || existing.sourceType !== item.sourceType)];
    storyProjectService.saveBrainIndex(storyId, next);
    return next;
  },
};
