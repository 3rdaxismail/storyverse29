import type { AIContextChip } from '../../types/AIContext';

interface ContextChipProps {
  chip: AIContextChip;
  onRemove: (chipId: string) => void;
}

export default function ContextChip({ chip, onRemove }: ContextChipProps) {
  return (
    <button className="ai-context-chip" onClick={() => onRemove(chip.id)} title="Remove context">
      <span>{chip.label}</span>
      <span aria-hidden="true">×</span>
    </button>
  );
}
