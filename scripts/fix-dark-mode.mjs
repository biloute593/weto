import fs from 'node:fs';

const screens = [
  'src/screens/ChatScreen.tsx',
  'src/screens/FeedScreen.tsx',
  'src/screens/ProfileScreen.tsx',
  'src/screens/ContactProfileScreen.tsx',
  'src/screens/WelcomeScreen.tsx',
  'src/screens/ChatDetailScreen.tsx',
];

const replacements = [
  ['Colors.background', 'p.background'],
  ['Colors.card', 'p.card'],
  ['Colors.textSecondary', 'p.textSecondary'],
  ['Colors.textMuted', 'p.textMuted'],
  ['Colors.accentLight', 'p.accentLight'],
  ['Colors.border', 'p.border'],
  ['Colors.success', 'p.success'],
  ['Colors.overlay', 'p.overlay'],
  ['Colors.shadow', 'p.shadow'],
  ['Colors.white', 'p.white'],
  ['Colors.skeletonBase', 'p.skeletonBase'],
  ['Colors.skeletonHighlight', 'p.skeletonHighlight'],
  ['Colors.matchGold', 'p.matchGold'],
  ['Colors.tabBar', 'p.tabBar'],
  ['Colors.tabActive', 'p.tabActive'],
  ['Colors.tabInactive', 'p.tabInactive'],
  ['Colors.buttonNeutral', 'p.buttonNeutral'],
  ['Colors.buttonNeutralText', 'p.buttonNeutralText'],
];

for (const file of screens) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    content = content.replaceAll(from, to);
  }
  // Handle Colors.accent and Colors.text carefully (avoid partial matches already replaced)
  content = content.replace(/Colors\.accent\b/g, 'p.accent');
  content = content.replace(/Colors\.text\b/g, 'p.text');
  fs.writeFileSync(file, content, 'utf8');
  const remaining = [...content.matchAll(/Colors\.\w+/g)].map(m => m[0]).filter(m => !m.includes('[')).join(', ');
  console.log(`${file}: remaining=${remaining || 'NONE'}`);
}
console.log('Done.');
