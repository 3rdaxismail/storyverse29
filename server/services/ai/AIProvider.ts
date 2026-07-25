export interface GenerateReplyParams {
  prompt: string;
  contextSummary: string;
  conversationId: string;
}

export interface AIProvider {
  readonly providerName: string;
  readonly modelName: string;
  generateReply(params: GenerateReplyParams): Promise<string>;
}

export class AIProviderError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code = 'PROVIDER_ERROR', status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
