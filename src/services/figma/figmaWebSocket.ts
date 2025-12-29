/**
 * Figma WebSocket Client
 * Communicates with cursor-talk-to-figma-socket server (port 3060)
 */

interface FigmaWebSocketMessage {
  type: 'request' | 'response' | 'error';
  action: string;
  payload?: any;
  error?: string;
}

class FigmaWebSocketClient {
  private ws: WebSocket | null = null;
  private url = 'ws://localhost:3060';
  private messageCallbacks = new Map<string, (data: any) => void>();
  private messageId = 0;

  /**
   * Connect to the Figma WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ Connected to Figma WebSocket server');
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message: FigmaWebSocketMessage = JSON.parse(event.data);
          console.log('📨 Figma WebSocket message:', message);

          // Route to callback if exists
          if (this.messageCallbacks.has(message.action)) {
            this.messageCallbacks.get(message.action)?.(message.payload);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 Disconnected from Figma WebSocket server');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to the Figma WebSocket server
   */
  async send(action: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const messageId = `${action}-${++this.messageId}`;

      // Set up callback to receive response
      const callback = (data: any) => {
        this.messageCallbacks.delete(messageId);
        resolve(data);
      };

      this.messageCallbacks.set(messageId, callback);

      // Send message
      const message: FigmaWebSocketMessage = {
        type: 'request',
        action,
        payload,
      };

      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        this.messageCallbacks.delete(messageId);
        reject(error);
      }

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.messageCallbacks.has(messageId)) {
          this.messageCallbacks.delete(messageId);
          reject(new Error(`Request timeout: ${action}`));
        }
      }, 30000);
    });
  }

  /**
   * Get file information from Figma
   */
  async getFileInfo(fileId: string): Promise<any> {
    return this.send('getFileInfo', { fileId });
  }

  /**
   * Get page data from Figma
   */
  async getPage(fileId: string, pageId: string): Promise<any> {
    return this.send('getPage', { fileId, pageId });
  }

  /**
   * Get component information from Figma
   */
  async getComponent(fileId: string, componentId: string): Promise<any> {
    return this.send('getComponent', { fileId, componentId });
  }

  /**
   * List all files accessible to the token
   */
  async listFiles(): Promise<any> {
    return this.send('listFiles');
  }

  /**
   * Get images from Figma file
   */
  async getImages(fileId: string): Promise<any> {
    return this.send('getImages', { fileId });
  }

  /**
   * Export a component to image
   */
  async exportComponent(fileId: string, componentId: string, format: 'png' | 'svg' = 'svg'): Promise<string> {
    return this.send('exportComponent', { fileId, componentId, format });
  }
}

// Export singleton instance
export const figmaClient = new FigmaWebSocketClient();
