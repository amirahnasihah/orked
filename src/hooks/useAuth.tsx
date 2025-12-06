import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isProcessingHash = false;

    // Handle auth callback from URL hash FIRST (before anything else)
    const handleHashAuth = async () => {
      const hash = window.location.hash;
      if (hash?.includes('access_token')) {
        isProcessingHash = true;
        console.log('Processing auth hash fragment...', hash.substring(0, 50) + '...');
        
        // Parse hash to get tokens
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        // Check for errors in hash
        if (errorParam) {
          console.error('Auth error in hash:', errorParam, errorDescription);
          setLoading(false);
          // Clean URL hash
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
        
        if (accessToken) {
          try {
            console.log('Setting session from hash tokens...');
            // Set session manually from hash tokens
            const { data: { session }, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Error setting session from hash:', error);
              setLoading(false);
              // Clean URL hash even on error
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
            
            if (session) {
              console.log('✅ Session set successfully from hash:', session.user.email);
              setSession(session);
              setUser(session.user);
              setLoading(false);
              // Redirect to /chat after successful auth
              const currentPath = window.location.pathname;
              if (currentPath === '/' || currentPath === '') {
                // Force navigation to /chat
                setTimeout(() => {
                  window.location.href = '/chat';
                }, 100);
              } else {
                // Clean URL hash but stay on current path
                window.history.replaceState(null, '', currentPath + window.location.search);
              }
            } else {
              console.warn('No session returned from setSession');
              setLoading(false);
            }
          } catch (err) {
            console.error('Exception processing hash auth:', err);
            setLoading(false);
            // Clean URL hash on exception
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          console.warn('No access_token found in hash');
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email ?? 'no user');
        
        // Only update state if we're not currently processing hash
        // This prevents race conditions
        if (!isProcessingHash || event !== 'SIGNED_IN') {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
        
        // Clean hash after successful sign in and redirect to /chat if on root
        if (event === 'SIGNED_IN' && window.location.hash) {
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '') {
            // Force navigation to /chat
            setTimeout(() => {
              window.location.href = '/chat';
            }, 100);
          } else {
            // Clean URL hash but stay on current path
            window.history.replaceState(null, '', currentPath + window.location.search);
          }
        }
      }
    );

    // Process hash FIRST, then check for existing session
    handleHashAuth().then(() => {
      // Only check for existing session if we didn't process a hash
      if (!isProcessingHash) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/chat`;
    
    // Validate Supabase client is configured
    if (!supabase) {
      console.error('Supabase client not initialized');
      return { error: new Error('Supabase client not configured. Check your environment variables.') };
    }

    // Check if environment variables are set
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      return { 
        error: new Error('Supabase configuration missing. Please check your .env file.') 
      };
    }

    console.log('Sending magic link to:', email);
    console.log('Redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('Magic link error:', error);
      // Log more details for debugging
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      console.log('Magic link sent successfully:', data);
    }
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
