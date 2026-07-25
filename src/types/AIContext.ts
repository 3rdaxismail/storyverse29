export interface AIContextFlags {
  includeCurrentScene: boolean;
  includeEntireAct: boolean;
  includeStoryBible: boolean;
  includeCharacters: boolean;
  includeLocations: boolean;
  includeTimeline: boolean;
  includeResearchNotes: boolean;
  includeThemes: boolean;
  includeSymbols: boolean;
  includeMotifs: boolean;
  includePreviousScene: boolean;
  includeNextScene: boolean;
  includeContinuityNotes: boolean;
  includeOpenQuestions: boolean;
  includeSceneMetadata: boolean;
}

export interface AIContextPayload {
  projectId: string;
  currentSceneId?: string;
  selectedSceneIds: string[];
  selectedCharacterIds: string[];
  selectedLocationIds: string[];
  selectedTimelineIds: string[];
  bibleSectionIds: string[];
  researchIds: string[];
  flags: AIContextFlags;
}

export interface AIContextOption {
  id: string;
  label: string;
  type: 'toggle' | 'scene' | 'character' | 'location';
  group: string;
}

export interface AIContextChip {
  id: string;
  label: string;
}
