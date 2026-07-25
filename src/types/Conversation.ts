import type { ChatMessage } from './ChatMessage';

export interface Conversation {
  id: string;
  storyId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
