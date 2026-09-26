import { HashtagItem, KeywordItem } from '../types';

/**
 * Robust YouTube live autocompletion fetcher with multi-tier fallback.
 */
export async function fetchYouTubeSuggestions(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Tier 1: Local API proxy
  try {
    const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Proceed to Tier 2
  }

  // Tier 2: Dynamic JSONP script to official YouTube suggest endpoint
  try {
    const suggestions = await fetchJsonpSuggestions(trimmed);
    if (suggestions.length > 0) {
      return suggestions;
    }
  } catch {
    // Proceed to Tier 3
  }

  // Tier 3: High-quality heuristic creator keyword expansion
  return generateHeuristicSuggestions(trimmed);
}

/**
 * JSONP executor for YouTube complete search
 */
function fetchJsonpSuggestions(query: string): Promise<string[]> {
  return new Promise((resolve) => {
    const callbackName = `ytSuggest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement('script');
    let timeoutId: number | null = null;

    // Timeout safety after 3 seconds
    timeoutId = window.setTimeout(() => {
      cleanup();
      resolve([]);
    }, 3000);

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      try {
        if (Array.isArray(data) && Array.isArray(data[1])) {
          // Client youtube JSONP format: [query, [[term1, ...], [term2, ...]]]
          const results = data[1].map((item: unknown) => {
            if (Array.isArray(item) && typeof item[0] === 'string') return item[0];
            if (typeof item === 'string') return item;
            return '';
          }).filter(Boolean);
          resolve(results);
          return;
        }
      } catch {
        // Fallback
      }
      resolve([]);
    };

    script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}&jsonp=${callbackName}`;
    script.onerror = () => {
      cleanup();
      resolve([]);
    };
    document.head.appendChild(script);
  });
}

/**
 * Creator expansion engine when offline or no direct network response
 */
function generateHeuristicSuggestions(topic: string): string[] {
  const clean = topic.toLowerCase().trim();
  const year = new Date().getFullYear();
  return [
    clean,
    `${clean} tutorial`,
    `how to ${clean}`,
    `${clean} for beginners`,
    `best ${clean} ${year}`,
    `${clean} tips and tricks`,
    `${clean} full course`,
    `${clean} explained`,
    `${clean} review`,
    `${clean} step by step`,
    `${clean} vs alternatives`,
    `${clean} mistakes to avoid`,
    `${clean} secrets`,
    `learn ${clean} fast`,
    `${clean} roadmap`,
  ];
}

/**
 * Converts a raw search phrase into a valid, high-impact YouTube hashtag.
 */
export function formatAsHashtag(phrase: string): string {
  // Strip non-alphanumeric, camelCase words
  const words = phrase
    .replace(/[^\w\s]/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '#';

  const camelCased = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');

  return `#${camelCased}`;
}

/**
 * Generates categorized hashtags from a seed query and suggestions.
 */
export function generateHashtagsFromTopic(topic: string, suggestions: string[]): HashtagItem[] {
  const cleanedTopic = topic.trim();
  if (!cleanedTopic) return [];

  const items: HashtagItem[] = [];
  const seen = new Set<string>();

  const addTag = (raw: string, category: HashtagItem['category'], reach: number) => {
    const formatted = formatAsHashtag(raw);
    const lower = formatted.toLowerCase();
    if (formatted.length > 2 && !seen.has(lower)) {
      seen.add(lower);
      items.push({
        id: `ht_${items.length}_${Math.random().toString(36).substring(2, 6)}`,
        tag: formatted,
        category,
        reachScore: reach,
      });
    }
  };

  // 1. Trending & Viral Core
  addTag(cleanedTopic, 'trending', 98);
  addTag(`${cleanedTopic}Viral`, 'trending', 94);
  addTag(`${cleanedTopic}Trending`, 'trending', 91);
  addTag('YouTubeCreator', 'trending', 89);
  addTag('TrendingNow', 'trending', 85);

  // 2. High Search / Intent
  addTag(`${cleanedTopic}Tutorial`, 'search', 96);
  addTag(`HowTo${cleanedTopic}`, 'search', 93);
  addTag(`${cleanedTopic}Guide`, 'search', 90);
  addTag(`${cleanedTopic}Tips`, 'search', 88);
  addTag(`Learn${cleanedTopic}`, 'search', 86);
  addTag(`${cleanedTopic}ForBeginners`, 'search', 84);

  // 3. Shorts Specific
  addTag('Shorts', 'shorts', 99);
  addTag('YouTubeShorts', 'shorts', 97);
  addTag('ShortsFeed', 'shorts', 95);
  addTag(`${cleanedTopic}Shorts`, 'shorts', 92);
  addTag('ViralShorts', 'shorts', 87);

  // 4. Incorporate live suggestions
  suggestions.forEach((sugg, idx) => {
    if (idx < 8) {
      addTag(sugg, 'niche', Math.max(70, 95 - idx * 3));
    }
  });

  // Additional niche long-tails
  addTag(`${cleanedTopic}Review`, 'niche', 82);
  addTag(`${cleanedTopic}Secrets`, 'niche', 79);
  addTag(`${cleanedTopic}Community`, 'niche', 75);

  return items;
}

/**
 * Expands queries into 4 keyword buckets (Autosuggest, Questions, Comparisons, Long-Tail).
 */
export async function generateKeywordClusters(topic: string): Promise<KeywordItem[]> {
  const baseSuggestions = await fetchYouTubeSuggestions(topic);
  const questionSuggestions = await fetchYouTubeSuggestions(`how to ${topic}`);
  const comparisonSuggestions = await fetchYouTubeSuggestions(`best ${topic}`);

  const items: KeywordItem[] = [];
  const seen = new Set<string>();

  const addKw = (keyword: string, type: KeywordItem['type'], relevance: number) => {
    const clean = keyword.trim().toLowerCase();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      items.push({
        id: `kw_${items.length}_${Math.random().toString(36).substring(2, 6)}`,
        keyword: clean,
        type,
        relevance,
      });
    }
  };

  // Base suggestions
  addKw(topic, 'autosuggest', 100);
  baseSuggestions.forEach((s, idx) => {
    addKw(s, 'autosuggest', Math.max(65, 96 - idx * 2));
  });

  // Question keywords
  const standardQuestions = [
    `how to ${topic}`,
    `why use ${topic}`,
    `what is ${topic}`,
    `how to learn ${topic} fast`,
    `how ${topic} works`,
  ];
  standardQuestions.forEach((q) => addKw(q, 'question', 90));
  questionSuggestions.forEach((q) => addKw(q, 'question', 88));

  // Comparisons and reviews
  const standardComparisons = [
    `best ${topic}`,
    `${topic} review`,
    `${topic} vs alternative`,
    `${topic} pros and cons`,
    `${topic} honest opinion`,
  ];
  standardComparisons.forEach((c) => addKw(c, 'comparison', 87));
  comparisonSuggestions.forEach((c) => addKw(c, 'comparison', 85));

  // Long-tail & beginner keywords
  const longTails = [
    `${topic} tutorial for beginners`,
    `${topic} complete guide 2026`,
    `${topic} step by step tutorial`,
    `${topic} mistakes to avoid`,
    `${topic} tips and tricks`,
  ];
  longTails.forEach((lt) => addKw(lt, 'longtail', 80));

  return items;
}
