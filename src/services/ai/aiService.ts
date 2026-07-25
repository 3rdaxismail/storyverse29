import type { AIContextPayload } from '../../types/AIContext';
import type { Conversation } from '../../types/Conversation';
import type { ChatMessage } from '../../types/ChatMessage';
import type { AIEditPlan, AIEditOperation, AISelectionRange } from '../../types/AIEditing';

export interface AIChatRequest {
  projectId: string;
  conversationId: string;
  prompt: string;
  selectedContext: AIContextPayload & {
    currentSceneText?: string;
    selectedText?: string;
  };
}

export interface AIChatResponse {
  message: ChatMessage;
  conversation: Conversation;
}

interface AIEditProposalRequest {
  storyId: string;
  sceneId: string;
  prompt: string;
  sceneContent: string;
  selection: AISelectionRange | null;
  context: AIContextPayload;
}

export class AIServiceClientError extends Error {
  public readonly code: string;

  constructor(message: string, code = 'AI_REQUEST_FAILED') {
    super(message);
    this.code = code;
  }
}

const EDIT_INTENT_KEYWORDS = [
  'rewrite',
  'improve',
  'reduce',
  'show instead of tell',
  'make',
  'increase',
  'add',
  'shorten',
  'fix grammar',
  'readability',
  'simpler language',
  'continue from here',
  'continue scene',
];

function hasEditIntent(prompt: string): boolean {
  const normalized = prompt.toLowerCase();
  return EDIT_INTENT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function simplifyText(text: string): string {
  return text
    .replace(/utilize/gi, 'use')
    .replace(/approximately/gi, 'about')
    .replace(/commence/gi, 'start')
    .replace(/subsequently/gi, 'then')
    .replace(/nevertheless/gi, 'still')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function improveTextByPrompt(sourceText: string, prompt: string): string {
  const lower = prompt.toLowerCase();
  let next = sourceText.trim();

  if (lower.includes('fix grammar') || lower.includes('readability')) {
    next = next
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .replace(/\bi\b/g, 'I');
  }

  if (lower.includes('simpler language')) {
    next = simplifyText(next);
  }

  if (lower.includes('reduce exposition') || lower.includes('shorten')) {
    const sentences = next.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 2) {
      next = sentences.slice(0, Math.max(2, Math.ceil(sentences.length * 0.7))).join(' ');
    }
  }

  if (lower.includes('increase tension') || lower.includes('foreshadow')) {
    next = `${next}\n\nA faint unease lingered, as if one wrong step would reveal what had been hidden all along.`;
  }

  if (lower.includes('dialogue') || lower.includes('emotional')) {
    next = next.replace(/"([^"]+)"/g, '"$1," they said, voice tightening.');
  }

  if (next.length === 0) {
    next = sourceText;
  }

  return next;
}

function buildOperationForSelection(prompt: string, selection: AISelectionRange, sceneId: string): AIEditOperation {
  const replacement = improveTextByPrompt(selection.text, prompt);
  return {
    id: `edit-selection-${Date.now()}`,
    target: 'selected-text',
    action: 'replace',
    description: 'Replace selected text with AI rewrite',
    beforeText: selection.text,
    afterText: replacement,
    selection,
  };
}

function buildOperationForScene(prompt: string, sceneContent: string): AIEditOperation {
  const nextScene = improveTextByPrompt(sceneContent, prompt);
  return {
    id: `edit-scene-${Date.now()}`,
    target: 'current-scene',
    action: 'replace',
    description: 'Revise the current scene draft',
    beforeText: sceneContent,
    afterText: nextScene,
  };
}

function buildCursorOperation(sceneContent: string, selection: AISelectionRange | null): AIEditOperation {
  const continuation = 'The next beat should force a choice the protagonist cannot ignore.';
  const cursorPosition = selection ? selection.start : sceneContent.length;
  return {
    id: `edit-cursor-${Date.now()}`,
    target: 'cursor',
    action: 'insert',
    description: 'Insert continuation at cursor position',
    beforeText: sceneContent,
    afterText: continuation,
    selection: {
      start: cursorPosition,
      end: cursorPosition,
      text: '',
    },
  };
}

function createMockAssistantReply(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('rewrite')) {
    return 'Here is a tighter rewrite with stronger pacing and clearer emotional beats.\n\n- Keep the conflict visible in every paragraph\n- Shorten descriptive lines between actions\n- End on a decision or reveal';
  }
  if (lower.includes('brainstorm')) {
    return 'Possible directions for your next beat:\n\n1. A hidden motive is revealed by a side character\n2. A prior promise creates a moral dilemma\n3. A location detail introduces immediate risk';
  }
  return 'Great scene foundation. I suggest continuing with one concrete character objective, one obstacle, and one emotional turn in the next paragraph.';
}

export const aiService = {
  async sendMessage(request: AIChatRequest): Promise<AIChatResponse> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    let parsed: any = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const message = parsed?.error?.message || 'AI request failed. Please try again.';
      const code = parsed?.error?.code || 'AI_REQUEST_FAILED';
      throw new AIServiceClientError(message, code);
    }

    const assistantText: string = parsed?.message || createMockAssistantReply(request.prompt);
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: assistantText,
      createdAt: Date.now(),
    };

    return {
      message: assistantMessage,
      conversation: {
        id: request.conversationId,
        storyId: request.projectId,
        title: 'Story Assistant',
        messages: [assistantMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };
  },

  async *streamMessage(request: AIChatRequest): AsyncGenerator<string> {
    const fallback = createMockAssistantReply(request.prompt);
    const chunks = fallback.split(' ');
    for (const chunk of chunks) {
      yield `${chunk} `;
    }
  },

  async proposeSceneEdits(request: AIEditProposalRequest): Promise<AIEditPlan | null> {
    if (!hasEditIntent(request.prompt)) {
      return null;
    }

    const lower = request.prompt.toLowerCase();
    let operations: AIEditOperation[] = [];

    if (lower.includes('continue from here')) {
      operations = [buildCursorOperation(request.sceneContent, request.selection)];
    } else if (request.selection && request.selection.text.trim()) {
      operations = [buildOperationForSelection(request.prompt, request.selection, request.sceneId)];
    } else {
      operations = [buildOperationForScene(request.prompt, request.sceneContent)];
    }

    const changedCount = operations.filter((op) => op.beforeText !== op.afterText || op.action === 'insert').length;

    return {
      id: `plan-${Date.now()}`,
      summary: `Prepared ${changedCount} proposed change${changedCount === 1 ? '' : 's'} for the current scene. Review and approve before applying.`,
      operations,
      affectedSceneIds: [request.sceneId],
      affectedElements: ['scene-content'],
    };
  },
};
