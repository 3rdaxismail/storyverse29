import type { AIContextOption } from '../../types/AIContext';

interface ContextSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  options: AIContextOption[];
  isSelected: (optionId: string) => boolean;
  onToggle: (optionId: string) => void;
}

export default function ContextSelector({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  options,
  isSelected,
  onToggle,
}: ContextSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="ai-context-selector-backdrop" onClick={onClose}>
      <div className="ai-context-selector" onClick={(event) => event.stopPropagation()}>
        <div className="ai-context-selector-header">
          <div>Use Context</div>
          <button onClick={onClose} aria-label="Close context selector">×</button>
        </div>

        <input
          className="ai-context-search"
          placeholder="Search context..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />

        <div className="ai-context-options">
          {options.map((option) => (
            <label key={option.id} className="ai-context-option-row">
              <input
                type="checkbox"
                checked={isSelected(option.id)}
                onChange={() => onToggle(option.id)}
              />
              <div>
                <div className="ai-context-option-label">{option.label}</div>
                <div className="ai-context-option-group">{option.group}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
