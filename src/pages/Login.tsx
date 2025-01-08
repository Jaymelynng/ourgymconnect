import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Login component mounted');
    console.log('Current origin:', window.location.origin);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN') {
        console.log('User signed in, redirecting to /');
        navigate("/");
        toast.success("Successfully signed in!");
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setError("");
      } else if (event === 'USER_UPDATED') {
        console.log('User updated, checking session');
        const { error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          toast.error(sessionError.message);
        }
      }
    });

    // Check if we're already signed in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', session, error);
      if (session) {
        console.log('Session found, redirecting to /');
        navigate("/");
      }
      if (error) {
        console.error('Initial session error:', error);
        setError(error.message);
        toast.error(error.message);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Sign up or sign in to continue</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
            }}
            theme="light"
            providers={[]}
            redirectTo={`${window.location.origin}/`}
          />
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Make sure to check your email after signing up</p>
        </div>
      </div>
    </div>
  );
}