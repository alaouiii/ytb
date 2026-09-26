import React, { useState } from 'react';
import { ToolTab } from './types';
import { Header } from './components/Header';
import { DownloaderTool } from './components/DownloaderTool';
import { ThumbnailTool } from './components/ThumbnailTool';
import { HashtagTool } from './components/HashtagTool';
import { KeywordTool } from './components/KeywordTool';
import { SeoHelperTool } from './components/SeoHelperTool';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { AccessCodeProvider, useAccessCode } from './context/AccessCodeContext';
import { AccessCodeGate } from './components/AccessCodeGate';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ToolTab>('downloader');
  const { isUnlocked } = useAccessCode();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* 5-second Email Login Modal in Middle of Screen */}
      <AuthModal />

      {/* Top Menu Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area: If code is not entered, block all tools with AccessCodeGate */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-2 sm:px-4 lg:px-6 py-4 pb-20 md:pb-6 flex flex-col">
        {!isUnlocked ? (
          <AccessCodeGate />
        ) : (
          <>
            {activeTab === 'downloader' && <DownloaderTool />}

            {activeTab === 'thumbnails' && <ThumbnailTool />}

            {activeTab === 'hashtags' && (
              <HashtagTool initialTopic="YouTube Creator" />
            )}

            {activeTab === 'keywords' && (
              <KeywordTool initialTopic="YouTube Video" />
            )}

            {activeTab === 'seo' && (
              <SeoHelperTool initialTitle="" />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AccessCodeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AccessCodeProvider>
  );
}
