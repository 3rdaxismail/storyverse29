import { aiService } from '../services/ai/aiService';
import type { AIContextPayload } from '../types/AIContext';
import type { AIEditPlan, AISelectionRange } from '../types/AIEditing';

interface UseAIEditingParams {
  storyId: string;
  sceneId?: string;
}

interface BuildPlanInput {
  prompt: string;
  sceneContent: string;
  selection: AISelectionRange | null;
  context: AIContextPayload;
}

export function useAIEditing({ storyId, sceneId }: UseAIEditingParams) {
  const buildEditPlan = async ({ prompt, sceneContent, selection, context }: BuildPlanInput): Promise<AIEditPlan | null> => {
    if (!sceneId) return null;
    return aiService.proposeSceneEdits({
      storyId,
      sceneId,
      prompt,
      sceneContent,
      selection,
      context,
    });
  };

  return {
    buildEditPlan,
  };
}
