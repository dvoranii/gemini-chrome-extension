import './MessageBubble.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => (
        <span key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </span>
      ));
  };

  return (
    <div className={`message-bubble ${message.role}`}>
      <div className="message-content">
        {formatMessageContent(message.content)}
      </div>
      <div className="message-timestamp">
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
}