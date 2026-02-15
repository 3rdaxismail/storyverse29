/**
 * Writing Session Engine
 * 
 * SINGLE SOURCE OF TRUTH for all content (Stories, Poems, Lyrics).
 * Pages are NOT data owners - they are stateless views over content bundles.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * - Engine owns ALL user content data
 * - Pages consume engine state via subscription
 * - Pages dispatch edits back to engine
 * - Pages only manage UI state (expanded/collapsed, focus, etc.)
 * 
 * STORAGE STRATEGY:
 * All data is persisted to localStorage via StorageManager.
 * Structure: /storyverse/stories/{storyId}/ or /storyverse/poems/{poemId}/
 *   - story.json / poem.json (metadata, genres, audience)
 *   - characters.json (character list - stories only)
 *   - acts.json (acts + chapter structure - stories only)
 *   - chapters/chapter_{id}_part_0 (text content, split if > 30k chars)
 * 
 * AUTOSAVE:
 * - Text changes: debounced 1000ms
 * - Dropdowns/metadata: immediate save
 * - Acts/chapters structure: immediate save
 * 
 * This is a singleton class - import the default instance, not the class.
 */

import storageManager, {
  type Character,
  type Location,
  type Act,
  type Chapter,
  type ChapterContent,
} from './storage/StorageManager';
import { getPoem, createPoem, updatePoem, type Poem } from '../firebase/services/poemsService';
import { 
  getStory, 
  createStory, 
  updateStory,
  loadCharacters,
  saveCharacters,
  loadLocations,
  saveLocations,
  loadActsAndChapters,
  saveActsAndChapters,
  loadChapterContent,
  saveChapterContent,
  type Story
} from '../firebase/services/storiesService';
import { recordWritingActivity } from '../firebase/services/writingActivityService';
import { auth } from '../firebase/config';
import { deviceSessionManager } from '../services/DeviceSessionManager';

export type WritingState = 'empty' | 'writing' | 'idle' | 'syncing' | 'error';
export type ContentType = 'story' | 'poem' | 'lyrics';
export type { Location };

export interface StoryState {
  storyId: string;
  storyTitle: string;
  privacy: string;
  primaryGenre: string;
  secondaryGenre: string;
  tertiaryGenre: string;
  audience: string;
  readingTime: number;
  coverImageId?: string;
  coverImageUrl?: string;
  characters: Character[];
  locations: Location[];
  acts: Act[];
  chapters: Chapter[];
}

export interface PoemState {
  poemId: string;
  title: string;
  text: string;
  tags: string[];
  privacy: string;
  genre: string;
  coverImageUrl: string;
  wordCount: number;
  lineCount: number;
  stanzaCount: number;
  readTime: number;
}

const AUTOSAVE_DELAY_TEXT = 1000; // 1 second for text
const AUTOSAVE_DELAY_META = 0; // Immediate for metadata


class WritingSessionEngine {
  // Content type and ID
  private contentType: ContentType;
  private contentId: string;
  
  // Story-specific fields
  private storyId: string;
  private storyTitle: string;
  private privacy: string;
  private primaryGenre: string;
  private secondaryGenre: string;
  private tertiaryGenre: string;
  private audience: string;
  private readingTime: number;
  private excerptHeading: string;
  private excerptBody: string;
  private coverImageId: string;
  private coverImageUrl: string;
  private characters: Map<string, Character>;
  private locations: Map<string, Location>;
  private acts: Map<string, Act>;
  private chapters: Map<string, Chapter>;
  private chapterContents: Map<string, ChapterContent>;
  private chapterStates: Map<string, WritingState>;
  private activeEditorId: string;
  
  // Poem/Lyrics-specific fields
  private poemId: string;
  private poemTitle: string;
  private poemText: string;
  private poemTags: string[];
  private poemPrivacy: string;
  private poemGenre: string;
  private poemCoverImageUrl: string;
  
  // Common autosave and subscription infrastructure
  private textAutosaveTimeouts: Map<string, number>;
  private metaAutosaveTimeout: number | null;
  private listeners: Set<() => void>;

  constructor() {
    this.contentType = 'story';
    this.contentId = '';
    
    // Story fields
    this.storyId = '';
    this.storyTitle = '';
    this.privacy = '';
    this.primaryGenre = '';
    this.secondaryGenre = '';
    this.tertiaryGenre = '';
    this.audience = '';
    this.readingTime = 0;
    this.excerptHeading = '';
    this.excerptBody = '';
    this.coverImageId = '';
    this.coverImageUrl = '';
    this.characters = new Map();
    this.locations = new Map();
    this.acts = new Map();
    this.chapters = new Map();
    this.chapterContents = new Map();
    this.chapterStates = new Map();
    this.activeEditorId = '';
    
    // Poem/Lyrics fields
    this.poemId = '';
    this.poemTitle = '';
    this.poemText = '';
    this.poemTags = [];
    this.poemPrivacy = '';
    this.poemGenre = '';
    this.poemCoverImageUrl = '';
    
    this.textAutosaveTimeouts = new Map();
    this.metaAutosaveTimeout = null;
    this.listeners = new Set();
  }

  // ============================================================
  // FLUSH PENDING SAVES (for navigation)
  // ============================================================

