import type { StoryProjectMetadata, StoryBibleEntry, StoryBrainIndexEntry, StoryProjectScene, StoryProjectAiSuggestion } from './types';

const STORAGE_PREFIX = 'storyverse:story-project';

function getStoryStorageKey(storyId: string) {
  return `${STORAGE_PREFIX}:${storyId}`;
}

function readStorage<T>(storyId: string, key: string): T | null {
  const raw = localStorage.getItem(`${getStoryStorageKey(storyId)}:${key}`);
  return raw ? JSON.parse(raw) as T : null;
}

function writeStorage(storyId: string, key: string, value: unknown) {
  localStorage.setItem(`${getStoryStorageKey(storyId)}:${key}`, JSON.stringify(value));
}

export const storyProjectService = {
  getMetadata(storyId: string): StoryProjectMetadata | null {
    return readStorage<StoryProjectMetadata>(storyId, 'metadata');
  },

  saveMetadata(storyId: string, metadata: StoryProjectMetadata) {
    writeStorage(storyId, 'metadata', metadata);
  },

  getBible(storyId: string): StoryBibleEntry[] {
    return readStorage<StoryBibleEntry[]>(storyId, 'bible') ?? [];
  },

  saveBible(storyId: string, entries: StoryBibleEntry[]) {
    writeStorage(storyId, 'bible', entries);
  },

  getBrainIndex(storyId: string): StoryBrainIndexEntry[] {
    return readStorage<StoryBrainIndexEntry[]>(storyId, 'brain') ?? [];
  },

  saveBrainIndex(storyId: string, entries: StoryBrainIndexEntry[]) {
    writeStorage(storyId, 'brain', entries);
  },

  getScenes(storyId: string): StoryProjectScene[] {
    return readStorage<StoryProjectScene[]>(storyId, 'scenes') ?? [];
  },

  saveScenes(storyId: string, scenes: StoryProjectScene[]) {
    writeStorage(storyId, 'scenes', scenes);
  },

  getAiSuggestions(storyId: string): StoryProjectAiSuggestion[] {
    return readStorage<StoryProjectAiSuggestion[]>(storyId, 'ai') ?? [];
  },

  saveAiSuggestions(storyId: string, suggestions: StoryProjectAiSuggestion[]) {
    writeStorage(storyId, 'ai', suggestions);
  },

  ensureMetadata(storyId: string, title: string): StoryProjectMetadata {
    const existing = this.getMetadata(storyId);
    if (existing) return existing;

    const metadata: StoryProjectMetadata = {
      id: `project-${storyId}`,
      storyId,
      title,
      premise: '',
      theme: '',
      genre: '',
      tone: '',
      targetRuntime: '',
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.saveMetadata(storyId, metadata);
    return metadata;
  },
};
