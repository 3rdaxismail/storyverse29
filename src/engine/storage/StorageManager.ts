/**
 * StorageManager
 * 
 * Handles all localStorage persistence for the Story Editor.
 * Manages structured storage with support for large text splitting.
 * 
 * STORAGE STRUCTURE:
 * /storyverse/
 *   /stories/
 *     /{storyId}/
 *       story.json          ← metadata, genres, audience
 *       characters.json     ← global character list
 *       acts.json           ← acts + chapter structure
 *       /chapters/
 *         chapter_{id}_part_0  ← text content (split if > 30k chars)
 *         chapter_{id}_part_1
 *         ...
 */

export interface StoryMetadata {
  storyId: string;
  storyTitle: string;
  privacy: string;
  primaryGenre: string;
  secondaryGenre: string;
  tertiaryGenre: string;
  audience: string;
  readingTime: number; // derived, in minutes
  excerptHeading: string;
  excerptBody: string;
  coverImageId?: string;
  coverImageUrl?: string;
  authorId?: string; // User ID of story creator (CRITICAL for isolation)
  createdAt: number;
  updatedAt: number;
}

export interface Character {
  characterId: string;
  name: string;
  avatar?: string;
  initials: string;
  order: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'INT' | 'EXT';
  description?: string;
  image?: string;
  createdAt: number;
}

export interface Act {
  actId: string;
  actTitle: string;
  actOrder: number;
}

export interface Chapter {
  chapterId: string;
  actId: string;
  chapterTitle: string;
  assignedCharacterIds: string[];
  assignedLocationIds: string[];
  expanded: boolean;
  chapterOrder: number;
  lastEditedAt: number;
}

export interface ChapterContent {
  chapterId: string;
  text: string;
  wordCount: number;
  charCount: number;
  state: 'empty' | 'writing' | 'idle' | 'syncing' | 'error';
  lastSavedAt: number;
}

const MAX_TEXT_SIZE = 30000; // Split text if exceeds 30k characters
const STORAGE_PREFIX = 'storyverse';

class StorageManager {
  /**
   * Get the storage key for a specific resource
   */
  private getKey(storyId: string, resource: string): string {
    return `${STORAGE_PREFIX}/stories/${storyId}/${resource}`;
  }

  /**
   * Save story metadata
   */
  saveStoryMeta(metadata: StoryMetadata): void {
    try {
      const key = this.getKey(metadata.storyId, 'story');
      const data = {
        ...metadata,
        updatedAt: Date.now(),
      };
      
      console.log('[StorageManager] Saving story metadata to key:', key);
      console.log('[StorageManager] Data:', data);
      
      localStorage.setItem(key, JSON.stringify(data));
      
      console.log('[StorageManager] Story metadata saved successfully to localStorage');
    } catch (error) {
      console.error('[StorageManager] Failed to save story metadata:', error);
      throw new Error('STORAGE_ERROR: Failed to save story metadata');
    }
  }

  /**
   * Load story metadata
   */
  loadStoryMeta(storyId: string): StoryMetadata | null {
    try {
      const key = this.getKey(storyId, 'story');
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as StoryMetadata;
    } catch (error) {
      console.error('Failed to load story metadata:', error);
      return null;
    }
  }

  /**
   * Save characters list
   */
  saveCharacters(storyId: string, characters: Character[]): void {
    try {
      const key = this.getKey(storyId, 'characters');
      localStorage.setItem(key, JSON.stringify(characters));
    } catch (error) {
      console.error('Failed to save characters:', error);
      throw new Error('STORAGE_ERROR: Failed to save characters');
    }
  }

  /**
   * Load characters list
   */
  loadCharacters(storyId: string): Character[] {
    try {
      const key = this.getKey(storyId, 'characters');
      const data = localStorage.getItem(key);
      if (!data) return [];
      return JSON.parse(data) as Character[];
    } catch (error) {
      console.error('Failed to load characters:', error);
      return [];
    }
  }

  /**
   * Save locations list
   */
  saveLocations(storyId: string, locations: Location[]): void {
    try {
      const key = this.getKey(storyId, 'locations');
      localStorage.setItem(key, JSON.stringify(locations));
    } catch (error) {
      console.error('Failed to save locations:', error);
      throw new Error('STORAGE_ERROR: Failed to save locations');
    }
  }

  /**
   * Load locations list
   */
  loadLocations(storyId: string): Location[] {
    try {
      const key = this.getKey(storyId, 'locations');
      const data = localStorage.getItem(key);
      if (!data) return [];
      return JSON.parse(data) as Location[];
    } catch (error) {
      console.error('Failed to load locations:', error);
      return [];
    }
  }

