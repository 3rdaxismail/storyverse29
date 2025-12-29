import React, { useEffect, useState } from 'react';
import { useFigma } from '../../hooks/useFigma';
import styles from './FigmaViewer.module.css';

interface FigmaFile {
  key: string;
  name: string;
  lastModified?: string;
}

interface FigmaViewerProps {
  fileId?: string;
}

/**
 * Component to view and interact with Figma content via WebSocket
 */
export const FigmaViewer: React.FC<FigmaViewerProps> = ({ fileId }) => {
  const { isConnected, isLoading, error, getFileInfo, listFiles, getImages } = useFigma();
  const [files, setFiles] = useState<FigmaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load files when connected
  useEffect(() => {
    if (!isConnected) return;

    const loadFiles = async () => {
      try {
        const filesList = await listFiles();
        setFiles(filesList || []);
        setFetchError(null);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load files');
      }
    };

    loadFiles();
  }, [isConnected, listFiles]);

  // Fetch file info when file is selected
  useEffect(() => {
    if (!selectedFile?.key) return;

    const loadFileInfo = async () => {
      try {
        const info = await getFileInfo(selectedFile.key);
        setFileInfo(info);
        
        // Also fetch images
        const imageList = await getImages(selectedFile.key);
        setImages(imageList || []);
        
        setFetchError(null);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load file info');
      }
    };

    loadFileInfo();
  }, [selectedFile, getFileInfo, getImages]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Figma Content Viewer</h1>

      {/* Connection Status */}
      <div className={styles.statusBar}>
        <span className={isConnected ? styles.connected : styles.disconnected}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        {isLoading && <span className={styles.loading}>⏳ Loading...</span>}
      </div>

      {error && <div className={styles.error}>Error: {error.message}</div>}
      {fetchError && <div className={styles.error}>Error: {fetchError}</div>}

      {/* Files List */}
      {isConnected && files.length > 0 && (
        <div className={styles.section}>
          <h2>Available Files</h2>
          <div className={styles.filesList}>
            {files.map((file) => (
              <button
                key={file.key}
                className={`${styles.fileItem} ${selectedFile?.key === file.key ? styles.active : ''}`}
                onClick={() => setSelectedFile(file)}
              >
                <span className={styles.fileName}>{file.name}</span>
                {file.lastModified && <span className={styles.lastModified}>{file.lastModified}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Info */}
      {fileInfo && (
        <div className={styles.section}>
          <h2>File Information</h2>
          <div className={styles.fileInfo}>
            <p>
              <strong>Name:</strong> {fileInfo.name}
            </p>
            <p>
              <strong>Version:</strong> {fileInfo.version}
            </p>
            <p>
              <strong>Pages:</strong> {fileInfo.pages?.length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Images Preview */}
      {images.length > 0 && (
        <div className={styles.section}>
          <h2>Images in File ({images.length})</h2>
          <div className={styles.imagesGrid}>
            {images.map((image, index) => (
              <div key={index} className={styles.imageCard}>
                <img src={image.url} alt={image.name} className={styles.imagePreview} />
                <p className={styles.imageName}>{image.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No files message */}
      {isConnected && files.length === 0 && (
        <div className={styles.emptyState}>
          <p>No Figma files found. Make sure your Figma token is configured.</p>
        </div>
      )}
    </div>
  );
};

export default FigmaViewer;
