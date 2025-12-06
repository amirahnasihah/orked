import { useMemo } from 'react';
import { Sparkles, Sunrise, Sun, Moon, CloudRain } from 'lucide-react';

interface SmartSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function SmartSuggestions({ onSuggestionClick }: SmartSuggestionsProps) {
  const suggestions = useMemo(() => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    
    // Time-based suggestions
    if (hour >= 6 && hour < 10) {
      // Breakfast time
      return {
        icon: <Sunrise className="w-4 h-4" />,
        label: 'Breakfast Ideas',
        items: [
          { text: 'Nasi lemak best dekat sini', emoji: '🍛' },
          { text: 'Roti canai sedap area ni', emoji: '🥞' },
          { text: 'Dim sum spot untuk breakfast', emoji: '🥟' },
          { text: 'Kopi tarik dengan toast set', emoji: '☕' },
        ],
      };
    } else if (hour >= 10 && hour < 14) {
      // Lunch time
      return {
        icon: <Sun className="w-4 h-4" />,
        label: 'Lunch Time',
        items: [
          { text: 'Nasi ayam penyet murah', emoji: '🍗' },
          { text: 'Mee goreng mamak sedap', emoji: '🍜' },
          { text: 'Chicken rice best dalam town', emoji: '🍚' },
          { text: isWeekend ? 'Brunch spot yang aesthetic' : 'Lunch set murah dan sedap', emoji: isWeekend ? '🥂' : '💰' },
        ],
      };
    } else if (hour >= 14 && hour < 17) {
      // Afternoon / tea time
      return {
        icon: <Sparkles className="w-4 h-4" />,
        label: 'Tea Time',
        items: [
          { text: 'Cendol or ABC ice kat mana', emoji: '🍧' },
          { text: 'Pisang goreng dan kuih-muih', emoji: '🍌' },
          { text: 'Cafe dengan kopi sedap', emoji: '☕' },
          { text: 'Dessert place yang best', emoji: '🍰' },
        ],
      };
    } else if (hour >= 17 && hour < 21) {
      // Dinner time
      return {
        icon: <Moon className="w-4 h-4" />,
        label: 'Dinner Ideas',
        items: [
          { text: 'Seafood sedap untuk dinner', emoji: '🦐' },
          { text: 'BBQ atau grill yang best', emoji: '🍖' },
          { text: 'Steamboat untuk ramai-ramai', emoji: '🍲' },
          { text: isWeekend ? 'Fine dining untuk date night' : 'Dinner dengan family', emoji: isWeekend ? '🌹' : '👨‍👩‍👧' },
        ],
      };
    } else {
      // Supper / late night
      return {
        icon: <CloudRain className="w-4 h-4" />,
        label: 'Supper Mode',
        items: [
          { text: 'Mamak 24 jam dekat sini', emoji: '🌙' },
          { text: 'Maggi goreng untuk supper', emoji: '🍜' },
          { text: 'Teh tarik lepak malam', emoji: '🍵' },
          { text: 'Late night makan spot', emoji: '🌃' },
        ],
      };
    }
  }, []);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-full bg-primary/10 text-primary">
          {suggestions.icon}
        </div>
        <span className="text-sm font-medium text-foreground">{suggestions.label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.items.map((item) => (
          <button
            type="button"
            key={item.text}
            onClick={() => onSuggestionClick(item.text)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-full text-sm text-foreground transition-all duration-150 hover:border-primary/30 hover:shadow-sm active:scale-95"
          >
            <span>{item.emoji}</span>
            <span className="truncate max-w-[180px]">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
