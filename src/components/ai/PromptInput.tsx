import { useState } from 'react';

interface PromptInputProps {
  isSending: boolean;
  onSend: (prompt: string) => void;
  value?: string;
  onValueChange?: (nextValue: string) => void;
}

export default function PromptInput({ isSending, onSend, value: controlledValue, onValueChange }: PromptInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue ?? internalValue;

  const setValue = (nextValue: string) => {
    if (onValueChange) {
      onValueChange(nextValue);
      return;
    }
    setInternalValue(nextValue);
  };

  const handleSend = () => {
    const prompt = value.trim();
    if (!prompt) return;
    onSend(prompt);
    setValue('');
  };

  return (
    <div className="ai-prompt-input-wrap">
      <textarea
        className="ai-prompt-input"
        value={value}
        placeholder="Ask AI to help with this scene..."
        onChange={(event) => setValue(event.target.value)}
        rows={3}
      />
      <button className="ai-send-btn" disabled={isSending || !value.trim()} onClick={handleSend}>
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
