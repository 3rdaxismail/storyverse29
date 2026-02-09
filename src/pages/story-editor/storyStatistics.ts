/**
 * Story Statistics Utilities
 * 
 * Pure calculation functions for StatsBlock
 * Source of truth: WritingSessionEngine story state
 * 
 * These functions are:
 * - Deterministic
 * - Side-effect free
 * - Accept full story state as input
 * - Return numbers only
 */

import type { StoryState } from '../../engine/WritingSessionEngine';

/**
 * Format number for display
 * Examples: 1234 → "1.2k", 567 → "567", 12345 → "12.3k"
 */
export function formatStatNumber(num: number): string {
  if (num >= 1000) {
    const rounded = Math.floor(num / 100) / 10;
    return `${rounded}k`;
  }
  return num.toString();
}

/**
 * Calculate all statistics at once
 * Returns formatted strings ready for StatsBlock
 */
export interface StoryStatistics {
  words: string;
  dialogues: string;
  characters: string;
  acts: string;
  chapters: string;
  locations: string; // Placeholder - not implemented
}

export function calculateAllStatistics(
  story: StoryState,
  chapterTexts: Map<string, string>
): StoryStatistics {
  // Calculate word count
  let totalWords = 0;
  for (const chapter of story.chapters) {
    const content = chapterTexts.get(chapter.chapterId) || '';
    if (content && content.trim()) {
      const words = content.trim().split(/\s+/).filter((word: string) => word.length > 0);
      totalWords += words.length;
    }
  }
  
  // Calculate dialogue count
  let totalDialogues = 0;
  for (const chapter of story.chapters) {
    const content = chapterTexts.get(chapter.chapterId) || '';
    if (content) {
      // Match dialogue patterns: "text", 'text', "text" (smart quotes)
      const dialoguePattern = /"[^"]*"|'[^']*'|"[^"]*"/g;
      const matches = content.match(dialoguePattern);
      if (matches) {
        totalDialogues += matches.length;
      }
    }
  }
  
  return {
    words: formatStatNumber(totalWords),
    dialogues: formatStatNumber(totalDialogues),
    characters: story.characters.length.toString(),
    acts: story.acts.length.toString(),
    chapters: story.chapters.length.toString(),
    locations: story.locations.length.toString(),
  };
}