  /**
   * Flush all pending saves immediately (call before navigation)
   */
  async flushPendingSaves(): Promise<void> {
    console.log('[ENGINE] 🔄 Flushing all pending saves...');
    
    // Clear all pending timeouts and save immediately
    const pendingChapterIds = Array.from(this.textAutosaveTimeouts.keys());
    
    for (const chapterId of pendingChapterIds) {
      const timeout = this.textAutosaveTimeouts.get(chapterId);
      if (timeout) {
        clearTimeout(timeout);
        this.textAutosaveTimeouts.delete(chapterId);
      }
      // Save immediately
      await this.saveChapterContent(chapterId);
    }
    
    // Also flush meta save if pending
    if (this.metaAutosaveTimeout) {
      clearTimeout(this.metaAutosaveTimeout);
      this.metaAutosaveTimeout = null;
      await this.saveStoryMeta();
    }
    
    console.log('[ENGINE] ✅ All pending saves flushed');
  }

  // ============================================================
  // INITIALIZATION & RECOVERY
  // ============================================================

  /**
   * Initialize a new story or load existing one
   */
  async initStory(storyId?: string): Promise<void> {
    console.log('[ENGINE INIT] 🔧 initStory called with storyId:', storyId);
    
    this.contentType = 'story';
    this.contentId = storyId || '';
    
    if (storyId) {
      // Load existing story
      const loaded = await this.loadStory(storyId);
      console.log('[ENGINE INIT] Story loaded:', loaded);
      if (!loaded) {
        // Story doesn't exist, create it with this ID
        console.log('[ENGINE INIT] 🆕 Story not found, creating new with ID:', storyId);
        this.createNewStory(storyId);
      }
    } else {
      // Create new story
      const newId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('[ENGINE INIT] 🆕 Creating new story with ID:', newId);
      this.createNewStory(newId);
    }
    
    this.notifyListeners();
  }

  /**
   * Initialize a new poem/lyrics or load existing one
   */
  async initPoem(poemId?: string, type: 'poem' | 'lyrics' = 'poem'): Promise<void> {
    console.log('[ENGINE INIT] 🔧 initPoem called with poemId:', poemId, 'type:', type);
    
    this.contentType = type;
    this.contentId = poemId || '';
    
    if (poemId) {
      // Load existing poem
      const loaded = await this.loadPoem(poemId);
      console.log('[ENGINE INIT] Poem loaded:', loaded);
      if (!loaded) {
        // Poem doesn't exist, create it with this ID
        console.log('[ENGINE INIT] 🆕 Poem not found, creating new with ID:', poemId);
        this.createNewPoem(poemId);
      }
    } else {
      // Create new poem
      const newId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('[ENGINE INIT] 🆕 Creating new poem with ID:', newId);
      this.createNewPoem(newId);
    }
    
    this.notifyListeners();
  }

  /**
   * Create a new story with given ID
   */
  private createNewStory(storyId: string): void {
    this.storyId = storyId;
    this.contentId = storyId;
    this.storyTitle = 'Untitled Story';
    this.privacy = '';
    this.primaryGenre = '';
    this.secondaryGenre = '';
    this.tertiaryGenre = '';
    this.audience = '';
    this.readingTime = 0;
    this.excerptHeading = '';
    this.excerptBody = '';
    this.coverImageId = '';
    this.coverImageUrl = '';
    this.characters.clear();
    this.locations.clear();
    this.acts.clear();
    this.chapters.clear();
    this.chapterContents.clear();
    this.chapterStates.clear();
    
    // DO NOT save initial state - only save when user adds content
    console.log('[WritingSessionEngine] New story created (not saved yet - awaiting user content)');
  }

  /**
   * Create a new poem with given ID
   */
  private createNewPoem(poemId: string): void {
    this.poemId = poemId;
    this.contentId = poemId;
    this.poemTitle = '';
    this.poemText = '';
    this.poemTags = [];
    this.poemPrivacy = '';
    this.poemGenre = '';
    this.poemCoverImageUrl = '';
    
    // DO NOT save initial state - only save when user adds content
    console.log('[WritingSessionEngine] New poem created (not saved yet - awaiting user content)');
  }

  /**
   * Load poem from Firestore
   */
  async loadPoem(poemId: string): Promise<boolean> {
    try {
      const poem = await getPoem(poemId);
      if (!poem) {
        console.warn(`Poem ${poemId} not found in Firestore`);
        return false;
      }
      
      this.poemId = poemId;
      this.contentId = poemId;
      this.poemTitle = poem.title || '';
      this.poemText = poem.text || '';
      this.poemTags = poem.tags || [];
      this.poemPrivacy = poem.privacy || '';
      this.poemGenre = poem.genre || '';
      this.poemCoverImageUrl = poem.coverImageUrl || '';
      
      console.log(`Poem ${poemId} loaded successfully from Firestore`);
      return true;
    } catch (error) {
      console.error('Failed to load poem from Firestore:', error);
      return false;
    }
  }

