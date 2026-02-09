/**
 * useWritingSession Hook
 * 
 * Connects UI components to the WritingSessionEngine
 * Handles state synchronization, active editor tracking, and persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import writingSessionEngine, { type WritingState } from '../engine/WritingSessionEngine';

interface UseWritingSessionOptions {
  editorId: string;
  onFocus?: () => void;
  onBlur?: () => void;
  debounceMs?: number;
}

interface UseWritingSessionReturn {
  content: string;
  isActive: boolean;
  handleChange: (value: string) => void;
  handleFocus: () => void;
  handleBlur: () => void;
}

/**
 * Hook for connecting text inputs to the writing session engine
 */
export function useWritingSession({
  editorId,
  onFocus,
  onBlur,
  debounceMs = 300,
}: UseWritingSessionOptions): UseWritingSessionReturn {
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Subscribe to engine updates
  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const activeEditorId = writingSessionEngine.getActiveEditorId();
      setIsActive(activeEditorId === editorId);
    });

    return unsubscribe;
  }, [editorId]);

  // Handle content change with debouncing
  const handleChange = useCallback(
    (value: string) => {
      // Update local state immediately for responsive UI
      setContent(value);

      // Debounce engine update
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        // Story title is handled specially
        if (editorId === 'story-title') {
          writingSessionEngine.setStoryTitle(value);
        }
      }, debounceMs);
    },
    [editorId, debounceMs]
  );

  // Handle focus - mark this editor as active
  const handleFocus = useCallback(() => {
    writingSessionEngine.setActiveEditor(editorId);
    setIsActive(true);
    onFocus?.();
  }, [editorId, onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    content,
    isActive,
    handleChange,
    handleFocus,
    handleBlur,
  };
}

/**
 * Hook for accessing story title from the session
 */
export function useStoryTitle(): [string, (title: string) => void] {
  const [title, setTitle] = useState(() => writingSessionEngine.getStoryTitle());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedTitle = writingSessionEngine.getStoryTitle();
      if (updatedTitle !== title) {
        setTitle(updatedTitle);
      }
    });

    return unsubscribe;
  }, [title]);

  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle);
    writingSessionEngine.setStoryTitle(newTitle);
  }, []);

  return [title, updateTitle];
}

/**
 * Hook for accessing active editor state
 */
export function useActiveEditor(editorId: string): boolean {
  const [isActive, setIsActive] = useState(
    () => writingSessionEngine.getActiveEditorId() === editorId
  );

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const activeEditorId = writingSessionEngine.getActiveEditorId();
      setIsActive(activeEditorId === editorId);
    });

    return unsubscribe;
  }, [editorId]);

  return isActive;
}

/**
 * Hook for accessing privacy setting from the session
 */
export function usePrivacy(): [string, (privacy: string) => void] {
  const [privacy, setPrivacy] = useState(() => writingSessionEngine.getPrivacy());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedPrivacy = writingSessionEngine.getPrivacy();
      if (updatedPrivacy !== privacy) {
        setPrivacy(updatedPrivacy);
      }
    });

    return unsubscribe;
  }, [privacy]);

  const updatePrivacy = useCallback((newPrivacy: string) => {
    setPrivacy(newPrivacy);
    writingSessionEngine.setPrivacy(newPrivacy as 'open' | 'private');
  }, []);

  return [privacy, updatePrivacy];
}

/**
 * Hook for accessing primary genre from the session
 */
export function usePrimaryGenre(): [string, (genre: string) => void] {
  const [genre, setGenre] = useState(() => writingSessionEngine.getPrimaryGenre());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedGenre = writingSessionEngine.getPrimaryGenre();
      if (updatedGenre !== genre) {
        setGenre(updatedGenre);
      }
    });

    return unsubscribe;
  }, [genre]);

  const updateGenre = useCallback((newGenre: string) => {
    setGenre(newGenre);
    writingSessionEngine.setPrimaryGenre(newGenre);
  }, []);

  return [genre, updateGenre];
}

/**
 * Hook for accessing secondary genre from the session
 */
