import { useState } from 'react';
import { MapPin, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface LocationFallbackDialogProps {
  open: boolean;
  onClose: () => void;
  onAreaSelect: (area: string) => void;
  pendingMessage: string | null;
}

const POPULAR_AREAS = [
  { name: 'KL City', emoji: '🏙️' },
  { name: 'Petaling Jaya', emoji: '🌆' },
  { name: 'Bangsar', emoji: '🍷' },
  { name: 'Mont Kiara', emoji: '🏢' },
  { name: 'Subang Jaya', emoji: '🏘️' },
  { name: 'Damansara', emoji: '🌳' },
  { name: 'Cheras', emoji: '🏠' },
  { name: 'Ampang', emoji: '⛰️' },
];

export function LocationFallbackDialog({ 
  open, 
  onClose, 
  onAreaSelect,
  pendingMessage 
}: LocationFallbackDialogProps) {
  const [customArea, setCustomArea] = useState('');

  const handleAreaClick = (areaName: string) => {
    onAreaSelect(areaName);
    onClose();
  };

  const handleCustomAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customArea.trim()) {
      onAreaSelect(customArea.trim());
      setCustomArea('');
      onClose();
    }
  };

  const handleSkip = () => {
    onAreaSelect(''); // Empty means no location
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Tak dapat access lokasi</DialogTitle>
          <DialogDescription className="text-center">
            Takpe geng! Boleh pilih area atau taip sendiri. Kami cari kedai dekat situ.
          </DialogDescription>
        </DialogHeader>

        {/* Pending message preview */}
        {pendingMessage && (
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Your search:</span> "{pendingMessage}"
          </div>
        )}

        {/* Popular Areas */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Popular areas</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_AREAS.map((area) => (
              <button
                key={area.name}
                type="button"
                onClick={() => handleAreaClick(area.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-full text-sm text-foreground transition-all duration-150 hover:border-primary/30 active:scale-95"
              >
                <span>{area.emoji}</span>
                <span>{area.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Area Input */}
        <form onSubmit={handleCustomAreaSubmit} className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Or enter your area</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g. Bukit Bintang, KLCC..."
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={!customArea.trim()}>
              Search
            </Button>
          </div>
        </form>

        {/* Skip Option */}
        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground"
            onClick={handleSkip}
          >
            <Sparkles className="w-4 h-4" />
            Skip - just show me anywhere in Malaysia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
