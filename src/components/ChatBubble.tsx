import { ChatMessage } from '@/types/kedai';
import { KedaiCard } from './KedaiCard';
import { User, Bot } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 animate-bubble-pop ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center spring-transition ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl px-4 py-2.5 spring-transition ${
          isUser 
            ? 'bg-primary text-primary-foreground rounded-br-md' 
            : 'bg-card border border-border text-foreground rounded-bl-md'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Kedai Results */}
        {!isUser && message.kedaiResults && message.kedaiResults.length > 0 && (
          <div className="mt-3 space-y-3">
            {message.kedaiResults.map((kedai, index) => (
              <div 
                key={kedai.id} 
                className="animate-stagger-fade opacity-0"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <KedaiCard kedai={kedai} />
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1 animate-fade-in">
          {message.timestamp.toLocaleTimeString('en-MY', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}
