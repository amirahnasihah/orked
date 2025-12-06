import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
  disabled?: boolean;
  showSuggestions?: boolean;
}

const AI_SUGGESTIONS = [
  { emoji: '🍛', text: 'Nasi lemak sedap near me' },
  { emoji: '🍜', text: 'Best mamak around KL' },
  { emoji: '🍣', text: 'Sushi murah kat Penang' },
  { emoji: '🍔', text: 'Burger best below RM20' },
  { emoji: '☕', text: 'Cafe vibes kat Bangsar' },
  { emoji: '🦐', text: 'Seafood fresh kat JB' },
];

export function ChatInput({ onSend, loading, disabled, showSuggestions = true }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showChips, setShowChips] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;
    onSend(input.trim());
    setInput('');
    setShowChips(false);
  };

  const handleSuggestionClick = (text: string) => {
    onSend(text);
    setShowChips(false);
  };

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  return (
    <div className="space-y-3">
      {/* AI Suggestions */}
      {showSuggestions && showChips && !loading && (
        <div className="space-y-2 animate-slide-down">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 animate-pulse-glow" />
            <span>Try these or type your own:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AI_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className={`mobbin-chip opacity-0 animate-stagger-fade stagger-${idx + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <span>{suggestion.emoji}</span>
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 animate-fade-up">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type apa you nak makan... 🍽️"
          className="flex-1 bg-card border-border mobbin-input"
          disabled={loading || disabled}
        />
        <Button 
          type="submit" 
          disabled={!input.trim() || loading || disabled}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 press-effect fab"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
}
