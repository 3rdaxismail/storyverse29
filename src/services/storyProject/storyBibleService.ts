import { storyProjectService } from './storyProjectService';
import type { StoryBibleEntry } from './types';

export const storyBibleService = {
  list(storyId: string): StoryBibleEntry[] {
    return storyProjectService.getBible(storyId);
  },

  upsert(storyId: string, entry: StoryBibleEntry) {
    const entries = storyProjectService.getBible(storyId);
    const next = entries.filter(item => item.id !== entry.id);
    next.push(entry);
    storyProjectService.saveBible(storyId, next);
    return next;
  },

  create(storyId: string, section: StoryBibleEntry['section'], title: string, content: string) {
    const entry: StoryBibleEntry = {
      id: `bible-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      storyId,
      section,
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return this.upsert(storyId, entry);
  },
};
