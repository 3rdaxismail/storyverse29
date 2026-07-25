export interface StoryProjectMetadata {
  id: string;
  storyId: string;
  title: string;
  premise: string;
  theme: string;
  genre: string;
  tone: string;
  targetRuntime: string;
  status: 'draft' | 'active' | 'complete';
  createdAt: number;
  updatedAt: number;
}

export interface StoryBibleEntry {
  id: string;
  storyId: string;
  section: 'premise' | 'theme' | 'genre' | 'tone' | 'rules' | 'timeline' | 'characters' | 'locations' | 'research' | 'symbols' | 'motifs' | 'acts' | 'scenes' | 'questions' | 'continuity' | 'changelog';
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoryBrainIndexEntry {
  id: string;
  storyId: string;
  sourceType: 'story-bible' | 'character' | 'location' | 'timeline' | 'research' | 'scene' | 'act' | 'theme';
  sourceId: string;
  title: string;
  summary: string;
  keywords: string[];
  createdAt: number;
}

export interface StoryProjectScene {
  id: string;
  storyId: string;
  title: string;
  purpose: string;
  conflict: string;
  characters: string[];
  locations: string[];
  timelinePosition: string;
  estimatedRuntime: string;
  completionStatus: 'draft' | 'complete';
  notes: string;
  storyArc: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoryProjectAiSuggestion {
  id: string;
  storyId: string;
  type: 'continue-scene' | 'rewrite-scene' | 'brainstorm' | 'consistency' | 'timeline' | 'continuity' | 'dialogue' | 'theme' | 'foreshadowing' | 'summary' | 'plot-hole';
  prompt: string;
  response: string;
  createdAt: number;
}