  /**
   * Save complete character profile
   */
  saveCharacterProfile(storyId: string, characterId: string, profile: any): void {
    try {
      const key = this.getKey(storyId, `character_profiles/${characterId}`);
      const data = {
        ...profile,
        updatedAt: Date.now(),
      };
      
      console.log('[StorageManager] Saving profile to key:', key);
      console.log('[StorageManager] Profile name:', profile.name);
      console.log('[StorageManager] Profile imageUrl:', profile.imageUrl ? `Present (${profile.imageUrl.length} chars)` : 'None');
      
      localStorage.setItem(key, JSON.stringify(data));
      
      // Verify it was saved
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('[StorageManager] Verified save - imageUrl:', parsed.imageUrl ? 'Present' : 'Missing');
      }
      
      // Update character in main characters list
      const characters = this.loadCharacters(storyId);
      const existingIndex = characters.findIndex(c => c.characterId === characterId);
      
      if (existingIndex >= 0) {
        // Update existing character with new avatar
        characters[existingIndex] = {
          ...characters[existingIndex],
          name: profile.name,
          avatar: profile.imageUrl,
        };
        console.log('[StorageManager] Updated character in list:', characterId, 'Name:', profile.name, 'Avatar:', profile.imageUrl ? 'Set' : 'Removed');
      } else {
        // Add new character
        characters.push({
          characterId: characterId,
          name: profile.name,
          avatar: profile.imageUrl,
          initials: profile.name.substring(0, 2).toUpperCase(),
          order: characters.length,
        });
      }
      
      this.saveCharacters(storyId, characters);
      console.log('[StorageManager] Character profile saved:', characterId);
    } catch (error) {
      console.error('Failed to save character profile:', error);
      throw new Error('STORAGE_ERROR: Failed to save character profile');
    }
  }

  /**
   * Load complete character profile
   */
  loadCharacterProfile(storyId: string, characterId: string): any | null {
    try {
      const key = this.getKey(storyId, `character_profiles/${characterId}`);
      const data = localStorage.getItem(key);
      if (!data) {
        console.log('[StorageManager] No profile found for:', characterId);
        return null;
      }
      const profile = JSON.parse(data);
      console.log('[StorageManager] Loaded character profile:', characterId, 'Avatar:', profile.imageUrl ? 'Present (' + profile.imageUrl.substring(0, 50) + '...)' : 'None');
      return profile;
    } catch (error) {
      console.error('Failed to load character profile:', error);
      return null;
    }
  }

  /**
   * Delete character profile and remove from characters list
   */
  deleteCharacterProfile(storyId: string, characterId: string): void {
    try {
      // Delete character profile
      const profileKey = this.getKey(storyId, `character_profiles/${characterId}`);
      localStorage.removeItem(profileKey);
      
      // Remove from characters list
      const characters = this.loadCharacters(storyId);
      const updatedCharacters = characters.filter(c => c.characterId !== characterId);
      this.saveCharacters(storyId, updatedCharacters);
      
      // Remove character from all chapters
      const { chapters } = this.loadActsAndChapters(storyId);
      const updatedChapters = chapters.map(chapter => ({
        ...chapter,
        assignedCharacterIds: chapter.assignedCharacterIds.filter(id => id !== characterId)
      }));
      
      // Save updated chapters
      const { acts } = this.loadActsAndChapters(storyId);
      this.saveActsAndChapters(storyId, acts, updatedChapters);
      
      console.log('[StorageManager] Character deleted:', characterId);
    } catch (error) {
      console.error('Failed to delete character:', error);
      throw new Error('STORAGE_ERROR: Failed to delete character');
    }
  }

  /**
   * Save acts and chapters structure
   */
  saveActsAndChapters(storyId: string, acts: Act[], chapters: Chapter[]): void {
    try {
      const key = this.getKey(storyId, 'acts');
      const data = {
        acts,
        chapters,
        updatedAt: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save acts and chapters:', error);
      throw new Error('STORAGE_ERROR: Failed to save acts and chapters');
    }
  }

  /**
   * Load acts and chapters structure
   */
  loadActsAndChapters(storyId: string): { acts: Act[]; chapters: Chapter[] } {
    try {
      const key = this.getKey(storyId, 'acts');
      const data = localStorage.getItem(key);
      if (!data) return { acts: [], chapters: [] };
      const parsed = JSON.parse(data);
      return {
        acts: parsed.acts || [],
        chapters: parsed.chapters || [],
      };
    } catch (error) {
      console.error('Failed to load acts and chapters:', error);
      return { acts: [], chapters: [] };
    }
  }

  /**
   * Save chapter content with automatic splitting for large text
   */
  saveChapterContent(storyId: string, content: ChapterContent): void {
    try {
      console.log('[StorageManager] Saving chapter content:', { 
        storyId, 
        chapterId: content.chapterId,
        textLength: content.text.length 
      });
      
      const text = content.text;
      const parts = this.splitText(text);
      
      console.log('[StorageManager] Text split into', parts.length, 'parts');
      
      // Save metadata
      const metaKey = this.getKey(storyId, `chapters/chapter_${content.chapterId}_meta`);
      const metadata = {
        chapterId: content.chapterId,
        wordCount: content.wordCount,
        charCount: content.charCount,
        state: content.state,
        lastSavedAt: Date.now(),
        partCount: parts.length,
      };
      
      console.log('[StorageManager] Saving chapter metadata to key:', metaKey);
      localStorage.setItem(metaKey, JSON.stringify(metadata));
      
      // Save text parts
      parts.forEach((part, index) => {
        const partKey = this.getKey(storyId, `chapters/chapter_${content.chapterId}_part_${index}`);
        console.log('[StorageManager] Saving part', index, 'to key:', partKey);
        localStorage.setItem(partKey, part);
      });
      
      // Clean up old parts if text was shortened
      this.cleanupOldParts(storyId, content.chapterId, parts.length);
      
      console.log('[StorageManager] Chapter content saved successfully');
    } catch (error) {
      console.error('[StorageManager] Failed to save chapter content:', error);
      throw new Error('STORAGE_ERROR: Failed to save chapter content');
    }
  }

  /**
   * Load chapter content and reassemble from parts
   */
  loadChapterContent(storyId: string, chapterId: string): ChapterContent | null {
    try {
      const metaKey = this.getKey(storyId, `chapters/chapter_${chapterId}_meta`);
      const metaData = localStorage.getItem(metaKey);
      if (!metaData) return null;
      
      const metadata = JSON.parse(metaData);
      const partCount = metadata.partCount || 1;
      
      // Reassemble text from parts
      const parts: string[] = [];
      for (let i = 0; i < partCount; i++) {
        const partKey = this.getKey(storyId, `chapters/chapter_${chapterId}_part_${i}`);
        const part = localStorage.getItem(partKey);
        if (part !== null) {
          parts.push(part);
        }
      }
      
      const text = parts.join('');
      
      return {
        chapterId,
        text,
        wordCount: metadata.wordCount || this.countWords(text),
        charCount: metadata.charCount || text.length,
        state: metadata.state || 'idle',
        lastSavedAt: metadata.lastSavedAt || Date.now(),
      };
    } catch (error) {
      console.error('Failed to load chapter content:', error);
      return null;
    }
  }

  /**
   * Split text into parts if it exceeds MAX_TEXT_SIZE
   */
  private splitText(text: string): string[] {
    if (text.length <= MAX_TEXT_SIZE) {
      return [text];
    }
    
    const parts: string[] = [];
    let remaining = text;
    
    while (remaining.length > 0) {
      if (remaining.length <= MAX_TEXT_SIZE) {
        parts.push(remaining);
        break;
      }
      
      // Find a safe split point (end of sentence or paragraph)
      let splitPoint = MAX_TEXT_SIZE;
      
      // Look for paragraph break
      const paragraphBreak = remaining.lastIndexOf('\n\n', splitPoint);
      if (paragraphBreak > MAX_TEXT_SIZE * 0.8) {
        splitPoint = paragraphBreak + 2;
      } else {
        // Look for sentence end
        const sentenceEnd = remaining.lastIndexOf('. ', splitPoint);
        if (sentenceEnd > MAX_TEXT_SIZE * 0.8) {
          splitPoint = sentenceEnd + 2;
        }
      }
      
      parts.push(remaining.substring(0, splitPoint));
      remaining = remaining.substring(splitPoint);
    }
    
    return parts;
  }

  /**
   * Clean up old parts when text is shortened
   */
  private cleanupOldParts(storyId: string, chapterId: string, currentPartCount: number): void {
    // Try to remove up to 10 potential old parts
    for (let i = currentPartCount; i < currentPartCount + 10; i++) {
      const partKey = this.getKey(storyId, `chapters/chapter_${chapterId}_part_${i}`);
      try {
        localStorage.removeItem(partKey);
      } catch {
        // Ignore errors
      }
    }
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
   * Delete a chapter's content
   */
  deleteChapterContent(storyId: string, chapterId: string): void {
    try {
      // Remove metadata
      const metaKey = this.getKey(storyId, `chapters/chapter_${chapterId}_meta`);
      localStorage.removeItem(metaKey);
      
      // Remove all parts (try up to 100)
      for (let i = 0; i < 100; i++) {
        const partKey = this.getKey(storyId, `chapters/chapter_${chapterId}_part_${i}`);
        localStorage.removeItem(partKey);
      }
    } catch (error) {
      console.error('Failed to delete chapter content:', error);
    }
  }

  /**
   * Delete entire story data
   */
  deleteStory(storyId: string): void {
    try {
      // Get all keys that match this story
      const prefix = `${STORAGE_PREFIX}/stories/${storyId}/`;
      const keysToDelete: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      }
      
      // Delete all matching keys
      keysToDelete.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  }

  /**
   * List all story IDs
   */
  listStories(): string[] {
    try {
      const storyIds = new Set<string>();
      const prefix = `${STORAGE_PREFIX}/stories/`;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          // Extract story ID from key
          const parts = key.substring(prefix.length).split('/');
          if (parts.length > 0) {
            storyIds.add(parts[0]);
          }
        }
      }
      
      return Array.from(storyIds);
    } catch (error) {
      console.error('Failed to list stories:', error);
      return [];
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            used += key.length + value.length;
          }
        }
      }
      
      // localStorage typically has 5-10MB limit
      const total = 10 * 1024 * 1024; // 10MB estimate
      const percentage = (used / total) * 100;
      
      return { used, total, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

// Export singleton instance
const storageManager = new StorageManager();
export default storageManager;
