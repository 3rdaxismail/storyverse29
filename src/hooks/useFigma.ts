import { useEffect, useState, useCallback } from 'react';
import { figmaClient } from '../services/figma/figmaWebSocket';

interface UseFigmaOptions {
  autoConnect?: boolean;
}

interface UseFigmaReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  getFileInfo: (fileId: string) => Promise<any>;
  getPage: (fileId: string, pageId: string) => Promise<any>;
  getComponent: (fileId: string, componentId: string) => Promise<any>;
  listFiles: () => Promise<any>;
  getImages: (fileId: string) => Promise<any>;
  exportComponent: (fileId: string, componentId: string, format?: 'png' | 'svg') => Promise<string>;
  disconnect: () => void;
}

/**
 * React hook to interact with Figma WebSocket client
 */
export function useFigma(options: UseFigmaOptions = {}): UseFigmaReturn {
  const { autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Connect on mount
  useEffect(() => {
    if (!autoConnect) return;

    const connect = async () => {
      try {
        setIsLoading(true);
        await figmaClient.connect();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      figmaClient.disconnect();
      setIsConnected(false);
    };
  }, [autoConnect]);

  // Wrapped methods
  const getFileInfo = useCallback(async (fileId: string) => {
    setIsLoading(true);
    try {
      const data = await figmaClient.getFileInfo(fileId);
      setError(null);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPage = useCallback(async (fileId: string, pageId: string) => {
    setIsLoading(true);
    try {
      const data = await figmaClient.getPage(fileId, pageId);
      setError(null);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getComponent = useCallback(async (fileId: string, componentId: string) => {
    setIsLoading(true);
    try {
      const data = await figmaClient.getComponent(fileId, componentId);
      setError(null);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await figmaClient.listFiles();
      setError(null);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getImages = useCallback(async (fileId: string) => {
    setIsLoading(true);
    try {
      const data = await figmaClient.getImages(fileId);
      setError(null);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportComponent = useCallback(async (fileId: string, componentId: string, format: 'png' | 'svg' = 'svg') => {
    setIsLoading(true);
    try {
      const url = await figmaClient.exportComponent(fileId, componentId, format);
      setError(null);
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    figmaClient.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    getFileInfo,
    getPage,
    getComponent,
    listFiles,
    getImages,
    exportComponent,
    disconnect,
  };
}
