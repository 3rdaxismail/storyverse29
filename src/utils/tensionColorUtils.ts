/**
 * Utility functions for tension-based color mapping
 * Matches the tension scale: Grey → Blue → Yellow → Orange → Red
 */

export const getTensionColor = (tension: number): string => {
  const normalized = Math.max(0, Math.min(100, tension));
  
  if (normalized < 25) {
    // Grey (0-25%)
    return '#888888';
  } else if (normalized < 50) {
    // Blue (25-50%)
    return '#4fc3f7';
  } else if (normalized < 75) {
    // Yellow (50-75%)
    return '#ffeb3b';
  } else if (normalized < 90) {
    // Orange (75-90%)
    return '#ff9800';
  } else {
    // Red (90-100%)
    return '#f44336';
  }
};

export const getTensionColorWithOpacity = (tension: number, opacity: number = 1): string => {
  const color = getTensionColor(tension);
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getTensionLabel = (tension: number): string => {
  const normalized = Math.max(0, Math.min(100, tension));
  
  if (normalized < 25) return '😐 Calm';
  if (normalized < 50) return '🤔 Building';
  if (normalized < 75) return '😰 Tense';
  if (normalized < 90) return '😨 Critical';
  return '🔥 Peak';
};

export const getTensionDescription = (tension: number): { label: string; description: string; emotions: string[] } => {
  const normalized = Math.max(0, Math.min(100, tension));
  
  if (normalized < 25) {
    return {
      label: '😐 Calm',
      description: 'Peaceful and quiet. Building character moments. Establishing the setting.',
      emotions: ['Peaceful', 'Reflective', 'Stable', 'Comfortable'],
    };
  } else if (normalized < 50) {
    return {
      label: '🤔 Building',
      description: 'Subtle tension growing. Hints of conflict. Anticipation building up.',
      emotions: ['Thoughtful', 'Curious', 'Uncertain', 'Anticipating'],
    };
  } else if (normalized < 75) {
    return {
      label: '😰 Tense',
      description: 'Clear conflict emerging. Emotional stakes rising. Drama intensifying.',
      emotions: ['Anxious', 'Worried', 'Focused', 'Conflicted'],
    };
  } else if (normalized < 90) {
    return {
      label: '😨 Critical',
      description: 'Major turning point. High emotional impact. Critical decision or revelation.',
      emotions: ['Panicked', 'Shocked', 'Desperate', 'Overwhelmed'],
    };
  } else {
    return {
      label: '🔥 Peak',
      description: 'Maximum intensity. Climactic moment. Resolution or major revelation.',
      emotions: ['Explosive', 'Intense', 'Devastating', 'Triumphant'],
    };
  }
};

