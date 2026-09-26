import React, { useState } from 'react';
import { 
  X, 
  Youtube, 
  AlertCircle, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    closeLoginModal, 
    signInWithGoogle 
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  if (!isLoginModalOpen) {
    return null;
  }

  const cleanErrorMsg = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'An error occurred. Please try again.';
    const anyErr = err as { code?: string; message?: string };
    const code = anyErr.code || '';
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before finishing.';
      case 'auth/cancelled-popup-request':
        return 'Only one popup request is allowed at a time.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser. Please allow popups for this site.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in your Firebase Console. Please add it to Authorized Domains.';
      default:
        return anyErr.message || 'Google authentication failed. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      closeLoginModal();
    } catch (err) {
      setError(cleanErrorMsg(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 relative text-slate-100 animate-in zoom-in-95 duration-200 text-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center mb-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 shadow-md mb-3">
            <Youtube className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Sign in to TubePulse
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Continue with your Gmail account to unlock full converter features, HD thumbnails & SEO tools.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 text-left flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ONLY Button: Gmail Login with Google */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 text-sm font-bold transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 ring-1 ring-slate-200/20"
          >
            {isGoogleSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500 pt-1">
            Fast & secure 1-click authentication
          </p>
        </div>
      </div>
    </div>
  );
};
