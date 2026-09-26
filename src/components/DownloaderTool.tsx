import React, { useState, useRef } from 'react';

export const DownloaderTool: React.FC = () => {
  const [iframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const baseIframeSrc = 'https://y2mate.tube/en78/';

  return (
    <div className="w-full h-full flex-1">
      {/* Seamless full iframe without extra paragraphs or text labels */}
      <div className="w-full rounded-xl sm:rounded-2xl border border-slate-800/80 bg-slate-950 shadow-2xl overflow-hidden min-h-[75vh] sm:min-h-[82vh] lg:min-h-[86vh]">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={baseIframeSrc}
          title="Video Downloader"
          className="w-full h-full min-h-[75vh] sm:min-h-[82vh] lg:min-h-[86vh] border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
          referrerPolicy="origin-when-cross-origin"
          loading="lazy"
        />
      </div>
    </div>
  );
};
