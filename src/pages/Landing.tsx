import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ArrowRight, Sparkles, Moon, Sun } from 'lucide-react';

// Demo conversation data
const DEMO_CONVERSATION = [
  { type: 'user', text: 'Nasi lemak sedap kat Bangsar' },
  { type: 'assistant', text: 'Eh best tu geng! Jap aku carikan...' },
  { 
    type: 'result', 
    name: 'Village Park Restaurant',
    rating: 4.5,
    area: 'Damansara Uptown',
    signature: 'Nasi Lemak Ayam Goreng',
    price: '$$',
    image: '🍛'
  },
  { 
    type: 'result', 
    name: 'Nasi Lemak Antarabangsa',
    rating: 4.3,
    area: 'Kampung Baru',
    signature: 'Nasi Lemak Special',
    price: '$',
    image: '🍚'
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  // Animate demo conversation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= DEMO_CONVERSATION.length) {
          // Reset after showing all
          setTimeout(() => setCurrentStep(0), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Typing animation for user message
  useEffect(() => {
    if (currentStep === 0) {
      setTypingText('');
      return;
    }
    
    const userMsg = DEMO_CONVERSATION[0];
    
    // Only animate typing when currentStep is exactly 1
    if (currentStep === 1) {
      if (typingText.length < userMsg.text.length) {
        // Continue typing animation
        const timer = setTimeout(() => {
          setTypingText(userMsg.text.slice(0, typingText.length + 1));
        }, 50);
        return () => clearTimeout(timer);
      } else if (typingText.length === 0) {
        // Start typing animation
        setTypingText(userMsg.text.slice(0, 1));
      }
    } else if (currentStep > 1 && typingText.length < userMsg.text.length) {
      // If step moved forward but text not complete, show full text immediately
      setTypingText(userMsg.text);
    }
  }, [currentStep, typingText]);

  // Cursor blink
  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background bg-nasi-pattern flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍛</span>
            <span className="font-bold text-lg text-foreground">Makan Mana Geng?</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:bg-muted"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full mb-4 animate-fade-up">
            <Sparkles className="w-4 h-4" />
            AI-Powered Food Recommendations
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Find the best <span className="text-primary">makan spots</span> in Malaysia
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Just tell us what you crave, and we will find the perfect place with real Google reviews. No cap! 🔥
          </p>
        </div>

        {/* Demo Phone Mockup */}
        <div className="w-full max-w-sm mx-auto mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-card border-2 border-border rounded-3xl p-3 shadow-2xl">
            {/* Phone Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border mb-3">
              <span className="text-xl">🍛</span>
              <span className="font-semibold text-sm text-foreground">Makan Mana Geng?</span>
            </div>
            
            {/* Demo Chat */}
            <div className="space-y-3 min-h-[300px] px-2">
              {/* Welcome Message */}
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                  🍛
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 max-w-[80%]">
                  <p className="text-sm text-foreground">Yo geng! Nak makan apa hari ni?</p>
                </div>
              </div>

              {/* User typing */}
              {currentStep >= 1 && (
                <div className="flex justify-end animate-fade-up">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 max-w-[80%]">
                    <p className="text-sm">
                      {typingText}
                      {typingText.length < DEMO_CONVERSATION[0].text.length && (
                        <span className={`${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Assistant Response */}
              {currentStep >= 2 && (
                <div className="flex gap-2 animate-fade-up">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                    🍛
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 max-w-[80%]">
                    <p className="text-sm text-foreground">{DEMO_CONVERSATION[1].text}</p>
                  </div>
                </div>
              )}

              {/* Result Cards */}
              {currentStep >= 3 && DEMO_CONVERSATION.slice(2).map((item, idx) => (
                currentStep >= 3 + idx && item.type === 'result' && (
                  <div 
                    key={item.name} 
                    className="flex gap-2 p-2 bg-card border border-border rounded-xl animate-fade-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                      {item.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span>{item.rating}</span>
                        <span>·</span>
                        <span>{item.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{item.area}</span>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Fake Input */}
            <div className="mt-3 px-2">
              <div className="bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
                Nak makan apa geng?
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          size="lg" 
          className="gap-2 text-lg px-8 animate-fade-up press-effect"
          style={{ animationDelay: '0.4s' }}
          onClick={() => navigate('/auth')}
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Button>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-xs text-muted-foreground">
        <p>🇲🇾 Cursor Hackathon 2025</p>
      </footer>
    </div>
  );
}
