import type { AIContextPayload } from '../../types/AIContext';

interface BuildContextInput {
  storyId: string;
  currentSceneId?: string;
  currentActId?: string;
  allSceneIds: string[];
  allCharacterIds: string[];
  allLocationIds: string[];
  selectedSceneIds: string[];
  selectedCharacterIds: string[];
  selectedLocationIds: string[];
  includeTimeline: boolean;
  includeStoryBible: boolean;
  includeResearchNotes: boolean;
  includeCurrentScene: boolean;
  includeEntireAct: boolean;
  includeCharacters: boolean;
  includeLocations: boolean;
  includeThemes: boolean;
  includeSymbols: boolean;
  includeMotifs: boolean;
  includePreviousScene: boolean;
  includeNextScene: boolean;
  includeContinuityNotes: boolean;
  includeOpenQuestions: boolean;
  includeSceneMetadata: boolean;
}

export function buildAIContextPayload(input: BuildContextInput): AIContextPayload {
  const sceneIds = new Set(input.selectedSceneIds);
  if (input.includeCurrentScene && input.currentSceneId) {
    sceneIds.add(input.currentSceneId);
  }
  if (input.includeEntireAct && input.currentActId) {
    input.allSceneIds.forEach((id) => sceneIds.add(id));
  }

  const characterIds = input.includeCharacters
    ? [...input.allCharacterIds]
    : [...new Set(input.selectedCharacterIds)];

  const locationIds = input.includeLocations
    ? [...input.allLocationIds]
    : [...new Set(input.selectedLocationIds)];

  const timelineIds = input.includeTimeline && input.currentActId ? [input.currentActId] : [];
  const bibleSectionIds = input.includeStoryBible ? ['all'] : [];
  const researchIds = input.includeResearchNotes ? ['all'] : [];

  return {
    projectId: input.storyId,
    currentSceneId: input.currentSceneId,
    selectedSceneIds: [...sceneIds],
    selectedCharacterIds: characterIds,
    selectedLocationIds: locationIds,
    selectedTimelineIds: timelineIds,
    bibleSectionIds,
    researchIds,
    flags: {
      includeCurrentScene: input.includeCurrentScene,
      includeEntireAct: input.includeEntireAct,
      includeStoryBible: input.includeStoryBible,
      includeCharacters: input.includeCharacters,
      includeLocations: input.includeLocations,
      includeTimeline: input.includeTimeline,
      includeResearchNotes: input.includeResearchNotes,
      includeThemes: input.includeThemes,
      includeSymbols: input.includeSymbols,
      includeMotifs: input.includeMotifs,
      includePreviousScene: input.includePreviousScene,
      includeNextScene: input.includeNextScene,
      includeContinuityNotes: input.includeContinuityNotes,
      includeOpenQuestions: input.includeOpenQuestions,
      includeSceneMetadata: input.includeSceneMetadata,
    },
  };
}
