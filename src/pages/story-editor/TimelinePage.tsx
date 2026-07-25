import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../firebase/AuthContext';
import { getOrCreateTimeline, updateTimelineNode } from '../../firebase/services/timelineService';
import type { TimelineNode, StoryTimeline } from '../../firebase/services/timelineService';
import TimelineGraph from '../../components/timeline/TimelineGraph';
import TimelineNodeCard from '../../components/timeline/TimelineNodeCard';
import ChapterTextViewer from '../../components/timeline/ChapterTextViewer';
import { useTensionAnalysis } from '../../hooks/useTensionAnalysis';
import styles from './TimelinePage.module.css';

interface Chapter {
  id: string;
  title: string;
  content?: string;
  order?: number;
  actId?: string;
  tension?: number;
}

interface Story {
  id: string;
  title: string;
  uid: string;
  acts?: any[];
  chapters?: Chapter[];
}

/**
 * Generate default timeline nodes from chapters
 * Distributes chapters evenly across time with tension curve
 */
function generateDefaultNodes(chapters: Chapter[]): TimelineNode[] {
  console.log('[TimelinePage] 🔧 Generating default nodes for', chapters.length, 'chapters');
  
  if (chapters.length === 0) {
    console.log('[TimelinePage] ℹ️ No chapters to generate nodes for');
    return [];
  }

  const nodes = chapters.map((chapter, index) => {
    const totalChapters = chapters.length;
    // Even distribution across time (0 to 1)
    const x = totalChapters > 1 ? index / (totalChapters - 1) : 0.5;
    // Tension curve: starts at 0.2, rises smoothly to 1.0
    const y = 0.2 + x * 0.8;

    return {
      chapterId: chapter.id,
      x,
      y,
    };
  });

  console.log('[TimelinePage] ✅ Generated', nodes.length, 'default nodes');
  return nodes;
}

