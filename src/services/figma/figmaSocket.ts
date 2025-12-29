/**
 * Figma WebSocket Client - Updated for cursor-talk-to-figma protocol
 * Communicates with cursor-talk-to-figma-socket server (port 3060)
 */

interface WebSocketMessage {
  type: string;
  channel?: string;
  [key: string]: any;
}

class FigmaSocket {
  private ws: WebSocket | null = null;
  private url = 'ws://localhost:3060';
  private isConnected = false;
  private channel: string | null = null;

  /**
   * Connect to the Figma WebSocket server
   */
  async connect(channel: string = 'figma-sync'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ Connected to Figma WebSocket server');
          
          // Join channel
          this.joinChannel(channel);
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log('📨 Message received:', message);
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 Disconnected from server');
          this.isConnected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Join a channel
   */
  private joinChannel(channel: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message: WebSocketMessage = {
      type: 'join',
      channel,
    };

    this.ws.send(JSON.stringify(message));
    this.channel = channel;
    this.isConnected = true;
    console.log(`📍 Joined channel: ${channel}`);
  }

  /**
   * Send a message through the channel
   */
  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: 'message',
      channel: this.channel,
      ...data,
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Request Figma file data
   */
  requestFile(fileId: string): void {
    console.log(`📁 Requesting file: ${fileId}`);
    this.send({
      action: 'getFile',
      fileId,
    });
  }

  /**
   * Request page data
   */
  requestPage(fileId: string, pageId: string): void {
    console.log(`📄 Requesting page: ${pageId}`);
    this.send({
      action: 'getPage',
      fileId,
      pageId,
    });
  }

  /**
   * Request component data
   */
  requestComponent(fileId: string, componentId: string): void {
    console.log(`🧩 Requesting component: ${componentId}`);
    this.send({
      action: 'getComponent',
      fileId,
      componentId,
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
}

export const figmaSocket = new FigmaSocket();
