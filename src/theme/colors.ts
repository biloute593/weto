export const Colors = {
  background: '#F4F2EE',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  accent: '#007AFF',
  accentLight: '#E8F2FF',
  buttonNeutral: '#FFFFFF',
  buttonNeutralText: '#007AFF',
  buttonNeutralHover: '#F9F9F9',
  border: '#E5E5E5',
  categoryBadgeBg: '#E8F2FF',
  categoryBadgeText: '#007AFF',
  success: '#34C759',
  matchGold: '#FFD700',
  tabActive: '#007AFF',
  tabInactive: '#A0A0A0',
  tabBar: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.04)',
  overlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  skeletonBase: '#EDEBE7',
  skeletonHighlight: '#F4F2EE',

  // Category colors
  Social: { bg: '#E8F2FF', text: '#007AFF' },
  Absurd: { bg: '#F3E8FF', text: '#7C3AED' },
  Values: { bg: '#E8F9EE', text: '#059669' },
  Relationship: { bg: '#FFE8F0', text: '#E11D48' },
} as const;

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
