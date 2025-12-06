import { MapPin, Navigation, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LocationPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onAllow: () => void;
  loading?: boolean;
}

export function LocationPermissionDialog({ open, onClose, onAllow, loading }: LocationPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-spring-scale">
            <Navigation className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Allow Location Access</DialogTitle>
          <DialogDescription className="text-center">
            We need your location to find the best makan spots near you. Your location is only used for search and is never stored.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Benefits */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Find restaurants within walking distance</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-lg">🍛</span>
              <span>Get personalized "near me" recommendations</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-lg">⚡</span>
              <span>Faster, more accurate results</span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Your browser will ask for permission. You can change this anytime in your browser settings.</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1 press-effect"
            onClick={onClose}
          >
            Not Now
          </Button>
          <Button 
            className="flex-1 gap-2 press-effect"
            onClick={onAllow}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Getting...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Allow Location
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
