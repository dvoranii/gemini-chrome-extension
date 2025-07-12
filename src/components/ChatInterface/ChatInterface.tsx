import { useState, useEffect, useRef } from 'react';
import { SubConversation } from '../ConversationView/ConversationView';
import MessageBubble from '../MessageBubble/MessageBubble';
import { ConversationMessage, sendMessageToGemini } from '../../utils/geminiApi';
import './ChatInterface.css';

interface ChatInterfaceProps {
    conversation: SubConversation;
    onBack: () => void;
    onUpdateConversation: (updatedConversation: SubConversation) => void;
}

export default function ChatInterface({
    conversation,
    onBack,
    onUpdateConversation
}: ChatInterfaceProps) {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [localMessages, setLocalMessages] = useState(conversation.messages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [typedResponse, setTypedResponse] = useState<string>('');

    useEffect(() => {
        scrollToBottom();
    }, [localMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    const generateContextPrompt = (highlightedText: string, context:string) => {
        return `You are a helpful AI assistant having a conversation about the following highlighted text from a Gemini conversation:
        HIGHLIGHTED TEXT:
        "${highlightedText}"

        CONTEXT:
        ${context}

        Please help the user understand, analyze, or discuss this highlighted content. Be specific and reference the highlighted text when relevant. If the user asks questions, answer them in relation to this context.

        The user may ask follow-up questions or request clarification about this content. Always keep the highlighted text and its context in mind when responding.`;
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            role: 'user' as const,
            content: inputValue,
            timestamp: new Date()
        };

        const updatedMessages = [...localMessages, userMessage];
        setLocalMessages(updatedMessages);
        setInputValue('');
        setIsLoading(true);

        try {

            const conversationHistory:ConversationMessage[] = [];

            if (localMessages.length === 0) {
                conversationHistory.push({
                    role: 'user' as const,
                    content: generateContextPrompt(conversation.highlightedText, conversation.context)
                });
            }

            conversationHistory.push(...localMessages.map(msg => ({
                role: msg.role === "assistant" ? 'assistant' as const : 'user' as const,
                content: msg.content
            })));

            conversationHistory.push({
                role: "user" as const,
                content: inputValue
            });

            const response = await sendMessageToGemini(conversationHistory);
            await typeMessage(response, updatedMessages);

        } catch(error) {
            console.error("Error sending message:", error);

            const errorMessage = {
                role: 'assistant' as const,
                content: 'Sorry, I encountered an error while processing your message. Please try again.',
                timestamp: new Date()
            };

            const finalMessages = [...updatedMessages, errorMessage];
            setLocalMessages(finalMessages);
        } finally {
            setIsLoading(false);
        }
    }

    const typeMessage = async (fullText: string, currentMessages: typeof localMessages) => {
        setTypedResponse('');
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < fullText.length) {
                setTypedResponse((prev) => prev+ fullText.charAt(i));
                i++;
                scrollToBottom();
            } else {
                clearInterval(typingInterval);

                const assistantMessage = {
                    role: 'assistant' as const,
                    content: fullText,
                    timestamp: new Date()
                };

                const finalMessages = [...currentMessages, assistantMessage];
                setLocalMessages(finalMessages);

                const updatedConversation = {
                    ...conversation,
                    messages: finalMessages,
                    isActive: true
                }

                onUpdateConversation(updatedConversation);
            }
        }, 30)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    return(
    <div className="chat-interface">
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Conversations
        </button>
        <div className="conversation-info">
          <div className="highlighted-text-preview">
            "{conversation.highlightedText.length > 50 
              ? conversation.highlightedText.substring(0, 50) + '...'
              : conversation.highlightedText}"
          </div>
          <div className="context-badge">
            {conversation.contextType} context
          </div>
        </div>
      </div>

      <div className="messages-container">
        {localMessages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-bubble">
              <p>Hi! I'm here to help you discuss and analyze this highlighted text:</p>
              <blockquote>"{conversation.highlightedText}"</blockquote>
              <p>What would you like to know or discuss about it?</p>
            </div>
          </div>
        )}

        {localMessages.slice(0, localMessages.length - (typedResponse ? 1 : 0)).map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
          />
        ))}

        {typedResponse && (
            <MessageBubble
            key="typing-response" 
            message={{ role: 'assistant', content: typedResponse, timestamp: new Date() }}
            />
        )}

        {isLoading && (
          <div className="loading-message">
            <div className="loading-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the highlighted text..."
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
    )
}