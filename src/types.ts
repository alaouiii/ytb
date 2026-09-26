export type ToolTab = 'downloader' | 'thumbnails' | 'hashtags' | 'keywords' | 'seo';

export interface VideoMetadata {
  title: string;
  author_name: string;
  author_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  provider_name?: string;
  html?: string;
}

export interface ThumbnailQuality {
  id: string;
  name: string;
  resolution: string;
  aspectRatio: string;
  url: string;
  webpUrl?: string;
  recommended: boolean;
  description: string;
}

export interface HashtagItem {
  id: string;
  tag: string;
  category: 'trending' | 'search' | 'niche' | 'shorts';
  reachScore: number;
}

export interface KeywordItem {
  id: string;
  keyword: string;
  type: 'autosuggest' | 'question' | 'comparison' | 'longtail';
  relevance: number;
}

export interface SeoCheck {
  id: string;
  title: string;
  status: 'passed' | 'warning' | 'failed';
  score: number;
  maxScore: number;
  recommendation: string;
  detail: string;
}

export interface Chapter {
  id: string;
  timestamp: string;
  title: string;
}
