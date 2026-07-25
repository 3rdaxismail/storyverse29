import { type Act } from '../../pages/story-editor/StoryEditorPage';

interface ScenesPanelProps {
  acts: Act[];
  activeChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onAddScene: () => void;
}

const SCENE_TAGS = ['Opening', 'Plot Point 1', 'Turning Point', 'Character', 'Plot Point 2', 'Progress', 'Tension', 'Crisis'];

function getWordCount(text: string) {
  const count = text.trim().split(/\s+/).filter(Boolean).length;
  return `${count.toLocaleString()} words`;
}

export default function StoryEditorScenesPanel({
  acts,
  activeChapterId,
  onSelectChapter,
  onAddScene,
}: ScenesPanelProps) {
  return (
    <aside className="story-editor-scenes-panel">
      <div className="sidebar-shell">
        <div className="sidebar-scroll">
          {acts.map((act, actIndex) => {
            const isActiveAct = act.chapters.some((chapter) => chapter.id === activeChapterId);

            if (!isActiveAct) {
              return (
                <button
                  key={act.id}
                  className="sidebar-act-collapsed"
                  onClick={() => act.chapters[0] && onSelectChapter(act.chapters[0].id)}
                >
                  <span>{act.title || `Act ${actIndex + 1}`}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              );
            }

            return (
              <div key={act.id} className="sidebar-act-expanded">
                <div className="sidebar-act-expanded-header">
                  <div className="sidebar-act-title">{act.title || `Act ${actIndex + 1}`}</div>
                  <button className="sidebar-act-add" onClick={onAddScene} aria-label="Add scene">
                    +
                  </button>
                </div>

                <ul className="sidebar-scene-rows">
                  {act.chapters.map((chapter, chapterIndex) => {
                    const hasContent = (chapter.content || '').trim().length > 0;
                    const isSelected = chapter.id === activeChapterId;
                    const isDone = hasContent && chapter.state === 'idle' && chapterIndex === 0;

                    return (
                      <li
                        key={chapter.id}
                        className={isSelected ? 'selected' : undefined}
                        onClick={() => onSelectChapter(chapter.id)}
                      >
                        <div className="scene-row-top">
                          <span className="scene-row-title">
                            {chapterIndex + 1}. {chapter.title || 'Untitled Chapter'}
                          </span>
                          <span className={`scene-row-status ${isDone ? 'done' : hasContent ? 'active' : 'empty'}`} />
                        </div>
                        <div className="scene-row-meta">{SCENE_TAGS[chapterIndex % SCENE_TAGS.length]}</div>
                        <div className="scene-row-words">{getWordCount(chapter.content || '')}</div>
                      </li>
                    );
                  })}
                </ul>

                <button className="sidebar-action-button" onClick={onAddScene}>
                  + Add Scene
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
