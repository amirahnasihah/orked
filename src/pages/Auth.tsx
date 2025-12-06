import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { signInWithMagicLink, user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for auth errors from URL
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      let friendlyMessage = 'Authentication failed. Please try again.';
      
      if (errorDescription?.includes('invalid') || errorDescription?.includes('expired')) {
        friendlyMessage = 'Magic link sudah expired atau dah guna. Cuba request yang baru.';
      } else if (errorDescription?.includes('signature')) {
        friendlyMessage = 'Link tak sah. Cuba request magic link baru.';
      }
      
      setAuthError(friendlyMessage);
      toast.error(friendlyMessage);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    const { error } = await signInWithMagicLink(email);
    
    if (error) {
      let friendlyMessage = error.message || 'Failed to send magic link';
      
      if (error.message?.includes('rate limit')) {
        friendlyMessage = 'Terlalu banyak request. Cuba lagi dalam beberapa minit.';
      }
      
      toast.error(friendlyMessage);
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
    toast.success('Magic link sent! Check your email.');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background bg-nasi-pattern flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍛</span>
              <div>
                <h1 className="font-bold text-lg text-foreground">Makan Mana Geng?</h1>
                <p className="text-xs text-muted-foreground">Login to save your favorites</p>
              </div>
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

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Auth Error Banner */}
          {authError && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 animate-fade-up">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Link Expired</p>
                <p className="text-xs text-muted-foreground mt-1">{authError}</p>
              </div>
            </div>
          )}

          {emailSent ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center animate-fade-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Check your email!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                We sent a magic link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Tips:</strong> Click the link within 1 hour. Only click once - kalau dah click, jangan click lagi.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setAuthError(null);
                }}
              >
                Use different email
              </Button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 animate-fade-up">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-1">Welcome, geng! 👋</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email to sign in or create an account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending magic link...
                    </>
                  ) : (
                    'Send Magic Link ✨'
                  )}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground mt-4">
                No password needed! We'll send you a secure login link.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
