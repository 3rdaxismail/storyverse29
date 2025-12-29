import React, { useEffect, useState } from 'react';
import { figmaSocket } from '../../services/figma/figmaSocket';
import styles from './FigmaFileViewer.module.css';

interface FigmaFileViewerProps {
  fileUrl?: string;
  fileName?: string;
}

/**
 * Component to view Figma file through WebSocket
 * URL: https://www.figma.com/design/zuWEY4gNbhwescluD1WZAC/Preview?node-id=23-110&m=dev
 * File ID: zuWEY4gNbhwescluD1WZAC
 */
export const FigmaFileViewer: React.FC<FigmaFileViewerProps> = ({
  fileUrl = 'https://www.figma.com/design/zuWEY4gNbhwescluD1WZAC/Preview?node-id=23-110&m=dev',
  fileName = 'Preview Design',
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Extract file ID from URL
  const extractFileId = (url: string): string => {
    const match = url.match(/design\/([a-zA-Z0-9]+)\//);
    return (match && match[1]) ? match[1] : '';
  };

  const fileId = extractFileId(fileUrl);

  // Initialize WebSocket connection
  useEffect(() => {
    const initConnection = async () => {
      try {
        setIsLoading(true);
        addMessage('🔗 Connecting to Figma WebSocket server...');
        
        await figmaSocket.connect('figma-file-viewer');
        
        setIsConnected(true);
        addMessage('✅ Connected to WebSocket server');
        
        if (fileId) {
          addMessage(`📁 File ID extracted: ${fileId}`);
          // Request file data
          setTimeout(() => {
            figmaSocket.requestFile(fileId);
          }, 500);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Connection failed';
        setError(errorMsg);
        addMessage(`❌ Connection error: ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    };

    initConnection();

    return () => {
      figmaSocket.disconnect();
      setIsConnected(false);
    };
  }, [fileId]);

  const addMessage = (msg: string) => {
    setMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleViewInFigma = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📐 Figma File Viewer</h1>
        <p className={styles.subtitle}>{fileName}</p>
      </div>

      {/* Connection Status */}
      <div className={styles.statusSection}>
        <div className={`${styles.statusBadge} ${isConnected ? styles.connected : styles.disconnected}`}>
          <span className={styles.statusDot}></span>
          {isConnected ? 'Connected to WebSocket' : 'Disconnected'}
        </div>
        {isLoading && <span className={styles.loading}>⏳ Loading...</span>}
      </div>

      {/* File Info */}
      <div className={styles.fileInfo}>
        <div className={styles.infoItem}>
          <span className={styles.label}>File URL:</span>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {fileUrl}
          </a>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>File ID:</span>
          <code className={styles.code}>{fileId || 'Not found'}</code>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Messages Log */}
      <div className={styles.messagesSection}>
        <h2 className={styles.sectionTitle}>Connection Log</h2>
        <div className={styles.messagesList}>
          {messages.map((msg, idx) => (
            <div key={idx} className={styles.message}>
              {msg}
            </div>
          ))}
          {messages.length === 0 && <div className={styles.messageEmpty}>Waiting for messages...</div>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.button} onClick={handleViewInFigma}>
          🔗 Open in Figma
        </button>
        <button
          className={styles.button}
          onClick={() => {
            if (fileId) {
              figmaSocket.requestFile(fileId);
              addMessage('📁 Requesting file data...');
            }
          }}
          disabled={!isConnected || !fileId}
        >
          🔄 Refresh File Data
        </button>
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <h3>How to use:</h3>
        <ol>
          <li>WebSocket connects to port 3060</li>
          <li>File data is requested automatically</li>
          <li>Check the Connection Log above for status</li>
          <li>Click buttons to interact with the Figma file</li>
        </ol>
      </div>
    </div>
  );
};

export default FigmaFileViewer;
