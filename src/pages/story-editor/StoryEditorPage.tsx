// src/pages/story-editor/StoryEditorPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import BottomNavigation from "../../components/navigation/BottomNavigation";
import Card from "../../components/common/Card";
import Toast from "../../components/common/Toast";
import ConfirmationToast from "../../components/common/ConfirmationToast";
import ChapterTextEditor, { type EditorState } from "../../components/story/ChapterTextEditor";
import StoryEditorSidebar from "../../components/story/StoryEditorSidebar";
import StoryEditorScenesPanel from "../../components/story/StoryEditorScenesPanel";
import AIAssistantPanel from "../../components/ai/AIAssistantPanel";
import StoryEditorTopBar from "../../components/story/StoryEditorTopBar";
import type { Location } from "../../components/story/LocationSection";
import type { AISelectionRange } from "../../types/AIEditing";
import "../../components/story/StoryEditorLayout.css";

import writingSessionEngine from "../../engine/WritingSessionEngine";
import storageManager from "../../engine/storage/StorageManager";
import { exportStoryAsPDF } from "../../utils/exportStoryPDF";
import { moveChapterUp, moveChapterDown } from "../../firebase/services/chapterReorderService";
import type { Chapter as ReorderChapter, Act as ReorderAct } from "../../firebase/services/chapterReorderService";
import "./StoryEditorPage.css";

export interface Chapter {
  id: string;
  title: string;
  characterIds: string[];
  locationIds: string[];
  content: string;
  state: EditorState;
}

export interface Act {
  id: string;
  title: string;
  chapters: Chapter[];
}

