export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error?: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

export interface GeminiStreamChunk {
  text: string;
  isComplete: boolean;
}