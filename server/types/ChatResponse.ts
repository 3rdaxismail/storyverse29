export interface ChatResponse {
  conversationId: string;
  message: string;
  provider: string;
  model: string;
  streamingSupported: boolean;
}

export interface ChatErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
