import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Copy, 
  Check, 
  Clock, 
  FileText, 
  Sliders, 
  Plus, 
  Trash2,
  TrendingUp,
  BookmarkPlus
} from 'lucide-react';
import { 
  analyzeTitle, 
  calculateComprehensiveSeoAudit, 
  generateTitleFormulas, 
  formatChaptersAsText,
  parseChaptersFromText
} from '../utils/seo';
import { Chapter, VideoMetadata } from '../types';

interface SeoHelperToolProps {
  initialTitle?: string;
  initialVideoMetadata?: VideoMetadata | null;
}

export const SeoHelperTool: React.FC<SeoHelperToolProps> = ({
  initialTitle = '',
  initialVideoMetadata,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'title' | 'description' | 'chapters'>('audit');
  
  // SEO state
  const [videoTitle, setVideoTitle] = useState(
    initialTitle || initialVideoMetadata?.title || 'How to Learn Web Development in 2026 [Complete Beginner Roadmap]'
  );
  const [videoDescription, setVideoDescription] = useState(
    `In this complete web development tutorial for 2026, we break down the step-by-step roadmap to become a full-stack engineer from scratch.\n\n` +
    `📌 Timestamps:\n00:00 - Introduction & Industry Overview\n01:45 - HTML, CSS & Modern Tailwind\n04:30 - JavaScript & TypeScript Fundamentals\n08:15 - React & Next.js Frameworks\n12:00 - Backend, Databases & Cloud\n15:30 - How to Land Your First Job\n\n` +
    `🔗 Resources & Links:\n- Complete Roadmap PDF: https://example.com/roadmap\n- Source Code Repository: https://github.com/example/web-dev-2026\n\n` +
    `🔔 Don't forget to subscribe for weekly coding tutorials: https://youtube.com/@example\n\n` +
    `#WebDevelopment #CodingTutorial #LearnToCode #React #Shorts`
  );
  const [tagsString, setTagsString] = useState(
    'web development, learn to code, javascript tutorial, react 2026, full stack roadmap, programming for beginners, html css, frontend engineer'
  );
  const [hasCustomThumbnail, setHasCustomThumbnail] = useState(true);

  // Chapters builder state
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: '1', timestamp: '00:00', title: 'Introduction & Overview' },
    { id: '2', timestamp: '02:15', title: 'Core Concepts Explained' },
    { id: '3', timestamp: '06:40', title: 'Live Demonstration & Setup' },
    { id: '4', timestamp: '11:20', title: 'Best Practices & Pitfalls' },
    { id: '5', timestamp: '15:45', title: 'Final Summary & Next Steps' },
  ]);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Update when external video metadata arrives
  useEffect(() => {
    if (initialVideoMetadata?.title) {
      setVideoTitle(initialVideoMetadata.title);
    }
  }, [initialVideoMetadata]);

  // Title analysis
  const titleAnalysis = analyzeTitle(videoTitle);

  // Run audit
  const auditResult = calculateComprehensiveSeoAudit({
    title: videoTitle,
    description: videoDescription,
    tagsString,
    hasThumbnail: hasCustomThumbnail,
    chaptersCount: chapters.length,
  });

  const titleFormulas = generateTitleFormulas(
    videoTitle.replace(/\[.*?\]|\(.*?\)/g, '').trim() || 'Your Topic'
  );

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleAddChapter = () => {
    setChapters([
      ...chapters,
      { id: Date.now().toString(), timestamp: '00:00', title: 'New Chapter' },
    ]);
  };

  const handleRemoveChapter = (id: string) => {
    setChapters(chapters.filter((c) => c.id !== id));
  };

  const handleUpdateChapter = (id: string, field: 'timestamp' | 'title', value: string) => {
    setChapters(
      chapters.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Sync chapters with description
  const handleInsertChaptersIntoDescription = () => {
    const formatted = formatChaptersAsText(chapters);
    const updated = `${videoDescription}\n\n📌 Video Chapters:\n${formatted}`;
    setVideoDescription(updated);
    handleCopy(formatted, 'chapters');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>YouTube SEO Score & Creator Optimizer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit your video metadata, elevate click-through rates with bracket power hooks, and build algorithmic descriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">SEO Health:</span>
            <span className={`text-base font-bold font-mono tabular-nums ${
              auditResult.totalScore >= 80 
                ? 'text-emerald-400' 
                : auditResult.totalScore >= 50 
                ? 'text-amber-400' 
                : 'text-red-400'
            }`}>
              {auditResult.totalScore} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'audit' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>SEO Health Audit ({auditResult.totalScore}%)</span>
        </button>

        <button
          onClick={() => setActiveTab('title')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'title' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>Title CTR Analyzer & Formulas</span>
        </button>

        <button
          onClick={() => setActiveTab('description')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'description' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>Description Template Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'chapters' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>Chapters & Timestamps</span>
        </button>
      </div>

      {/* TAB 1: SEO AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Quick Inputs Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-white">Live Video Metadata Checklist</h2>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Video Title</span>
                  <span className="text-slate-500 font-mono tabular-nums">{videoTitle.length} / 70 chars</span>
                </div>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Description</span>
                  <span className="text-slate-500 font-mono tabular-nums">
                    {videoDescription.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 transition-colors resize-y font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex-1 min-w-[240px]">
                  <span className="text-xs text-slate-300 font-medium block mb-1">Studio Tags (comma-separated)</span>
                  <input
                    type="text"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCustomThumbnail}
                      onChange={(e) => setHasCustomThumbnail(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-red-600 focus:ring-0"
                    />
                    <span>Custom HD Thumbnail Active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Result Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">
              Diagnostic Audit Breakdown ({auditResult.checks.length} signals tested)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {auditResult.checks.map((check) => {
                const isPassed = check.status === 'passed';
                const isWarning = check.status === 'warning';

                return (
                  <div
                    key={check.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {isWarning && <AlertCircle className="w-4 h-4 text-amber-400" />}
                          {!isPassed && !isWarning && <XCircle className="w-4 h-4 text-red-400" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white">{check.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{check.detail}</p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold tabular-nums text-slate-300 shrink-0">
                        {check.score}/{check.maxScore}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-300 font-medium">Recommendation: </span>
                      {check.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TITLE CTR ANALYZER & FORMULAS */}
      {activeTab === 'title' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Title CTR Potential Inspector</h2>
              <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                CTR Score: {titleAnalysis.ctrScore} / 100
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter or paste your YouTube video title..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 font-medium transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                {titleAnalysis.length} chars
              </span>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">Length Evaluation</span>
                <span className={`font-semibold capitalize ${
                  titleAnalysis.lengthStatus === 'optimal' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {titleAnalysis.lengthStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">Bracket Hook</span>
                <span className={`font-semibold ${titleAnalysis.hasBrackets ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {titleAnalysis.hasBrackets ? 'Present (+30% CTR)' : 'None detected'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">Power Words</span>
                <span className={`font-semibold ${titleAnalysis.hasPowerWord ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {titleAnalysis.powerWordsFound.length > 0 
                    ? titleAnalysis.powerWordsFound.slice(0, 2).join(', ') 
                    : 'None detected'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-1">Year / Number</span>
                <span className={`font-semibold ${titleAnalysis.hasNumberOrYear ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {titleAnalysis.hasNumberOrYear ? 'Included' : 'None detected'}
                </span>
              </div>
            </div>
          </div>

          {/* High-CTR Title Formulas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">
                High-Converting Title Variations Based on Your Topic
              </h3>
              <span className="text-xs text-slate-500">Click to apply to your video</span>
            </div>

            <div className="space-y-2">
              {titleFormulas.map((formula, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 group transition-colors"
                >
                  <p className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {formula}
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setVideoTitle(formula)}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                    >
                      Use Title
                    </button>
                    <button
                      onClick={() => handleCopy(formula, `formula_${idx}`)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                      title="Copy title"
                    >
                      {copiedType === `formula_${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DESCRIPTION TEMPLATE BUILDER */}
      {activeTab === 'description' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">YouTube Description Template Engine</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Follows YouTube's algorithmic 6-part description structure (Hook, Chapters, Links, Socials, Tags, Disclaimer).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInsertChaptersIntoDescription}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Insert Chapters</span>
                </button>

                <button
                  onClick={() => handleCopy(videoDescription, 'full_desc')}
                  className="px-3.5 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {copiedType === 'full_desc' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Complete Description</span>
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* TAB 4: CHAPTERS & TIMESTAMPS */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">Video Chapters & Key Moments Generator</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  YouTube requires: Starts at 00:00, at least 3 chapters, and each segment at least 10 seconds long.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddChapter}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Timestamp</span>
                </button>

                <button
                  onClick={() => handleCopy(formatChaptersAsText(chapters), 'chapters_text')}
                  className="px-3.5 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {copiedType === 'chapters_text' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Timestamps</span>
                </button>
              </div>
            </div>

            {/* Chapter rows */}
            <div className="space-y-2">
              {chapters.map((chap, idx) => (
                <div
                  key={chap.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3"
                >
                  <span className="text-xs font-mono text-slate-500 w-6 tabular-nums">{idx + 1}.</span>
                  
                  <input
                    type="text"
                    value={chap.timestamp}
                    onChange={(e) => handleUpdateChapter(chap.id, 'timestamp', e.target.value)}
                    placeholder="00:00"
                    className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-center text-white focus:outline-none focus:border-red-500"
                  />

                  <input
                    type="text"
                    value={chap.title}
                    onChange={(e) => handleUpdateChapter(chap.id, 'title', e.target.value)}
                    placeholder="Chapter Title..."
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-red-500"
                  />

                  <button
                    onClick={() => handleRemoveChapter(chap.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
