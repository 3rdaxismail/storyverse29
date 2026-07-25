export interface SelectedContextPayload {
  currentSceneId?: string;
  selectedSceneIds: string[];
  selectedCharacterIds: string[];
  selectedLocationIds: string[];
  selectedTimelineIds: string[];
  bibleSectionIds: string[];
  researchIds: string[];
  flags?: Record<string, boolean>;
  // Transitional fields until backend context builder reads from DB.
  currentSceneText?: string;
  selectedText?: string;
}

export interface ChatRequest {
  projectId: string;
  conversationId: string;
  prompt: string;
  selectedContext: SelectedContextPayload;
}