const TimelinePage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [acts, setActs] = useState<any[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [timeline, setTimeline] = useState<StoryTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAnalyzing, progress, error: analysisError, analyze: performAnalysis } = useTensionAnalysis();

  useEffect(() => {
    const loadData = async () => {
      console.log('[TimelinePage] 🚀 Loading data', { storyId, userId: user?.uid });

      // Step 1: Validate storyId
      if (!storyId) {
        console.error('[TimelinePage] ❌ Missing storyId from route params');
        setError('Story ID not found in URL');
        setLoading(false);
        return;
      }

      // Step 2: Validate user authentication
      if (!user) {
        console.error('[TimelinePage] ❌ User not authenticated');
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        // Step 3: LOAD STORY (PRIMARY)
        console.log('[TimelinePage] 📖 Step 1: Loading story document:', storyId);
        const storyRef = doc(db, 'stories', storyId);
        const storySnap = await getDoc(storyRef);

        // Step 4: Validate story exists
        if (!storySnap.exists()) {
          console.error('[TimelinePage] ❌ Story document not found:', storyId);
          setError('Story not found');
          setLoading(false);
          return;
        }

        // Step 5: Parse story data
        const storyData = storySnap.data() as any;
        const normalizedStory: Story = {
          id: storyId,
          uid: storyData.uid,
          title: storyData.storyTitle || storyData.title || 'Untitled Story',
          acts: storyData.acts || [],
          chapters: storyData.chapters || [],
        };
        console.log('[TimelinePage] ✅ Story loaded:', { 
          id: storyId, 
          title: normalizedStory.title, 
          uid: normalizedStory.uid 
        });

        // Step 6: Set ownership
        const isStoryOwner = normalizedStory.uid === user.uid;
        setStory(normalizedStory);
        setIsOwner(isStoryOwner);
        console.log('[TimelinePage] 🔐 Owner check:', { 
          isOwner: isStoryOwner, 
          storyOwnerId: normalizedStory.uid, 
          currentUserId: user.uid 
        });

        // Step 7: Load acts and chapters using the same method as Story Editor
        console.log('[TimelinePage] 📚 Loading acts and chapters from Firestore');
        const { loadActsAndChapters } = await import('../../firebase/services/storiesService');
        const { acts: loadedActs, chapters: loadedChapters } = await loadActsAndChapters(storyId);
        
        console.log('[TimelinePage] 📊 Loaded acts and chapters:', { 
          actCount: loadedActs.length, 
          chapterCount: loadedChapters.length 
        });
        console.log('[TimelinePage] 📋 Act structure with chapter counts:');
        loadedActs.forEach(act => {
          const chaptersInAct = loadedChapters.filter(ch => ch.actId === act.actId);
          console.log(`  Act "${act.actTitle}" (${act.actId}): ${chaptersInAct.length} chapters`);
        });
        
        console.log('[TimelinePage] 📖 Raw loaded chapters (ALL):');
        loadedChapters.forEach((ch, idx) => {
          console.log(`  ${idx + 1}. "${ch.chapterTitle}" - actId: ${ch.actId}, order: ${ch.chapterOrder}`);
        });

        // Step 8: Flatten and sort chapters from acts (preserving order by act, then by order within act)
        const allChapters: Chapter[] = loadedChapters
          .sort((a, b) => {
            // First sort by actId to group by act
            const actOrder = a.actId.localeCompare(b.actId);
            if (actOrder !== 0) return actOrder;
            // Then sort by chapter order within the act
            return a.chapterOrder - b.chapterOrder;
          })
          .map((ch: any) => ({
            id: ch.chapterId,
            title: (ch.chapterTitle || 'Untitled Chapter').trim(),
            content: ch.content || '',
            order: ch.chapterOrder,
            actId: ch.actId,
            tension: ch.tension || 0,
          }));

        // Calculate chapters per act for proper timeline visualization
        const chaptersPerAct = loadedActs.map(act => ({
          actId: act.actId,
          actTitle: act.actTitle,
          count: allChapters.filter(ch => ch.actId === act.actId).length
        }));
        
        console.log('[TimelinePage] ✅ Chapters sorted and flattened:', { 
          totalChapters: allChapters.length,
          chaptersPerAct: chaptersPerAct.map(a => `${a.actTitle}: ${a.count} chapters`),
          chapters: allChapters.map(ch => ({ id: ch.id, title: ch.title, actId: ch.actId, order: ch.order }))
        });

        // Store acts and chapters in state for rendering
        setActs(loadedActs);
        setChapters(allChapters);

        // Step 9: LOAD CHAPTER CONTENT from subcollection
        console.log('[TimelinePage] 📝 Step 3: Loading chapter content from subcollection');
        try {
          const { loadChapterContent } = await import('../../firebase/services/storiesService');
          const chaptersWithContent = await Promise.all(
            allChapters.map(async (ch) => {
              try {
                const content = await loadChapterContent(storyId, ch.id);
                return {
                  ...ch,
                  content: content?.text || '',
                };
              } catch (err) {
                console.warn(`[TimelinePage] ⚠️ Could not load content for chapter ${ch.id}:`, err);
                return ch;
              }
            })
          );
          console.log('[TimelinePage] ✅ Chapter content loaded');
          setChapters(chaptersWithContent);
        } catch (contentErr) {
          console.warn('[TimelinePage] ⚠️ Could not load chapter content:', contentErr);
          // Continue without content - it's not fatal
        }

        // Step 8: LOAD TIMELINE (SECONDARY)
        console.log('[TimelinePage] 📊 Step 2: Loading or generating timeline');
        let timelineData: StoryTimeline;

        try {
          // Try to fetch existing timeline
          const timelineRef = doc(db, 'storyTimelines', storyId);
          const timelineSnap = await getDoc(timelineRef);

          if (timelineSnap.exists()) {
            // Timeline exists - use it
            console.log('[TimelinePage] ✅ Existing timeline found');
            timelineData = timelineSnap.data() as StoryTimeline;
          } else {
            // Timeline doesn't exist - generate default positions
            console.log('[TimelinePage] 📝 Timeline not found, generating default positions');
            const defaultNodes: TimelineNode[] = generateDefaultNodes(allChapters);
            
            timelineData = {
              storyId,
              userId: storyData.userId,
              nodes: defaultNodes,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Optionally save generated timeline to Firestore for future use
            try {
              console.log('[TimelinePage] 💾 Saving generated timeline to Firestore');
              const { setDoc, Timestamp } = await import('firebase/firestore');
              await setDoc(timelineRef, {
                ...timelineData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              });
              console.log('[TimelinePage] ✅ Generated timeline saved');
            } catch (saveErr) {
              console.warn('[TimelinePage] ⚠️ Could not save generated timeline:', saveErr);
              // This is not fatal - we can still display the timeline
            }
          }
        } catch (timelineErr) {
          // Final fallback - generate timeline in memory if anything goes wrong
          console.warn('[TimelinePage] ⚠️ Timeline load failed, using fallback:', timelineErr);
          const defaultNodes: TimelineNode[] = generateDefaultNodes(allChapters);
          
          timelineData = {
            storyId,
            userId: storyData.userId,
            nodes: defaultNodes,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        console.log('[TimelinePage] ✅ Timeline ready:', { nodeCount: timelineData.nodes.length });
        setTimeline(timelineData);
      } catch (err) {
        console.error('[TimelinePage] ❌ Unexpected error during load:', err);
        setError('Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [storyId, user]);

  const handleNodePositionChange = async (chapterId: string, x: number, y: number) => {
    console.log('[TimelinePage] 📍 Node position changed:', { chapterId, x, y, isOwner });

    if (!isOwner || !storyId) {
      console.warn('[TimelinePage] ⚠️ Cannot update position - not owner or missing storyId');
      return;
    }

    // Update local state immediately for responsiveness
    if (timeline) {
      const updatedNodes = timeline.nodes.map((node) =>
        node.chapterId === chapterId ? { ...node, x, y } : node
      );
      setTimeline({ ...timeline, nodes: updatedNodes });
    }

    // Debounce Firebase update
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log('[TimelinePage] 💾 Saving node position to Firestore:', { chapterId, x, y });
        await updateTimelineNode(storyId, chapterId, x, y);
        console.log('[TimelinePage] ✅ Node position saved');
      } catch (err) {
        console.error('[TimelinePage] ❌ Error updating timeline position:', err);
        // Could add error toast here
      }
    }, 500);
  };

  const handleAnalyzeStory = async () => {
    if (!isOwner || !storyId) {
      console.warn('[TimelinePage] ⚠️ Cannot analyze - not owner or missing storyId');
      return;
    }

    try {
      console.log('[TimelinePage] 🔍 Starting tension analysis...');
      const results = await performAnalysis(storyId, acts, chapters);
      console.log('[TimelinePage] ✅ Analysis complete:', { chaptersAnalyzed: results.length });
      
      // Refresh chapters with updated tension scores
      const { loadActsAndChapters } = await import('../../firebase/services/storiesService');
      const { chapters: updatedChapters } = await loadActsAndChapters(storyId);
      
      // Update state with new chapters (which now have auto tension)
      const flattenedChapters = updatedChapters.map((ch: any) => ({
        id: ch.chapterId,
        title: (ch.chapterTitle || 'Untitled Chapter').trim(),
        content: ch.content || '',
        order: ch.chapterOrder,
        actId: ch.actId,
        tension: ch.tensionAuto || ch.tension || 0,
      }));
      
      setChapters(flattenedChapters);
      
      // Update timeline nodes with new tension values
      if (timeline) {
        const updatedNodes = timeline.nodes.map(node => {
          const chapter = flattenedChapters.find(ch => ch.id === node.chapterId);
          return {
            ...node,
            y: (chapter?.tension || 0) / 100,
          };
        });
        setTimeline({ ...timeline, nodes: updatedNodes });
      }
    } catch (err) {
      console.error('[TimelinePage] ❌ Analysis failed:', err);
    }
  };

  const handleTensionChange = async (chapterId: string, tension: number) => {
    console.log('[TimelinePage] 🔥 Tension changed:', { chapterId, tension, isOwner });

    if (!isOwner || !storyId) {
      console.warn('[TimelinePage] ⚠️ Cannot update tension - not owner or missing storyId');
      return;
    }

    // Update chapter tension in Firestore
    try {
      const { updateChapterTension } = await import('../../firebase/services/storiesService');
      
      // Find the chapter to get its actId
      const chapter = chapters.find(ch => ch.id === chapterId);
      if (!chapter || !chapter.actId) {
        console.error('[TimelinePage] ❌ Chapter or actId not found');
        return;
      }

      console.log('[TimelinePage] 💾 Saving chapter tension:', { chapterId, tension });
      await updateChapterTension(storyId, chapter.actId, chapterId, tension);
      console.log('[TimelinePage] ✅ Chapter tension saved');

      // Calculate new Y coordinate based on tension (0-100 maps to 0-1)
      const newY = tension / 100;
      
      // Update local chapter data to reflect new tension
      setChapters(prevChapters =>
        prevChapters.map(ch =>
          ch.id === chapterId ? { ...ch, tension: tension } : ch
        )
      );

      // Update timeline node Y coordinate to move the dot up/down
      if (timeline) {
        const timelineNode = timeline.nodes.find(n => n.chapterId === chapterId);
        const currentX = timelineNode?.x ?? 0;
        
        const updatedNodes = timeline.nodes.map(node =>
          node.chapterId === chapterId ? { ...node, y: newY } : node
        );
        setTimeline({ ...timeline, nodes: updatedNodes });
        
        // Save updated timeline node position to Firestore
        try {
          console.log('[TimelinePage] 💾 Updating timeline Y position for tension:', { chapterId, newY });
          await updateTimelineNode(storyId, chapterId, currentX, newY);
          console.log('[TimelinePage] ✅ Timeline Y position updated');
        } catch (timelineErr) {
          console.warn('[TimelinePage] ⚠️ Could not save timeline position:', timelineErr);
        }
      }
    } catch (err) {
      console.error('[TimelinePage] ❌ Error updating chapter tension:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={() => navigate('/home')} className={styles.backButton}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Story not found</p>
          <button onClick={() => navigate('/home')} className={styles.backButton}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button
            className={styles.backButton}
            onClick={() => navigate(`/editor/story/${storyId}`)}
            title="Back to Editor"
          >
            ← Back
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{story.title}</h1>
            <p className={styles.subtitle}>Timeline View (Experimental)</p>
          </div>
          <div className={styles.headerActions}>
            {isOwner && (
              <button
                id="analyze-btn"
                className={styles.analyzeButton}
                onClick={handleAnalyzeStory}
                disabled={isAnalyzing}
                title="Run AI analysis on all chapters to auto-generate tension scores"
              >
                {isAnalyzing ? '⚡ Analyzing...' : '🤖 Analyze Story'}
              </button>
            )}
            {!isOwner && <p className={styles.readOnlyBadge}>Read-Only</p>}
          </div>
        </div>
        
        {/* Analysis Progress */}
        {isAnalyzing && progress && (
          <div className={styles.analysisProgress}>
            <p>
              Analyzing Chapter {progress.current} of {progress.total}
              {progress.chapterTitle && `: ${progress.chapterTitle}`}
            </p>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {analysisError && (
          <div className={styles.analysisError}>
            ⚠️ Analysis error: {analysisError}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {!timeline ? (
          <div className={styles.emptyState}>
            <p>Preparing timeline...</p>
          </div>
        ) : timeline.nodes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No chapters yet. Create chapters in the story editor to visualize the timeline.</p>
          </div>
        ) : (
          <>
            {/* Timeline Graph Section */}
            <div className={styles.graphContainer}>
              <TimelineGraph
                nodes={timeline.nodes}
                chapters={chapters}
                acts={acts}
                onNodePositionChange={handleNodePositionChange}
                onTensionChange={handleTensionChange}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                isOwner={isOwner}
              />
            </div>

            {/* Chapter Text Viewer Section */}
            <div className={styles.textViewerContainer}>
              <ChapterTextViewer
                chapter={selectedNodeId ? chapters.find(ch => ch.id === selectedNodeId) || null : null}
                storyTitle={story.title}
              />
            </div>
          </>
        )}
      </main>

      {/* Node Details Panel (if a node is selected) */}
      {selectedNodeId && timeline && (
        <aside className={styles.detailsPanel}>
          <TimelineNodeCard
            nodeId={selectedNodeId}
            story={story}
            timeline={timeline}
            chapters={chapters}
            isOwner={isOwner}
            onClose={() => setSelectedNodeId(null)}
            onTensionChange={handleTensionChange}
          />
        </aside>
      )}
    </div>
  );
};

export default TimelinePage;
