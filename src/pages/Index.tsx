import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage } from '@/types/kedai';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { LocationPermissionDialog } from '@/components/LocationPermissionDialog';
import { LocationFallbackDialog } from '@/components/LocationFallbackDialog';
import { SmartSuggestions } from '@/components/SmartSuggestions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useTheme } from '@/components/ThemeProvider';
import { Loader2, Moon, Sun, Filter, X, MapPin, Navigation, User, LogOut, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Apa khabar geng! 🍛 Aku food plug korang ni.\n\n**Tekan suggestion kat bawah** atau taip sendiri apa yang korang nak!\n\nBoleh tanya apa-apa makanan, mana-mana area kat Malaysia. Aku akan carikan dengan Google Maps reviews yang real. Trust me bro! 😎",
  timestamp: new Date(),
};

const BUDGET_OPTIONS = [
  { value: '', label: 'Any Budget' },
  { value: 'cheap', label: '💵 Cheap (< RM15)' },
  { value: 'moderate', label: '💵💵 Moderate (RM15-40)' },
  { value: 'expensive', label: '💵💵💵 Expensive (RM40+)' },
];

const CUISINE_OPTIONS = [
  { value: '', label: 'Any Cuisine' },
  { value: 'malay', label: '🍛 Malay' },
  { value: 'chinese', label: '🥢 Chinese' },
  { value: 'indian', label: '🍚 Indian' },
  { value: 'mamak', label: '🍜 Mamak' },
  { value: 'japanese', label: '🍣 Japanese' },
  { value: 'korean', label: '🍖 Korean' },
  { value: 'western', label: '🍔 Western' },
  { value: 'thai', label: '🌶️ Thai' },
  { value: 'seafood', label: '🦐 Seafood' },
  { value: 'vegetarian', label: '🥗 Vegetarian' },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, session, loading: authLoading } = useAuth();
  const { bookmarks } = useBookmarks();
  const { resolvedTheme, setTheme } = useTheme();
  
  // Redirect to landing page if user logs out
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showLocationFallback, setShowLocationFallback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const activeFiltersCount = (budget ? 1 : 0) + (cuisine ? 1 : 0) + (userLocation ? 1 : 0);

  const handleLocationRequest = () => {
    // Check if permission was already granted
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // Already granted, get location directly
          getCurrentLocation();
        } else {
          // Show our custom dialog first
          setShowLocationDialog(true);
        }
      }).catch(() => {
        // Fallback: show dialog
        setShowLocationDialog(true);
      });
    } else {
      // Fallback for browsers without permissions API
      setShowLocationDialog(true);
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }

    setShowLocationDialog(false);
    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lon: longitude };
        setUserLocation(newLocation);
        
        // Reverse geocode to get location name
        let area = 'Your Location';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`
          );
          const data = await response.json();
          area = data.address?.suburb || data.address?.city || data.address?.town || 'Your Location';
          setLocationName(area);
          toast.success(`📍 Location set: ${area}`);
        } catch {
          setLocationName('Your Location');
          toast.success('📍 Location detected!');
        }
        
        setLocationLoading(false);

        // If there's a pending message, send it now with location
        if (pendingMessage) {
          const msg = pendingMessage;
          setPendingMessage(null);
          // Small delay to ensure state is updated
          setTimeout(() => {
            processSendMessage(msg, newLocation);
          }, 100);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationLoading(false);
        
        // Show friendly fallback dialog instead of just toast
        if (error.code === error.PERMISSION_DENIED) {
          setShowLocationFallback(true);
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location unavailable. Try selecting an area instead.');
          setShowLocationFallback(true);
        } else if (error.code === error.TIMEOUT) {
          toast.error('Location request timed out. Try selecting an area instead.');
          setShowLocationFallback(true);
        } else {
          toast.error('Failed to get location.');
          setShowLocationFallback(true);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const clearLocation = () => {
    setUserLocation(null);
    setLocationName(null);
    toast.info('Location cleared');
  };

  // Store pending message when waiting for location
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Check if message contains "near me" keywords
  const containsNearMe = (text: string) => {
    const keywords = ['near me', 'nearby', 'dekat sini', 'sekitar sini', 'near here', 'around here', 'berdekatan'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  // Core message processing function
  const processSendMessage = async (content: string, locationOverride?: { lat: number; lon: number } | null) => {
    // Check if user is logged in (function requires auth)
    if (!user || !session) {
      toast.error('Please login first to use chat!');
      navigate('/auth');
      return;
    }
    
    const currentLocation = locationOverride !== undefined ? locationOverride : userLocation;
    
    // Append filter context to message
    let enhancedContent = content;
    const filterParts = [];
    if (budget) filterParts.push(`budget: ${budget}`);
    if (cuisine) filterParts.push(`cuisine: ${cuisine}`);
    if (currentLocation) filterParts.push(`near me / nearby`);
    if (filterParts.length > 0) {
      enhancedContent = `${content} [Filters: ${filterParts.join(', ')}]`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      console.log('Calling chat function with:', {
        message: enhancedContent,
        historyLength: history.length,
        filters: { budget, cuisine },
        hasLocation: !!currentLocation
      });

      // Get auth token for function call (functions require JWT)
      const authToken = session?.access_token;
      
      let responseData: unknown = null;
      let responseError: { message?: string; status?: number; context?: unknown } | null = null;
      
      try {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { 
            message: enhancedContent, 
            history,
            filters: { budget, cuisine },
            location: currentLocation
          },
          headers: authToken ? {
            Authorization: `Bearer ${authToken}`
          } : {
            // If no auth, use anon key (might fail if function requires auth)
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
          }
        });

        console.log('Chat function response:', { data, error });

        if (error) {
          console.error('Supabase function error:', error);
          // Check if error has status code
          const errorStatus = (error as { status?: number; statusCode?: number }).status || 
                             (error as { status?: number; statusCode?: number }).statusCode ||
                             (error as { context?: { status?: number } }).context?.status;
          
          responseError = {
            message: error.message || 'Unknown error',
            status: errorStatus,
            context: error
          };
        } else {
          responseData = data;
        }
      } catch (invokeError) {
        console.error('Function invoke error:', invokeError);
        const err = invokeError as { message?: string; status?: number; statusCode?: number; context?: unknown };
        
        // Try to extract status from various possible locations
        const errorStatus = err.status || err.statusCode || 
                          (err.context as { status?: number })?.status;
        
        responseError = {
          message: err.message || 'Unknown error',
          status: errorStatus,
          context: err
        };
      }

      // Handle errors with proper status codes
      if (responseError) {
        const status = responseError.status;
        const message = responseError.message || '';
        const context = responseError.context as { message?: string; error?: string } | undefined;
        
        console.error('Function error details:', { status, message, context });
        
        // Extract actual error message from context if available
        const actualError = context?.error || context?.message || message;
        
        // Handle specific status codes
        if (status === 429 || message.includes('429') || message.includes('rate limit') || actualError?.includes('429')) {
          throw new Error('rate_limit');
        }
        
        if (status === 401 || message.includes('401') || message.includes('unauthorized') || message.includes('jwt')) {
          throw new Error('unauthorized');
        }
        
        if (status === 404 || message.includes('404') || message.includes('not found')) {
          throw new Error('function_not_found');
        }
        
        if (status === 500 || message.includes('500') || message.includes('internal')) {
          // Try to extract error message from response
          const errorMsg = actualError?.includes('GEMINI_API_KEY') || actualError?.includes('SERPAPI_KEY') || actualError?.includes('GROQ_API_KEY')
            ? 'api_key_missing'
            : 'server_error';
          throw new Error(errorMsg);
        }
        
        // For any other non-2xx status, check if it's rate limit in the actual response
        if (status && status >= 400 && actualError?.includes('rate limit')) {
          throw new Error('rate_limit');
        }
        
        throw new Error(message || `Function returned status ${status || 'unknown'}`);
      }

      if (!responseData) {
        throw new Error('No data returned from chat function');
      }

      const data = responseData as { message?: string; kedai?: unknown[]; error?: string };
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "Maaf, ada masalah sikit. Cuba lagi ya!",
        kedaiResults: (data.kedai || []) as ChatMessage['kedaiResults'],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error details:', err);
      
      // More detailed error messages
      let errorContent = "Alamak, ada masalah teknikal. Cuba lagi ya! 😅";
      
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();
        
        if (errorMsg.includes('rate_limit') || errorMsg.includes('429') || errorMsg.includes('non-2xx')) {
          errorContent = "Alamak, ramai sangat orang tengah guna ni! 😅\n\n**Rate Limit Exceeded** - API dah penuh untuk sekarang.\n\n**Penyelesaian:**\n1. Tunggu 2-5 minit sebelum cuba lagi\n2. Check API quotas:\n   - Gemini: https://aistudio.google.com/app/apikey\n   - SerpAPI: https://serpapi.com/dashboard\n   - Groq: https://console.groq.com/keys\n\nKalau masih error, mungkin perlu upgrade API plan! 💰";
        } else if (errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
          errorContent = "Need to login first! 🔐\n\nFunction requires authentication. Please login via the Auth page, then try again.";
          // Redirect to auth if not logged in
          if (!user) {
            setTimeout(() => navigate('/auth'), 2000);
          }
        } else if (errorMsg.includes('function_not_found') || errorMsg.includes('404') || errorMsg.includes('not found')) {
          errorContent = "Chat function tak jumpa. 🔧\n\nFunctions dah deploy? Check:\n1. Supabase Dashboard → Edge Functions\n2. Function 'chat' status ACTIVE\n3. Browser console untuk details";
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorContent = "Internet connection ada masalah. 📶\n\nCheck connection korang dan cuba lagi!";
        } else if (errorMsg.includes('timeout')) {
          errorContent = "Request timeout. ⏱️\n\nServer tengah sibuk, cuba lagi dalam beberapa saat!";
        } else if (errorMsg.includes('api_key_missing') || errorMsg.includes('gemini') || errorMsg.includes('api key') || errorMsg.includes('not configured')) {
          errorContent = "API keys belum set! 🔑\n\nSet secrets dalam Supabase Dashboard:\n1. Settings → Edge Functions → Secrets\n2. Add: GEMINI_API_KEY, GROQ_API_KEY, SERPAPI_KEY\n\nCheck README.md untuk details!";
        } else if (errorMsg.includes('server_error') || errorMsg.includes('500')) {
          errorContent = "Server ada masalah teknikal. 🔧\n\nCuba lagi dalam beberapa saat. Kalau masih error, check:\n1. Supabase Dashboard → Edge Functions → Logs\n2. Browser console untuk details";
        } else {
          errorContent = `Error: ${err.message}\n\nCheck browser console untuk details.`;
        }
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Show toast for debugging
      toast.error('Chat error - check console for details');
    } finally {
      setLoading(false);
    }
  };

  // Main send function that checks for "near me" first
  const sendMessage = async (content: string) => {
    // Check if user is asking for "near me" but location not set
    if (containsNearMe(content) && !userLocation) {
      setPendingMessage(content); // Store message to send after location granted
      handleLocationRequest();
      return;
    }

    processSendMessage(content);
  };

  const clearFilters = () => {
    setBudget('');
    setCuisine('');
    setUserLocation(null);
    setLocationName(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background bg-nasi-pattern">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍛</span>
            <div>
              <h1 className="font-bold text-lg text-foreground">Makan Mana Geng?</h1>
              <p className="text-xs text-muted-foreground">Your Malaysian food plug 🇲🇾</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:bg-muted"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="w-5 h-5" />
                    {bookmarks.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] rounded-full flex items-center justify-center">
                        {bookmarks.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/bookmarks')}>
                    <Bookmark className="w-4 h-4" />
                    Saved ({bookmarks.length})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 text-destructive focus:text-destructive"
                    onClick={async () => {
                      await signOut();
                      toast.success('Logged out');
                      navigate('/');
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="gap-1.5"
              >
                <User className="w-4 h-4" />
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mt-4 p-4 bg-gradient-to-br from-card via-card to-muted/30 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Filter className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Search Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-primary bg-primary/20 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className="text-xs h-7 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            
            {/* GPS Location Button */}
            <div className="mb-4">
              <label htmlFor="location" className="text-xs font-medium text-foreground mb-2 block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Location
              </label>
              {userLocation ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/30 rounded-lg px-3 py-2.5 shadow-sm">
                  <div className="p-1 bg-primary/20 rounded-md">
                    <Navigation className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{locationName || 'Your Location'}</span>
                  <button 
                    type="button"
                    onClick={clearLocation} 
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLocationRequest}
                  disabled={locationLoading}
                  className="w-full justify-start h-10 bg-background/50 hover:bg-background border-border/50 hover:border-primary/30 transition-all hover:shadow-md"
                >
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                  )}
                  <span className="font-medium">
                    {locationLoading ? 'Getting location...' : 'Use My Location (Near Me)'}
                  </span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Budget Filter */}
              <div>
                <label htmlFor="budget" className="text-xs font-medium text-foreground mb-2 block flex items-center gap-1.5">
                  💵 Budget
                </label>
                <div className="relative">
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-background/80 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-background hover:border-border"
                  >
                    {BUDGET_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg aria-hidden="true" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Cuisine Filter */}
              <div>
                <label htmlFor="cuisine" className="text-xs font-medium text-foreground mb-2 block flex items-center gap-1.5">
                  🍛 Cuisine
                </label>
                <div className="relative">
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full bg-background/80 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-background hover:border-border"
                  >
                    {CUISINE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg aria-hidden="true" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/50 flex-wrap">
                {userLocation && (
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                    <Navigation className="w-3.5 h-3.5" />
                    {locationName || 'Near Me'}
                    <button 
                      type="button"
                      onClick={clearLocation} 
                      className="hover:text-primary/70 transition-colors ml-0.5 p-0.5 rounded-full hover:bg-primary/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {budget && (
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-accent/20 to-accent/10 text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full border border-accent/20 shadow-sm hover:shadow-md transition-shadow">
                    {BUDGET_OPTIONS.find(b => b.value === budget)?.label}
                    <button 
                      type="button"
                      onClick={() => setBudget('')} 
                      className="hover:opacity-70 transition-opacity ml-0.5 p-0.5 rounded-full hover:bg-accent/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {cuisine && (
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary-foreground text-xs font-medium px-3 py-1.5 rounded-full border border-secondary/20 shadow-sm hover:shadow-md transition-shadow">
                    {CUISINE_OPTIONS.find(c => c.value === cuisine)?.label}
                    <button 
                      type="button"
                      onClick={() => setCuisine('')} 
                      className="hover:text-secondary/70 transition-colors ml-0.5 p-0.5 rounded-full hover:bg-secondary/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Smart Suggestions at top when chat is fresh */}
          {messages.length === 1 && !loading && (
            <SmartSuggestions onSuggestionClick={sendMessage} />
          )}
          
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          
          {loading && (
            <div className="flex gap-3 animate-fade-up">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center animate-pulse-glow">
                <Loader2 className="w-4 h-4 animate-spin text-secondary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-2.5">
                <p className="text-sm text-muted-foreground">Hunting for spots{userLocation ? ' near you' : ''}...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={sendMessage} loading={loading} />
          <p className="text-xs text-center text-muted-foreground mt-2">
            ⚡ Cursor Hackathon {userLocation && '📍'}
          </p>
        </div>
      </footer>

      {/* Location Permission Dialog */}
      <LocationPermissionDialog
        open={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onAllow={getCurrentLocation}
        loading={locationLoading}
      />

      {/* Location Fallback Dialog - when GPS denied */}
      <LocationFallbackDialog
        open={showLocationFallback}
        onClose={() => {
          setShowLocationFallback(false);
          setPendingMessage(null);
        }}
        pendingMessage={pendingMessage}
        onAreaSelect={(area) => {
          if (area && pendingMessage) {
            // Modify the pending message to include the selected area
            const modifiedMessage = pendingMessage.replace(
              /near me|nearby|dekat sini|sekitar sini|near here|around here|berdekatan/gi,
              `kat ${area}`
            );
            processSendMessage(modifiedMessage);
          } else if (pendingMessage) {
            // User skipped - just send without location context
            processSendMessage(pendingMessage);
          }
          setPendingMessage(null);
          setShowLocationFallback(false);
        }}
      />
    </div>
  );
};

export default Index;
