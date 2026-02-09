/**
 * useEditorState Hook
 * 
 * Determines the current state of an editor component based on:
 * - Content presence
 * - Focus state
 * - User typing activity
 * - Selection state
 * - Disabled/readonly props
 */

import { useState, useEffect, useRef } from 'react';

export type EditorState = 
  | 'empty' 
  | 'idle' 
  | 'focused' 
  | 'typing' 
  | 'selection' 
  | 'disabled' 
  | 'readOnly';

interface UseEditorStateOptions {
  content: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const TYPING_DEBOUNCE_MS = 500;

export function useEditorState(
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  options: UseEditorStateOptions
): EditorState {
  const { content, disabled, readOnly } = options;
  const [hasFocus, setHasFocus] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Handle focus state
  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    const handleFocus = () => setHasFocus(true);
    const handleBlur = () => {
      setHasFocus(false);
      setIsTyping(false);
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [inputRef]);

  // Handle typing state with debounce
  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    const handleInput = () => {
      setIsTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to mark typing as stopped
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, TYPING_DEBOUNCE_MS);
    };

    element.addEventListener('input', handleInput);

    return () => {
      element.removeEventListener('input', handleInput);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [inputRef]);

  // Handle selection state
  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    const handleSelect = () => {
      const selectionLength = (element.selectionEnd || 0) - (element.selectionStart || 0);
      setHasSelection(selectionLength > 0);
    };

    element.addEventListener('select', handleSelect);
    element.addEventListener('mouseup', handleSelect);
    element.addEventListener('keyup', handleSelect);

    return () => {
      element.removeEventListener('select', handleSelect);
      element.removeEventListener('mouseup', handleSelect);
      element.removeEventListener('keyup', handleSelect);
    };
  }, [inputRef]);

  // Determine current state
  if (disabled) return 'disabled';
  if (readOnly) return 'readOnly';
  if (content.length === 0) return 'empty';
  if (hasFocus && hasSelection) return 'selection';
  if (hasFocus && isTyping) return 'typing';
  if (hasFocus) return 'focused';
  return 'idle';
}
