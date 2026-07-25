/**
 * Main Tension Analysis Engine
 * Orchestrates rule-based + AI scoring and saves results
 */

import { calculateRuleTension } from './ruleBasedScoring';
import { getGeminiTension } from './geminiScoring';
import { updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

export interface TensionAnalysisResult {
  chapterId: string;
  tensionRule: number;
  tensionAI: number;
  tensionAuto: number;
  analyzedAt: Timestamp;
}

/**
 * Analyze a single chapter
 */
export async function analyzeChapter(
  storyId: string,
  actId: string,
  chapterId: string,
  content: string
): Promise<TensionAnalysisResult> {
  try {
    // 1. Calculate rule-based score
    const tensionRule = calculateRuleTension(content);

    // 2. Get AI score from Gemini
    const tensionAI = await getGeminiTension(content);

    // 3. Combine scores: 60% rule + 40% AI
    const tensionAuto = Math.round(0.6 * tensionRule + 0.4 * tensionAI);

    // 4. Save to Firestore
    const chapterRef = doc(
      db,
      'stories',
      storyId,
      'acts',
      actId,
      'chapters',
      chapterId
    );

    await updateDoc(chapterRef, {
      tensionRule,
      tensionAI,
      tensionAuto,
      analyzedAt: Timestamp.now(),
    });

    return {
      chapterId,
      tensionRule,
      tensionAI,
      tensionAuto,
      analyzedAt: Timestamp.now(),
    };
  } catch (error) {
    console.error(`Error analyzing chapter ${chapterId}:`, error);
    throw error;
  }
}

/**
 * Analyze all chapters in a story
 * Calls onProgress callback to report progress
 */
export async function analyzeStory(
  storyId: string,
  acts: any[],
  chapters: any[],
  onProgress?: (current: number, total: number, chapterTitle: string) => void
): Promise<TensionAnalysisResult[]> {
  const results: TensionAnalysisResult[] = [];
  const total = chapters.length;

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, total, chapter.title || `Chapter ${i + 1}`);
    }

    try {
      // Find chapter's act
      const act = acts.find(a => a.actId === chapter.actId);
      if (!act) {
        console.warn(`Act not found for chapter ${chapter.id}`);
        continue;
      }

      // Skip if no content
      if (!chapter.content || chapter.content.trim().length === 0) {
        console.warn(`Chapter ${chapter.id} has no content, skipping`);
        continue;
      }

      // Analyze chapter
      const result = await analyzeChapter(
        storyId,
        chapter.actId,
        chapter.id,
        chapter.content
      );

      results.push(result);

      // Add delay between API calls to avoid rate limiting
      if (i < chapters.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to analyze chapter ${chapter.id}:`, error);
      // Continue with next chapter on error
    }
  }

  return results;
}
