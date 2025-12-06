import { useState } from 'react';
import { Loader2, Sparkles, Flag, ThumbsUp, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Kedai } from '@/types/kedai';

interface VibeCheckResult {
  vibeScore: number;
  verdict: string;
  summary: string;
  greenFlags: string[];
  redFlags: string[];
  bestFor: string;
  avoidIf: string;
}

interface KedaiVibeCheckProps {
  kedai: Kedai;
}

export function KedaiVibeCheck({ kedai }: KedaiVibeCheckProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VibeCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVibeCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('vibecheck', {
        body: {
          kedaiName: kedai.name,
          reviews: kedai.reviews || [],
          rating: kedai.rating,
          priceLevel: kedai.price_level
        }
      });

      if (fnError) throw fnError;
      setResult(data);
    } catch (err) {
      console.error('VibeCheck error:', err);
      setError('Failed to analyze vibe. Cuba lagi!');
    } finally {
      setLoading(false);
    }
  };

  const getVibeColor = (score: number) => {
    if (score >= 80) return 'text-secondary';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-orange-500';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-secondary';
    if (score >= 60) return 'bg-accent';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-destructive';
  };

  if (!result && !loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={runVibeCheck}
        className="gap-2 border-primary/30 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm animate-ping" />
        </div>
        <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          VibeCheck
        </span>
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-xl border border-primary/20 animate-pulse">
        <div className="flex items-center gap-2 text-sm">
          <div className="relative">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-sm" />
          </div>
          <span className="font-medium text-foreground">Analyzing vibe...</span>
        </div>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-pulse" 
            style={{ width: '60%' }} 
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="ghost" size="sm" onClick={runVibeCheck} className="mt-2">
          Try again
        </Button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20 space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">VibeCheck</span>
        </div>
        <span className="text-2xl">{result.verdict.split(' ')[0]}</span>
      </div>

      {/* Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Vibe Score</span>
          <span className={`text-2xl font-bold ${getVibeColor(result.vibeScore)}`}>
            {result.vibeScore}/100
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor(result.vibeScore)} transition-all duration-500`}
            style={{ width: `${result.vibeScore}%` }}
          />
        </div>
        <p className="text-lg font-medium text-foreground">{result.verdict}</p>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground italic">"{result.summary}"</p>

      {/* Flags */}
      <div className="grid grid-cols-2 gap-3">
        {/* Green Flags */}
        {result.greenFlags.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-secondary">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Green Flags</span>
            </div>
            {result.greenFlags.map((flag) => (
              <p key={flag} className="text-xs text-muted-foreground pl-5">• {flag}</p>
            ))}
          </div>
        )}

        {/* Red Flags */}
        {result.redFlags.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Red Flags</span>
            </div>
            {result.redFlags.map((flag) => (
              <p key={flag} className="text-xs text-muted-foreground pl-5">• {flag}</p>
            ))}
          </div>
        )}
      </div>

      {/* Best For / Avoid */}
      <div className="flex gap-4 pt-2 border-t border-border">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Users className="w-3 h-3" />
            Best for
          </div>
          <p className="text-xs text-foreground">{result.bestFor}</p>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Flag className="w-3 h-3" />
            Avoid if
          </div>
          <p className="text-xs text-foreground">{result.avoidIf}</p>
        </div>
      </div>

      {/* Re-run */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={runVibeCheck} 
        className="w-full text-xs hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <Sparkles className="w-3 h-3 mr-1.5" />
        Run VibeCheck again
      </Button>
    </div>
  );
}
