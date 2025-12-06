import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ExternalLink, Share2, ThumbsUp, Navigation, Bookmark, BookmarkCheck, Copy, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { Kedai, Review } from '@/types/kedai';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { KedaiVibeCheck } from './KedaiVibeCheck';

interface KedaiDetailSheetProps {
  kedai: Kedai;
  foodImage: string | null;
  open: boolean;
  onClose: () => void;
}

export function KedaiDetailSheet({ kedai, foodImage, open, onClose }: KedaiDetailSheetProps) {
  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const navigate = useNavigate();
  
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(kedai.name + ' ' + kedai.area + ' Malaysia')}`;
  const reviews = kedai.reviews || [];
  const bookmarked = isBookmarked(kedai.id);

  const shareMessage = `🍛 Check out ${kedai.name}!\n\n📍 ${kedai.area}\n🍽️ ${kedai.signature || 'Great food!'}\n⭐ ${kedai.rating ? `${kedai.rating}/5` : 'Highly rated'}\n💵 ${kedai.price_level || '$$'}\n\n🗺️ ${googleMapsUrl}\n\nFound via Makan Mana Geng 🇲🇾`;

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(googleMapsUrl)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(telegramUrl, '_blank');
    toast.success('Opening Telegram...');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: kedai.name,
          text: `Check out ${kedai.name} - ${kedai.signature || 'Great food!'}`,
          url: googleMapsUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.info('Login to save bookmarks');
      onClose();
      navigate('/auth');
      return;
    }

    if (bookmarked) {
      await removeBookmark(kedai.id);
    } else {
      await addBookmark(kedai, foodImage);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[480px] sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header Image */}
          <div className="relative w-full h-48 bg-muted flex-shrink-0">
            {foodImage ? (
              <img 
                src={foodImage} 
                alt={kedai.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-accent/20 to-primary/20">
                🍽️
              </div>
            )}
            
            {/* Top Actions */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Button
                type="button"
                onClick={handleBookmark}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  bookmarked 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background/80 backdrop-blur-sm hover:bg-background'
                }`}
              >
                {bookmarked ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4 text-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Title */}
            <SheetHeader className="space-y-1 mb-3">
              <SheetTitle className="text-xl font-bold text-foreground text-left">
                {kedai.name}
              </SheetTitle>
              <div className="flex items-center gap-2 text-sm">
                {kedai.rating && (
                  <>
                    <span className="font-medium text-foreground">{kedai.rating}</span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star 
                          key={`${kedai.id}-rating-star-${starIdx}`} 
                          className={`w-3.5 h-3.5 ${starIdx < Math.floor(kedai.rating || 0) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                    {kedai.totalReviews && (
                      <span className="text-muted-foreground">({kedai.totalReviews})</span>
                    )}
                    <span className="text-muted-foreground">·</span>
                  </>
                )}
                <span className="text-muted-foreground">{kedai.price_level || '$$'}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">Restaurant</span>
              </div>
            </SheetHeader>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 gap-1.5 press-effect"
                onClick={() => window.open(googleMapsUrl, '_blank')}
              >
                <Navigation className="w-4 h-4" />
                Directions
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-shrink-0 gap-1.5 press-effect"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={nativeShare} className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share via...
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={shareToWhatsApp} className="gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareToTelegram} className="gap-2">
                    <Send className="w-4 h-4 text-blue-500" />
                    Telegram
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={copyToClipboard} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy to clipboard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant={bookmarked ? "secondary" : "outline"}
                size="sm" 
                className="flex-shrink-0 gap-1.5 press-effect"
                onClick={handleBookmark}
              >
                {bookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            </div>

            {/* VibeCheck */}
            <KedaiVibeCheck kedai={kedai} />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full mt-4">
              <TabsList className="w-full grid grid-cols-2 mb-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-3 mt-0">
                {/* Distance (if available) */}
                {kedai.distanceFormatted && (
                  <div className="flex items-start gap-3 py-2">
                    <Navigation className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Distance</p>
                      <p className="text-sm font-medium text-foreground">{kedai.distanceFormatted} away</p>
                    </div>
                  </div>
                )}

                {/* Address */}
                <div className={`flex items-start gap-3 py-2 ${kedai.distanceFormatted ? 'border-t border-border' : ''}`}>
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                    <p className="text-sm text-foreground">{kedai.area}, Malaysia</p>
                  </div>
                </div>

                {/* Signature Dish */}
                {kedai.signature && (
                  <div className="flex items-start gap-3 py-2 border-t border-border">
                    <span className="text-lg">🍽️</span>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Signature Dish</p>
                      <p className="text-sm font-medium text-foreground">{kedai.signature}</p>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-start gap-3 py-2 border-t border-border">
                  <span className="text-lg">💵</span>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Price Range</p>
                    <p className="text-sm font-medium text-foreground">{kedai.price_level || '$$'}</p>
                  </div>
                </div>

                {/* Tags */}
                {kedai.tags && kedai.tags.length > 0 && (
                  <div className="flex items-start gap-3 py-2 border-t border-border">
                    <span className="text-lg">🏷️</span>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {kedai.tags.slice(0, 5).map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-3 mt-0">
                {reviews.length > 0 ? (
                  reviews.map((review: Review, idx: number) => {
                    // Create unique key from review properties (no index fallback)
                    const reviewKey = `${review.name}-${review.text.slice(0, 50).replace(/\s+/g, '-')}-${review.date || review.rating || 'no-date'}`;
                    return (
                    <div 
                      key={reviewKey} 
                      className="p-3 bg-muted/50 rounded-lg animate-stagger-fade"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {review.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{review.name}</p>
                            {review.date && (
                              <p className="text-xs text-muted-foreground">{review.date}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: Math.min(review.rating, 5) }, (_, starIdx) => {
                            const starKey = `${reviewKey}-star-${review.rating}-pos-${starIdx}`;
                            return (
                              <Star key={starKey} className="w-3.5 h-3.5 fill-accent text-accent" />
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{review.text}</p>
                      {review.likes !== undefined && review.likes > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{review.likes} found this helpful</span>
                        </div>
                      )}
                    </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No reviews available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Bottom Action */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-card">
            <Button 
              className="w-full gap-2 press-effect"
              onClick={() => window.open(googleMapsUrl, '_blank')}
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
