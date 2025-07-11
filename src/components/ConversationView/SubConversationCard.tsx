import { type SubConversation } from './ConversationView';
import './SubConversationCard.css';

interface SubConversationCardProps {
  conversation: SubConversation;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SubConversationCard({ 
  conversation, 
  onOpen, 
  onDelete 
}: SubConversationCardProps) {
  const truncatedText = conversation.highlightedText.length > 60 
    ? conversation.highlightedText.substring(0, 60) + '...'
    : conversation.highlightedText;

  return (
    <div className="sub-conversation-card">
      <div className="card-header">
        <div className="highlighted-text">"{truncatedText}"</div>
        <button 
          className="delete-btn"
          onClick={() => onDelete(conversation.id)}
          title="Delete conversation"
        >
          ×
        </button>
      </div>
      
      <div className="card-meta">
        <span className="context-type">{conversation.contextType} context</span>
        <span className="message-count">{conversation.messages.length} messages</span>
      </div>
      
      <div className="card-actions">
        <button 
          className="open-btn"
          onClick={() => onOpen(conversation.id)}
        >
          {conversation.messages.length > 0 ? 'Continue' : 'Open'}
        </button>
      </div>
    </div>
  );
}