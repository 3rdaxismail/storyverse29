export interface ChatMessageReference {
  id: string;
  label: string;
  type: 'scene' | 'character' | 'location' | 'timeline' | 'bible' | 'research' | 'other';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  references?: ChatMessageReference[];
}
