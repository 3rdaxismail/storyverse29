import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/ChatMessage';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderMarkdownLite(content: string): React.ReactNode {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={`list-${nodes.length}`}>
        {listBuffer.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const renderBold = (text: string, keyPrefix: string) => {
    const segments = text.split(/(\*\*[^*]+\*\*)/g);
    return segments.map((segment, index) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return <strong key={`${keyPrefix}-${index}`}>{segment.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={`${keyPrefix}-${index}`}>{segment}</React.Fragment>;
    });
  };

  lines.forEach((line) => {
    if (line.trim().startsWith('- ')) {
      listBuffer.push(line.trim().slice(2));
      return;
    }

    flushList();

    if (!line.trim()) {
      nodes.push(<div key={`sp-${nodes.length}`} className="ai-msg-spacer" />);
      return;
    }

    nodes.push(<p key={`p-${nodes.length}`}>{renderBold(line, `b-${nodes.length}`)}</p>);
  });

  flushList();

  return nodes;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`ai-chat-message ai-chat-message-${message.role}`}>
      <div className="ai-chat-role">{message.role === 'user' ? 'You' : 'AI'}</div>
      <div className="ai-chat-content">{renderMarkdownLite(message.content)}</div>
    </div>
  );
}
