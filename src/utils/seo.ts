import { Chapter, SeoCheck } from '../types';

export const POWER_WORDS = [
  'ultimate', 'secret', 'proven', 'step-by-step', 'masterclass', 'complete', 
  'essential', 'fast', 'easy', 'simple', 'best', 'guide', 'revealed', 
  'guaranteed', 'instant', 'tricks', 'hacks', 'mistakes', 'stop', 'how to'
];

export const EMOTIONAL_WORDS = [
  'insane', 'shocking', 'crazy', 'truth', 'warning', 'honest', 'game-changer', 
  'mind-blowing', 'unbelievable', 'danger', 'exposed', 'never'
];

export interface TitleAnalysis {
  length: number;
  lengthStatus: 'optimal' | 'good' | 'too_short' | 'too_long';
  hasPowerWord: boolean;
  powerWordsFound: string[];
  hasEmotionalWord: boolean;
  emotionalWordsFound: string[];
  hasBrackets: boolean;
  hasNumberOrYear: boolean;
  capitalizationStyle: 'good' | 'all_caps' | 'all_lower';
  ctrScore: number; // 0 - 100
}

export function analyzeTitle(title: string): TitleAnalysis {
  const trimmed = title.trim();
  const len = trimmed.length;
  const lower = trimmed.toLowerCase();

  // Length scoring
  let lengthStatus: TitleAnalysis['lengthStatus'] = 'good';
  if (len === 0) lengthStatus = 'too_short';
  else if (len >= 45 && len <= 70) lengthStatus = 'optimal';
  else if (len < 30) lengthStatus = 'too_short';
  else if (len > 85) lengthStatus = 'too_long';

  // Words detection
  const powerWordsFound = POWER_WORDS.filter((pw) => lower.includes(pw));
  const emotionalWordsFound = EMOTIONAL_WORDS.filter((ew) => lower.includes(ew));

  // Brackets / Parentheses
  const hasBrackets = /[[({].*?[\])}]/.test(trimmed);

  // Numbers or Year (2024-2030 or digits)
  const hasNumberOrYear = /\b(?:\d+|202[4-9]|203[0-5])\b/.test(trimmed);

  // Capitalization
  let capitalizationStyle: TitleAnalysis['capitalizationStyle'] = 'good';
  if (len > 8 && trimmed === trimmed.toUpperCase()) {
    capitalizationStyle = 'all_caps';
  } else if (len > 8 && trimmed === trimmed.toLowerCase()) {
    capitalizationStyle = 'all_lower';
  }

  // Calculate CTR potential score (0 - 100)
  let score = 30;
  if (lengthStatus === 'optimal') score += 25;
  else if (lengthStatus === 'good') score += 15;
  
  if (powerWordsFound.length > 0) score += 15;
  if (hasBrackets) score += 15; // Proven to lift CTR
  if (hasNumberOrYear) score += 10;
  if (emotionalWordsFound.length > 0) score += 10;
  if (capitalizationStyle === 'all_caps') score -= 15; // YouTube discourages all caps shouting

  return {
    length: len,
    lengthStatus,
    hasPowerWord: powerWordsFound.length > 0,
    powerWordsFound,
    hasEmotionalWord: emotionalWordsFound.length > 0,
    emotionalWordsFound,
    hasBrackets,
    hasNumberOrYear,
    capitalizationStyle,
    ctrScore: Math.min(100, Math.max(10, score)),
  };
}

export function generateTitleFormulas(topic: string): string[] {
  const clean = topic.trim() || 'Your Topic';
  const year = new Date().getFullYear();

  return [
    `How to Master ${clean} in ${year} (Step-by-Step Guide)`,
    `The Only ${clean} Tutorial You Will Ever Need [Complete]`,
    `Stop Making This Huge ${clean} Mistake (Do This Instead)`,
    `7 ${clean} Secrets That Changed Everything for Me`,
    `${clean} vs The Competition: The Brutally Honest Truth`,
    `How I Learned ${clean} in 30 Days (Full Roadmap)`,
    `Top 5 ${clean} Tips for Beginners [${year} Edition]`,
    `Why Nobody Tells You the Truth About ${clean}`,
  ];
}

export interface SeoAuditParams {
  title: string;
  description: string;
  tagsString: string;
  hasThumbnail: boolean;
  chaptersCount: number;
}