  /**
   * Load story from Firestore
   */
  async loadStory(storyId: string): Promise<boolean> {
    try {
      // Load metadata from Firestore
      const story = await getStory(storyId);
      if (!story) {
        console.warn(`Story ${storyId} not found in Firestore`);
        return false;
      }
      
      this.storyId = story.id;
      this.storyTitle = story.storyTitle;
      this.privacy = story.privacy;
      this.primaryGenre = story.primaryGenre;
      this.secondaryGenre = story.secondaryGenre;
      this.tertiaryGenre = story.tertiaryGenre;
      this.audience = story.audience;
      this.readingTime = story.readingTime;
      this.excerptHeading = story.excerptHeading;
      this.excerptBody = story.excerptBody;
      this.coverImageId = story.coverImageId || '';
      this.coverImageUrl = story.coverImageUrl || '';
      
      // Load characters from Firestore
      const characters = await loadCharacters(storyId);
      this.characters.clear();
      characters.forEach(char => {
        this.characters.set(char.characterId, char);
      });
      
      // Load locations from Firestore
      const locations = await loadLocations(storyId);
      this.locations.clear();
      locations.forEach(loc => {
        this.locations.set(loc.id, loc);
      });
      
      // Load acts and chapters from Firestore
      const { acts, chapters } = await loadActsAndChapters(storyId);
      this.acts.clear();
      this.chapters.clear();
      this.chapterContents.clear();
      this.chapterStates.clear();
      
      acts.forEach(act => {
        this.acts.set(act.actId, act);
      });
      
      for (const chapter of chapters) {
        this.chapters.set(chapter.chapterId, chapter);
        
        // Load chapter content from Firestore
        const content = await loadChapterContent(storyId, chapter.chapterId);
        if (content) {
          this.chapterContents.set(chapter.chapterId, content);
          this.chapterStates.set(chapter.chapterId, content.state);
        } else {
          // Initialize empty content
          this.chapterContents.set(chapter.chapterId, {
            chapterId: chapter.chapterId,
            text: '',
            wordCount: 0,
            charCount: 0,
            state: 'empty',
            lastSavedAt: Date.now(),
          });
          this.chapterStates.set(chapter.chapterId, 'empty');
        }
      }
      
      console.log(`Story ${storyId} loaded successfully from Firestore`);
      return true;
    } catch (error) {
      console.error('Failed to load story:', error);
      return false;
    }
  }

  // ============================================================
  // STORY METADATA
  // ============================================================

  /**
   * Set story title
   */
  setStoryTitle(title: string): void {
    if (this.storyTitle !== title) {
      this.storyTitle = title;
      this.scheduleMetaSave();
      this.notifyListeners();
    }
  }

  getStoryTitle(): string {
    return this.storyTitle;
  }

  /**
   * Set privacy
   */
  setPrivacy(privacy: string): void {
    if (this.privacy !== privacy) {
      this.privacy = privacy;
      this.scheduleMetaSave();
      this.notifyListeners();
    }
  }

  getPrivacy(): string {
    return this.privacy;
  }

  /**
   * Set cover image
   */
  setCoverImage(coverImageId: string, coverImageUrl: string): void {
    // Delete old cover image if exists and is different
    if (this.coverImageId && this.coverImageId !== coverImageId) {
      this.deleteCoverImage();
    }
    
    this.coverImageId = coverImageId;
    this.coverImageUrl = coverImageUrl;
    this.scheduleMetaSave();
    this.notifyListeners();
  }

  getCoverImageUrl(): string {
    return this.coverImageUrl;
  }

  getCoverImageId(): string {
    return this.coverImageId;
  }

  /**
   * Delete cover image
   */
  deleteCoverImage(): void {
    // Remove from localStorage
    if (this.coverImageId) {
      const key = `storyverse:image:${this.coverImageId}`;
      localStorage.removeItem(key);
      console.log(`[WritingSessionEngine] Deleted cover image: ${this.coverImageId}`);
    }
    
    this.coverImageId = '';
    this.coverImageUrl = '';
    this.scheduleMetaSave();
    this.notifyListeners();
  }

  /**
   * Set primary genre
   */
  setPrimaryGenre(genre: string): void {
    if (this.primaryGenre !== genre) {
      this.primaryGenre = genre;
      this.scheduleMetaSave();
      this.notifyListeners();
    }
  }

  getPrimaryGenre(): string {
    return this.primaryGenre;
  }

  /**
   * Set secondary genre
   */
  setSecondaryGenre(genre: string): void {
    if (this.secondaryGenre !== genre) {
      this.secondaryGenre = genre;
      this.scheduleMetaSave();
      this.notifyListeners();
    }
  }

  getSecondaryGenre(): string {
    return this.secondaryGenre;
  }

  /**
   * Set tertiary genre
   */
  setTertiaryGenre(genre: string): void {
    if (this.tertiaryGenre !== genre) {
      this.tertiaryGenre = genre;
      this.scheduleMetaSave();
      this.notifyListeners();
    }
  }

  getTertiaryGenre(): string {
    return this.tertiaryGenre;
  }

  /**
   * Set audience
   */
  setAudience(audience: string): void {
    if (this.audience !== audience) {
      this.audience = audience;
      this.scheduleMetaSave();
      this.notifyListeners();
    }
  }

  getAudience(): string {
    return this.audience;
  }

