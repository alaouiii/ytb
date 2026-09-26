import React, { useState } from 'react';
import { 
  KeyRound, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Image as ImageIcon, 
  Hash, 
  ArrowRight 
} from 'lucide-react';
import { useAccessCode, VALID_ACCESS_CODE } from '../context/AccessCodeContext';

export const AccessCodeGate: React.FC = () => {
  const { unlockWithCode } = useAccessCode();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Please enter the access code to continue.');
      return;
    }

    const isValid = unlockWithCode(code);
    if (isValid) {
      setSuccess(true);
    } else {
      setError('Invalid access code. Please enter the correct VIP access code.');
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl">
        {/* Decorative Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-red-500/20 to-slate-900 border border-red-500/40 text-red-500 flex items-center justify-center shadow-lg shadow-red-950/50 mb-5">
            {success ? (
              <Unlock className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-in zoom-in-75 duration-200" />
            ) : (
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 animate-pulse" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            <span>VIP Access Protected</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
            Enter Access Code
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            All creator tools are currently locked. Enter the secret access code to unlock the full YouTube suite.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Passcode / Access Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter access code..."
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all font-mono tracking-wider"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Access Granted! Unlocking all tools...</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-bold transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock All Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Protected Tools List Preview */}
          <div className="pt-6 border-t border-slate-800/80 text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 text-center sm:text-left">
              Tools Unlocked With Passcode:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <Download className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">YouTube Video & Audio Converter</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Ultra HD Thumbnail Extractor</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <Hash className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Live Viral Hashtags Generator</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">SEO Tags & CTR Optimizer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
