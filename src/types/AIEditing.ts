export type AIEditTarget = 'current-scene' | 'selected-text' | 'cursor';

export interface AISelectionRange {
  start: number;
  end: number;
  text: string;
}

export interface AIEditOperation {
  id: string;
  target: AIEditTarget;
  action: 'replace' | 'insert' | 'remove' | 'create';
  description: string;
  beforeText: string;
  afterText: string;
  selection?: AISelectionRange;
}

export interface AIEditPlan {
  id: string;
  summary: string;
  operations: AIEditOperation[];
  affectedSceneIds: string[];
  affectedElements: string[];
}
