import { ThumbnailQuality, VideoMetadata } from '../types';

/**
 * Extracts a 11-character YouTube video ID from various URL formats or raw ID string.
 */
export function extractVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex covering standard watch, youtu.be shortlinks, shorts, embeds, and live streams
  const patterns = [
    /(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Returns all standard quality thumbnail options for a given video ID.
 */
export function getThumbnailQualities(videoId: string): ThumbnailQuality[] {
  return [
    {
      id: 'maxres',
      name: 'Maximum Resolution (Ultra HD)',
      resolution: '1280 × 720 px',
      aspectRatio: '16:9',
      url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      webpUrl: `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`,
      recommended: true,
      description: 'Highest available fidelity. Ideal for YouTube feed display and 1080p video masters.',
    },
    {
      id: 'sd',
      name: 'Standard Definition (SD)',
      resolution: '640 × 480 px',
      aspectRatio: '4:3',
      url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      webpUrl: `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp`,
      recommended: false,
      description: 'Clear standard resolution. Guaranteed available for nearly all YouTube videos.',
    },
    {
      id: 'hq',
      name: 'High Quality (HQ)',
      resolution: '480 × 360 px',
      aspectRatio: '4:3',
      url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      webpUrl: `https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`,
      recommended: false,
      description: 'Compact high-contrast preview image, great for forum embeds and emails.',
    },
    {
      id: 'mq',
      name: 'Medium Quality (MQ)',
      resolution: '320 × 180 px',
      aspectRatio: '16:9',
      url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      webpUrl: `https://i.ytimg.com/vi_webp/${videoId}/mqdefault.webp`,
      recommended: false,
      description: 'Widescreen 16:9 aspect thumbnail used in mobile video list views.',
    },
    {
      id: 'default',
      name: 'Default Small / Icon',
      resolution: '120 × 90 px',
      aspectRatio: '4:3',
      url: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      recommended: false,
      description: 'Ultra-small thumbnail avatar format for compact cards.',
    },
  ];
}

/**
 * Fetches real video metadata using open oEmbed services.
 */
export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  // Try local proxy endpoint first
  try {
    const res = await fetch(`/api/video-info?url=${encodeURIComponent(watchUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          author_name: data.author_name || 'YouTube Creator',
          author_url: data.author_url || '',
          thumbnail_url: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          provider_name: data.provider_name || 'YouTube',
        };
      }
    }
  } catch {
    // Continue to client direct fallback
  }

  // Direct client fallback to noembed
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          author_name: data.author_name || 'YouTube Creator',
          author_url: data.author_url || '',
          thumbnail_url: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          provider_name: data.provider_name || 'YouTube',
        };
      }
    }
  } catch {
    // No-op
  }

  // Graceful fallback with standard YouTube CDN thumbnail
  return {
    title: `YouTube Video (${videoId})`,
    author_name: 'YouTube Channel',
    thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}

/**
 * Robust image download trigger: attempts blob fetch and a[download],
 * falling back to direct target=_blank navigation.
 */
export async function downloadThumbnailFile(imageUrl: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) throw new Error('Fetch failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    return true;
  } catch {
    // Canvas or Direct anchor fallback
    const a = document.createElement('a');
    a.href = imageUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return false;
  }
}