  /**
   * Set excerpt heading
   */
  setExcerptHeading(heading: string): void {
    if (this.excerptHeading !== heading) {
      this.excerptHeading = heading;
      this.scheduleMetaSave();
      this.notifyListeners();
    }
  }

  getExcerptHeading(): string {
    return this.excerptHeading;
  }

  /**
   * Set excerpt body
   */
  setExcerptBody(body: string): void {
    if (this.excerptBody !== body) {
      this.excerptBody = body;
      this.scheduleMetaSave();
      this.notifyListeners();
    }
  }

  getExcerptBody(): string {
    return this.excerptBody;
  }

  /**
   * Get reading time (derived from all chapter texts)
   */
  getReadingTime(): number {
    return this.readingTime;
  }

  /**
   * Calculate reading time based on total word count
   * Assumes average reading speed of 200 words per minute
   */
  private calculateReadingTime(): void {
    let totalWords = 0;
    this.chapterContents.forEach(content => {
      totalWords += content.wordCount;
    });
    this.readingTime = Math.ceil(totalWords / 200);
  }

  // ============================================================
  // CHARACTERS
  // ============================================================

  /**
   * Add a character
   */
  addCharacter(character: Character): void {
    this.characters.set(character.characterId, character);
    this.saveCharacters();
    this.notifyListeners();
  }

  /**
   * Update a character
   */
  updateCharacter(characterId: string, updates: Partial<Character>): void {
    const character = this.characters.get(characterId);
    if (character) {
      Object.assign(character, updates);
      this.saveCharacters();
      this.notifyListeners();
    }
  }

  /**
   * Remove a character
   */
  removeCharacter(characterId: string): void {
    this.characters.delete(characterId);
    
    // Remove from all chapters
    this.chapters.forEach(chapter => {
      chapter.assignedCharacterIds = chapter.assignedCharacterIds.filter(
        id => id !== characterId
      );
    });
    
    this.saveCharacters();
    this.saveActsAndChapters();
    this.notifyListeners();
  }

  /**
   * Get all characters
   */
  getCharacters(): Character[] {
    return Array.from(this.characters.values()).sort((a, b) => a.order - b.order);
  }

  // ============================================================
  // LOCATIONS
  // ============================================================

  /**
   * Add a location
   */
  addLocation(location: Location): void {
    this.locations.set(location.id, location);
    this.saveLocations();
    this.notifyListeners();
  }

  /**
   * Update a location
   */
  updateLocation(locationId: string, updates: Partial<Location>): void {
    const location = this.locations.get(locationId);
    if (location) {
      Object.assign(location, updates);
      this.saveLocations();
      this.notifyListeners();
    }
  }

  /**
   * Remove a location
   */
  removeLocation(locationId: string): void {
    this.locations.delete(locationId);
    this.saveLocations();
    this.notifyListeners();
  }

  /**
   * Get all locations
   */
  getLocations(): Location[] {
    return Array.from(this.locations.values()).sort((a, b) => a.createdAt - b.createdAt);
  }

  // ============================================================
  // ACTS
  // ============================================================

  /**
   * Add an act
   */
  addAct(actTitle: string = 'New Act'): Act {
    const actId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const actOrder = this.acts.size;
    
    const act: Act = {
      actId,
      actTitle,
      actOrder,
    };
    
    this.acts.set(actId, act);
    this.saveActsAndChapters();
    this.notifyListeners();
    
    return act;
  }

  /**
   * Update act title
   */
  updateActTitle(actId: string, title: string): void {
    const act = this.acts.get(actId);
    if (act) {
      act.actTitle = title;
      this.saveActsAndChapters();
      this.notifyListeners();
    }
  }

  /**
   * Remove an act and all its chapters
   */
  async removeAct(actId: string): Promise<void> {
    // Remove all chapters in this act
    const chaptersToRemove = Array.from(this.chapters.values())
      .filter(chapter => chapter.actId === actId);
    
    for (const chapter of chaptersToRemove) {
      await this.removeChapter(chapter.chapterId);
    }
    
    // Remove act
    this.acts.delete(actId);
    await this.saveActsAndChapters();
    await this.saveStoryMeta(); // Update word count
    this.notifyListeners();
  }

  /**
   * Get all acts
   */
  getActs(): Act[] {
    return Array.from(this.acts.values()).sort((a, b) => a.actOrder - b.actOrder);
  }

