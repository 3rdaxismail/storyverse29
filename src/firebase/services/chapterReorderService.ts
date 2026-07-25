/**
 * Chapter Reorder Service
 * Handles chapter movement operations across acts with Firestore batch updates
 */
import { 
  doc, 
  writeBatch, 
  updateDoc,
  Timestamp,
  getDocs,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config';

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

export interface Act {
  actId: string;
  actTitle: string;
  actOrder: number;
}

export interface ReorderResult {
  success: boolean;
  updatedChapters: Array<{ id: string; order: number; actId: string }>;
}

/**
 * Move chapter up within act or to previous act
 */
export async function moveChapterUp(
  storyId: string,
  chapterId: string,
  currentActId: string,
  currentOrder: number,
  allActs: Act[],
  allChapters: Chapter[]
): Promise<ReorderResult> {
  const batch = writeBatch(db);
  const updatedChapters: ReorderResult['updatedChapters'] = [];

  // Get chapters in current act, sorted by order
  const currentActChapters = allChapters
    .filter(ch => ch.actId === currentActId)
    .sort((a, b) => a.chapterOrder - b.chapterOrder);

  const currentIndex = currentActChapters.findIndex(ch => ch.chapterId === chapterId);

  if (currentIndex > 0) {
    // Case 1: Not first in act - swap with previous chapter in same act
    const previousChapter = currentActChapters[currentIndex - 1];
    
    const currentChapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    const previousChapterRef = doc(db, 'stories', storyId, 'chapters', previousChapter.chapterId);

    batch.update(currentChapterRef, {
      chapterOrder: previousChapter.chapterOrder,
      lastEditedAt: Date.now()
    });

    batch.update(previousChapterRef, {
      chapterOrder: currentOrder,
      lastEditedAt: Date.now()
    });

    updatedChapters.push(
      { id: chapterId, order: previousChapter.chapterOrder, actId: currentActId },
      { id: previousChapter.chapterId, order: currentOrder, actId: currentActId }
    );
  } else if (currentIndex === 0) {
    // Case 2: First in act - move to previous act if it exists
    const currentActIndex = allActs.findIndex(a => a.actId === currentActId);
    
    if (currentActIndex > 0) {
      const previousAct = allActs[currentActIndex - 1];
      const previousActChapters = allChapters
        .filter(ch => ch.actId === previousAct.actId)
        .sort((a, b) => a.chapterOrder - b.chapterOrder);
      
      const lastOrderInPreviousAct = previousActChapters.length > 0
        ? Math.max(...previousActChapters.map(ch => ch.chapterOrder))
        : 0;

      const currentChapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
      
      batch.update(currentChapterRef, {
        actId: previousAct.actId,
        chapterOrder: lastOrderInPreviousAct + 1,
        lastEditedAt: Date.now()
      });

      updatedChapters.push({
        id: chapterId,
        order: lastOrderInPreviousAct + 1,
        actId: previousAct.actId
      });
    }
  }

  if (updatedChapters.length > 0) {
    await batch.commit();
    return { success: true, updatedChapters };
  }

  return { success: false, updatedChapters: [] };
}

/**
 * Move chapter down within act or to next act
 */
export async function moveChapterDown(
  storyId: string,
  chapterId: string,
  currentActId: string,
  currentOrder: number,
  allActs: Act[],
  allChapters: Chapter[]
): Promise<ReorderResult> {
  const batch = writeBatch(db);
  const updatedChapters: ReorderResult['updatedChapters'] = [];

  // Get chapters in current act, sorted by order
  const currentActChapters = allChapters
    .filter(ch => ch.actId === currentActId)
    .sort((a, b) => a.chapterOrder - b.chapterOrder);

  const currentIndex = currentActChapters.findIndex(ch => ch.chapterId === chapterId);

  if (currentIndex < currentActChapters.length - 1) {
    // Case 1: Not last in act - swap with next chapter in same act
    const nextChapter = currentActChapters[currentIndex + 1];
    
    const currentChapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    const nextChapterRef = doc(db, 'stories', storyId, 'chapters', nextChapter.chapterId);

    batch.update(currentChapterRef, {
      chapterOrder: nextChapter.chapterOrder,
      lastEditedAt: Date.now()
    });

    batch.update(nextChapterRef, {
      chapterOrder: currentOrder,
      lastEditedAt: Date.now()
    });

    updatedChapters.push(
      { id: chapterId, order: nextChapter.chapterOrder, actId: currentActId },
      { id: nextChapter.chapterId, order: currentOrder, actId: currentActId }
    );
  } else if (currentIndex === currentActChapters.length - 1) {
    // Case 2: Last in act - move to next act if it exists
    const currentActIndex = allActs.findIndex(a => a.actId === currentActId);
    
    if (currentActIndex < allActs.length - 1) {
      const nextAct = allActs[currentActIndex + 1];
      const nextActChapters = allChapters
        .filter(ch => ch.actId === nextAct.actId)
        .sort((a, b) => a.chapterOrder - b.chapterOrder);

      // Insert at beginning of next act
      const currentChapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
      
      // If next act has chapters, we need to increment all their orders
      if (nextActChapters.length > 0) {
        // Increment all chapters in next act
        nextActChapters.forEach(ch => {
          const chapterRef = doc(db, 'stories', storyId, 'chapters', ch.chapterId);
          batch.update(chapterRef, {
            chapterOrder: ch.chapterOrder + 1,
            lastEditedAt: Date.now()
          });
          updatedChapters.push({
            id: ch.chapterId,
            order: ch.chapterOrder + 1,
            actId: nextAct.actId
          });
        });
      }

      // Add moved chapter at position 0
      batch.update(currentChapterRef, {
        actId: nextAct.actId,
        chapterOrder: 0,
        lastEditedAt: Date.now()
      });

      updatedChapters.push({
        id: chapterId,
        order: 0,
        actId: nextAct.actId
      });
    }
  }

  if (updatedChapters.length > 0) {
    await batch.commit();
    return { success: true, updatedChapters };
  }

  return { success: false, updatedChapters: [] };
}

/**
 * Determine if chapter can move up
 */
export function canMoveUp(
  chapterId: string,
  currentActId: string,
  allActs: Act[],
  allChapters: Chapter[]
): boolean {
  const currentActIndex = allActs.findIndex(a => a.actId === currentActId);
  
  // If first act and first chapter in act, can't move up
  if (currentActIndex === 0) {
    const firstActChapters = allChapters
      .filter(ch => ch.actId === currentActId)
      .sort((a, b) => a.chapterOrder - b.chapterOrder);
    
    return firstActChapters[0]?.chapterId !== chapterId ? true : false;
  }
  
  return true;
}

/**
 * Determine if chapter can move down
 */
export function canMoveDown(
  chapterId: string,
  currentActId: string,
  allActs: Act[],
  allChapters: Chapter[]
): boolean {
  const currentActIndex = allActs.findIndex(a => a.actId === currentActId);
  const lastActIndex = allActs.length - 1;
  
  // If last act and last chapter in act, can't move down
  if (currentActIndex === lastActIndex) {
    const lastActChapters = allChapters
      .filter(ch => ch.actId === currentActId)
      .sort((a, b) => a.chapterOrder - b.chapterOrder);
    
    return lastActChapters[lastActChapters.length - 1]?.chapterId !== chapterId ? true : false;
  }
  
  return true;
}
