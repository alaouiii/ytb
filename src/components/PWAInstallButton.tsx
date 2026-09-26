import React, { useState } from 'react';
import { Download, Monitor, Smartphone, X, Check, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile-drawer' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed and running standalone, suppress
  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      // Show guided instructions for iOS Safari or Laptop manual installation
      setShowGuideModal(true);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        <span>Installed Successfully!</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-all shadow-sm shadow-red-950/40 cursor-pointer ${className}`}
          title="Install TubePulse as desktop or mobile app"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'mobile-drawer' && (
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-3 rounded-xl bg-red-600/15 border border-red-500/40 text-white hover:bg-red-600/25 transition-all cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Install TubePulse PWA</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500 text-white font-mono">App</span>
              </div>
              <div className="text-[11px] text-slate-300">Fast offline access on Laptop & Phone</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-red-400">Install</span>
        </button>
      )}

      {/* Guided Installation Modal (for iOS Safari or Desktop browsers) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install TubePulse App</h3>
                <p className="text-xs text-slate-400">Use TubePulse in full-screen standalone mode</p>
              </div>
            </div>

            {isIOS ? (
              /* iOS Safari Instructions */
              <div className="space-y-3 py-2 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Smartphone className="w-4 h-4 text-red-400" />
                    <span>How to Install on iPhone / iPad:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-300">
                    <li>
                      Tap the <strong className="text-white">Share</strong> button in your Safari toolbar (the box with an upward arrow <span className="text-sm">⎋</span>).
                    </li>
                    <li>
                      Scroll down in the action sheet and select <strong className="text-white">Add to Home Screen</strong>.
                    </li>
                    <li>
                      Tap <strong className="text-white">Add</strong> in the top right corner.
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              /* Laptop / Desktop Instructions */
              <div className="space-y-3 py-2 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Laptop className="w-4 h-4 text-red-400" />
                    <span>How to Install on Laptop / Desktop:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-300">
                    <li>
                      In Google Chrome or Microsoft Edge, look for the <strong className="text-white">Install icon</strong> (computer monitor with download arrow) on the right side of the address bar.
                    </li>
                    <li>
                      Or click the browser menu (<strong className="text-white">⋮</strong>) → select <strong className="text-white">"Install TubePulse"</strong>.
                    </li>
                    <li>
                      Confirm <strong className="text-white">Install</strong> to add TubePulse to your Desktop & Taskbar.
                    </li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <Monitor className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Works natively on Windows, macOS, Linux, and Chromebooks.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
