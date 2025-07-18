import { GoogleGenAI } from "@google/genai";
import { ChatMessage, GeminiMessage, GeminiResponse } from "../types/chat";

// Gemini Configuration
const GEMINI_CONFIG = {
  model: "gemini-2.5-flash",
  temperature: 0.7,
  systemInstruction: `You are an expert Ayurvedic wellness assistant with deep knowledge of traditional Indian medicine, herbs, nutrition, yoga, and holistic health practices. 

Your role is to:
- Provide personalized wellness advice based on Ayurvedic principles
- Recommend natural remedies, herbs, and lifestyle changes
- Suggest yoga poses, breathing exercises, and meditation techniques
- Offer guidance on nutrition and diet according to Ayurvedic doshas
- Help users understand their constitution (Vata, Pitta, Kapha)
- Provide holistic solutions for common health concerns

Always:
- Give practical, actionable advice
- Explain the reasoning behind your recommendations
- Emphasize the importance of consulting healthcare professionals for serious conditions
- Be warm, supportive, and encouraging
- Keep responses concise but informative

Remember: You are not a replacement for medical care, but a guide for natural wellness and prevention.`,
};

class GeminiService {
  private ai: GoogleGenAI;
  private chatHistory: GeminiMessage[] = [];

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file");
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  // Convert app messages to Gemini format
  private convertToGeminiHistory(messages: ChatMessage[]): GeminiMessage[] {
    return messages
      .filter(msg => msg.text.trim() !== "") // Filter out empty messages
      .map(msg => ({
        role: msg.isUser ? 'user' as const : 'model' as const,
        parts: [{ text: msg.text }],
      }));
  }

  // Send message and get response
  async sendMessage(userMessage: string, conversationHistory: ChatMessage[]): Promise<GeminiResponse> {
    try {
      // Convert conversation history to Gemini format
      const history = this.convertToGeminiHistory(conversationHistory);

      // Create chat with history
      const chat = this.ai.chats.create({
        model: GEMINI_CONFIG.model,
        history: history,
        config: {
          systemInstruction: GEMINI_CONFIG.systemInstruction,
          temperature: GEMINI_CONFIG.temperature,
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster responses
          },
        },
      });

      // Send message
      const response = await chat.sendMessage({
        message: userMessage,
      });

      return {
        text: response.text || "I apologize, but I couldn't generate a response. Please try again.",
      };

    } catch (error) {
      console.error("Gemini API Error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          return {
            text: "There seems to be an issue with the API configuration. Please check your settings.",
            error: "API_KEY_ERROR",
          };
        }

        if (error.message.includes("quota") || error.message.includes("limit")) {
          return {
            text: "I'm experiencing high demand right now. Please try again in a moment.",
            error: "QUOTA_EXCEEDED",
          };
        }

        if (error.message.includes("network") || error.message.includes("fetch")) {
          return {
            text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
            error: "NETWORK_ERROR",
          };
        }
      }

      // Generic error fallback
      return {
        text: "I'm experiencing some technical difficulties. Please try again, and if the problem persists, try restarting the app.",
        error: "UNKNOWN_ERROR",
      };
    }
  }

  // Send message with streaming response
  async sendMessageStream(
    userMessage: string,
    conversationHistory: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<GeminiResponse> {
    try {
      // Convert conversation history to Gemini format
      const history = this.convertToGeminiHistory(conversationHistory);

      // Create chat with history
      const chat = this.ai.chats.create({
        model: GEMINI_CONFIG.model,
        history: history,
        config: {
          systemInstruction: GEMINI_CONFIG.systemInstruction,
          temperature: GEMINI_CONFIG.temperature,
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster responses
          },
        },
      });

      // Send message with streaming
      const stream = await chat.sendMessageStream({
        message: userMessage,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const chunkText = chunk.text || "";
        fullResponse += chunkText;
        onChunk(chunkText);
      }

      return {
        text: fullResponse || "I apologize, but I couldn't generate a response. Please try again.",
      };

    } catch (error) {
      console.error("Gemini Streaming Error:", error);

      // Use same error handling as regular sendMessage
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          return {
            text: "There seems to be an issue with the API configuration. Please check your settings.",
            error: "API_KEY_ERROR",
          };
        }

        if (error.message.includes("quota") || error.message.includes("limit")) {
          return {
            text: "I'm experiencing high demand right now. Please try again in a moment.",
            error: "QUOTA_EXCEEDED",
          };
        }

        if (error.message.includes("network") || error.message.includes("fetch")) {
          return {
            text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
            error: "NETWORK_ERROR",
          };
        }
      }

      return {
        text: "I'm experiencing some technical difficulties. Please try again, and if the problem persists, try restarting the app.",
        error: "UNKNOWN_ERROR",
      };
    }
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.ai.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: "Hello",
        config: {
          temperature: 0.1,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      return !!response.text;
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();