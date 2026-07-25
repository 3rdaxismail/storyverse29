import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  CollectionReference,
  Query,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config';

export interface TimelineNode {
  chapterId: string;
  x: number; // 0 to 1 (time progression)
  y: number; // 0 to 1 (tension level)
}

export interface StoryTimeline {
  storyId: string;
  userId: string;
  nodes: TimelineNode[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * Fetch or generate timeline for a story
 * If timeline doesn't exist, auto-generates default positions
 */
export async function getOrCreateTimeline(
  storyId: string,
  userId: string,
  chapters: Array<{ id: string }> = []
): Promise<StoryTimeline> {
  console.log('[timelineService] 🔍 Getting or creating timeline:', { storyId, chapterCount: chapters.length });
  
  const timelineRef = doc(db, 'storyTimelines', storyId);
  const timelineSnap = await getDoc(timelineRef);

  // Timeline exists - return it
  if (timelineSnap.exists()) {
    const existingTimeline = timelineSnap.data() as StoryTimeline;
    console.log('[timelineService] ✅ Existing timeline found:', { nodeCount: existingTimeline.nodes.length });
    return existingTimeline;
  }

  console.log('[timelineService] 📝 No timeline found, generating default positions');
  // Generate default timeline positions
  const defaultNodes = generateDefaultPositions(chapters);

  const newTimeline: StoryTimeline = {
    storyId,
    userId,
    nodes: defaultNodes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save to Firestore
  console.log('[timelineService] 💾 Saving new timeline to Firestore...');
  await setDoc(timelineRef, {
    ...newTimeline,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  console.log('[timelineService] ✅ New timeline created and saved');
  return newTimeline;
}

/**
 * Generate default timeline positions for chapters
 * Distributes chapters evenly across time, with tension curve
 */
export function generateDefaultPositions(
  chapters: Array<{ id: string }>
): TimelineNode[] {
  if (chapters.length === 0) {
    return [];
  }

  return chapters.map((chapter, index) => {
    const totalChapters = chapters.length;
    // Even distribution across time (0 to 1)
    const x = totalChapters > 1 ? index / (totalChapters - 1) : 0.5;
    // Tension curve: starts low, rises smoothly to high
    const y = 0.2 + x * 0.8; // 0.2 to 1.0

    return {
      chapterId: chapter.id,
      x,
      y,
    };
  });
}

/**
 * Update timeline positions for a story
 * Only updates UI positioning, does NOT modify story structure
 */
export async function updateTimelinePositions(
  storyId: string,
  nodes: TimelineNode[]
): Promise<void> {
  const timelineRef = doc(db, 'storyTimelines', storyId);

  await updateDoc(timelineRef, {
    nodes,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update a single node's position
 */
export async function updateTimelineNode(
  storyId: string,
  chapterId: string,
  x: number,
  y: number
): Promise<void> {
  console.log('[timelineService] 📍 Updating timeline node:', { storyId, chapterId, x, y });
  
  const timelineRef = doc(db, 'storyTimelines', storyId);
  const timelineSnap = await getDoc(timelineRef);

  if (!timelineSnap.exists()) {
    console.error('[timelineService] ❌ Timeline not found:', storyId);
    throw new Error('Timeline not found');
  }

  const timeline = timelineSnap.data() as StoryTimeline;
  const nodeIndex = timeline.nodes.findIndex((n) => n.chapterId === chapterId);

  if (nodeIndex === -1) {
    console.error('[timelineService] ❌ Chapter node not found:', chapterId);
    throw new Error('Chapter node not found in timeline');
  }

  // Constrain values to 0-1 range
  const constrainedX = Math.max(0, Math.min(1, x));
  const constrainedY = Math.max(0, Math.min(1, y));

  console.log('[timelineService] 📝 Updating node at index:', { nodeIndex, constrainedX, constrainedY });

  timeline.nodes[nodeIndex] = {
    chapterId,
    x: constrainedX,
    y: constrainedY,
  };

  await updateDoc(timelineRef, {
    nodes: timeline.nodes,
    updatedAt: Timestamp.now(),
  });

  console.log('[timelineService] ✅ Timeline node updated');
}

/**
 * Check if user owns the timeline
 */
export async function isTimelineOwner(
  storyId: string,
  userId: string
): Promise<boolean> {
  const timelineRef = doc(db, 'storyTimelines', storyId);
  const timelineSnap = await getDoc(timelineRef);

  if (!timelineSnap.exists()) {
    return false;
  }

  const timeline = timelineSnap.data() as StoryTimeline;
  return timeline.userId === userId;
}
