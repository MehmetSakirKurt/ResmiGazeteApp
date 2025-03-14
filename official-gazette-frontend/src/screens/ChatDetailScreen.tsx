import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { ChatMessage, ChatConversation } from '../types';
import { RootStackParamList } from '../navigation/types';

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

// Mock initial messages
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    text: 'Merhaba! Ben Resmi Gazete Asistanı. Size nasıl yardımcı olabilirim?',
    sender: 'bot',
    timestamp: new Date().toISOString(),
  },
];

// Mock suggestions for new users
const SUGGESTIONS = [
  'Resmi Gazete nedir?',
  'En son yayınlar nelerdir?',
  'Vergi düzenlemeleri hakkında bilgi verir misin?',
  'İş Sağlığı ve Güvenliği yönetmeliği nedir?',
];

const ChatDetailScreen: React.FC = () => {
  const route = useRoute<ChatDetailRouteProp>();
  const initialQuestion = route.params?.initialQuestion;
  
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState(initialQuestion || '');
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // If there's an initial question, send it automatically
    if (initialQuestion) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: initialQuestion,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputText('');
      setIsTyping(true);

      // Simulate bot response after a delay
      setTimeout(() => {
        let botResponse = '';
        
        if (initialQuestion.toLowerCase().includes('resmi gazete')) {
          botResponse = 'Resmi Gazete, Türkiye Cumhuriyeti\'nin resmi yayın organıdır. Yasalar, yönetmelikler, tebliğler ve diğer resmi duyurular burada yayınlanır.';
        } else if (initialQuestion.toLowerCase().includes('vergi')) {
          botResponse = 'Vergi ile ilgili düzenlemeler genellikle Resmi Gazete\'de yayınlanır. Son vergi düzenlemeleri hakkında bilgi için ana sayfadaki yayınları inceleyebilirsiniz.';
        } else if (initialQuestion.toLowerCase().includes('iş sağlığı') || initialQuestion.toLowerCase().includes('güvenlik')) {
          botResponse = 'İş Sağlığı ve Güvenliği Yönetmeliği, işyerlerinde iş sağlığı ve güvenliğinin sağlanması ve mevcut sağlık ve güvenlik şartlarının iyileştirilmesi için işveren ve çalışanların görev, yetki, sorumluluk, hak ve yükümlülüklerini düzenler.';
        } else {
          botResponse = 'Bu konu hakkında daha detaylı bilgi için lütfen daha spesifik bir soru sorun veya ana sayfadaki yayınları inceleyebilirsiniz.';
        }

        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };

        setMessages(prevMessages => [...prevMessages, botMessage]);
        setIsTyping(false);
      }, 1500);
    }
  }, [initialQuestion]);
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      // Mock bot response based on user input
      let botResponse = '';
      
      if (inputText.toLowerCase().includes('resmi gazete')) {
        botResponse = 'Resmi Gazete, Türkiye Cumhuriyeti\'nin resmi yayın organıdır. Yasalar, yönetmelikler, tebliğler ve diğer resmi duyurular burada yayınlanır.';
      } else if (inputText.toLowerCase().includes('vergi')) {
        botResponse = 'Vergi ile ilgili düzenlemeler genellikle Resmi Gazete\'de yayınlanır. Son vergi düzenlemeleri hakkında bilgi için ana sayfadaki yayınları inceleyebilirsiniz.';
      } else if (inputText.toLowerCase().includes('iş sağlığı') || inputText.toLowerCase().includes('güvenlik')) {
        botResponse = 'İş Sağlığı ve Güvenliği Yönetmeliği, işyerlerinde iş sağlığı ve güvenliğinin sağlanması ve mevcut sağlık ve güvenlik şartlarının iyileştirilmesi için işveren ve çalışanların görev, yetki, sorumluluk, hak ve yükümlülüklerini düzenler.';
      } else {
        botResponse = 'Bu konu hakkında daha detaylı bilgi için lütfen daha spesifik bir soru sorun veya ana sayfadaki yayınları inceleyebilirsiniz.';
      }

      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isBot = item.sender === 'bot';
    
    return (
      <View style={[
        styles.messageContainer,
        isBot ? styles.botMessageContainer : styles.userMessageContainer
      ]}>
        {isBot && (
          <View style={styles.botAvatar}>
            <MaterialIcons name="smart-toy" size={20} color={COLORS.card} />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isBot ? styles.botMessageBubble : styles.userMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isBot ? styles.botMessageText : styles.userMessageText
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const renderSuggestion = (suggestion: string) => {
    return (
      <TouchableOpacity
        key={suggestion}
        style={styles.suggestionButton}
        onPress={() => {
          setInputText(suggestion);
          // Small delay to show the text in the input before sending
          setTimeout(() => {
            handleSendMessage();
          }, 100);
        }}
      >
        <Text style={styles.suggestionText}>{suggestion}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Önerilen Sorular:</Text>
            <View style={styles.suggestionsList}>
              {SUGGESTIONS.map(suggestion => renderSuggestion(suggestion))}
            </View>
          </View>
        )}

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>Asistan yazıyor</Text>
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.typingIndicator} />
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Bir soru sorun..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialIcons
              name="send"
              size={24}
              color={inputText.trim() ? COLORS.card : COLORS.disabled}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <MaterialIcons name="info" size={16} color={COLORS.disabled} style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>
            Asistan, Gemini API kullanarak genel bilgiler sunar. Resmi bilgi için her zaman orijinal kaynaklara başvurun.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContainer: {
    padding: SPACING.m,
    paddingBottom: SPACING.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
    maxWidth: '80%',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  messageBubble: {
    borderRadius: SIZES.base,
    padding: SPACING.m,
    ...SHADOWS.small,
  },
  botMessageBubble: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 0,
  },
  userMessageBubble: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 0,
  },
  messageText: {
    fontSize: SIZES.font,
    lineHeight: 20,
  },
  botMessageText: {
    color: COLORS.text,
  },
  userMessageText: {
    color: COLORS.card,
  },
  typingContainer: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.s,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    alignSelf: 'flex-start',
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    ...SHADOWS.small,
  },
  typingText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    opacity: 0.7,
  },
  typingIndicator: {
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    maxHeight: 100,
    fontSize: SIZES.font,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.s,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.background,
  },
  suggestionsContainer: {
    padding: SPACING.m,
  },
  suggestionsTitle: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionButton: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    marginRight: SPACING.s,
    marginBottom: SPACING.s,
    ...SHADOWS.small,
  },
  suggestionText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disclaimerIcon: {
    marginRight: SPACING.xs,
  },
  disclaimerText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.disabled,
  },
});

export default ChatDetailScreen;
