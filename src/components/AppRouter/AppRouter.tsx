import {useState, useEffect} from "react";
import ApiKeyModal from "../ApiKeyModal/ApiKeyModal";
import ConversationView from "../ConversationView/ConversationView";
import ChatInterface from "../ChatInterface/ChatInterface";
import { SubConversation } from "../ConversationView/ConversationView";
import {getApiKey} from "../../utils/storage";
import { validateApiKey } from "../../utils/validateApiKey";
import "./AppRouter.css";

type AppView = 'auth' | 'conversations' | 'chat';

export default function AppRouter(){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<AppView>('auth');
    const [selectedConversation, setSelectedConversation] = useState<SubConversation | null>(null);

    useEffect(() => {
        checkExistingApiKey();
    }, []);

    const checkExistingApiKey = async () => {
        try {
            const existingKey = await getApiKey();
            if (existingKey) {
                const isValid = await validateApiKey(existingKey);
                setIsAuthenticated(isValid);
                if (isValid) {
                    setCurrentView('conversations');
                } else {
                    setCurrentView('auth');
                    if (typeof chrome !== "undefined" && chrome.storage?.local) {
                        await chrome.storage.local.remove('geminiApiKey');
                    } else {
                        localStorage.removeItem("geminiApiKey");
                    }
                }
            }
        } catch (error) {
            console.error("Error checking existing API Key:", error);
            setIsAuthenticated(false);
            setCurrentView('auth');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApiKeySuccess = () => {
        setIsAuthenticated(true);
        setCurrentView('conversations');
    };

    const handleOpenConversation = (conversation: SubConversation) => {
        setSelectedConversation(conversation);
        setCurrentView('chat');
    };

    const handleBackToConversations = () => {
        setSelectedConversation(null);
        setCurrentView('conversations');
    };

    const handleUpdateConversation = async (updatedConversation: SubConversation) => {
        try {
            const storageKey = 'subConversations';
            let conversations: SubConversation[] = [];

            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                const result = await chrome.storage.local.get([storageKey]);
                if (result[storageKey]) {
                    conversations = JSON.parse(result[storageKey]);
                }
            } else {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    conversations = JSON.parse(stored);
                }
            }

            const updatedConversations = conversations.map(conv => 
                conv.id === updatedConversation.id ? updatedConversation : conv
            );

            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                await chrome.storage.local.set({ 
                    [storageKey]: JSON.stringify(updatedConversations) 
                });
            } else {
                localStorage.setItem(storageKey, JSON.stringify(updatedConversations));
            }

            setSelectedConversation(updatedConversation);

        } catch (error) {
            console.error('Error updating conversation:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                </div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <>
            {currentView === 'auth' && (
                <ApiKeyModal onSuccess={handleApiKeySuccess}/>
            )}
            {currentView === 'conversations' && (
                <ConversationView onOpenConversation={handleOpenConversation}/>
            )}
            {currentView === 'chat' && selectedConversation && (
                <ChatInterface
                    conversation={selectedConversation}
                    onBack={handleBackToConversations}
                    onUpdateConversation={handleUpdateConversation}
                />
            )}
        </>
    );
}