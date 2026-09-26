import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Monitor, 
  Smartphone, 
  ListFilter,
  Sparkles,
  Search
} from 'lucide-react';
import { getThumbnailQualities, downloadThumbnailFile, extractVideoId } from '../utils/youtube';
import { VideoMetadata } from '../types';

interface ThumbnailToolProps {
  initialVideoId?: string | null;
  videoMetadata?: VideoMetadata | null;
}

export const ThumbnailTool: React.FC<ThumbnailToolProps> = ({
  initialVideoId,
  videoMetadata,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [activeVideoId, setActiveVideoId] = useState<string>(initialVideoId || 'dQw4w9WgXcQ');
  const qualities = getThumbnailQualities(activeVideoId);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'sidebar'>('desktop');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    const extracted = extractVideoId(inputUrl);
    if (extracted) {
      setActiveVideoId(extracted);
    }
  };

  const handleDownload = async (url: string, qualityId: string) => {
    setDownloadingId(qualityId);
    const filename = `youtube-thumbnail-${qualityId}-${activeVideoId}.jpg`;
    await downloadThumbnailFile(url, filename);
    setTimeout(() => setDownloadingId(null), 1200);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDownloadAll = async () => {
    for (const q of qualities.slice(0, 3)) {
      await downloadThumbnailFile(q.url, `youtube-thumbnail-${q.id}-${activeVideoId}.jpg`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>HD YouTube Thumbnail Downloader & Inspector</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Extract official full-fidelity 1280x720 Ultra HD thumbnails with instant 1-click downloads and feed preview simulation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Top Resolutions</span>
          </button>
        </div>
      </div>

      {/* Self-contained URL input specifically inside Thumbnail tab */}
      <form onSubmit={handleSearch} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste YouTube video URL or ID to fetch thumbnails..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          Extract Thumbnails
        </button>
      </form>

      {/* Grid of Qualities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qualities.map((item) => {
          const isDownloading = downloadingId === item.id;
          const isCopied = copiedUrl === item.url;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden bg-slate-900/70 flex flex-col justify-between ${
                item.recommended
                  ? 'border-red-500/50 shadow-md shadow-red-950/20 ring-1 ring-red-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header tag */}
                <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                    {item.recommended && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                        Top CTR
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {item.resolution}
                  </span>
                </div>

                {/* Thumbnail Image Slot with Fallback */}
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
                  <img
                    src={item.url}
                    alt={`${item.name} preview`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (item.id === 'maxres') {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`;
                      }
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-slate-900/90 text-white hover:bg-red-600 transition-colors shadow-lg"
                      title="View full size in new tab"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>

                  <span className="absolute bottom-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-300">
                    {item.aspectRatio}
                  </span>
                </div>

                {/* Description */}
                <div className="p-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-slate-800/60 mt-2">
                <button
                  onClick={() => handleDownload(item.url, item.id)}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {isDownloading ? (
                    <span className="animate-spin text-white">⏳</span>
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloading ? 'Saving...' : 'Download'}</span>
                </button>

                <button
                  onClick={() => handleCopyLink(item.url)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feed Simulator / CTR Test Bench */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>YouTube Feed Mock Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify how your thumbnail, title legibility, and contrast appear across different YouTube user interfaces.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                previewMode === 'desktop' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Feed</span>
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                previewMode === 'mobile' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Feed</span>
            </button>
            <button
              onClick={() => setPreviewMode('sidebar')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                previewMode === 'sidebar' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Up Next Sidebar</span>
            </button>
          </div>
        </div>

        {/* Mock View Container */}
        <div className="p-6 rounded-lg bg-slate-950 border border-slate-800 flex justify-center">
          {previewMode === 'desktop' && (
            <div className="w-full max-w-sm rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
              <div className="relative aspect-video bg-black">
                <img
                  src={`https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`}
                  alt="Desktop feed mock"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[11px] font-mono font-semibold bg-black/90 text-white rounded">
                  14:28
                </span>
              </div>
              <div className="p-3.5 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  {videoMetadata?.author_name?.charAt(0) || 'Y'}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                    {videoMetadata?.title || 'How to Create High-Converting YouTube Thumbnails That Get 1M Views'}
                  </h3>
                  <p className="text-xs text-slate-400">{videoMetadata?.author_name || 'Creator Academy'}</p>
                  <p className="text-xs text-slate-500 font-mono">248K views · 3 days ago</p>
                </div>
              </div>
            </div>
          )}

          {previewMode === 'mobile' && (
            <div className="w-full max-w-xs rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-1">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`}
                  alt="Mobile feed mock"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-black/90 text-white rounded">
                  14:28
                </span>
              </div>
              <div className="p-3 flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  {videoMetadata?.author_name?.charAt(0) || 'Y'}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                    {videoMetadata?.title || 'How to Create High-Converting YouTube Thumbnails That Get 1M Views'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {videoMetadata?.author_name || 'Creator Academy'} · 248K views
                  </p>
                </div>
              </div>
            </div>
          )}

          {previewMode === 'sidebar' && (
            <div className="w-full max-w-md p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3 items-center">
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                <img
                  src={`https://img.youtube.com/vi/${activeVideoId}/mqdefault.jpg`}
                  alt="Sidebar mock"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[9px] font-mono font-semibold bg-black/90 text-white rounded">
                  14:28
                </span>
              </div>
              <div className="space-y-1 overflow-hidden">
                <h3 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                  {videoMetadata?.title || 'How to Create High-Converting YouTube Thumbnails That Get 1M Views'}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">{videoMetadata?.author_name || 'Creator Academy'}</p>
                <p className="text-[10px] text-slate-500 font-mono">248K views · 3 days ago</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
