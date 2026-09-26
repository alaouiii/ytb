import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Image as ImageIcon, 
  Hash, 
  KeyRound, 
  Sparkles, 
  Youtube,
  Menu,
  X,
  ChevronRight,
  User as UserIcon,
  LogOut,
  Lock,
  Unlock
} from 'lucide-react';
import { ToolTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../context/AuthContext';
import { useAccessCode } from '../context/AccessCodeContext';

interface HeaderProps {
  activeTab: ToolTab;
  onTabChange: (tab: ToolTab) => void;
}

interface NavItem {
  id: ToolTab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  description: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, openLoginModal, logout } = useAuth();
  const { isUnlocked, lockAccess } = useAccessCode();

  const navItems: NavItem[] = [
    { 
      id: 'downloader', 
      label: 'Downloader', 
      shortLabel: 'Downloader',
      icon: <Download className="w-4 h-4 shrink-0" />,
      description: 'Video & audio converter engine'
    },
    { 
      id: 'thumbnails', 
      label: 'Thumbnails', 
      shortLabel: 'Thumbnails',
      icon: <ImageIcon className="w-4 h-4 shrink-0" />,
      description: 'Ultra HD 1280x720 extractor'
    },
    { 
      id: 'hashtags', 
      label: 'Hashtags', 
      shortLabel: 'Hashtags',
      icon: <Hash className="w-4 h-4 shrink-0" />,
      description: 'Live viral tags & shorts'
    },
    { 
      id: 'keywords', 
      label: 'Keywords', 
      shortLabel: 'Keywords',
      icon: <KeyRound className="w-4 h-4 shrink-0" />,
      description: 'Studio 500-char tag generator'
    },
    { 
      id: 'seo', 
      label: 'SEO Helper', 
      shortLabel: 'SEO',
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
      description: 'CTR score & title optimizer'
    },
  ];

  // Auto-close mobile dropdown when tab changes or resize to desktop
  const handleSelectTab = (id: ToolTab) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md transition-colors">
        <div className="max-w-[1500px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Zone */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-600/15 border border-red-500/30 text-red-500 shadow-sm shrink-0">
              <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <button 
              onClick={() => handleSelectTab('downloader')}
              className="text-left font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              TubePulse
            </button>

            {/* Mobile Active Tab Pill badge (Shows current tool on mobile) */}
            <div className="flex md:hidden items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span className="truncate max-w-[90px]">{activeItem.shortLabel}</span>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Menu Tabs (Hidden on mobile < md) */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1 overflow-x-auto py-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {!isUnlocked && (
                      <Lock className="w-3 h-3 text-red-400 shrink-0 opacity-80" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Access Code VIP Status Badge */}
            {isUnlocked ? (
              <button
                onClick={lockAccess}
                title="VIP Code freedownload2026 is unlocked. Click to re-lock tools."
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>VIP Unlocked</span>
              </button>
            ) : (
              <div 
                title="Enter code freedownload2026 to unlock"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Code Locked</span>
              </div>
            )}

            <PWAInstallButton variant="header" />

            {/* Auth Button (Desktop) */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 max-w-[150px] truncate"
                  title={currentUser.email || 'Signed in'}
                >
                  <UserIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{currentUser.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 transition-all cursor-pointer shadow-xs"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span>Google Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls: Install Button + Auth + Hamburger Toggle (Visible on mobile < md) */}
          <div className="flex md:hidden items-center gap-1.5">
            <PWAInstallButton variant="header" className="px-2 py-1 text-[11px]" />
            {!currentUser && (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-900 transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
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
                <span>Login</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-red-400" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-slate-950/98 backdrop-blur-xl px-3 py-3 shadow-2xl space-y-2 animate-in slide-in-from-top-2 duration-150">
            {/* User Profile Card inside mobile drawer */}
            {currentUser ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs font-semibold text-white truncate">{currentUser.email}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Logged In</div>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-xs font-medium text-slate-300 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white text-slate-900">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">Sign In with Google</div>
                    <div className="text-[11px] text-slate-400">1-click login with your Gmail account</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* Direct PWA Install Card inside mobile drawer */}
            <PWAInstallButton variant="mobile-drawer" />

            {/* VIP Passcode Status Card */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isUnlocked 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {isUnlocked ? (
                  <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <div className="text-left">
                  <div className="text-xs font-bold text-white">
                    {isUnlocked ? 'VIP Access Unlocked' : 'Tools Locked'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isUnlocked ? 'Access granted with freedownload2026' : 'Passcode freedownload2026 required'}
                  </div>
                </div>
              </div>
              {isUnlocked && (
                <button
                  onClick={lockAccess}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white"
                >
                  Lock
                </button>
              )}
            </div>

            <div className="px-2 pt-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Creator Tools Menu
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border border-red-500/40 shadow-xs ring-1 ring-red-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isUnlocked && (
                      <Lock className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Visible on mobile < md) */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-1 py-1 flex items-center justify-around safe-bottom"
        style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-lg transition-colors cursor-pointer relative ${
                isActive 
                  ? 'text-red-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-md transition-colors relative ${
                isActive ? 'bg-red-500/15 text-red-500' : ''
              }`}>
                {item.icon}
                {!isUnlocked && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-slate-950 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-white" />
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight mt-0.5 truncate max-w-[62px]">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
