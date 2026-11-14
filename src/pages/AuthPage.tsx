import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AlertBanner, Button, Card, SkeletonBlock } from '../components/ui/Primitives';

export function AuthPage() {
  const { user, profile, loading, authError, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';

  const handleGoogleSignIn = async () => {
    setError(null);
    setStatusMessage(null);
    setSigningIn(true);
    try {
      const loadedProfile = await signInWithGoogle();
      setStatusMessage('Signed in successfully.');
      if (loadedProfile && !loadedProfile.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      if (raw.includes('auth/popup-closed-by-user')) {
        setError('Sign-in popup was closed before completing Google authentication.');
      } else if (raw.includes('auth/operation-not-allowed')) {
        setError(
          'Google Sign-In is not enabled in the Firebase Console yet. Enable Google under Firebase Console → Authentication → Sign-in method.'
        );
      } else if (raw.includes('auth/unauthorized-domain')) {
        setError(
          'This domain is not yet authorized in Firebase Authentication → Settings → Authorized domains.'
        );
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setSigningOut(true);
    try {
      await logout();
      setStatusMessage('You have been signed out.');
    } catch {
      setError('Unable to sign out cleanly. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-14 space-y-4">
        <SkeletonBlock className="h-10 w-48" />
        <SkeletonBlock className="h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Learner Authentication
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Sign in with your Google account to personalize SmartLearn AI by bhanu and save your learning progress securely.
        </p>
      </div>

      {(error || authError) && <AlertBanner tone="error" message={error || authError || ''} />}
      {statusMessage && <AlertBanner tone="success" message={statusMessage} />}

      <Card className="p-6 sm:p-8 space-y-6">
        {!user ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Sign in with Google via Firebase Authentication</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your profile, practice evaluations, and quiz scores are isolated to your account in Cloud Firestore.
              </p>
            </div>

            <Button
              size="lg"
              loading={signingIn}
              onClick={() => void handleGoogleSignIn()}
              className="w-full"
            >
              Continue with Google
            </Button>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                Console Setup Reference
              </p>
              <p>
                Ensure Google Sign-In is enabled under Firebase Console → Authentication → Sign-in method, and this app host is listed in Authorized Domains.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Signed in learner
              </p>
              <p className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                {profile?.displayName || user.displayName || 'Learner'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
              {profile && (
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  Level: {profile.experienceLevel} · Language: {profile.preferredLanguage}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={profile && !profile.onboardingCompleted ? '/onboarding' : '/dashboard'}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                {profile && !profile.onboardingCompleted ? 'Complete Setup' : 'Go to Dashboard'}
              </Link>
              <Button
                variant="secondary"
                loading={signingOut}
                onClick={() => void handleSignOut()}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
