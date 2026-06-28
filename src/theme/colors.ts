export const Colors = {
  background: '#F6F8FB',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  accent: '#7CCBFF',
  accentLight: '#EEF8FF',
  buttonNeutral: '#FFFFFF',
  buttonNeutralText: '#7CCBFF',
  buttonNeutralHover: '#F9F9F9',
  border: '#E6EBF0',
  categoryBadgeBg: '#EEF8FF',
  categoryBadgeText: '#7CCBFF',
  success: '#7CCBFF',
  matchGold: '#CDEBFF',
  tabActive: '#7CCBFF',
  tabInactive: '#A0AAB6',
  tabBar: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.04)',
  overlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  skeletonBase: '#EDEBE7',
  skeletonHighlight: '#F4F2EE',

  // Category colors
  Social: { bg: '#F3F9FD', text: '#7CCBFF' },
  Absurd: { bg: '#F3F9FD', text: '#7CCBFF' },
  Values: { bg: '#F3F9FD', text: '#7CCBFF' },
  Relationship: { bg: '#F3F9FD', text: '#7CCBFF' },
} as const;

export const DarkColors = {
  background: '#020510',
  card: '#060D1E',
  text: '#F0F4FF',
  textSecondary: '#8BAED4',
  textMuted: '#5A7A9E',
  accent: '#7CCBFF',
  accentLight: 'rgba(124,203,255,0.16)',
  buttonNeutral: '#0C1830',
  buttonNeutralText: '#D0EAFF',
  buttonNeutralHover: '#0F1F3C',
  border: '#132040',
  categoryBadgeBg: 'rgba(124,203,255,0.13)',
  categoryBadgeText: '#7CCBFF',
  success: '#7CCBFF',
  matchGold: '#7CCBFF',
  tabActive: '#7CCBFF',
  tabInactive: '#4A6885',
  tabBar: '#030916',
  shadow: 'rgba(0,0,0,0.6)',
  overlay: 'rgba(0,0,0,0.75)',
  white: '#FFFFFF',
  skeletonBase: '#0A1628',
  skeletonHighlight: '#112038',
  Social: { bg: 'rgba(124,203,255,0.12)', text: '#7CCBFF' },
  Absurd: { bg: 'rgba(124,203,255,0.12)', text: '#7CCBFF' },
  Values: { bg: 'rgba(124,203,255,0.12)', text: '#7CCBFF' },
  Relationship: { bg: 'rgba(124,203,255,0.12)', text: '#7CCBFF' },
} as const;

export function getThemeColors(mode: 'light' | 'dark') {
  return mode === 'dark' ? DarkColors : Colors;
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 50,
  full: 9999,
} as const;

export const Typography = {
  title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '700' as const },
  h2: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  captionBold: { fontSize: 13, fontWeight: '600' as const },
  small: { fontSize: 11, fontWeight: '500' as const },
} as const;
