import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const PLAN_LIMITS = {
  FREE: { exports: 3, quality: 'SD', watermark: true, templates: 'basic' },
  PRO: { exports: Infinity, quality: 'HD', watermark: false, templates: 'all' },
  BUSINESS: { exports: Infinity, quality: 'FHD', watermark: false, templates: 'all' },
  ENTERPRISE: { exports: Infinity, quality: 'UHD', watermark: false, templates: 'all' },
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  COOKING: '🍳 Cooking',
  TRAVEL: '✈️ Travel',
  BABY: '👶 Baby Memories',
  WEDDING: '💒 Wedding',
  PETS: '🐾 Pets',
  FASHION: '👗 Fashion',
  FOOD_BUSINESS: '🍔 Food Business',
  CAFE: '☕ Café',
  FITNESS: '💪 Fitness',
  PRODUCT: '📦 Product Showcase',
  REAL_ESTATE: '🏠 Real Estate',
  FESTIVAL: '🎉 Festival',
  BIRTHDAY: '🎂 Birthday',
  COUPLE: '💑 Couple Memories',
  LUXURY: '✨ Luxury',
  VLOG: '🎬 Vlog',
  OTHER: '📹 Other',
};

export const MOOD_LABELS: Record<string, string> = {
  CINEMATIC: '🎥 Cinematic',
  EMOTIONAL: '💝 Emotional',
  LUXURY: '👑 Luxury',
  COZY: '☕ Cozy',
  VIRAL: '🔥 Viral',
  FAST_PACED: '⚡ Fast-paced',
  DREAMY: '🌙 Dreamy',
  RETRO: '📺 Retro',
  MINIMAL: '⬜ Minimal',
  DOCUMENTARY: '📽️ Documentary',
  AESTHETIC: '🌸 Aesthetic',
};
