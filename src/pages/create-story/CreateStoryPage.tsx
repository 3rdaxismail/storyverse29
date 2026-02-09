import WritingSurface from '../../components/editor/WritingSurface';
import HeaderBar from '../../components/header/HeaderBar';
import './CreateStoryPage.css';

const CreateStoryPage: React.FC = () => {
  return (
    <div className="page-container">
      {/* HEADER */}
      <HeaderBar />
      
      <div className="page-content">
        <header className="page-header">
          <h1 className="page-title">Create Story</h1>
          <p className="page-subtitle">Start writing your next masterpiece</p>
        </header>

        <main className="editor-section">
          <WritingSurface
            sectionId="create-story-content"
            placeholder="Start writing your story..."
          />
        </main>
      </div>
    </div>
  );
};

export default CreateStoryPage;
