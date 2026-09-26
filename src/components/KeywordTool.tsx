import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  Sparkles, 
  Plus, 
  X, 
  Search, 
  HelpCircle, 
  Scale, 
  ArrowUpDown,
  Trash2,
  Zap
} from 'lucide-react';
import { KeywordItem } from '../types';
import { generateKeywordClusters } from '../utils/suggest';

interface KeywordToolProps {
  initialTopic: string;
}

export const KeywordTool: React.FC<KeywordToolProps> = ({ initialTopic }) => {
  const [topic, setTopic] = useState(initialTopic || 'web development');
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [studioTags, setStudioTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<'all' | KeywordItem['type']>('all');

  const handleGenerate = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const clusters = await generateKeywordClusters(query);
      setKeywords(clusters);
      
      // Seed studio tags with top keywords up to ~400 chars
      const initialTags: string[] = [];
      let currentLen = 0;
      for (const item of clusters) {
        const tagLen = item.keyword.length + (initialTags.length > 0 ? 2 : 0);
        if (currentLen + tagLen <= 420) {
          initialTags.push(item.keyword);
          currentLen += tagLen;
        }
      }
      setStudioTags(initialTags);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      handleGenerate(initialTopic);
    } else {
      handleGenerate(topic);
    }
  }, [initialTopic]);

  // Compute total tag length formatted as comma-separated (YouTube Studio style)
  const formattedStudioTags = studioTags.join(', ');
  const characterCount = formattedStudioTags.length;
  const maxLimit = 500;
  const isOverLimit = characterCount > maxLimit;

  const handleAddTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (!clean) return;
    if (studioTags.includes(clean)) return;
    setStudioTags([...studioTags, clean]);
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setStudioTags(studioTags.filter((t) => t !== tagToRemove));
  };

  const handleAddAllUntilLimit = () => {
    const updated = [...studioTags];
    let len = updated.join(', ').length;

    for (const k of keywords) {
      if (!updated.includes(k.keyword)) {
        const addedLen = k.keyword.length + (updated.length > 0 ? 2 : 0);
        if (len + addedLen <= maxLimit) {
          updated.push(k.keyword);
          len += addedLen;
        }
      }
    }
    setStudioTags(updated);
  };

  const handleCopyForStudio = () => {
    if (studioTags.length === 0) return;
    navigator.clipboard.writeText(formattedStudioTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredKeywords = filterType === 'all'
    ? keywords
    : keywords.filter((k) => k.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>YouTube Keywords & Video Tags Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time YouTube search suggestions mapped into question keywords, comparisons, and 500-character Studio tags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddAllUntilLimit}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Fill to 500 Chars</span>
          </button>

          <button
            onClick={handleCopyForStudio}
            disabled={studioTags.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All for YouTube Studio</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate(topic);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter seed topic for YouTube tags (e.g. Next.js, Photography, Keto Diet)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {isLoading ? <span className="animate-spin text-sm">⏳</span> : <Sparkles className="w-4 h-4" />}
            <span>Fetch Keywords</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500">Popular Queries:</span>
          {['Python Tutorial', 'Vlog Editing', 'Valorant Highlights', 'Affiliate Marketing', 'How to Cook Steak'].map((seed) => (
            <button
              key={seed}
              type="button"
              onClick={() => {
                setTopic(seed);
                handleGenerate(seed);
              }}
              className="hover:text-red-400 transition-colors cursor-pointer"
            >
              {seed} <span className="text-slate-600">·</span>
            </button>
          ))}
        </div>
      </div>

      {/* YouTube Studio 500-Character Tag Manager Box */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">YouTube Studio Tags Box</span>
            <span className="text-xs text-slate-500">· Ready for direct paste into YouTube Video Details</span>
          </div>

          {/* Character Progress Counter */}
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverLimit
                    ? 'bg-red-500'
                    : characterCount > 400
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (characterCount / maxLimit) * 100)}%` }}
              />
            </div>

            <span className={`text-xs font-mono tabular-nums font-semibold ${
              isOverLimit ? 'text-red-400' : 'text-slate-300'
            }`}>
              {characterCount} / {maxLimit} chars
            </span>

            <button
              onClick={() => setStudioTags([])}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title="Clear all tags"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tag Pills Container */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 min-h-[100px] flex flex-wrap gap-2 items-center">
          {studioTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-200 border border-slate-700"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Add custom tag input */}
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                handleAddTag(customTagInput);
              }
            }}
            placeholder={studioTags.length === 0 ? "Type tag & hit Enter..." : "+ Add more tags..."}
            className="flex-1 min-w-[140px] bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none py-1"
          />
        </div>

        {isOverLimit && (
          <p className="text-xs text-red-400 font-medium">
            Warning: Tags exceed 500 characters by {characterCount - maxLimit} chars. YouTube Studio will reject this tag list until shortened.
          </p>
        )}
      </div>

      {/* Suggested Keyword Clusters & Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Suggestions ({keywords.length})
            </button>

            <button
              onClick={() => setFilterType('autosuggest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === 'autosuggest' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>Autosuggest</span>
            </button>

            <button
              onClick={() => setFilterType('question')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === 'question' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Questions</span>
            </button>

            <button
              onClick={() => setFilterType('comparison')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === 'comparison' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              <span>Comparisons</span>
            </button>

            <button
              onClick={() => setFilterType('longtail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === 'longtail' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Long-Tail</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">
            Click any keyword to add to Studio tags
          </span>
        </div>

        {/* Keywords Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredKeywords.map((item) => {
            const isAlreadyAdded = studioTags.includes(item.keyword);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isAlreadyAdded) {
                    handleRemoveTag(item.keyword);
                  } else {
                    handleAddTag(item.keyword);
                  }
                }}
                className={`p-3 rounded-lg border text-left transition-all duration-150 flex items-center justify-between gap-2 ${
                  isAlreadyAdded
                    ? 'bg-slate-800/80 border-slate-700 opacity-60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {item.keyword}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 capitalize">
                    {item.type} · {item.relevance}% relevance
                  </p>
                </div>

                <div className="shrink-0">
                  {isAlreadyAdded ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-400 hover:text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
