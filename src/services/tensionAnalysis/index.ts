/**
 * Tension Analysis Service Exports
 */

export { calculateRuleTension, getStructureScore, getPacingScore, getDictionaryScore, getDialogueScore } from './ruleBasedScoring';
export { getGeminiTension } from './geminiScoring';
export { analyzeChapter, analyzeStory } from './analysisEngine';
export type { TensionAnalysisResult } from './analysisEngine';
