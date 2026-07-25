import { useMemo, useState } from 'react';
import { useAIChat } from '../../hooks/useAIChat';
import { useAIEditing } from '../../hooks/useAIEditing';
import { useContextSelection } from '../../hooks/useContextSelection';
import type { AIEditOperation, AIEditPlan, AISelectionRange } from '../../types/AIEditing';
import ContextChip from './ContextChip';
import ContextSelector from './ContextSelector';
import QuickActions from './QuickActions';
import PromptInput from './PromptInput';
import ChatWindow from './ChatWindow';
import AIEditProposalModal from './AIEditProposalModal';
import './AIAssistantPanel.css';

interface EntityItem {
  id: string;
  label: string;
}

interface AIAssistantPanelProps {
  storyId?: string;
  currentActId?: string;
  currentSceneId?: string;
  sceneContent: string;
  currentSelection: AISelectionRange | null;
  onApplySceneContent: (nextContent: string, summary: string) => void;
  onUndoLastAiEdit: () => void;
  canUndoAiEdit: boolean;
  scenes: EntityItem[];
  characters: EntityItem[];
  locations: EntityItem[];
}

export default function AIAssistantPanel({
  storyId,
  currentActId,
  currentSceneId,
  sceneContent,
  currentSelection,
  onApplySceneContent,
  onUndoLastAiEdit,
  canUndoAiEdit,
  scenes,
  characters,
  locations,
}: AIAssistantPanelProps) {
  const safeStoryId = storyId || 'draft-story';
  const [draftPrompt, setDraftPrompt] = useState('');
  const [lastEditPrompt, setLastEditPrompt] = useState('');
  const [pendingPlan, setPendingPlan] = useState<AIEditPlan | null>(null);
  const [isProposalOpen, setIsProposalOpen] = useState(false);

  const {
    isPickerOpen,
    setIsPickerOpen,
    searchQuery,
    setSearchQuery,
    filteredOptions,
    isSelected,
    toggleOption,
    contextChips,
    removeChip,
    buildContext,
  } = useContextSelection({
    storyId: safeStoryId,
    currentSceneId,
    currentActId,
    scenes,
    characters,
    locations,
  });

  const { messages, isSending, sendMessage, appendLocalMessage, quickActionToPrompt } = useAIChat({ storyId: safeStoryId });
  const { buildEditPlan } = useAIEditing({ storyId: safeStoryId, sceneId: currentSceneId });

  const canUseAI = Boolean(storyId);

  const handleSend = async (prompt: string) => {
    if (!canUseAI) return;
    const context = buildContext();
    const enrichedContext = {
      ...context,
      currentSceneText: sceneContent,
      selectedText: currentSelection?.text,
    };
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    const plan = await buildEditPlan({
      prompt: cleanPrompt,
      sceneContent,
      selection: currentSelection,
      context,
    });

    if (plan) {
      appendLocalMessage('user', cleanPrompt);
      setPendingPlan(plan);
      setIsProposalOpen(true);
      setLastEditPrompt(cleanPrompt);
      appendLocalMessage('assistant', `${plan.summary}\n\nReview the proposed changes and choose what to commit.`);
      return;
    }

    await sendMessage(cleanPrompt, enrichedContext);
  };

  const handleQuickAction = (actionId: string) => {
    const prompt = quickActionToPrompt(actionId);
    if (prompt) {
      setDraftPrompt(prompt);
    }
  };

  const applyOperation = (baseContent: string, operation: AIEditOperation): string => {
    if (operation.target === 'cursor' && operation.action === 'insert') {
      const cursor = operation.selection?.start;
      if (typeof cursor === 'number') {
        return `${baseContent.slice(0, cursor)}${operation.afterText}${baseContent.slice(cursor)}`;
      }
      return `${baseContent.trimEnd()}\n\n${operation.afterText}`;
    }

    if (operation.target === 'selected-text' && operation.selection) {
      const start = Math.max(0, operation.selection.start);
      const end = Math.max(start, operation.selection.end);
      return `${baseContent.slice(0, start)}${operation.afterText}${baseContent.slice(end)}`;
    }

    if (operation.target === 'current-scene') {
      if (operation.action === 'remove') return '';
      return operation.afterText;
    }

    return baseContent;
  };

  const handleCommitPlan = (selectedOperationIds: string[]) => {
    if (!pendingPlan) return;
    let nextContent = sceneContent;
    const selectedOperations = pendingPlan.operations.filter((operation) => selectedOperationIds.includes(operation.id));

    const selectionOps = selectedOperations
      .filter((operation) => operation.target === 'selected-text' && operation.selection)
      .sort((a, b) => (b.selection?.start ?? 0) - (a.selection?.start ?? 0));

    const nonSelectionOps = selectedOperations.filter((operation) => operation.target !== 'selected-text');

    nonSelectionOps.forEach((operation) => {
      nextContent = applyOperation(nextContent, operation);
    });

    selectionOps.forEach((operation) => {
      nextContent = applyOperation(nextContent, operation);
    });

    onApplySceneContent(nextContent, pendingPlan.summary);
    setPendingPlan(null);
    setIsProposalOpen(false);
    appendLocalMessage('assistant', 'Selected edits committed to the current scene. You can undo from AI Undo.');
  };

  const handleRegeneratePlan = async () => {
    if (!lastEditPrompt.trim()) return;
    setIsProposalOpen(false);
    const context = buildContext();
    const plan = await buildEditPlan({
      prompt: lastEditPrompt,
      sceneContent,
      selection: currentSelection,
      context,
    });
    if (plan) {
      setPendingPlan(plan);
      setIsProposalOpen(true);
    }
  };

  const groupedOptionCount = useMemo(() => filteredOptions.length, [filteredOptions]);

  return (
    <aside className="story-editor-rightpanel">
      <div className="ai-panel-card">
        <div className="ai-panel-header">
          <div>
            <div className="ai-panel-title">AI Story Assistant</div>
            <div className="ai-panel-subtitle">Context-aware guidance, writer in control</div>
          </div>
          <div className="ai-panel-header-actions">
            <button className="ai-context-open-btn" onClick={() => setIsPickerOpen(true)}>
              Use Context ({groupedOptionCount})
            </button>
            <button className="ai-context-open-btn" onClick={onUndoLastAiEdit} disabled={!canUndoAiEdit}>
              Undo AI Edit
            </button>
          </div>
        </div>

        <QuickActions onAction={handleQuickAction} />

        <ChatWindow messages={messages} isSending={isSending} />

        <div className="ai-context-chip-row">
          {contextChips.map((chip) => (
            <ContextChip key={chip.id} chip={chip} onRemove={removeChip} />
          ))}
        </div>

        <PromptInput
          isSending={isSending || !canUseAI}
          value={draftPrompt}
          onValueChange={setDraftPrompt}
          onSend={(prompt) => {
            void handleSend(prompt);
            setDraftPrompt('');
          }}
        />

        <ContextSelector
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          options={filteredOptions}
          isSelected={isSelected}
          onToggle={toggleOption}
        />

        <AIEditProposalModal
          isOpen={isProposalOpen}
          plan={pendingPlan}
          onClose={() => setIsProposalOpen(false)}
          onRegenerate={() => {
            void handleRegeneratePlan();
          }}
          onCommit={handleCommitPlan}
        />
      </div>
    </aside>
  );
}
