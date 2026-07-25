import { useEffect, useMemo, useState } from 'react';
import { AIServiceClientError, aiService } from '../services/ai/aiService';
import type { AIContextPayload } from '../types/AIContext';
import type { ChatMessage } from '../types/ChatMessage';

interface UseAIChatParams {
  storyId: string;
}

const QUICK_ACTION_PROMPTS: Record<string, string> = {
  continue: 'Continue this scene while preserving tone and continuity.',
  rewrite: 'Rewrite the selected passage for clarity and impact.',
  brainstorm: 'Brainstorm 5 grounded next-scene possibilities.',
  continuity: 'Check continuity against selected context and list issues.',
  dialogue: 'Improve dialogue voice and subtext for this scene.',
};

export function useAIChat({ storyId }: UseAIChatParams) {
  const [conversationId] = useState(`conv-${storyId}`);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem(`storyverse-ai-chat-${storyId}`);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as ChatMessage[];
    } catch {
      return [];
    }
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    localStorage.setItem(`storyverse-ai-chat-${storyId}`, JSON.stringify(messages));
  }, [storyId, messages]);

  const canSend = useMemo(() => !isSending && Boolean(storyId), [isSending, storyId]);

  const sendMessage = async (prompt: string, context: AIContextPayload) => {
    const cleanedPrompt = prompt.trim();
    if (!cleanedPrompt || !canSend) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: cleanedPrompt,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const result = await aiService.sendMessage({
        projectId: storyId,
        conversationId,
        prompt: cleanedPrompt,
        selectedContext: context,
      });

      setMessages((prev) => [...prev, result.message]);
    } catch (error) {
      const friendlyMessage =
        error instanceof AIServiceClientError
          ? error.message
          : 'Unable to contact AI service right now. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: friendlyMessage,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const appendLocalMessage = (role: ChatMessage['role'], content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role,
        content,
        createdAt: Date.now(),
      },
    ]);
  };

  const quickActionToPrompt = (actionId: string): string => QUICK_ACTION_PROMPTS[actionId] || '';

  return {
    messages,
    isSending,
    canSend,
    sendMessage,
    appendLocalMessage,
    quickActionToPrompt,
  };
}
