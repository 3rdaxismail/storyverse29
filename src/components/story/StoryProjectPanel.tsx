import React, { useMemo } from 'react';
import { useStoryProject } from '../../hooks/useStoryProject';
import { storyBibleService } from '../../services/storyProject/storyBibleService';
import { storyBrainService } from '../../services/storyProject/storyBrainService';
import { sceneManagerService } from '../../services/storyProject/sceneManagerService';
import { aiAssistantService } from '../../services/storyProject/aiAssistantService';

interface StoryProjectPanelProps {
  storyId?: string;
}

export default function StoryProjectPanel({ storyId }: StoryProjectPanelProps) {
  const { metadata, bible, brain, scenes, aiSuggestions, storyHealth } = useStoryProject(storyId);

  const summary = useMemo(() => [
    metadata?.premise ? `Premise: ${metadata.premise}` : null,
    metadata?.theme ? `Theme: ${metadata.theme}` : null,
    metadata?.genre ? `Genre: ${metadata.genre}` : null,
  ].filter(Boolean), [metadata]);

  const addSampleBibleEntry = () => {
    if (!storyId) return;
    storyBibleService.create(storyId, 'premise', 'Story Premise', 'Captured from the current story draft.');
  };

  const addSampleBrainEntry = () => {
    if (!storyId) return;
    storyBrainService.index(storyId, {
      sourceType: 'story-bible',
      sourceId: 'sample',
      title: 'Story Bible Entry',
      summary: 'Indexed from the story bible for fast retrieval.',
      keywords: ['story', 'bible', 'context'],
    });
  };

  const addSampleScene = () => {
    if (!storyId) return;
    sceneManagerService.create(storyId, {
      title: 'Opening Scene',
      purpose: 'Introduce the conflict',
      conflict: 'The protagonist faces uncertainty',
      characters: [],
      locations: [],
      timelinePosition: 'Act I',
      estimatedRuntime: '5 min',
      completionStatus: 'draft',
      notes: 'Captured as a scene entry',
      storyArc: 'Setup',
      content: '',
    });
  };

  const addSampleAiSuggestion = () => {
    if (!storyId) return;
    aiAssistantService.add(storyId, {
      type: 'consistency',
      prompt: 'Check character continuity',
      response: 'The assistant can later analyze the current scene and suggest continuity improvements.',
    });
  };

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>Story Project OS</h3>
      <p style={{ marginTop: 0, color: '#4b5563' }}>A scalable Story Development Operating System layer built on top of your existing story editor.</p>

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        <div><strong>Metadata:</strong> {metadata?.title || 'Untitled'}</div>
        <div><strong>Summary:</strong> {summary.join(' • ') || 'No summary yet'}</div>
        <div><strong>Story Health:</strong> Bible {storyHealth.bibleCoverage} • Brain {storyHealth.brainHealth} • Scenes {storyHealth.scenesCount}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button onClick={addSampleBibleEntry}>Add Bible Entry</button>
        <button onClick={addSampleBrainEntry}>Index Brain Entry</button>
        <button onClick={addSampleScene}>Add Scene</button>
        <button onClick={addSampleAiSuggestion}>Add AI Suggestion</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Story Bible</h4>
        <ul>
          {bible.slice(0, 5).map(entry => <li key={entry.id}>{entry.title}</li>)}
        </ul>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Story Brain</h4>
        <ul>
          {brain.slice(0, 5).map(entry => <li key={entry.id}>{entry.title}</li>)}
        </ul>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Scene Manager</h4>
        <ul>
          {scenes.slice(0, 5).map(scene => <li key={scene.id}>{scene.title}</li>)}
        </ul>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>AI Assistant</h4>
        <ul>
          {aiSuggestions.slice(0, 5).map(suggestion => <li key={suggestion.id}>{suggestion.prompt}</li>)}
        </ul>
      </div>
    </section>
  );
}
