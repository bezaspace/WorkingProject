import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Send, Bot, User as UserIcon, Sparkles, Heart, Brain, Leaf, AlertCircle } from 'lucide-react-native';
import { geminiService } from '../../services/geminiService';
import { ChatMessage } from '../../types/chat';

const quickQuestions = [
  "What herbs help with stress?",
  "Best foods for digestion?",
  "How to improve sleep naturally?",
  "Yoga poses for back pain?",
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    text: "Hello! I'm your Ayurvedic wellness assistant powered by AI. I'm here to help you with natural remedies, lifestyle advice, and wellness guidance. How can I assist you today?",
    isUser: false,
    timestamp: new Date(Date.now() - 60000),
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (text = inputText) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setError(null);
    setCurrentStreamingMessage('');

    try {
      // Get conversation history (excluding the message we just added since it will be sent separately)
      const conversationHistory = messages;

      // Use streaming for better UX
      let streamingMessageId = Date.now() + 1;
      let fullResponse = '';

      const response = await geminiService.sendMessageStream(
        text.trim(),
        conversationHistory,
        (chunk: string) => {
          fullResponse += chunk;
          setCurrentStreamingMessage(fullResponse);
        }
      );

      // Create final AI message
      const aiMessage: ChatMessage = {
        id: streamingMessageId,
        text: response.text,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentStreamingMessage('');

      // Handle any errors
      if (response.error) {
        setError(response.error);
        
        // Show user-friendly error alerts for specific cases
        if (response.error === 'API_KEY_ERROR') {
          Alert.alert(
            'Configuration Error',
            'Please check your API key configuration in the .env file.',
            [{ text: 'OK' }]
          );
        } else if (response.error === 'QUOTA_EXCEEDED') {
          Alert.alert(
            'Service Temporarily Unavailable',
            'The AI service is experiencing high demand. Please try again in a few minutes.',
            [{ text: 'OK' }]
          );
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Create error message
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setError('CONNECTION_ERROR');
      
      Alert.alert(
        'Connection Error',
        'Unable to connect to the AI service. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsTyping(false);
      setCurrentStreamingMessage('');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiAvatar}>
            <Bot size={24} color="#FF8C42" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Wellness Assistant</Text>
            <Text style={styles.subtitle}>Powered by Ayurvedic knowledge</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineStatus} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
            ]}>
              {!message.isUser && (
                <View style={styles.aiMessageAvatar}>
                  <Sparkles size={16} color="#FF8C42" />
                </View>
              )}
              
              <View style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}>
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.isUser ? styles.userMessageTime : styles.aiMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              
              {message.isUser && (
                <View style={styles.userMessageAvatar}>
                  <UserIcon size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          ))}
          
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.aiMessageAvatar}>
                <Brain size={16} color="#FF8C42" />
              </View>
              {currentStreamingMessage ? (
                <View style={styles.aiMessage}>
                  <Text style={styles.aiMessageText}>
                    {currentStreamingMessage}
                  </Text>
                  <View style={styles.streamingIndicator}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              ) : (
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              )}
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#FF6B6B" />
              <Text style={styles.errorText}>
                {error === 'API_KEY_ERROR' && 'API configuration issue'}
                {error === 'QUOTA_EXCEEDED' && 'Service temporarily unavailable'}
                {error === 'NETWORK_ERROR' && 'Connection problem'}
                {error === 'CONNECTION_ERROR' && 'Unable to connect'}
                {!['API_KEY_ERROR', 'QUOTA_EXCEEDED', 'NETWORK_ERROR', 'CONNECTION_ERROR'].includes(error) && 'Something went wrong'}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about wellness, herbs, or lifestyle..."
              placeholderTextColor="#666666"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={!inputText.trim() ? "#666666" : "#FFFFFF"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#111111',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A1A0F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF8C42',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A1A0F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FF8C42',
  },
  userMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#FF8C42',
    borderBottomRightRadius: 6,
  },
  aiMessage: {
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  userMessageTime: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: '#CCCCCC',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  typingBubble: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C42',
    marginHorizontal: 2,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickQuestions: {
    gap: 8,
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  
  // Streaming and Error Styles
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 140, 66, 0.1)',
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#D63031',
    fontWeight: '500',
  },
});