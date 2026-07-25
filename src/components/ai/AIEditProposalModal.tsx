import { useMemo, useState } from 'react';
import type { AIEditOperation, AIEditPlan } from '../../types/AIEditing';

interface AIEditProposalModalProps {
  isOpen: boolean;
  plan: AIEditPlan | null;
  onClose: () => void;
  onRegenerate: () => void;
  onCommit: (selectedOperationIds: string[]) => void;
}

function lineDiff(beforeText: string, afterText: string) {
  const before = beforeText.split('\n');
  const after = afterText.split('\n');
  const max = Math.max(before.length, after.length);
  const rows: Array<{ type: 'same' | 'add' | 'remove' | 'modify'; beforeLine: string; afterLine: string }> = [];

  for (let i = 0; i < max; i += 1) {
    const beforeLine = before[i] ?? '';
    const afterLine = after[i] ?? '';

    if (beforeLine === afterLine) {
      rows.push({ type: 'same', beforeLine, afterLine });
    } else if (!beforeLine && afterLine) {
      rows.push({ type: 'add', beforeLine, afterLine });
    } else if (beforeLine && !afterLine) {
      rows.push({ type: 'remove', beforeLine, afterLine });
    } else {
      rows.push({ type: 'modify', beforeLine, afterLine });
    }
  }

  return rows;
}

function OperationDiff({ operation }: { operation: AIEditOperation }) {
  const rows = useMemo(() => lineDiff(operation.beforeText, operation.afterText), [operation.beforeText, operation.afterText]);

  return (
    <div className="ai-edit-diff-wrap">
      <div className="ai-edit-diff-head">{operation.description}</div>
      <div className="ai-edit-diff-grid">
        <div className="ai-edit-diff-col-title">Before</div>
        <div className="ai-edit-diff-col-title">After</div>
        {rows.map((row, idx) => (
          <div key={`row-${idx}`} style={{ display: 'contents' }}>
            <div className={`ai-edit-diff-line ${row.type}`}>{row.beforeLine || ' '}</div>
            <div className={`ai-edit-diff-line ${row.type}`}>{row.afterLine || ' '}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIEditProposalModal({
  isOpen,
  plan,
  onClose,
  onRegenerate,
  onCommit,
}: AIEditProposalModalProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  if (!isOpen || !plan) return null;

  const selectedIds = plan.operations
    .filter((operation) => selected[operation.id] ?? true)
    .map((operation) => operation.id);

  const toggleOperation = (id: string) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  return (
    <div className="ai-edit-modal-backdrop" onClick={onClose}>
      <div className="ai-edit-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ai-edit-modal-header">
          <div>
            <div className="ai-edit-modal-title">AI Edit Preview</div>
            <div className="ai-edit-modal-summary">{plan.summary}</div>
          </div>
          <button className="ai-edit-close" onClick={onClose}>×</button>
        </div>

        <div className="ai-edit-meta">
          <span>Scenes affected: {plan.affectedSceneIds.length}</span>
          <span>Elements affected: {plan.affectedElements.join(', ')}</span>
        </div>

        <div className="ai-edit-ops-list">
          {plan.operations.map((operation) => {
            const checked = selected[operation.id] ?? true;
            return (
              <label key={operation.id} className="ai-edit-op-item">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleOperation(operation.id)}
                />
                <div>
                  <div className="ai-edit-op-title">{operation.action.toUpperCase()} · {operation.target}</div>
                  <div className="ai-edit-op-desc">{operation.description}</div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="ai-edit-diff-list">
          {plan.operations
            .filter((operation) => selected[operation.id] ?? true)
            .map((operation) => (
              <OperationDiff key={operation.id} operation={operation} />
            ))}
        </div>

        <div className="ai-edit-actions">
          <button className="ai-edit-secondary" onClick={onRegenerate}>Regenerate</button>
          <button className="ai-edit-secondary" onClick={onClose}>Reject</button>
          <button className="ai-edit-primary" onClick={() => onCommit(selectedIds)} disabled={selectedIds.length === 0}>
            Commit Selected Changes
          </button>
        </div>
      </div>
    </div>
  );
}
