import { storyProjectService } from './storyProjectService';
import type { StoryProjectScene } from './types';

export const sceneManagerService = {
  list(storyId: string): StoryProjectScene[] {
    return storyProjectService.getScenes(storyId);
  },

  save(storyId: string, scenes: StoryProjectScene[]) {
    storyProjectService.saveScenes(storyId, scenes);
    return scenes;
  },

  create(storyId: string, scene: Omit<StoryProjectScene, 'id' | 'storyId' | 'createdAt' | 'updatedAt'>) {
    const entry: StoryProjectScene = {
      id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      storyId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...scene,
    };

    const scenes = storyProjectService.getScenes(storyId);
    const next = [entry, ...scenes];
    storyProjectService.saveScenes(storyId, next);
    return entry;
  },
};
