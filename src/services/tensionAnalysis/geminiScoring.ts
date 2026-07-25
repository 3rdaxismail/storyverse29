import { AI_CONFIG } from '../../config/aiConfig';

/**
 * Gemini AI Tension Scoring
 * Uses the centrally configured Gemini model to analyze text for emotional tension
 */

/**
 * Truncate text to max tokens (roughly 300-500 words)
 * Samples intro + middle + end to preserve context
 */
function truncateText(text: string, maxWords: number = 400): string {
  const words = text.split(/\s+/);
  
  if (words.length <= maxWords) {
    return text;
  }

  // Sample: first 40%, middle 40%, last 20% of words
  const third = Math.floor(words.length / 3);
  const firstPart = words.slice(0, Math.floor(maxWords * 0.4)).join(' ');
  const middlePart = words.slice(third, third + Math.floor(maxWords * 0.4)).join(' ');
  const lastPart = words.slice(-Math.floor(maxWords * 0.2)).join(' ');

  return `${firstPart} ... ${middlePart} ... ${lastPart}`;
}

/**
 * Call Gemini API to get tension score
 * Returns number 0-100
 */
export async function getGeminiTension(text: string): Promise<number> {
  try {
    if (!text || text.trim().length === 0) {
      return 0;
    }

    // Truncate text to reasonable size
    const truncatedText = truncateText(text, 400);

    const prompt = `Rate the emotional tension and dramatic intensity of this scene/chapter from 0 to 100.

Consider:
- Conflict level (low = calm, high = intense struggle)
- Emotional stakes (what characters have to lose)
- Pacing urgency (static = low, fast = high)
- Dialogue intensity (passive = low, confrontational = high)
- Plot advancement (exposition = low, climax = high)

Respond with ONLY a single number between 0 and 100. No explanation, no text, just the number.

TEXT:
${truncatedText}`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': import.meta.env.REACT_APP_GEMINI_API_KEY || '',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 0.95,
          maxOutputTokens: 10,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return 50; // Default fallback
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '50';
    
    // Parse the number from response
    const scoreMatch = content.match(/\d+/);
    const score = scoreMatch ? parseInt(scoreMatch[0]) : 50;

    // Clamp to 0-100
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 50; // Default fallback on error
  }
}