  /**
   * Get chapters for a specific act
   */
  getChaptersForAct(actId: string): Chapter[] {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.actId === actId)
      .sort((a, b) => a.chapterOrder - b.chapterOrder);
  }

  // ============================================================
  // CHAPTERS
  // ============================================================

  /**
   * Add a chapter to an act
   */
  addChapter(actId: string, chapterTitle: string = ''): Chapter {
    const chapterId = `chapter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get order within this act
    const existingChapters = this.getChaptersForAct(actId);
    const chapterOrder = existingChapters.length;
    
    const chapter: Chapter = {
      chapterId,
      actId,
      chapterTitle,
      assignedCharacterIds: [],
      assignedLocationIds: [],
      expanded: false,
      chapterOrder,
      lastEditedAt: Date.now(),
    };
    
    this.chapters.set(chapterId, chapter);
    
    // Initialize empty content
    const content: ChapterContent = {
      chapterId,
      text: '',
      wordCount: 0,
      charCount: 0,
      state: 'empty',
      lastSavedAt: Date.now(),
    };
    
    this.chapterContents.set(chapterId, content);
    this.chapterStates.set(chapterId, 'empty');
    
    // Fire and forget - save operations run async but don't block
    this.saveActsAndChapters().catch(err => console.error('Failed to save acts and chapters:', err));
    this.saveChapterContent(chapterId).catch(err => console.error('Failed to save chapter content:', err));
    this.notifyListeners();
    
    return chapter;
  }

  /**
   * Update chapter title
   */
  updateChapterTitle(chapterId: string, title: string): void {
    const chapter = this.chapters.get(chapterId);
    if (chapter) {
      chapter.chapterTitle = title;
      chapter.lastEditedAt = Date.now();
      this.saveActsAndChapters();
      this.notifyListeners();
    }
  }

  /**
   * Update chapter text content
   */
  updateChapterText(chapterId: string, text: string): void {
    console.log('[ENGINE] 💾 updateChapterText called:', { chapterId, textLength: text.length });
    
    let content = this.chapterContents.get(chapterId);
    if (!content) {
      // Chapter doesn't exist in engine, create it
      console.log('[ENGINE] 🆕 Chapter not found, creating:', chapterId);
      content = {
        chapterId,
        text: '',
        wordCount: 0,
        charCount: 0,
        state: 'empty',
        lastSavedAt: Date.now(),
      };
      this.chapterContents.set(chapterId, content);
    }
    
    content.text = text;
    content.charCount = text.length;
    content.wordCount = this.countWords(text);
    content.state = text.length === 0 ? 'empty' : 'writing';
    
    this.chapterStates.set(chapterId, content.state);
    
    const chapter = this.chapters.get(chapterId);
    if (chapter) {
      chapter.lastEditedAt = Date.now();
    }
    
    // Update reading time
    this.calculateReadingTime();
    
    console.log('[ENGINE] ⏰ Scheduling autosave for chapter:', chapterId);
    // Schedule debounced save for chapter content
    this.scheduleChapterTextSave(chapterId);
    // Also schedule meta save to update word count in story document
    this.scheduleMetaSave();
    this.notifyListeners();
  }

  /**
   * Get chapter text content
   */
  getChapterText(chapterId: string): string {
    const content = this.chapterContents.get(chapterId);
    return content ? content.text : '';
  }

  /**
   * Get chapter writing state
   */
  getChapterState(chapterId: string): WritingState {
    return this.chapterStates.get(chapterId) || 'empty';
  }

  /**
   * Toggle chapter expanded state
   */
  toggleChapterExpanded(chapterId: string): void {
    const chapter = this.chapters.get(chapterId);
    if (chapter) {
      chapter.expanded = !chapter.expanded;
      this.saveActsAndChapters();
      this.notifyListeners();
    }
  }

  /**
   * Assign character to chapter
   */
  assignCharacterToChapter(chapterId: string, characterId: string): void {
    const chapter = this.chapters.get(chapterId);
    if (chapter && !chapter.assignedCharacterIds.includes(characterId)) {
      chapter.assignedCharacterIds.push(characterId);
      this.saveActsAndChapters();
      this.notifyListeners();
    }
  }

  /**
   * Remove character from chapter
   */
  removeCharacterFromChapter(chapterId: string, characterId: string): void {
    const chapter = this.chapters.get(chapterId);
    if (chapter) {
      chapter.assignedCharacterIds = chapter.assignedCharacterIds.filter(
        id => id !== characterId
      );
      this.saveActsAndChapters();
      this.notifyListeners();
    }
  }

  /**
   * Assign location to chapter
   */
  assignLocationToChapter(chapterId: string, locationId: string): void {
    const chapter = this.chapters.get(chapterId);
    if (chapter) {
      // Initialize assignedLocationIds if it doesn't exist (for existing chapters)
      if (!chapter.assignedLocationIds) {
        chapter.assignedLocationIds = [];
      }
      
      if (!chapter.assignedLocationIds.includes(locationId)) {
        chapter.assignedLocationIds.push(locationId);
        this.saveActsAndChapters();
        this.notifyListeners();
      }
    }
  }

  /**
   * Remove location from chapter
   */
  removeLocationFromChapter(chapterId: string, locationId: string): void {
    const chapter = this.chapters.get(chapterId);
    if (chapter) {
      // Initialize assignedLocationIds if it doesn't exist (for existing chapters)
      if (!chapter.assignedLocationIds) {
        chapter.assignedLocationIds = [];
      }
      
      chapter.assignedLocationIds = chapter.assignedLocationIds.filter(
        id => id !== locationId
      );
      this.saveActsAndChapters();
      this.notifyListeners();
    }
  }

  /**
   * Remove a chapter
   */
  async removeChapter(chapterId: string): Promise<void> {
    this.chapters.delete(chapterId);
    this.chapterContents.delete(chapterId);
    this.chapterStates.delete(chapterId);
    
    // Delete from storage
    storageManager.deleteChapterContent(this.storyId, chapterId);
    
    await this.saveActsAndChapters();
    this.calculateReadingTime();
    await this.saveStoryMeta(); // Update word count
    this.notifyListeners();
  }

  // ============================================================
  // ACTIVE EDITOR TRACKING
  // ============================================================

  /**
   * Set the active editor ID (for single-active-editor tracking)
   */
  setActiveEditor(editorId: string): void {
    if (this.activeEditorId !== editorId) {
      this.activeEditorId = editorId;
      this.notifyListeners();
    }
  }

  /**
   * Get the active editor ID
   */
  getActiveEditorId(): string {
    return this.activeEditorId;
  }

  // ============================================================
  // PERSISTENCE (PRIVATE)
  // ============================================================

  /**
   * Schedule metadata save (immediate)
   */
  private scheduleMetaSave(): void {
    if (this.metaAutosaveTimeout) {
      clearTimeout(this.metaAutosaveTimeout);
    }
    
    this.metaAutosaveTimeout = setTimeout(async () => {
      await this.saveStoryMeta();
    }, AUTOSAVE_DELAY_META);
  }

  /**
   * Schedule chapter text save (debounced)
   */
  private scheduleChapterTextSave(chapterId: string): void {
    const existingTimeout = this.textAutosaveTimeouts.get(chapterId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set state to syncing
    this.chapterStates.set(chapterId, 'syncing');
    
    const timeout = setTimeout(async () => {
      await this.saveChapterContent(chapterId);
      
      // Set state to idle after save
      const content = this.chapterContents.get(chapterId);
      if (content) {
        this.chapterStates.set(chapterId, 'idle');
      }
      
      this.notifyListeners();
    }, AUTOSAVE_DELAY_TEXT);
    
    this.textAutosaveTimeouts.set(chapterId, timeout);
  }

  /**
   * Save story metadata to localStorage
   */
  private async saveStoryMeta(): Promise<void> {
    try {
      console.log('[SAVE STORY META] 💾 Saving metadata for story:', this.storyId);
      
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        console.warn('[SAVE STORY META] ⚠️ No user authenticated - cannot save story');
        return;
      }

      // CRITICAL: Check if this device is active (single-device session enforcement)
      const isActive = await deviceSessionManager.isActive();
      if (!isActive) {
        console.warn('[SAVE STORY META] 🚫 Device is not active - save blocked (session is on another device)');
        return;
      }

      console.log('[SAVE STORY META] 🔐 User UID:', user.uid);
      
      // Get user's display name from Firestore
      let authorName = '';
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          authorName = userDoc.data().displayName || '';
        }
      } catch (err) {
        console.warn('[SAVE STORY META] Could not fetch author name:', err);
      }
      
      // Calculate total word count from all chapter contents
      let totalWordCount = 0;
      this.chapterContents.forEach(content => {
        totalWordCount += content.wordCount;
      });
      
      console.log('[SAVE STORY META] 📊 Total word count:', totalWordCount);
      
      const storyData: Partial<Story> = {
        id: this.storyId,
        uid: user.uid, // CRITICAL: Always include uid
        storyTitle: this.storyTitle,
        privacy: this.privacy || 'private',
        primaryGenre: this.primaryGenre,
        secondaryGenre: this.secondaryGenre,
        tertiaryGenre: this.tertiaryGenre,
        audience: this.audience,
        readingTime: this.readingTime,
        wordCount: totalWordCount, // Add word count
        excerptHeading: this.excerptHeading,
        excerptBody: this.excerptBody,
        coverImageId: this.coverImageId,
        coverImageUrl: this.coverImageUrl,
        authorName: authorName, // Add author's display name
        status: 'draft',
      };
      
      console.log('[SAVE STORY META] 📝 Story data being saved:', {
        id: storyData.id,
        privacy: storyData.privacy,
        storyTitle: storyData.storyTitle,
        primaryGenre: storyData.primaryGenre
      });

      // Try to create or update using setDoc with merge
      // This avoids the read permission issue
      try {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        
        const storyRef = doc(db, 'stories', this.storyId);
        await setDoc(storyRef, {
          ...storyData,
          uid: user.uid, // Double ensure UID is set
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log('[SAVE STORY META] ✅ Story saved successfully with setDoc merge');
      } catch (setDocError) {
        console.error('[SAVE STORY META] ❌ setDoc failed:', setDocError);
        throw setDocError;
      }
    } catch (error) {
      console.error('[SAVE STORY META] ❌ Failed to save story metadata:', error);
    }
  }

  /**
   * Save characters to Firestore
   */
  private async saveCharacters(): Promise<void> {
    try {
      // CRITICAL: Check if this device is active (single-device session enforcement)
      const isActive = await deviceSessionManager.isActive();
      if (!isActive) {
        console.warn('[SAVE CHARACTERS] 🚫 Device is not active - save blocked (session is on another device)');
        return;
      }
      
      const characters = Array.from(this.characters.values());
      await saveCharacters(this.storyId, characters);
    } catch (error) {
      console.error('Failed to save characters:', error);
    }
  }

  /**
   * Save poem metadata to Firestore
   */
  private async savePoemMeta(): Promise<void> {
    if (!this.poemId) {
      console.warn('[SAVE POEM META] ⚠️ No poem ID, skipping save');
      return;
    }
    
    // Check if poem has content
    const hasContent = this.poemTitle.trim() || 
                      this.poemText.trim() || 
                      this.poemTags.length > 0 || 
                      this.poemPrivacy || 
                      this.poemCoverImageUrl;
    
    if (!hasContent) {
      console.log('[SAVE POEM META] ⏸️ Poem has no content, skipping save');
      return;
    }
    
    try {
      console.log('[SAVE POEM META] 💾 Saving metadata for poem:', this.poemId);
      
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        console.warn('[SAVE POEM META] ⚠️ No user authenticated - cannot save poem');
        return;
      }

      // CRITICAL: Check if this device is active (single-device session enforcement)
      const isActive = await deviceSessionManager.isActive();
      if (!isActive) {
        console.warn('[SAVE POEM META] 🚫 Device is not active - save blocked (session is on another device)');
        return;
      }

      // Get user's display name from Firestore
      let authorName = '';
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          authorName = userDoc.data().displayName || '';
        }
      } catch (err) {
        console.warn('[SAVE POEM META] Could not fetch author name:', err);
      }

      // Calculate derived fields
      const wordCount = this.poemText.split(/\s+/).filter(w => w.length > 0).length;
      const lineCount = this.poemText.split('\n').length;
      const stanzaCount = this.poemText.split(/\n\s*\n/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 words per minute

      const poemData: Partial<Poem> = {
        id: this.poemId,
        title: this.poemTitle,
        text: this.poemText,
        tags: this.poemTags,
        privacy: this.poemPrivacy as 'public' | 'private' | 'unlisted',
        genre: this.poemGenre || '',
        coverImageUrl: this.poemCoverImageUrl,
        authorName: authorName, // Add author's display name
        wordCount,
        lineCount,
        stanzaCount,
        readTime,
      };

      // Check if poem exists in Firestore
      const existingPoem = await getPoem(this.poemId);
      
      if (existingPoem) {
        // Update existing poem
        await updatePoem(this.poemId, poemData);
        console.log('[SAVE POEM META] ✅ Poem updated successfully');
      } else {
        // Create new poem
        await createPoem(this.poemId, poemData);
        console.log('[SAVE POEM META] ✅ New poem created successfully');
      }

      // RECORD WRITING ACTIVITY for poem
      // user is already declared earlier in this function
      if (user) {
        await recordWritingActivity(user.uid, wordCount);
        console.log('[SAVE POEM META] 📊 Activity recorded:', wordCount, 'words');
      }
    } catch (error) {
      console.error('[SAVE POEM META] ❌ Save failed:', error);
    }
  }

  /**
   * Save locations to Firestore
   */
  private async saveLocations(): Promise<void> {
    try {
      // CRITICAL: Check if this device is active (single-device session enforcement)
      const isActive = await deviceSessionManager.isActive();
      if (!isActive) {
        console.warn('[SAVE LOCATIONS] 🚫 Device is not active - save blocked (session is on another device)');
        return;
      }
      
      const locations = Array.from(this.locations.values());
      await saveLocations(this.storyId, locations);
    } catch (error) {
      console.error('Failed to save locations:', error);
    }
  }

  /**
   * Save acts and chapters structure to Firestore
   */
  private async saveActsAndChapters(): Promise<void> {
    try {
      // CRITICAL: Check if this device is active (single-device session enforcement)
      const isActive = await deviceSessionManager.isActive();
      if (!isActive) {
        console.warn('[SAVE ACTS/CHAPTERS] 🚫 Device is not active - save blocked (session is on another device)');
        return;
      }
      
      const acts = Array.from(this.acts.values());
      const chapters = Array.from(this.chapters.values());
      await saveActsAndChapters(this.storyId, acts, chapters);
    } catch (error) {
      console.error('Failed to save acts and chapters:', error);
    }
  }

  /**
   * Save chapter content to Firestore
   */
  private async saveChapterContent(chapterId: string): Promise<void> {
    try {
      console.log('[SAVE CHAPTER CONTENT] 💾 Saving chapter:', chapterId);
      
      // CRITICAL: Check if this device is active (single-device session enforcement)
      const isActive = await deviceSessionManager.isActive();
      if (!isActive) {
        console.warn('[SAVE CHAPTER CONTENT] 🚫 Device is not active - save blocked (session is on another device)');
        this.chapterStates.set(chapterId, 'error');
        this.notifyListeners();
        return;
      }
      
      const content = this.chapterContents.get(chapterId);
      if (content) {
        await saveChapterContent(this.storyId, chapterId, content);
        console.log('[SAVE CHAPTER CONTENT] ✅ Chapter saved:', { 
          chapterId, 
          wordCount: content.wordCount,
          charCount: content.charCount 
        });

        // RECORD WRITING ACTIVITY
        // Activity is recorded when text is saved to Firestore (autosave or manual)
        const user = auth.currentUser;
        if (user) {
          await recordWritingActivity(user.uid, content.wordCount);
          console.log('[SAVE CHAPTER CONTENT] 📊 Activity recorded:', content.wordCount, 'words');
        }
      } else {
        console.warn('[SAVE CHAPTER CONTENT] ⚠️ Chapter content not found:', chapterId);
      }
    } catch (error) {
      console.error('[SAVE CHAPTER CONTENT] ❌ Failed to save chapter:', error);
      this.chapterStates.set(chapterId, 'error');
      this.notifyListeners();
    }
  }

  // ============================================================
  // POEM/LYRICS METHODS
  // ============================================================

  /**
   * Set poem title
   */
  setPoemTitle(title: string): void {
    if (this.poemTitle !== title) {
      this.poemTitle = title;
      this.scheduleMetaSavePoem();
      this.notifyListeners();
    }
  }

  getPoemTitle(): string {
    return this.poemTitle;
  }

  /**
   * Set poem text content
   */
  setPoemText(text: string): void {
    if (this.poemText !== text) {
      this.poemText = text;
      this.scheduleMetaSavePoem();
      this.notifyListeners();
    }
  }

  getPoemText(): string {
    return this.poemText;
  }

  /**
   * Set poem tags
   */
  setPoemTags(tags: string[]): void {
    this.poemTags = tags;
    this.scheduleMetaSavePoem();
    this.notifyListeners();
  }

  getPoemTags(): string[] {
    return this.poemTags;
  }

  /**
   * Set poem privacy
   */
  setPoemPrivacy(privacy: string): void {
    if (this.poemPrivacy !== privacy) {
      this.poemPrivacy = privacy;
      this.scheduleMetaSavePoem();
      this.notifyListeners();
    }
  }

  getPoemPrivacy(): string {
    return this.poemPrivacy;
  }

  /**
   * Set poem genre
   */
  setPoemGenre(genre: string): void {
    if (this.poemGenre !== genre) {
      this.poemGenre = genre;
      this.scheduleMetaSavePoem();
      this.notifyListeners();
    }
  }

  getPoemGenre(): string {
    return this.poemGenre;
  }

  /**
   * Set poem cover image
   */
  setPoemCoverImage(coverImageUrl: string): void {
    this.poemCoverImageUrl = coverImageUrl;
    this.scheduleMetaSavePoem();
    this.notifyListeners();
  }

  getPoemCoverImageUrl(): string {
    return this.poemCoverImageUrl;
  }

  /**
   * Get poem statistics
   */
  getPoemStats(): { lines: number; stanzas: number; words: number; readTime: number } {
    const lines = this.poemText.split(/\r?\n/).map(l => l.trim());
    const nonEmptyLines = lines.filter(l => l.length > 0);
    
    // Count stanzas (groups of non-empty lines separated by empty lines)
    let stanzas = 0;
    let inStanza = false;
    for (const line of lines) {
      if (line.length > 0) {
        if (!inStanza) {
          stanzas++;
          inStanza = true;
        }
      } else {
        inStanza = false;
      }
    }
    
    const words = nonEmptyLines.join(' ').split(/\s+/).filter(Boolean).length;
    const readTime = words > 0 ? Math.max(1, Math.round(words / 200)) : 0;
    
    return { 
      lines: nonEmptyLines.length, 
      stanzas, 
      words, 
      readTime 
    };
  }

  /**
   * Get full poem state
   */
  getPoemState(): PoemState {
    const stats = this.getPoemStats();
    return {
      poemId: this.poemId,
      title: this.poemTitle,
      text: this.poemText,
      tags: this.poemTags,
      privacy: this.poemPrivacy,
      genre: this.poemGenre,
      coverImageUrl: this.poemCoverImageUrl,
      wordCount: stats.words,
      lineCount: stats.lines,
      stanzaCount: stats.stanzas,
      readTime: stats.readTime,
    };
  }

  /**
   * Schedule poem metadata save (immediate)
   */
  private scheduleMetaSavePoem(): void {
    if (this.metaAutosaveTimeout) {
      clearTimeout(this.metaAutosaveTimeout);
    }
    
    this.metaAutosaveTimeout = window.setTimeout(async () => {
      await this.savePoemMeta();
      this.metaAutosaveTimeout = null;
    }, AUTOSAVE_DELAY_META);
  }

  // ============================================================
  // UTILITIES
  // ============================================================

  /**
   * Get current content type
   */
  getContentType(): ContentType {
    return this.contentType;
  }

  /**
   * Get current content ID
   */
  getContentId(): string {
    return this.contentId;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  /**
   * Get story ID
   */
  getStoryId(): string {
    return this.storyId;
  }

  /**
   * Get poem ID
   */
  getPoemId(): string {
    return this.poemId;
  }

  /**
   * Get full story state
   */
  getStoryState(): StoryState {
    return {
      storyId: this.storyId,
      storyTitle: this.storyTitle,
      privacy: this.privacy,
      primaryGenre: this.primaryGenre,
      secondaryGenre: this.secondaryGenre,
      tertiaryGenre: this.tertiaryGenre,
      audience: this.audience,
      readingTime: this.readingTime,
      coverImageId: this.coverImageId,
      coverImageUrl: this.coverImageUrl,
      characters: this.getCharacters(),
      locations: this.getLocations(),
      acts: this.getActs(),
      chapters: Array.from(this.chapters.values()),
    };
  }

  /**
   * Subscribe to engine updates
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Export singleton instance
const writingSessionEngine = new WritingSessionEngine();
export default writingSessionEngine;