export function useSecondaryGenre(): [string, (genre: string) => void] {
  const [genre, setGenre] = useState(() => writingSessionEngine.getSecondaryGenre());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedGenre = writingSessionEngine.getSecondaryGenre();
      if (updatedGenre !== genre) {
        setGenre(updatedGenre);
      }
    });

    return unsubscribe;
  }, [genre]);

  const updateGenre = useCallback((newGenre: string) => {
    setGenre(newGenre);
    writingSessionEngine.setSecondaryGenre(newGenre);
  }, []);

  return [genre, updateGenre];
}

/**
 * Hook for accessing tertiary genre from the session
 */
export function useTertiaryGenre(): [string, (genre: string) => void] {
  const [genre, setGenre] = useState(() => writingSessionEngine.getTertiaryGenre());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedGenre = writingSessionEngine.getTertiaryGenre();
      if (updatedGenre !== genre) {
        setGenre(updatedGenre);
      }
    });

    return unsubscribe;
  }, [genre]);

  const updateGenre = useCallback((newGenre: string) => {
    setGenre(newGenre);
    writingSessionEngine.setTertiaryGenre(newGenre);
  }, []);

  return [genre, updateGenre];
}

/**
 * Hook for accessing audience from the session
 */
export function useAudience(): [string, (audience: string) => void] {
  const [audience, setAudience] = useState(() => writingSessionEngine.getAudience());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedAudience = writingSessionEngine.getAudience();
      if (updatedAudience !== audience) {
        setAudience(updatedAudience);
      }
    });

    return unsubscribe;
  }, [audience]);

  const updateAudience = useCallback((newAudience: string) => {
    setAudience(newAudience);
    writingSessionEngine.setAudience(newAudience);
  }, []);

  return [audience, updateAudience];
}

/**
 * Hook for accessing reading time from the session
 */
export function useReadingTime(): number {
  const [readingTime, setReadingTime] = useState(() => writingSessionEngine.getReadingTime());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedTime = writingSessionEngine.getReadingTime();
      if (updatedTime !== readingTime) {
        setReadingTime(updatedTime);
      }
    });

    return unsubscribe;
  }, [readingTime]);

  return readingTime;
}

/**
 * Hook for chapter text content
 */
export function useChapterText(chapterId: string): [string, (text: string) => void, WritingState] {
  const [text, setText] = useState(() => writingSessionEngine.getChapterText(chapterId));
  const [state, setState] = useState<WritingState>(() => writingSessionEngine.getChapterState(chapterId));

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedText = writingSessionEngine.getChapterText(chapterId);
      const updatedState = writingSessionEngine.getChapterState(chapterId);
      
      if (updatedText !== text) {
        setText(updatedText);
      }
      if (updatedState !== state) {
        setState(updatedState);
      }
    });

    return unsubscribe;
  }, [chapterId, text, state]);

  const updateText = useCallback((newText: string) => {
    setText(newText);
    writingSessionEngine.updateChapterText(chapterId, newText);
  }, [chapterId]);

  return [text, updateText, state];
}

/**
 * Hook for accessing excerpt heading from the session
 */
export function useExcerptHeading(): [string, (heading: string) => void] {
  const [heading, setHeading] = useState(() => writingSessionEngine.getExcerptHeading());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedHeading = writingSessionEngine.getExcerptHeading();
      if (updatedHeading !== heading) {
        setHeading(updatedHeading);
      }
    });

    return unsubscribe;
  }, [heading]);

  const updateHeading = useCallback((newHeading: string) => {
    setHeading(newHeading);
    writingSessionEngine.setExcerptHeading(newHeading);
  }, []);

  return [heading, updateHeading];
}

/**
 * Hook for accessing excerpt body from the session
 */
export function useExcerptBody(): [string, (body: string) => void] {
  const [body, setBody] = useState(() => writingSessionEngine.getExcerptBody());

  useEffect(() => {
    const unsubscribe = writingSessionEngine.subscribe(() => {
      const updatedBody = writingSessionEngine.getExcerptBody();
      if (updatedBody !== body) {
        setBody(updatedBody);
      }
    });

    return unsubscribe;
  }, [body]);

  const updateBody = useCallback((newBody: string) => {
    setBody(newBody);
    writingSessionEngine.setExcerptBody(newBody);
  }, []);

  return [body, updateBody];
}
