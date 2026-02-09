/**
 * useWritingEngine Hook
 * 
 * React hook for subscribing to WritingSessionEngine state changes.
 * Pages use this hook to consume engine state without owning data.
 * 
 * USAGE:
 * const storyState = useWritingEngine();
 * // storyState automatically updates when engine notifies listeners
 */

import { useEffect, useState } from 'react';
import writingSessionEngine, { type StoryState, type PoemState, type ContentType } from '../engine/WritingSessionEngine';

type EngineState = {
  contentType: ContentType;
  story: StoryState | null;
  poem: PoemState | null;
};

/**
 * Subscribe to WritingSessionEngine and get current state
 */
export function useWritingEngine(): EngineState {
  const [state, setState] = useState<EngineState>(() => {
    const contentType = writingSessionEngine.getContentType();
    return {
      contentType,
      story: contentType === 'story' ? writingSessionEngine.getStoryState() : null,
      poem: (contentType === 'poem' || contentType === 'lyrics') ? writingSessionEngine.getPoemState() : null,
    };
  });

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const contentType = writingSessionEngine.getContentType();
      setState({
        contentType,
        story: contentType === 'story' ? writingSessionEngine.getStoryState() : null,
        poem: (contentType === 'poem' || contentType === 'lyrics') ? writingSessionEngine.getPoemState() : null,
      });
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return state;
}

/**
 * Subscribe to story-specific state (convenience hook)
 */
export function useStoryEngine(): StoryState | null {
  const { story } = useWritingEngine();
  return story;
}

/**
 * Subscribe to poem-specific state (convenience hook)
 */
export function usePoemEngine(): PoemState | null {
  const { poem } = useWritingEngine();
  return poem;
}
