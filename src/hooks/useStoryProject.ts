import { useEffect, useMemo, useState } from 'react';
import { storyProjectService } from '../services/storyProject/storyProjectService';
import { storyBibleService } from '../services/storyProject/storyBibleService';
import { storyBrainService } from '../services/storyProject/storyBrainService';
import { sceneManagerService } from '../services/storyProject/sceneManagerService';
import { aiAssistantService } from '../services/storyProject/aiAssistantService';

export function useStoryProject(storyId?: string) {
  const [metadata, setMetadata] = useState(() => storyId ? storyProjectService.getMetadata(storyId) : null);
  const [bible, setBible] = useState(() => storyId ? storyBibleService.list(storyId) : []);
  const [brain, setBrain] = useState(() => storyId ? storyBrainService.list(storyId) : []);
  const [scenes, setScenes] = useState(() => storyId ? sceneManagerService.list(storyId) : []);
  const [aiSuggestions, setAiSuggestions] = useState(() => storyId ? aiAssistantService.list(storyId) : []);

  useEffect(() => {
    if (!storyId) return;

    const ensured = storyProjectService.ensureMetadata(storyId, 'Untitled Story');
    setMetadata(ensured);
    setBible(storyBibleService.list(storyId));
    setBrain(storyBrainService.list(storyId));
    setScenes(sceneManagerService.list(storyId));
    setAiSuggestions(aiAssistantService.list(storyId));
  }, [storyId]);

  const storyHealth = useMemo(() => ({
    bibleCoverage: bible.length > 0 ? 'active' : 'draft',
    brainHealth: brain.length > 0 ? 'indexed' : 'pending',
    scenesCount: scenes.length,
    aiSuggestionsCount: aiSuggestions.length,
  }), [bible.length, brain.length, scenes.length, aiSuggestions.length]);

  return {
    metadata,
    bible,
    brain,
    scenes,
    aiSuggestions,
    storyHealth,
    refresh: () => {
      if (!storyId) return;
      setMetadata(storyProjectService.getMetadata(storyId));
      setBible(storyBibleService.list(storyId));
      setBrain(storyBrainService.list(storyId));
      setScenes(sceneManagerService.list(storyId));
      setAiSuggestions(aiAssistantService.list(storyId));
    },
  };
}
