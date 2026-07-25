interface QuickActionsProps {
  onAction: (actionId: string) => void;
}

const ACTIONS = [
  { id: 'continue', label: 'Continue Scene' },
  { id: 'rewrite', label: 'Rewrite Scene' },
  { id: 'brainstorm', label: 'Brainstorm Ideas' },
  { id: 'continuity', label: 'Check Continuity' },
  { id: 'dialogue', label: 'Improve Dialogue' },
];

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="ai-quick-actions">
      {ACTIONS.map((action) => (
        <button key={action.id} onClick={() => onAction(action.id)}>
          {action.label}
        </button>
      ))}
    </div>
  );
}
