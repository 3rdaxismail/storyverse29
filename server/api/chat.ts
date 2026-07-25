import { Router } from 'express';
import { AIService } from '../services/ai/AIService';
import { AIProviderError } from '../services/ai/AIProvider';
import type { ChatRequest } from '../types/ChatRequest';

const router = Router();
const aiService = new AIService();

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateRequestBody(body: unknown): body is ChatRequest {
  if (!body || typeof body !== 'object') return false;
  const candidate = body as Partial<ChatRequest>;

  if (!isString(candidate.projectId)) return false;
  if (!isString(candidate.conversationId)) return false;
  if (!isString(candidate.prompt)) return false;
  if (!candidate.selectedContext || typeof candidate.selectedContext !== 'object') return false;

  const context = candidate.selectedContext;
  return (
    Array.isArray(context.selectedSceneIds) &&
    Array.isArray(context.selectedCharacterIds) &&
    Array.isArray(context.selectedLocationIds) &&
    Array.isArray(context.selectedTimelineIds) &&
    Array.isArray(context.bibleSectionIds) &&
    Array.isArray(context.researchIds)
  );
}

router.post('/chat', async (req, res) => {
  if (!validateRequestBody(req.body)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Invalid chat request payload.',
      },
    });
  }

  try {
    const response = await aiService.chat(req.body);
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof AIProviderError) {
      return res.status(error.status).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unexpected server error while processing AI chat.',
      },
    });
  }
});

export default router;
