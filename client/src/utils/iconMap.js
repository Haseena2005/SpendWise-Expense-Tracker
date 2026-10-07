export const ICON_OPTIONS = [
  { key: 'briefcase',    emoji: '💼' },
  { key: 'laptop',       emoji: '💻' },
  { key: 'building',     emoji: '🏢' },
  { key: 'trending-up',  emoji: '📈' },
  { key: 'plus-circle',  emoji: '➕' },
  { key: 'utensils',     emoji: '🍽️' },
  { key: 'car',          emoji: '🚗' },
  { key: 'shopping-bag', emoji: '🛍️' },
  { key: 'file-text',    emoji: '📄' },
  { key: 'book-open',    emoji: '📚' },
  { key: 'film',         emoji: '🎬' },
  { key: 'heart-pulse',  emoji: '❤️‍🩹' },
  { key: 'home',         emoji: '🏠' },
  { key: 'minus-circle', emoji: '➖' },
  { key: 'tag',          emoji: '🏷️' },
  { key: 'coffee',       emoji: '☕' },
  { key: 'music',        emoji: '🎵' },
  { key: 'gift',         emoji: '🎁' },
  { key: 'plane',        emoji: '✈️' },
  { key: 'star',         emoji: '⭐' },
];

export const COLOR_OPTIONS = [
  '#10B981','#EF4444','#6366F1','#F59E0B','#EC4899',
  '#8B5CF6','#06B6D4','#F97316','#14B8A6','#64748B',
  '#3B82F6','#84CC16','#D946EF','#0EA5E9','#FB923C',
];

export function getIconEmoji(key) {
  return ICON_OPTIONS.find(i => i.key === key)?.emoji || '🏷️';
}
