import { useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/ChatMessage';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isSending: boolean;
}

export default function ChatWindow({ messages, isSending }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  return (
    <div className="ai-chat-window">
      {messages.length === 0 ? (
        <div className="ai-chat-empty">
          Ask for help with pacing, continuity, dialogue, or scene direction.
        </div>
      ) : (
        messages.map((message) => <ChatMessage key={message.id} message={message} />)
      )}
      {isSending && <div className="ai-chat-typing">AI is thinking...</div>}
      <div ref={endRef} />
    </div>
  );
}
