import React, { useState, useEffect } from 'react';
import { 
  Hash, 
  Copy, 
  Check, 
  Sparkles, 
  TrendingUp, 
  Search, 
  Zap, 
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { HashtagItem } from '../types';
import { fetchYouTubeSuggestions, generateHashtagsFromTopic } from '../utils/suggest';

interface HashtagToolProps {
  initialTopic: string;
}

export const HashtagTool: React.FC<HashtagToolProps> = ({ initialTopic }) => {
  const [topic, setTopic] = useState(initialTopic || 'artificial intelligence');
  const [hashtags, setHashtags] = useState<HashtagItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | HashtagItem['category']>('all');

  const handleGenerate = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const suggestions = await fetchYouTubeSuggestions(searchQuery);
      const generated = generateHashtagsFromTopic(searchQuery, suggestions);
      setHashtags(generated);
      // Pre-select top 10 by default
      const defaultSelected = new Set(generated.slice(0, 10).map((h) => h.id));
      setSelectedIds(defaultSelected);
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

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectTopN = (n: number) => {
    const top = new Set(hashtags.slice(0, n).map((h) => h.id));
    setSelectedIds(top);
  };

  const copyTags = (tagList: string[], typeLabel: string) => {
    const text = tagList.join(' ');
    navigator.clipboard.writeText(text);
    setCopiedType(typeLabel);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const selectedList = hashtags.filter((h) => selectedIds.has(h.id)).map((h) => h.tag);
  const filteredHashtags = activeCategory === 'all' 
    ? hashtags 
    : hashtags.filter((h) => h.category === activeCategory);

  const getSafetyStatus = (count: number) => {
    if (count === 0) return { color: 'text-slate-400', label: 'Select hashtags below' };
    if (count <= 3) return { color: 'text-sky-400', label: 'Optimal for Video Title display (Max 3 shown above title)' };
    if (count <= 15) return { color: 'text-emerald-400', label: 'Optimal for YouTube Description indexation (3–15 tags)' };
    if (count <= 50) return { color: 'text-amber-400', label: 'Warning: YouTube may penalize videos with over 15 hashtags' };
    return { color: 'text-red-400', label: 'Over 60 tags: YouTube ignores all hashtags completely!' };
  };

  const safety = getSafetyStatus(selectedIds.size);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>YouTube Hashtag Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Free open-source hashtag intelligence powered by YouTube live search suggestions & niche trend clustering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyTags(selectedList.slice(0, 3), 'top3')}
            disabled={selectedList.length === 0}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            {copiedType === 'top3' ? <Check className="w-3.5 h-3.5 text-emerald-400 inline mr-1" /> : null}
            <span>Copy Top 3 (Title)</span>
          </button>

          <button
            onClick={() => copyTags(selectedList.slice(0, 15), 'top15')}
            disabled={selectedList.length === 0}
            className="px-3.5 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors shadow-xs disabled:opacity-40"
          >
            {copiedType === 'top15' ? <Check className="w-3.5 h-3.5 text-emerald-300 inline mr-1" /> : <Copy className="w-3.5 h-3.5 inline mr-1" />}
            <span>Copy Top 15 (Description)</span>
          </button>
        </div>
      </div>

      {/* Input bar */}
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
              placeholder="Enter video topic, keyword, or niche (e.g. React Tutorial, Gaming, Gym Workout)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {isLoading ? <span className="animate-spin text-sm">⏳</span> : <Sparkles className="w-4 h-4" />}
            <span>Generate Tags</span>
          </button>
        </form>

        {/* Popular Topic Seeds */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500">Quick Seeds:</span>
          {['Python Tutorial', 'Travel Vlog', 'Minecraft Build', 'Weight Loss', 'AI Tools 2026', 'Finance Tips'].map((seed) => (
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

      {/* Selection & Safety Status Box */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Selected:</span>
            <span className="text-sm font-mono font-bold text-white tabular-nums">
              {selectedIds.size} hashtags
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className={`text-xs font-medium ${safety.color}`}>
              {safety.label}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>YouTube displays max 3 tags above the title and ignores all hashtags if video description has &gt;60 tags.</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => selectTopN(3)}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Select Top 3
          </button>
          <button
            onClick={() => selectTopN(15)}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Select Top 15
          </button>
          <button
            onClick={() => setSelectedIds(new Set(hashtags.map((h) => h.id)))}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            All
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All ({hashtags.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('trending')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'trending' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-red-400" />
          <span>Viral & Trending</span>
        </button>

        <button
          onClick={() => setActiveCategory('search')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'search' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-sky-400" />
          <span>Search & How-To</span>
        </button>

        <button
          onClick={() => setActiveCategory('shorts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'shorts' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Shorts Viral</span>
        </button>

        <button
          onClick={() => setActiveCategory('niche')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'niche' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-emerald-400" />
          <span>Niche Suggestions</span>
        </button>
      </div>

      {/* Hashtag Cloud / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filteredHashtags.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleSelect(item.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-red-500/60 shadow-xs ring-1 ring-red-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className={`text-xs font-semibold break-all ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {item.tag}
                </span>
                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                  isSelected ? 'bg-red-600 border-red-500 text-white' : 'border-slate-700 bg-slate-950'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono tabular-nums">
                <span className="capitalize">{item.category}</span>
                <span className={item.reachScore > 90 ? 'text-emerald-400' : 'text-slate-400'}>
                  {item.reachScore}% reach
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Copied Output Preview Box */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Current Formatted Output ({selectedList.length} hashtags)
          </span>
          <button
            onClick={() => copyTags(selectedList, 'selected_all')}
            disabled={selectedList.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors disabled:opacity-40"
          >
            {copiedType === 'selected_all' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All Selected</span>
          </button>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed min-h-[50px] break-words">
          {selectedList.length > 0 ? (
            selectedList.join(' ')
          ) : (
            <span className="text-slate-600 italic">No hashtags selected. Click any tags above to add them to your batch.</span>
          )}
        </div>
      </div>
    </div>
  );
};
