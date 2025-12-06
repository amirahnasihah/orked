import { Kedai, Review } from '@/types/kedai';
import { MapPin, Star, CheckCircle, ChevronRight, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KedaiDetailSheet } from './KedaiDetailSheet';

interface KedaiCardProps {
  kedai: Kedai;
}

export function KedaiCard({ kedai }: KedaiCardProps) {
  const [foodImage, setFoodImage] = useState<string | null>(kedai.thumbnail || null);
  const [imageLoading, setImageLoading] = useState(!kedai.thumbnail);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (kedai.thumbnail) {
      setImageLoading(false);
      return;
    }

    async function generateFoodImage() {
      try {
        const response = await supabase.functions.invoke('generate-food-image', {
          body: { signature: kedai.signature, name: kedai.name }
        });
        
        if (response.data?.imageUrl) {
          setFoodImage(response.data.imageUrl);
        }
      } catch (error) {
        console.error('Failed to generate food image:', error);
      } finally {
        setImageLoading(false);
      }
    }

    generateFoodImage();
  }, [kedai.signature, kedai.name, kedai.thumbnail]);

  const reviews = kedai.reviews || [];
  const firstReview = reviews[0];

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-200">
        {/* Compact Google-style List Card */}
        <button
          onClick={() => setShowDetail(true)}
          className="w-full flex gap-3 p-3 hover:bg-muted/50 transition-all duration-200 text-left press-effect group"
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
            {imageLoading ? (
              <div className="w-full h-full shimmer-bg animate-shimmer" />
            ) : foodImage ? (
              <img 
                src={foodImage} 
                alt={kedai.name}
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
            {/* Name */}
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground truncate">
                {kedai.name}
              </h4>
              {kedai.hasRealReviews && (
                <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
              )}
            </div>

            {/* Rating Row */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {kedai.rating && (
                <>
                  <span className="text-sm font-medium text-foreground">{kedai.rating}</span>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(kedai.rating || 0) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  {kedai.totalReviews && (
                    <span className="text-xs text-muted-foreground">({kedai.totalReviews})</span>
                  )}
                  <span className="text-muted-foreground">·</span>
                </>
              )}
              <span className="text-xs text-muted-foreground">{kedai.price_level || '$$'}</span>
              {kedai.signature && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground truncate">{kedai.signature}</span>
                </>
              )}
            </div>

            {/* Location & Distance */}
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{kedai.area}</span>
              {kedai.distanceFormatted && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-xs font-medium text-primary">{kedai.distanceFormatted}</span>
                </>
              )}
            </div>

            {/* First Review Preview */}
            {firstReview && (
              <div className="flex items-start gap-1.5 mt-2">
                <MessageCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground line-clamp-1 italic">
                  "{firstReview.text}"
                </p>
              </div>
            )}
          </div>

          {/* Chevron */}
          <div className="flex-shrink-0 flex items-center">
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </button>

        {/* Horizontal Reviews Scroll */}
        {reviews.length > 0 && (
          <div className="border-t border-border">
            <div className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide">
              {reviews.slice(0, 5).map((review: Review, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => setShowDetail(true)}
                  className="flex-shrink-0 w-56 p-2.5 bg-muted/50 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {review.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{review.name}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-xs text-muted-foreground">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    "{review.text}"
                  </p>
                </div>
              ))}
              {reviews.length > 5 && (
                <button
                  onClick={() => setShowDetail(true)}
                  className="flex-shrink-0 w-20 flex items-center justify-center bg-muted/50 hover:bg-muted rounded-lg text-xs text-primary font-medium"
                >
                  +{reviews.length - 5} more
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <KedaiDetailSheet 
        kedai={kedai}
        foodImage={foodImage}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}