export function calculateComprehensiveSeoAudit(params: SeoAuditParams): {
  totalScore: number;
  checks: SeoCheck[];
} {
  const { title, description, tagsString, hasThumbnail, chaptersCount } = params;
  const checks: SeoCheck[] = [];
  const titleAnalysis = analyzeTitle(title);

  // Check 1: Title Length & CTR Hook (Max 20 pts)
  if (titleAnalysis.lengthStatus === 'optimal') {
    checks.push({
      id: 'title_length',
      title: 'Optimal Title Length (45–70 Characters)',
      status: 'passed',
      score: 20,
      maxScore: 20,
      detail: `Your title is ${titleAnalysis.length} characters. Fits cleanly on YouTube mobile and desktop without truncation.`,
      recommendation: 'Keep this length for peak CTR.',
    });
  } else if (titleAnalysis.lengthStatus === 'good') {
    checks.push({
      id: 'title_length',
      title: 'Acceptable Title Length',
      status: 'warning',
      score: 14,
      maxScore: 20,
      detail: `Your title is ${titleAnalysis.length} characters. Optimal sweet spot is 45-70 characters.`,
      recommendation: 'Adjust length between 50 and 65 characters to maximize readability on mobile search.',
    });
  } else {
    checks.push({
      id: 'title_length',
      title: 'Title Length Needs Optimization',
      status: 'failed',
      score: 5,
      maxScore: 20,
      detail: `Title is ${titleAnalysis.length} characters (${titleAnalysis.length < 30 ? 'too short' : 'too long'}).`,
      recommendation: 'Target 50–70 characters with primary keyword in first 35 characters.',
    });
  }

  // Check 2: CTR Booster: Brackets & Power Words (Max 15 pts)
  let ctrPoints = 0;
  if (titleAnalysis.hasBrackets) ctrPoints += 8;
  if (titleAnalysis.hasPowerWord) ctrPoints += 7;

  if (ctrPoints >= 15) {
    checks.push({
      id: 'title_ctr_boosters',
      title: 'High-Impact CTR Elements (Brackets & Power Words)',
      status: 'passed',
      score: 15,
      maxScore: 15,
      detail: `Title contains bracket qualifiers and high-intent power words (${titleAnalysis.powerWordsFound.join(', ')}).`,
      recommendation: 'Proven to increase initial click-through rate by up to 33%.',
    });
  } else if (ctrPoints > 0) {
    checks.push({
      id: 'title_ctr_boosters',
      title: 'Partial CTR Boosters in Title',
      status: 'warning',
      score: 9,
      maxScore: 15,
      detail: titleAnalysis.hasBrackets 
        ? 'Brackets detected. Add a high-intent power word (e.g. "Complete", "Fast", "Secret").'
        : 'Power word detected. Add bracket qualifiers like [Full Guide] or (Step-by-Step).',
      recommendation: 'Combine both brackets and a power word for maximum click intent.',
    });
  } else {
    checks.push({
      id: 'title_ctr_boosters',
      title: 'Missing CTR Boosters',
      status: 'failed',
      score: 3,
      maxScore: 15,
      detail: 'No power words or bracket qualifiers detected.',
      recommendation: 'Add bracket qualifiers like [Tutorial], (2026), or words like "Proven", "Complete", "Ultimate".',
    });
  }

  // Check 3: Description Word Count & Depth (Max 15 pts)
  const descWords = description.trim().split(/\s+/).filter(Boolean).length;
  if (descWords >= 180) {
    checks.push({
      id: 'desc_depth',
      title: 'Rich Description Depth (>180 Words)',
      status: 'passed',
      score: 15,
      maxScore: 15,
      detail: `Your description contains ${descWords} words. Provides deep semantic signals for YouTube's search and recommendation algorithms.`,
      recommendation: 'Excellent description depth.',
    });
  } else if (descWords >= 60) {
    checks.push({
      id: 'desc_depth',
      title: 'Moderate Description Length',
      status: 'warning',
      score: 9,
      maxScore: 15,
      detail: `Description contains ${descWords} words. YouTube recommends 200+ words to index relevant long-tail search queries.`,
      recommendation: 'Expand with key takeaways, resources, and video summary.',
    });
  } else {
    checks.push({
      id: 'desc_depth',
      title: 'Thin Video Description (<60 Words)',
      status: 'failed',
      score: 3,
      maxScore: 15,
      detail: `Description has only ${descWords} words. Thin descriptions hurt search ranking on YouTube and Google.`,
      recommendation: 'Write at least 2 paragraphs explaining what viewers will learn, plus links and gear used.',
    });
  }

  // Check 4: Video Chapters / Timestamps (Max 15 pts)
  if (chaptersCount >= 3) {
    checks.push({
      id: 'chapters',
      title: 'Video Chapters & Timestamps Configured',
      status: 'passed',
      score: 15,
      maxScore: 15,
      detail: `${chaptersCount} timestamps detected. Enables YouTube Key Moments on Google Search and scrub bar segments.`,
      recommendation: 'Video is eligible for Google Search video carousel chapters.',
    });
  } else {
    checks.push({
      id: 'chapters',
      title: 'Missing or Incomplete Chapters',
      status: 'failed',
      score: 2,
      maxScore: 15,
      detail: `${chaptersCount} timestamps found (minimum 3 required starting with 00:00).`,
      recommendation: 'Add at least 3 chapters in format "00:00 Intro" to enable YouTube video scrub bar markers.',
    });
  }

  // Check 5: YouTube Studio Tags Utilization (Max 15 pts)
  const tagsList = tagsString.split(',').map((t) => t.trim()).filter(Boolean);
  const totalTagChars = tagsList.join(', ').length;
  if (totalTagChars >= 250 && totalTagChars <= 500) {
    checks.push({
      id: 'studio_tags',
      title: 'Optimized YouTube Studio Tags (250–500 chars)',
      status: 'passed',
      score: 15,
      maxScore: 15,
      detail: `${tagsList.length} tags totaling ${totalTagChars}/500 characters. Perfect balance of broad and specific search tags.`,
      recommendation: 'Tags well balanced.',
    });
  } else if (totalTagChars > 500) {
    checks.push({
      id: 'studio_tags',
      title: 'Tags Exceed 500 Character Limit',
      status: 'failed',
      score: 4,
      maxScore: 15,
      detail: `Tags total ${totalTagChars} characters. YouTube Studio will reject tags exceeding 500 characters.`,
      recommendation: 'Remove a few less relevant tags to get under 500 characters.',
    });
  } else if (totalTagChars > 80) {
    checks.push({
      id: 'studio_tags',
      title: 'Tag Character Capacity Underutilized',
      status: 'warning',
      score: 8,
      maxScore: 15,
      detail: `${totalTagChars}/500 characters used. You have room for additional long-tail keyword variations.`,
      recommendation: 'Use the Keywords Generator to add more search phrases.',
    });
  } else {
    checks.push({
      id: 'studio_tags',
      title: 'Missing Studio Video Tags',
      status: 'failed',
      score: 2,
      maxScore: 15,
      detail: 'No tags or fewer than 80 characters provided.',
      recommendation: 'Populate 300+ characters of tags to capture related search queries and common misspellings.',
    });
  }

  // Check 6: Custom HD Thumbnail (Max 10 pts)
  if (hasThumbnail) {
    checks.push({
      id: 'thumbnail',
      title: 'Custom High-Resolution Thumbnail Attached',
      status: 'passed',
      score: 10,
      maxScore: 10,
      detail: 'Custom 1280x720 16:9 thumbnail active. Thumbnails drive over 90% of best-performing videos.',
      recommendation: 'Ensure focal subject is high contrast with bold readable text.',
    });
  } else {
    checks.push({
      id: 'thumbnail',
      title: 'Missing Custom Thumbnail',
      status: 'failed',
      score: 2,
      maxScore: 10,
      detail: 'No custom thumbnail uploaded or detected.',
      recommendation: 'Use our Thumbnail Downloader or designer to prepare a 1280x720 custom graphic.',
    });
  }

  // Check 7: Hashtag Compliance (Max 10 pts)
  const hashtagMatches = (description.match(/#[a-zA-Z0-9_]+/g) || []);
  if (hashtagMatches.length >= 2 && hashtagMatches.length <= 15) {
    checks.push({
      id: 'hashtags_compliance',
      title: 'Hashtag Count Within Safe Limit (2–15 tags)',
      status: 'passed',
      score: 10,
      maxScore: 10,
      detail: `${hashtagMatches.length} hashtags detected in description. Complies with YouTube policy.`,
      recommendation: 'First 3 hashtags will display prominently above or near video title.',
    });
  } else if (hashtagMatches.length > 15) {
    checks.push({
      id: 'hashtags_compliance',
      title: 'Too Many Hashtags (>15 tags)',
      status: 'failed',
      score: 3,
      maxScore: 10,
      detail: `${hashtagMatches.length} hashtags detected. YouTube policy states videos with >15 hashtags may have ALL hashtags ignored.`,
      recommendation: 'Reduce hashtags to between 3 and 10 relevant tags.',
    });
  } else {
    checks.push({
      id: 'hashtags_compliance',
      title: 'Add 2–5 Relevant Hashtags',
      status: 'warning',
      score: 4,
      maxScore: 10,
      detail: `${hashtagMatches.length} hashtags found. Include at least 2-3 topic hashtags.`,
      recommendation: 'Add hashtags like #Tutorial #Tech at the bottom of description.',
    });
  }

  const totalScore = checks.reduce((acc, c) => acc + c.score, 0);

  return {
    totalScore: Math.min(100, Math.round(totalScore)),
    checks,
  };
}

export function parseChaptersFromText(text: string): Chapter[] {
  const lines = text.split('\n');
  const chapters: Chapter[] = [];
  const regex = /(\b\d{1,2}:\d{2}(?::\d{2})?\b)\s*[-–—:]?\s*(.+)/;

  lines.forEach((line) => {
    const match = line.match(regex);
    if (match) {
      chapters.push({
        id: `ch_${chapters.length}`,
        timestamp: match[1],
        title: match[2].trim(),
      });
    }
  });

  return chapters;
}

export function formatChaptersAsText(chapters: Chapter[]): string {
  return chapters.map((c) => `${c.timestamp} - ${c.title}`).join('\n');
}
