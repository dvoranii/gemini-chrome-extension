import {useState, useEffect, useCallback} from "react";
import SubConversationCard from './SubConversationCard';
import './ConversationView.css';

export type SubConversation = {
  id: string;
  highlightedText: string;
  context: string;
  contextType: 'auto' | 'manual';
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  created: Date;
  isActive: boolean;
}

interface ConversationViewProps {
    onOpenConversation: (conversation: SubConversation) => void;
}

export default function ConversationView({onOpenConversation}: ConversationViewProps) {
    const [subConversations, setSubConversations] = useState<SubConversation[]>([]);
     const [isStorageListenerActive, setIsStorageListenerActive] = useState(false);


    const loadConversations = useCallback(async () => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          const result = await chrome.storage.local.get(['subConversations']);
          if (result.subConversations) {
            const parsedConversations: SubConversation[] = JSON.parse(result.subConversations).map((conv: any) => ({
                ...conv,
                created: new Date(conv.created),
                messages: conv.messages?.map((msg: any)=> ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                })) || []
            }));
            setSubConversations(parsedConversations);
          } else {
            setSubConversations([]);
          }
        } else {
          const stored = localStorage.getItem('subConversations');
          if (stored) {
            const parsedConversations: SubConversation[] = JSON.parse(stored).map((conv: any) => ({
                ...conv,
                created: new Date(conv.created),
                messages: conv.messages?.map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp)
                })) || []
            }));
            setSubConversations(parsedConversations);
          } else {
            setSubConversations([]);
          }
        }
    }, []);

    useEffect(() => {
        loadConversations();

        const storageChangeListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName === 'local' && changes.subConversations) {
                console.log('chrome.storage.local.subConversations changed!');
                loadConversations(); 
            }
        };

        if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
            chrome.storage.onChanged.addListener(storageChangeListener);
            setIsStorageListenerActive(true);
        } else {
            console.warn("chrome.storage.onChanged is not available. Storage changes won't be reactive.");
           setIsStorageListenerActive(false);
        }

        return () => {
            if (typeof  chrome !== "undefined" && chrome.storage?.onChanged) {
                chrome.storage.onChanged.removeListener(storageChangeListener);
            }
        }
    },[loadConversations]);

    const handleOpenConversation = (id: string) => {
        const conversation = subConversations.find(conv => conv.id === id);
        if (conversation) {
            onOpenConversation(conversation);
        }
    };

    const handleDeleteonversation = (id: string) => {
        setSubConversations(prev => {
            const updated = prev.filter(conv => conv.id !== id);
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
              chrome.storage.local.set({ subConversations: JSON.stringify(updated) });
            } else {
              localStorage.setItem('subConversations', JSON.stringify(updated));
            }
            return updated;
        });
    }


    return(
        <div className="conversation-view">
            <header className="view-header">
                <h1>Conversations</h1>
                <div className="status-indicator">
                    <span className={`status-dot ${isStorageListenerActive ? 'active' : 'inactive'}`}></span>
                       <span className="status-text">
                        {isStorageListenerActive ? 'Listening for highlights' : 'Not listening'}
                    </span>
                </div>
            </header>

            <div className="instructions">
                <p>Highlight text in your Gemini conversation and right-click to import it here for side conversations.</p>
            </div>

            <div className="converstions-container">
                {subConversations.length === 0 ? (
                    <div className="empty-space">
                        <p>No side conversations yet.</p>
                        <p>Highlight some text in Gemini to get started!</p>
                    </div>
                ): (
                    <div className="conversations-grid">
                        {subConversations
                        .sort((a,b) => b.created.getTime() - a.created.getTime())
                        .map(conversation => (
                            <SubConversationCard
                                key={conversation.id}
                                conversation={conversation}
                                onOpen={handleOpenConversation}
                                onDelete={handleDeleteonversation}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}