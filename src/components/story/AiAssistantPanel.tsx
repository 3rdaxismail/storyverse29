import React from 'react';
import { aiAssistantService } from '../../services/storyProject/aiAssistantService';

interface AiAssistantPanelProps {
  storyId?: string;
  sceneTitle?: string;
}

const ACTIONS: Array<{ type: 'continue-scene' | 'rewrite-scene' | 'brainstorm' | 'continuity' | 'dialogue'; label: string }> = [
  { type: 'continue-scene', label: 'Continue this scene' },
  { type: 'rewrite-scene', label: 'Rewrite this scene' },
  { type: 'brainstorm', label: 'Brainstorm ideas' },
  { type: 'continuity', label: 'Check continuity' },
  { type: 'dialogue', label: 'Improve dialogue' },
];

export default function AiAssistantPanel({ storyId, sceneTitle }: AiAssistantPanelProps) {
  const currentScene = sceneTitle || 'Scene 2';

  const handleAction = (type: typeof ACTIONS[number]['type']) => {
    if (!storyId) return;
    aiAssistantService.add(storyId, {
      type,
      prompt: `Please perform '${type}' for ${currentScene}.`,
      response: `AI assistant registered action '${type}' for ${currentScene}.`,
    });
  };

  return (
    <aside className="story-editor-rightpanel">
      <div className="rightpanel-card">
        <div className="rightpanel-header">
          <div className="rightpanel-title">AI Assistant</div>
        </div>

        <div className="rightpanel-actions">
          {ACTIONS.map((action) => (
            <button key={action.type} className="rightpanel-button" onClick={() => handleAction(action.type)} disabled={!storyId}>
              {action.label}
            </button>
          ))}
        </div>

        <div className="rightpanel-chatbox">
          <div className="rightpanel-chat-placeholder">Ask anything about your story...</div>
          <div className="rightpanel-chat-footer">
            <button className="rightpanel-send">Send</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

