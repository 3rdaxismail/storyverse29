/**
 * Rule-Based Tension Scoring Engine
 * Analyzes text using structure, pacing, dictionary, and dialogue metrics
 */

// Tension dictionary for keyword scoring
const TENSION_DICTIONARY = {
  conflict: [
    'fight', 'danger', 'fear', 'kill', 'threat', 'attack', 'violence', 'war',
    'murder', 'betrayal', 'revenge', 'enemy', 'battle', 'conflict', 'struggle'
  ],
  action: [
    'run', 'grab', 'hit', 'push', 'shout', 'scream', 'chase', 'escape',
    'attack', 'escape', 'flee', 'rush', 'jump', 'fall', 'crash', 'bang'
  ],
  emotion: [
    'panic', 'love', 'hate', 'cry', 'shock', 'terror', 'anger', 'rage',
    'desperate', 'desperate', 'heartbreak', 'anguish', 'joy', 'sorrow', 'grief'
  ],
};

/**
 * Split text into sentences
 */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Calculate average word count per sentence
 */
function getAverageWordCount(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0);
  return totalWords / sentences.length;
}

/**
 * 40% - STRUCTURE SCORE
 * Short sentences = higher tension (more fragmented/urgent)
 * Long sentences = lower tension (more contemplative)
 */
export function getStructureScore(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0.5;

  const avgLength = getAverageWordCount(sentences);

  if (avgLength < 8) return 1.0; // Very short = high tension
  if (avgLength < 12) return 0.8;
  if (avgLength < 15) return 0.6;
  if (avgLength < 20) return 0.4;
  return 0.2; // Very long = low tension
}

/**
 * 30% - PACING SCORE
 * High variance in sentence length = varied pacing = more tension
 * Low variance = monotone pacing = less tension
 */
export function getPacingScore(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return 0.5;

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  
  // Calculate variance
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Normalize to 0-1 (lower variance = 0, higher variance = 1)
  // Most texts have stdDev between 0 and 10
  return Math.min(1, stdDev / 10);
}

/**
 * 20% - DICTIONARY SCORE
 * Count tension-related keywords
 */
export function getDictionaryScore(text: string): number {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
  
  let score = 0;
  const wordSet = new Set(words);

  // Count keyword matches
  TENSION_DICTIONARY.conflict.forEach(keyword => {
    if (wordSet.has(keyword)) score += 2;
  });

  TENSION_DICTIONARY.action.forEach(keyword => {
    if (wordSet.has(keyword)) score += 1.5;
  });

  TENSION_DICTIONARY.emotion.forEach(keyword => {
    if (wordSet.has(keyword)) score += 1;
  });

  // Normalize: expect max ~15-20 keywords in average chapter
  // Return value between 0-1
  const normalized = Math.min(1, score / 20);
  return normalized;
}

/**
 * 10% - DIALOGUE DENSITY
 * Higher dialogue = more dynamic/tense
 * Lower dialogue = more exposition/calm
 */
export function getDialogueScore(text: string): number {
  // Count quoted sections (text between quotes)
  const quotePattern = /[""][^""]*[""]/g;
  const quotes = text.match(quotePattern) || [];
  
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;

  const dialogueDensity = quotes.length / sentences.length;
  
  // Normalize: typical dialogue density is 0-0.8
  return Math.min(1, dialogueDensity);
}

/**
 * MAIN: Calculate rule-based tension score (0-100)
 */
export function calculateRuleTension(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const structureScore = getStructureScore(text);
  const pacingScore = getPacingScore(text);
  const dictionaryScore = getDictionaryScore(text);
  const dialogueScore = getDialogueScore(text);

  // Weighted combination
  const finalScore =
    0.4 * structureScore +    // 40%
    0.3 * pacingScore +       // 30%
    0.2 * dictionaryScore +   // 20%
    0.1 * dialogueScore;      // 10%

  // Scale to 0-100
  return Math.round(finalScore * 100);
}