export default function StoryEditorPage() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const { user, userProfile } = useAuth();
  const isOnline = useOnlineStatus();
  const isMobile = useMediaQuery('(max-width: 900px)');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  
  // Cover image state
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  
  // Story-level characters (source of truth from Firestore)
  const [characterProfiles, setCharacterProfiles] = useState<Array<{ id: string; name: string; avatar?: string }>>([]);

  // Story-level locations (source of truth from Firestore)
  const [locations, setLocations] = useState<Location[]>([]);

  // Acts and Chapters structure (loaded from Firestore)
  const [acts, setActs] = useState<Act[]>([]);
  
  // Calculated stats
  const [wordCount, setWordCount] = useState(0);
  const [dialogueCount, setDialogueCount] = useState(0);
  const [readTime, setReadTime] = useState('< 1m');

  // Track active chapter for "writing" state
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Track expanded chapter for collapse/expand behavior (only one at a time)
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [activeSelection, setActiveSelection] = useState<AISelectionRange | null>(null);
  const [aiEditHistory, setAiEditHistory] = useState<Array<{ chapterId: string; previousContent: string; summary: string; createdAt: number }>>([]);

  // State for managing which dropdown is open (only one at a time)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'warning' | 'error' | 'success' | 'info'>('info');

  // Delete chapter confirmation state
  const [showDeleteChapterConfirm, setShowDeleteChapterConfirm] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

  // Delete act confirmation state
  const [showDeleteActConfirm, setShowDeleteActConfirm] = useState(false);
  const [actToDelete, setActToDelete] = useState<string | null>(null);
  const [actDeleteMessage, setActDeleteMessage] = useState('');

  const handleChapterSelect = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setExpandedChapterId(chapterId);
    console.log('[StoryEditorPage] 📌 Chapter selected via sidebar:', chapterId);
  };

  const fallbackAct = acts.find((act) => act.chapters.length > 0);
  const activeActItem = acts.find((act) => act.chapters.some((chapter) => chapter.id === activeChapterId)) || fallbackAct;
  const activeChapter = activeActItem?.chapters.find((chapter) => chapter.id === activeChapterId) || activeActItem?.chapters[0];
  const activeChapterTitle = activeChapter?.title || 'Current scene';
  const activeBreadcrumb = activeActItem ? `${activeActItem.title} · ${activeChapterTitle}` : 'Story Editor';
  const activeCharacters = activeChapter ? characterProfiles.filter((character) => activeChapter.characterIds.includes(character.id)) : [];
  const sceneContextItems = acts.flatMap((act) =>
    act.chapters.map((chapter) => ({
      id: chapter.id,
      label: `${act.title}: ${chapter.title || 'Untitled Chapter'}`,
    }))
  );
  const characterContextItems = characterProfiles.map((character) => ({
    id: character.id,
    label: character.name,
  }));
  const locationContextItems = locations.map((location) => ({
    id: location.id,
    label: location.name,
  }));

  const showNotification = (message: string, type: 'warning' | 'error' | 'success' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleOpenDropdown = (dropdownName: string) => {
    setOpenDropdown(dropdownName || null);
  };

  // Helper function to save chapter structure to Firestore
  const saveChapterStructureToFirestore = async (updatedActs: Act[]) => {
    if (!storyId) return;
    
    try {
      const { saveActsAndChapters } = await import('../../firebase/services/storiesService');
      
      // Convert editor Acts format to Firestore format
      const firestoreActs = updatedActs.map((act, index) => ({
        actId: act.id,
        actTitle: act.title,
        actOrder: index
      }));
      
      const firestoreChapters = updatedActs.flatMap((act) =>
        act.chapters.map((ch, chIndex) => ({
          chapterId: ch.id,
          actId: act.id,
          chapterTitle: ch.title,
          assignedCharacterIds: ch.characterIds,
          assignedLocationIds: ch.locationIds,
          expanded: ch.id === expandedChapterId,
          chapterOrder: chIndex,
          lastEditedAt: Date.now()
        }))
      );
      
      await saveActsAndChapters(storyId, firestoreActs, firestoreChapters);
      console.log('[StoryEditorPage] ✅ Chapter structure saved to Firestore');
    } catch (error) {
      console.error('[StoryEditorPage] ❌ Failed to save chapter structure:', error);
    }
  };

  // CRITICAL: Reset all editor state
  const resetEditorState = () => {
    console.log('[StoryEditorPage] 🧹 RESETTING EDITOR STATE');
    setCharacterProfiles([]);
    setLocations([]);
    setActs([]);
    setExpandedChapterId(null);
    setActiveChapterId(null);
    setLoading(true);
    setError(null);
    setAuthorized(false);
  };

  // CRITICAL: Load story from Firestore (single source of truth)
  const loadStoryFromFirestore = async (storyId: string, userId: string) => {
    try {
      console.log('[StoryEditorPage] 📡 Loading story from Firestore:', storyId);
      
      // Import Firestore functions dynamically
      const { getStory, loadActsAndChapters, loadChapterContent } = await import('../../firebase/services/storiesService');
      
      // Fetch story metadata
      const story = await getStory(storyId);
      
      if (!story) {
        // Story doesn't exist in Firestore yet (new story)
        // This is normal for newly created stories - they get saved when user adds content
        console.log('[StoryEditorPage] ✅ New story - will be created on first save');
        setAuthorized(true);
        setLoading(false);
        return;
      }
      
      // CRITICAL: Verify ownership
      if (story.uid !== userId) {
        console.error('[StoryEditorPage] ❌ UNAUTHORIZED: Story belongs to different user');
        setError('You do not have permission to edit this story');
        setAuthorized(false);
        setLoading(false);
        return;
      }
      
      setAuthorized(true);
      
      // Load cover image from story
      if (story.coverImageUrl) {
        setCoverImageUrl(story.coverImageUrl);
        console.log('[StoryEditorPage] ✅ Loaded cover image from Firestore');
      }
      
      // Load characters and locations from story document
      if (story.characters && story.characters.length > 0) {
        const loadedCharacters = story.characters.map((c: { characterId: string; name: string; avatar?: string }) => {
          // Try to get more detailed data from localStorage (includes full avatar)
          const localProfile = storageManager.loadCharacterProfile(storyId, c.characterId);
          return {
            id: c.characterId,
            name: localProfile?.name || c.name,
            avatar: localProfile?.imageUrl || c.avatar
          };
        });
        setCharacterProfiles(loadedCharacters);
        console.log('[StoryEditorPage] ✅ Loaded', loadedCharacters.length, 'characters from Firestore');
      }
      
      if (story.locations && story.locations.length > 0) {
        setLocations(story.locations);
        console.log('[StoryEditorPage] ✅ Loaded', story.locations.length, 'locations from Firestore');
      }
      
      // Load acts and chapters
      const { acts: loadedActs, chapters: loadedChapters } = await loadActsAndChapters(storyId);
      
      // Transform data for editor
      const editorActs: Act[] = await Promise.all(
        loadedActs.map(async (act) => ({
          id: act.actId,
          title: act.actTitle || 'Untitled Act',
          chapters: await Promise.all(
            loadedChapters
              .filter(ch => ch.actId === act.actId)
              .sort((a, b) => a.chapterOrder - b.chapterOrder)
              .map(async (ch) => {
                const chapterContent = await loadChapterContent(storyId, ch.chapterId);
                return {
                  id: ch.chapterId,
                  title: ch.chapterTitle || 'Untitled Chapter',
                  characterIds: ch.assignedCharacterIds || [],
                  locationIds: ch.assignedLocationIds || [],
                  content: chapterContent?.text || '',
                  state: (chapterContent?.text ? 'idle' : 'empty') as EditorState
                };
              })
          )
        }))
      );
      
      setActs(editorActs);
      
      // Initialize WritingSessionEngine with loaded data
      writingSessionEngine.initStory(storyId);
      
      console.log('[StoryEditorPage] ✅ Story loaded successfully');
      setLoading(false);
      
    } catch (err) {
      console.error('[StoryEditorPage] ❌ Failed to load story:', err);
      setError('Failed to load story');
      setLoading(false);
    }
  };

  // CRITICAL: Main effect - load on mount and when storyId changes
  useEffect(() => {
    console.log('[StoryEditorPage] 🔄 Main effect triggered:', { storyId, userId: user?.uid });
    
    // Validate route parameter
    if (!storyId) {
      console.error('[StoryEditorPage] ❌ No storyId in route');
      navigate('/home', { replace: true });
      return;
    }
    
    // Validate authentication
    if (!user) {
      console.error('[StoryEditorPage] ❌ No authenticated user');
      navigate('/auth/signin', { replace: true });
      return;
    }
    
    // Reset and load
    resetEditorState();
    loadStoryFromFirestore(storyId, user.uid);
    
  }, [storyId, user, navigate]);
  
  // CRITICAL: Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[StoryEditorPage] 🧹 Component unmounting - cleaning up');
      resetEditorState();
    };
  }, []);
  
  // Subscribe to engine updates (only after initial load)
  useEffect(() => {
    if (loading || !authorized || !storyId) return;
    
    console.log('[StoryEditorPage] 🔔 Subscribing to engine updates...');
    
    const unsubscribe = writingSessionEngine.subscribe(() => {
      console.log('[StoryEditorPage] 🔔 Engine update received');
      
      // Update acts with latest content from engine
      setActs(prevActs => prevActs.map(act => ({
        ...act,
        chapters: act.chapters.map(ch => ({
          ...ch,
          content: writingSessionEngine.getChapterText(ch.id) || ch.content,
        }))
      })));
    });
    
    return unsubscribe;
  }, [loading, authorized, storyId]);

  // Auto-select first chapter after loading to avoid empty-state desktop header.
  useEffect(() => {
    if (activeChapterId || acts.length === 0) return;
    const firstActWithChapter = acts.find((act) => act.chapters.length > 0);
    const firstChapter = firstActWithChapter?.chapters[0];
    if (firstChapter) {
      setActiveChapterId(firstChapter.id);
      setExpandedChapterId(firstChapter.id);
    }
  }, [acts, activeChapterId]);

  // Calculate stats whenever acts change
  useEffect(() => {
    if (!acts.length) {
      setWordCount(0);
      setDialogueCount(0);
      setReadTime('< 1m');
      return;
    }
    
    let totalWords = 0;
    let totalDialogues = 0;
    
    acts.forEach(act => {
      act.chapters.forEach(chapter => {
        if (chapter.content) {
          // Count words
          const words = chapter.content.split(/\s+/).filter(w => w.trim()).length;
          totalWords += words;
          
          // Count dialogues (simple heuristic: lines with quotes)
          const dialogueLines = chapter.content.split('\n').filter(line => 
            line.includes('"') || line.includes("'")
          ).length;
          totalDialogues += dialogueLines;
        }
      });
    });
    
    setWordCount(totalWords);
    setDialogueCount(totalDialogues);
    
    // Calculate reading time (avg 200 words/min)
    if (totalWords === 0) {
      setReadTime('< 1m');
    } else {
      const minutes = Math.ceil(totalWords / 200);
      if (minutes < 60) {
        setReadTime(`${minutes}m`);
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        setReadTime(remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`);
      }
    }
  }, [acts]);

  // Act handlers
  const handleAddAct = () => {
    // Add act to engine
    const newAct = writingSessionEngine.addAct(`Act ${acts.length + 1}`);
    
    // Add a default chapter to the new act
    const newChapter = writingSessionEngine.addChapter(newAct.actId, '');
    
    // Update local state
    const actForUI: Act = {
      id: newAct.actId,
      title: newAct.actTitle,
      chapters: [
        {
          id: newChapter.chapterId,
          title: newChapter.chapterTitle,
          characterIds: [],
          locationIds: [],
          content: '',
          state: 'empty' as EditorState
        }
      ]
    };
    setActs([...acts, actForUI]);
  };

  const handleActTitleChange = (actId: string, newTitle: string) => {
    // Save to engine
    writingSessionEngine.updateActTitle(actId, newTitle);
    
    // Update local state
    setActs(prevActs => prevActs.map(act =>
      act.id === actId ? { ...act, title: newTitle } : act
    ));
  };

  const handleAddChapter = (actId: string) => {
    // Add chapter to engine
    const newChapter = writingSessionEngine.addChapter(actId, '');
    
    // Update local state
    setActs(prevActs => prevActs.map(act => {
      if (act.id === actId) {
        const chapterForUI: Chapter = {
          id: newChapter.chapterId,
          title: newChapter.chapterTitle,
          characterIds: newChapter.assignedCharacterIds || [],
          locationIds: newChapter.assignedLocationIds || [],
          content: '',
          state: 'empty' as EditorState
        };
        return { ...act, chapters: [...act.chapters, chapterForUI] };
      }
      return act;
    }));
  };

  const handleChapterTitleChange = (chapterId: string, newTitle: string) => {
    // Save to engine
    writingSessionEngine.updateChapterTitle(chapterId, newTitle);
    
    // Update local state
    setActs(prevActs => prevActs.map(act => ({
      ...act,
      chapters: act.chapters.map(ch =>
        ch.id === chapterId ? { ...ch, title: newTitle } : ch
      )
    })));
  };

  const handleChapterContentChange = (chapterId: string, content: string) => {
    console.log('[StoryEditorPage] ✏️ CHAPTER CONTENT CHANGE:', { chapterId, contentLength: content.length });
    
    // Save to WritingSessionEngine (will autosave to localStorage)
    writingSessionEngine.updateChapterText(chapterId, content);
    console.log('[StoryEditorPage] 💾 Engine save triggered for chapter:', chapterId);
    
    // Update local state for immediate UI feedback
    setActs(prevActs => prevActs.map(act => ({
      ...act,
      chapters: act.chapters.map(ch =>
        ch.id === chapterId
          ? {
              ...ch,
              content,
              state: content.length === 0 ? 'empty' : 'syncing' as EditorState
            }
          : ch
      )
    })));

    // Simulate save completion after 1 second
    setTimeout(() => {
      setActs(prevActs => prevActs.map(act => ({
        ...act,
        chapters: act.chapters.map(ch =>
          ch.id === chapterId && ch.content.length > 0
            ? { ...ch, state: 'idle' as EditorState }
            : ch
        )
      })));
    }, 1000);
  };

  // Chapter handlers
  const handleToggleChapterExpanded = (chapterId: string) => {
    // If clicking the already expanded chapter, collapse it
    // Otherwise, expand the clicked chapter (collapsing any other)
    setExpandedChapterId(prev => prev === chapterId ? null : chapterId);
  };

  // Helper functions for chapter movement
  const canChapterMoveUp = (chapterId: string): boolean => {
    // Find the act that contains this chapter
    const actIndex = acts.findIndex(act => act.chapters.some(ch => ch.id === chapterId));
    if (actIndex === -1) return false;

    const act = acts[actIndex];
    const chapterIndex = act.chapters.findIndex(ch => ch.id === chapterId);
    
    // Can move up if not first in first act
    return !(actIndex === 0 && chapterIndex === 0);
  };

  const canChapterMoveDown = (chapterId: string): boolean => {
    // Find the act that contains this chapter
    const actIndex = acts.findIndex(act => act.chapters.some(ch => ch.id === chapterId));
    if (actIndex === -1) return false;

    const act = acts[actIndex];
    const chapterIndex = act.chapters.findIndex(ch => ch.id === chapterId);
    const lastActIndex = acts.length - 1;
    
    // Can move down if not last in last act
    return !(actIndex === lastActIndex && chapterIndex === act.chapters.length - 1);
  };

  const handleMoveChapterUp = async (chapterId: string, currentActId: string) => {
    if (!storyId || !isOnline) {
      showNotification('Cannot move chapter while offline', 'warning');
      return;
    }

    try {
      // Find current chapter and act
      const currentActIndex = acts.findIndex(act => act.id === currentActId);
      if (currentActIndex === -1) return;

      const currentAct = acts[currentActIndex];
      const chapterIndex = currentAct.chapters.findIndex(ch => ch.id === chapterId);
      if (chapterIndex === -1) return;

      // Convert for Firestore service
      const reorderActs: ReorderAct[] = acts.map(act => ({
        actId: act.id,
        actTitle: act.title,
        actOrder: 0
      }));
      
      const reorderChapters: ReorderChapter[] = acts.flatMap(act =>
        act.chapters.map((ch, idx) => ({
          chapterId: ch.id,
          actId: act.id,
          chapterTitle: ch.title,
          assignedCharacterIds: ch.characterIds,
          assignedLocationIds: ch.locationIds,
          expanded: false,
          chapterOrder: idx, // Use index as order
          lastEditedAt: 0
        }))
      );

      // Perform Firestore update
      const result = await moveChapterUp(storyId, chapterId, currentActId, chapterIndex, reorderActs, reorderChapters);

      if (result.success) {
        // Sync WritingSessionEngine with new chapter orders from Firestore
        const updates: Array<[string, string, number]> = result.updatedChapters.map(ch => 
          [ch.id, ch.actId, ch.order] as [string, string, number]
        );
        writingSessionEngine.batchUpdateChapterOrders(updates);

        // Update local state by moving chapter in the UI
        setActs(prevActs => {
          const newActs = [...prevActs];
          const fromActIdx = newActs.findIndex(a => a.id === currentActId);
          const fromChIdx = newActs[fromActIdx].chapters.findIndex(ch => ch.id === chapterId);

          if (fromChIdx > 0) {
            // Moving up within same act - swap
            const temp = newActs[fromActIdx].chapters[fromChIdx];
            newActs[fromActIdx].chapters[fromChIdx] = newActs[fromActIdx].chapters[fromChIdx - 1];
            newActs[fromActIdx].chapters[fromChIdx - 1] = temp;
          } else if (fromActIdx > 0) {
            // Moving to previous act
            const chapter = newActs[fromActIdx].chapters[fromChIdx];
            newActs[fromActIdx].chapters.splice(fromChIdx, 1);
            newActs[fromActIdx - 1].chapters.push(chapter);
          }

          return newActs;
        });

        showNotification('Chapter moved up', 'success');
      }
    } catch (error) {
      console.error('Failed to move chapter up:', error);
      showNotification('Failed to move chapter', 'error');
    }
  };

  const handleMoveChapterDown = async (chapterId: string, currentActId: string) => {
    if (!storyId || !isOnline) {
      showNotification('Cannot move chapter while offline', 'warning');
      return;
    }

    try {
      // Find current chapter and act
      const currentActIndex = acts.findIndex(act => act.id === currentActId);
      if (currentActIndex === -1) return;

      const currentAct = acts[currentActIndex];
      const chapterIndex = currentAct.chapters.findIndex(ch => ch.id === chapterId);
      if (chapterIndex === -1) return;

      // Convert for Firestore service
      const reorderActs: ReorderAct[] = acts.map(act => ({
        actId: act.id,
        actTitle: act.title,
        actOrder: 0
      }));
      
      const reorderChapters: ReorderChapter[] = acts.flatMap(act =>
        act.chapters.map((ch, idx) => ({
          chapterId: ch.id,
          actId: act.id,
          chapterTitle: ch.title,
          assignedCharacterIds: ch.characterIds,
          assignedLocationIds: ch.locationIds,
          expanded: false,
          chapterOrder: idx, // Use index as order
          lastEditedAt: 0
        }))
      );

      // Perform Firestore update
      const result = await moveChapterDown(storyId, chapterId, currentActId, chapterIndex, reorderActs, reorderChapters);

      if (result.success) {
        // Sync WritingSessionEngine with new chapter orders from Firestore
        const updates: Array<[string, string, number]> = result.updatedChapters.map(ch => 
          [ch.id, ch.actId, ch.order] as [string, string, number]
        );
        writingSessionEngine.batchUpdateChapterOrders(updates);

        // Update local state by moving chapter in the UI
        setActs(prevActs => {
          const newActs = [...prevActs];
          const fromActIdx = newActs.findIndex(a => a.id === currentActId);
          const fromChIdx = newActs[fromActIdx].chapters.findIndex(ch => ch.id === chapterId);
          const lastChIdx = newActs[fromActIdx].chapters.length - 1;

          if (fromChIdx < lastChIdx) {
            // Moving down within same act - swap
            const temp = newActs[fromActIdx].chapters[fromChIdx];
            newActs[fromActIdx].chapters[fromChIdx] = newActs[fromActIdx].chapters[fromChIdx + 1];
            newActs[fromActIdx].chapters[fromChIdx + 1] = temp;
          } else if (fromActIdx < newActs.length - 1) {
            // Moving to next act
            const chapter = newActs[fromActIdx].chapters[fromChIdx];
            newActs[fromActIdx].chapters.splice(fromChIdx, 1);
            newActs[fromActIdx + 1].chapters.unshift(chapter);
          }

          return newActs;
        });

        showNotification('Chapter moved down', 'success');
      }
    } catch (error) {
      console.error('Failed to move chapter down:', error);
      showNotification('Failed to move chapter', 'error');
    }
  };

  const handleAddCharacterToChapter = (chapterId: string, characterId: string) => {
    // Save to engine
    writingSessionEngine.assignCharacterToChapter(chapterId, characterId);
    
    // Update local state and save to Firestore
    setActs(prevActs => {
      const updatedActs = prevActs.map(act => ({
        ...act,
        chapters: act.chapters.map(ch =>
          ch.id === chapterId && !ch.characterIds.includes(characterId)
            ? { ...ch, characterIds: [...ch.characterIds, characterId] }
            : ch
        )
      }));
      // Save to Firestore in background
      saveChapterStructureToFirestore(updatedActs);
      return updatedActs;
    });
  };

  const handleRemoveCharacterFromChapter = (chapterId: string, characterId: string) => {
    // Save to engine
    writingSessionEngine.removeCharacterFromChapter(chapterId, characterId);
    
    // Update local state and save to Firestore
    setActs(prevActs => {
      const updatedActs = prevActs.map(act => ({
        ...act,
        chapters: act.chapters.map(ch =>
          ch.id === chapterId
            ? { ...ch, characterIds: ch.characterIds.filter(id => id !== characterId) }
            : ch
        )
      }));
      // Save to Firestore in background
      saveChapterStructureToFirestore(updatedActs);
      return updatedActs;
    });
  };

  const handleEditorFocus = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setActs(prevActs => prevActs.map(act => ({
      ...act,
      chapters: act.chapters.map(ch =>
        ch.id === chapterId && ch.content.length > 0
          ? { ...ch, state: 'writing' as EditorState }
          : ch
      )
    })));
  };

  const handleEditorBlur = (chapterId: string) => {
    setActs(prevActs => prevActs.map(act => ({
      ...act,
      chapters: act.chapters.map(ch =>
        ch.id === chapterId && ch.state === 'writing'
          ? { ...ch, state: 'idle' as EditorState }
          : ch
      )
    })));
  };

  const handleSelectionChange = (chapterId: string, selection: AISelectionRange) => {
    if (chapterId !== activeChapter?.id) return;
    setActiveSelection(selection);
  };

  const handleApplyAiSceneContent = (nextContent: string, summary: string) => {
    if (!activeChapter) return;

    setAiEditHistory((prev) => [
      {
        chapterId: activeChapter.id,
        previousContent: activeChapter.content,
        summary,
        createdAt: Date.now(),
      },
      ...prev,
    ]);

    handleChapterContentChange(activeChapter.id, nextContent);
    setActiveSelection(null);
    showNotification('AI changes applied to current scene', 'success');
  };

  const handleUndoLastAiEdit = () => {
    if (!activeChapter) return;
    const latestForChapter = aiEditHistory.find((entry) => entry.chapterId === activeChapter.id);
    if (!latestForChapter) {
      showNotification('No AI edits to undo for this scene', 'info');
      return;
    }

    handleChapterContentChange(activeChapter.id, latestForChapter.previousContent);
    setAiEditHistory((prev) => prev.filter((entry) => entry !== latestForChapter));
    showNotification('Last AI edit undone', 'success');
  };

  // Location handlers
  const handleAddLocation = async (location: Location) => {
    const updatedLocations = [...locations, location];
    setLocations(updatedLocations);
    
    // Save to Firestore
    if (storyId) {
      try {
        const { saveLocations } = await import('../../firebase/services/storiesService');
        await saveLocations(storyId, updatedLocations);
        console.log('[StoryEditorPage] ✅ Location saved to Firestore:', location);
      } catch (error) {
        console.error('[StoryEditorPage] ❌ Failed to save location:', error);
        // Optionally show error to user
      }
    }
  };

  const handleUpdateLocation = async (locationId: string, updates: Partial<Location>) => {
    const updatedLocations = locations.map(loc =>
      loc.id === locationId ? { ...loc, ...updates } : loc
    );
    setLocations(updatedLocations);
    
    // Save to Firestore
    if (storyId) {
      try {
        const { saveLocations } = await import('../../firebase/services/storiesService');
        await saveLocations(storyId, updatedLocations);
        console.log('[StoryEditorPage] ✅ Location updated in Firestore:', locationId);
      } catch (error) {
        console.error('[StoryEditorPage] ❌ Failed to update location:', error);
      }
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const updatedLocations = locations.filter(loc => loc.id !== id);
    setLocations(updatedLocations);
    
    // Save to Firestore
    if (storyId) {
      try {
        const { saveLocations } = await import('../../firebase/services/storiesService');
        await saveLocations(storyId, updatedLocations);
        console.log('[StoryEditorPage] ✅ Location deleted from Firestore:', id);
      } catch (error) {
        console.error('[StoryEditorPage] ❌ Failed to delete location:', error);
      }
    }
  };

  const handleAddLocationToChapter = (chapterId: string, locationId: string) => {
    setActs(prevActs => {
      const updatedActs = prevActs.map(act => ({
        ...act,
        chapters: act.chapters.map(ch =>
          ch.id === chapterId && !ch.locationIds.includes(locationId)
            ? { ...ch, locationIds: [...ch.locationIds, locationId] }
            : ch
        )
      }));
      // Save to Firestore in background
      saveChapterStructureToFirestore(updatedActs);
      return updatedActs;
    });
  };

  const handleRemoveLocationFromChapter = (chapterId: string, locationId: string) => {
    setActs(prevActs => {
      const updatedActs = prevActs.map(act => ({
        ...act,
        chapters: act.chapters.map(ch =>
          ch.id === chapterId
            ? { ...ch, locationIds: ch.locationIds.filter(id => id !== locationId) }
            : ch
        )
      }));
      // Save to Firestore in background
      saveChapterStructureToFirestore(updatedActs);
      return updatedActs;
    });
  };

  const handleCreateNewLocationForChapter = async (chapterId: string, name: string, type: 'INT' | 'EXT') => {
    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      name,
      type,
      createdAt: Date.now()
    };
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    
    // Also add it to the chapter and save structure
    setActs(prevActs => {
      const updatedActs = prevActs.map(act => ({
        ...act,
        chapters: act.chapters.map(ch =>
          ch.id === chapterId
            ? { ...ch, locationIds: [...ch.locationIds, newLocation.id] }
            : ch
        )
      }));
      // Save chapter structure to Firestore in background
      saveChapterStructureToFirestore(updatedActs);
      return updatedActs;
    });
    
    // Save locations to Firestore
    if (storyId) {
      try {
        const { saveLocations } = await import('../../firebase/services/storiesService');
        await saveLocations(storyId, updatedLocations);
        console.log('[StoryEditorPage] ✅ New location created and saved to Firestore:', newLocation);
      } catch (error) {
        console.error('[StoryEditorPage] ❌ Failed to save new location:', error);
      }
    }
  };

  // Character handlers
  const handleAddCharacter = async () => {
    // Check character limit
    if (characterProfiles.length >= 20) {
      showNotification('This story has reached the current character limit (20 characters).', 'warning');
      return;
    }

    const newCharacterId = `char-${Date.now()}`;
    const newCharacter = {
      id: newCharacterId,
      name: `Character ${characterProfiles.length + 1}`,
    };
    const updatedCharacters = [...characterProfiles, newCharacter];
    setCharacterProfiles(updatedCharacters);
    
    // Save to Firestore before navigating
    if (storyId) {
      try {
        const { saveCharacters } = await import('../../firebase/services/storiesService');
        // Convert to Firestore Character format
        const firestoreCharacters = updatedCharacters.map((char, index) => ({
          characterId: char.id,
          name: char.name,
          avatar: undefined,
          initials: char.name.substring(0, 2).toUpperCase(),
          order: index
        }));
        await saveCharacters(storyId, firestoreCharacters);
        console.log('[StoryEditorPage] ✅ Character saved to Firestore:', newCharacter);
      } catch (error) {
        console.error('[StoryEditorPage] ❌ Failed to save character:', error);
      }
    }
    
    // Navigate to character profile page for new character
    navigate(`/character-profile/${newCharacterId}`, { state: { returnTo: `/editor/story/${storyId}`, storyId } });
  };

  const handleSelectCharacter = (id: string) => {
    navigate(`/character-profile/${id}`, { state: { returnTo: `/editor/story/${storyId}`, storyId } });
  };

  // Cover image handlers
  const handleCoverUpload = (file: File) => {
    setCoverImageFile(file);
  };

  const handleCoverSave = async (imageDataUrl: string) => {
    if (!isOnline) {
      showNotification('Cannot save cover image while offline', 'warning');
      return;
    }
    
    setCoverImageUrl(imageDataUrl);
    setCoverImageFile(null);
    
    // Save to Firestore
    if (storyId) {
      try {
        const { updateStory } = await import('../../firebase/services/storiesService');
        await updateStory(storyId, { coverImageUrl: imageDataUrl });
        console.log('[StoryEditorPage] ✅ Cover image saved to Firestore');
      } catch (error) {
        console.error('[StoryEditorPage] ❌ Failed to save cover image:', error);
      }
    }
  };

  const handleCoverDelete = async () => {
    if (!isOnline) {
      showNotification('Cannot delete cover image while offline', 'warning');
      return;
    }
    
    setCoverImageUrl('');
    
    // Remove from Firestore
    if (storyId) {
      try {
        const { updateStory } = await import('../../firebase/services/storiesService');
        await updateStory(storyId, { coverImageUrl: '' });
        console.log('[StoryEditorPage] ✅ Cover image deleted from Firestore');
      } catch (error) {
        console.error('[StoryEditorPage] ❌ Failed to delete cover image:', error);
      }
    }
  };

  const handleCoverCancel = () => {
    setCoverImageFile(null);
  };

  const handleViewStory = () => {
    if (!storyId) return;
    // Navigate to story reader with preview mode
    navigate(`/story/view/${storyId}?preview=true`);
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapterToDelete(chapterId);
    setShowDeleteChapterConfirm(true);
  };

  const confirmDeleteChapter = async () => {
    if (!chapterToDelete) return;

    // Delete from engine
    await writingSessionEngine.removeChapter(chapterToDelete);

    // If the deleted chapter was expanded, clear expanded state
    if (expandedChapterId === chapterToDelete) {
      setExpandedChapterId(null);
    }

    // Remove the chapter from local state
    setActs(prevActs => prevActs.map(act => ({
      ...act,
      chapters: act.chapters.filter(ch => ch.id !== chapterToDelete)
    })));

    // Close confirmation and reset state
    setShowDeleteChapterConfirm(false);
    setChapterToDelete(null);
  };

  const cancelDeleteChapter = () => {
    setShowDeleteChapterConfirm(false);
    setChapterToDelete(null);
  };

  // Format numbers for display
  const formatCount = (count: number): string => {
    if (count > 100) {
      return `${(count / 1000).toFixed(2)}K`;
    }
    return count.toString();
  };

  const handleDeleteAct = (actId: string) => {
    const actData = acts.find(act => act.id === actId);
    if (!actData) return;

    const chapterCount = actData.chapters.length;
    const message = chapterCount === 0
      ? 'This will permanently remove this act. This cannot be undone.'
      : `This will permanently remove this act and all ${chapterCount} chapter${chapterCount > 1 ? 's' : ''}. This cannot be undone.`;

    setActToDelete(actId);
    setActDeleteMessage(message);
    setShowDeleteActConfirm(true);
  };

  const confirmDeleteAct = async () => {
    if (!actToDelete) return;

    const actData = acts.find(act => act.id === actToDelete);
    if (!actData) return;

    // Delete from engine (this will also delete all chapters in the act)
    await writingSessionEngine.removeAct(actToDelete);

    // If any chapter in this act was expanded, clear expanded state
    const hasExpandedChapter = actData.chapters.some(ch => ch.id === expandedChapterId);
    if (hasExpandedChapter) {
      setExpandedChapterId(null);
    }

    // Remove from local state
    setActs(prevActs => prevActs.filter(act => act.id !== actToDelete));

    // Close confirmation and reset state
    setShowDeleteActConfirm(false);
    setActToDelete(null);
    setActDeleteMessage('');
  };

  const cancelDeleteAct = () => {
    setShowDeleteActConfirm(false);
    setActToDelete(null);
    setActDeleteMessage('');
  };

  // Export story as PDF
  const handleExportPDF = async () => {
    try {
      // Show loading notification
      showNotification('Preparing PDF export...', 'info');
      
      // Get story title from engine
      const storyTitle = writingSessionEngine.getStoryTitle();
      const excerptBody = writingSessionEngine.getExcerptBody();
      
      // Get author name from userProfile (more reliable than user.displayName)
      const authorName = userProfile?.displayName || user?.displayName || 'Unknown Author';

      // Calculate total word count from all chapters
      const totalWordCount = acts.reduce((total, act) => {
        return total + act.chapters.reduce((actTotal, chapter) => {
          return actTotal + (chapter.content?.split(/\s+/).filter(w => w.length > 0).length || 0);
        }, 0);
      }, 0);

      // Calculate reading time (avg 200 words/min)
      const readingTime = Math.ceil(totalWordCount / 200);

      // Prepare data for PDF export
      const pdfData = {
        title: storyTitle,
        authorName: authorName,
        excerpt: excerptBody,
        characters: characterProfiles.map(c => ({
          id: c.id,
          name: c.name,
          avatar: c.avatar
        })),
        locations: locations,
        acts: acts.map(act => ({
          id: act.id,
          title: act.title,
          chapters: act.chapters.map(ch => ({
            id: ch.id,
            title: ch.title,
            content: ch.content
          }))
        })),
        coverImageUrl: coverImageUrl,
        // Stats
        wordCount: totalWordCount,
        readingTime: readingTime,
        chapterCount: acts.reduce((total, act) => total + act.chapters.length, 0),
        characterCount: characterProfiles.length,
        locationCount: locations.length
      };

      await exportStoryAsPDF(pdfData);
      showNotification('PDF exported successfully!', 'success');
    } catch (error) {
      console.error('[Export PDF] Error:', error);
      showNotification('Failed to export PDF. Please check your internet connection and try again.', 'error');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="story-page">
        <StoryEditorTopBar storyTitle={writingSessionEngine.getStoryTitle() || 'Untitled Story'} />
        <main className="story-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
            Loading story...
          </div>
        </main>
        {isMobile && <BottomNavigation activeTab="write" />}
      </div>
    );
  }
  
  // Render error state
  if (error || !authorized) {
    return (
      <div className="story-page">
        <StoryEditorTopBar storyTitle={writingSessionEngine.getStoryTitle() || 'Untitled Story'} />
        <main className="story-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'center', color: 'rgba(255, 108, 87, 1)', fontSize: '1.125rem' }}>
            {error || 'Unauthorized'}
          </div>
          <button 
            onClick={() => navigate('/home')} 
            style={{ 
              padding: '12px 24px', 
              background: 'rgba(165, 183, 133, 1)', 
              border: 'none', 
              borderRadius: '8px', 
              color: '#000', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </main>
        {isMobile && <BottomNavigation activeTab="write" />}
      </div>
    );
  }

  return (
    <div className="story-page">
      {/* HEADER */}
      <StoryEditorTopBar
        storyTitle={writingSessionEngine.getStoryTitle() || 'Untitled Story'}
        isSaving={activeChapter?.state === 'syncing'}
        onShare={() => showNotification('Share coming soon', 'info')}
        onFocusMode={() => showNotification('Focus mode coming soon', 'info')}
        onMenu={() => showNotification('More options coming soon', 'info')}
      />

      {/* SCROLLABLE CONTENT */}
      <main className="story-content">
        <div className="story-editor-layout">
          <StoryEditorSidebar
            storyTitle={writingSessionEngine.getStoryTitle() || 'Untitled Story'}
            storyId={storyId}
          />

          <StoryEditorScenesPanel
            acts={acts}
            activeChapterId={activeChapterId}
            onSelectChapter={handleChapterSelect}
            onAddScene={() => {
              const targetActId = activeActItem?.id || acts[0]?.id;
              if (targetActId) {
                handleAddChapter(targetActId);
              } else {
                handleAddAct();
              }
            }}
          />

          <div className="story-editor-main">
            <div className="story-editor-topbar">
              <div className="story-editor-topbar-row">
                <div className="story-editor-crumbs">{activeBreadcrumb}</div>
                <div className="story-editor-topbar-right">
                  <button className="story-editor-status-pill">
                    In Progress
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button className="story-editor-topbar-menu" aria-label="Scene options">⋯</button>
                </div>
              </div>

              <div className="story-editor-heading">
                <h1>{activeChapterTitle}</h1>
              </div>
            </div>

            <div className="story-editor-main-content">
              <section className="story-editor-copycard">
                <div className="story-editor-copybar">
                  <button>Paragraph</button>
                  <button>B</button>
                  <button>I</button>
                  <button>U</button>
                  <button>S</button>
                  <button>List</button>
                  <button>Link</button>
                  <button>Image</button>
                  <button>Undo</button>
                  <button>Redo</button>
                </div>

                <ChapterTextEditor
                  chapterId={activeChapter?.id ?? 'active-scene'}
                  content={activeChapter?.content ?? ''}
                  state={activeChapter?.state ?? 'idle'}
                  isActive={true}
                  isExpanded={true}
                  placeholder="Write your chapter scene here..."
                  isOnline={isOnline}
                  onContentChange={handleChapterContentChange}
                  onFocus={handleEditorFocus}
                  onBlur={handleEditorBlur}
                  onSelectionChange={handleSelectionChange}
                />
              </section>

              <Card className="story-editor-details-card">
                <div className="scene-details-header">
                  <div>
                    <div className="scene-details-title">Scene Details</div>
                    <div className="scene-details-subtitle">Purpose, conflict, cast, and timeline for your current scene.</div>
                  </div>
                  <button className="scene-details-edit">Edit</button>
                </div>

                <div className="scene-detail-grid">
                  <div>
                    <div className="scene-detail-label">Purpose</div>
                    <div>Plot Point 1</div>
                  </div>
                  <div>
                    <div className="scene-detail-label">Conflict</div>
                    <div>Internal: Duty vs. Truth</div>
                    <div>External: Council’s oppression</div>
                  </div>
                  <div>
                    <div className="scene-detail-label">Characters</div>
                    <div className="scene-detail-chips">
                      {activeCharacters.slice(0, 3).map((character) => (
                        <span key={character.id}>{character.name}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="scene-detail-label">Timeline</div>
                    <div>Day 5 of Month 3</div>
                  </div>
                </div>

                <div className="scene-detail-footer">
                  <span>Est. runtime: 3m 12s</span>
                  <span>Story Arc: Inciting Incident</span>
                  <span>Completion: In Progress</span>
                </div>
              </Card>
            </div>
          </div>

          <AIAssistantPanel
            storyId={storyId}
            currentActId={activeActItem?.id}
            currentSceneId={activeChapter?.id}
            sceneContent={activeChapter?.content ?? ''}
            currentSelection={activeSelection}
            onApplySceneContent={handleApplyAiSceneContent}
            onUndoLastAiEdit={handleUndoLastAiEdit}
            canUndoAiEdit={aiEditHistory.some((entry) => entry.chapterId === activeChapter?.id)}
            scenes={sceneContextItems}
            characters={characterContextItems}
            locations={locationContextItems}
          />
        </div>
      </main>

      {/* FLOATING FOOTER */}
      {isMobile && <BottomNavigation activeTab="write" />}

      {/* Toast Notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />

      {/* Delete Chapter Confirmation */}
      <ConfirmationToast
        show={showDeleteChapterConfirm}
        title="Delete this chapter?"
        message="This will permanently remove this chapter and all its content. This cannot be undone."
        onConfirm={confirmDeleteChapter}
        onCancel={cancelDeleteChapter}
        confirmText="OK"
        cancelText="Cancel"
      />

      {/* Delete Act Confirmation */}
      <ConfirmationToast
        show={showDeleteActConfirm}
        title="Delete this act?"
        message={actDeleteMessage}
        onConfirm={confirmDeleteAct}
        onCancel={cancelDeleteAct}
        confirmText="OK"
        cancelText="Cancel"
      />
    </div>
  );
}