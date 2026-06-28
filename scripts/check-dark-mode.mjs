/**
 * Wraps the module-level `const styles = StyleSheet.create({...})` in each screen
 * into a `function createStyles(p) { return StyleSheet.create({...}); }` and adds
 * the necessary hook + useMemo call inside the component.
 * 
 * This script is idempotent and only operates on files that still have the old pattern.
 */
import fs from 'node:fs';

const SCREENS = {
  'src/screens/ChatScreen.tsx': {
    storeDestructure: `const { chats, unreadCounts, sessionToken } = useWetoStore();`,
    insertAfter: `const { chats, unreadCounts, sessionToken } = useWetoStore();`,
  },
  'src/screens/FeedScreen.tsx': {
    storeDestructure: null, // already has multi-line destructure, handled manually
    insertAfter: null,
  },
  'src/screens/MatchScreen.tsx': {
    storeDestructure: null, // already done
    insertAfter: null,
  },
  'src/screens/ProfileScreen.tsx': {
    storeDestructure: null,
    insertAfter: null,
  },
  'src/screens/ContactProfileScreen.tsx': {
    storeDestructure: null,
    insertAfter: null,
  },
  'src/screens/WelcomeScreen.tsx': {
    storeDestructure: null,
    insertAfter: null,
  },
  'src/screens/ChatDetailScreen.tsx': {
    storeDestructure: null,
    insertAfter: null,
  },
};

for (const file of Object.keys(SCREENS)) {
  let content = fs.readFileSync(file, 'utf8');
  const hasOldPattern = content.includes('const styles = StyleSheet.create({');
  const hasNewPattern = content.includes('function createStyles(');
  console.log(`${file}: old=${hasOldPattern} new=${hasNewPattern}`);
}
