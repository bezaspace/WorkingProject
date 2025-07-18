import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, Bot, User as UserIcon, Sparkles, Heart, Brain, Leaf } from 'lucide-react-native';

const dummyResponses = [
  "Based on your symptoms, I recommend trying some ginger tea with honey. Ginger has natural anti-inflammatory properties that can help with digestive issues.",
  "For better sleep, consider establishing a bedtime routine with chamomile tea and some gentle yoga stretches 30 minutes before bed.",
  "Your stress levels seem elevated. I suggest practicing pranayama breathing exercises - try the 4-7-8 technique: inhale for 4, hold for 7, exhale for 8.",
  "Turmeric is excellent for inflammation. You can add it to warm milk with a pinch of black pepper to enhance absorption.",
  "For your energy levels, consider ashwagandha supplements. Start with a small dose in the morning and see how your body responds.",
  "Based on your constitution, a Vata-pacifying diet would be beneficial. Focus on warm, cooked foods and avoid cold, raw items.",
  "Try oil pulling with sesame oil in the morning. Swish for 10-15 minutes before brushing your teeth for better oral health.",
  "Your symptoms suggest a Pitta imbalance. Cool, sweet foods like coconut water and cucumber can help restore balance.",
];

const quickQuestions = [
  "What herbs help with stress?",
  "Best foods for digestion?",
  "How to improve sleep naturally?",
  "Yoga poses for back pain?",
];

const initialMessages = [
  {
    id: 1,
    text: "Hello! I'm your Ayurvedic wellness assistant. I'm here to help you with natural remedies, lifestyle advice, and wellness guidance. How can I assist you today?",
    isUser: false,
    timestamp: new Date(Date.now() - 60000),
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  const sendMessage = (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
      const aiMessage = {
        id: Date.now() + 1,
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
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
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
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
});