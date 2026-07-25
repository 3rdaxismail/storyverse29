/**
 * Hook for managing tension analysis UI state
 */

import { useState } from 'react';
import { analyzeStory } from '../services/tensionAnalysis/analysisEngine';
import type { TensionAnalysisResult } from '../services/tensionAnalysis/analysisEngine';

interface AnalysisState {
  isAnalyzing: boolean;
  progress: {
    current: number;
    total: number;
    chapterTitle: string;
  } | null;
  error: string | null;
  results: TensionAnalysisResult[] | null;
}

export function useTensionAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: null,
    error: null,
    results: null,
  });

  const analyze = async (
    storyId: string,
    acts: any[],
    chapters: any[]
  ) => {
    setState({
      isAnalyzing: true,
      progress: { current: 0, total: chapters.length, chapterTitle: '' },
      error: null,
      results: null,
    });

    try {
      const results = await analyzeStory(
        storyId,
        acts,
        chapters,
        (current, total, chapterTitle) => {
          setState(prev => ({
            ...prev,
            progress: { current, total, chapterTitle },
          }));
        }
      );

      setState({
        isAnalyzing: false,
        progress: null,
        error: null,
        results,
      });

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isAnalyzing: false,
        progress: null,
        error: errorMessage,
        results: null,
      });
      throw error;
    }
  };

  return {
    ...state,
    analyze,
    reset: () =>
      setState({
        isAnalyzing: false,
        progress: null,
        error: null,
        results: null,
      }),
  };
}
