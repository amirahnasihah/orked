import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks, Bookmark } from '@/hooks/useBookmarks';
import { useTheme } from '@/components/ThemeProvider';
import { ArrowLeft, Star, MapPin, Trash2, ExternalLink, Loader2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Bookmarks() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { bookmarks, loading, removeBookmark } = useBookmarks();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const openInMaps = (bookmark: Bookmark) => {
    const query = `${bookmark.kedai_name} ${bookmark.kedai_address || ''} Malaysia`;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background bg-nasi-pattern">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/chat')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg text-foreground">Saved Places</h1>
              <p className="text-xs text-muted-foreground">{bookmarks.length} kedai saved</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:bg-muted"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">📍</span>
            <h2 className="text-xl font-semibold text-foreground mb-2">No saved places yet</h2>
            <p className="text-muted-foreground mb-6">Save your favorite kedai to find them easily later!</p>
            <Button onClick={() => navigate('/chat')}>
              Start Exploring
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div 
                key={bookmark.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div className="flex gap-3 p-3">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {bookmark.kedai_image ? (
                      <img 
                        src={bookmark.kedai_image} 
                        alt={bookmark.kedai_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{bookmark.kedai_name}</h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {bookmark.kedai_rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-foreground">{bookmark.kedai_rating}</span>
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                        </div>
                      )}
                      {bookmark.kedai_price_level && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">{bookmark.kedai_price_level}</span>
                        </>
                      )}
                    </div>

                    {bookmark.kedai_address && (
                      <div className="flex items-center gap-1 mt-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{bookmark.kedai_address}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs gap-1"
                        onClick={() => openInMaps(bookmark)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Directions
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeBookmark(bookmark.kedai_place_id || '')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
