/**
 * Converts static StyleSheet.create in each screen to dynamic createStyles(p) pattern.
 * Also adds themeMode + useMemo hook wiring inside each component.
 */
import fs from 'node:fs';

// Map: file → anchor line after which we insert the theme wiring
// The anchor is a string that appears exactly once near the top of the component body
const CONFIG = {
  'src/screens/ChatScreen.tsx': {
    themeImport: `import { Colors, Spacing, Radius, Typography } from '../theme/colors';`,
    themeImportNew: `import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';`,
    reactImport: `import React, { useMemo, useState } from 'react';`,
    reactImportCurrent: `import React, { useMemo, useState } from 'react';`, // already has useMemo
    storeAnchor: `const { chats, unreadCounts, sessionToken } = useWetoStore();`,
    storeAnchorNew: `const { chats, unreadCounts, sessionToken, themeMode } = useWetoStore();\n  const p = getThemeColors(themeMode);\n  const styles = useMemo(() => createStyles(p), [themeMode]);`,
    hasStarfield: true,
    starfieldTarget: `return (\n    <SafeAreaView style={styles.container}>`,
    starfieldNew: `return (\n    <SafeAreaView style={styles.container}>\n      {themeMode === 'dark' && <StarfieldBackground />}`,
  },
  'src/screens/FeedScreen.tsx': {
    themeImport: `import { Colors, Radius, Spacing, Typography } from '../theme/colors';`,
    themeImportNew: `import { Colors, Radius, Spacing, Typography, getThemeColors } from '../theme/colors';`,
    reactImport: `import React, { useCallback, useMemo, useState } from 'react';`,
    reactImportCurrent: `import React, { useCallback, useMemo, useState } from 'react';`, // already has useMemo
    storeAnchor: `  } = useWetoStore();`,
    storeAnchorNew: `    themeMode,\n  } = useWetoStore();\n  const p = getThemeColors(themeMode);\n  const styles = useMemo(() => createStyles(p), [themeMode]);`,
    hasStarfield: true,
    starfieldTarget: `return (\n    <SafeAreaView style={styles.container}>`,
    starfieldNew: `return (\n    <SafeAreaView style={styles.container}>\n      {themeMode === 'dark' && <StarfieldBackground />}`,
  },
  'src/screens/ProfileScreen.tsx': {
    themeImport: `import { Colors, Spacing, Radius, Typography } from '../theme/colors';`,
    themeImportNew: `import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';`,
    reactImport: `import React, { useMemo, useState } from 'react';`,
    reactImportCurrent: null, // may not have useMemo - check
    storeAnchor: `    themeMode,\n    setThemeMode,`,
    storeAnchorNew: `    themeMode,\n    setThemeMode,`,
    afterStore: `  } = useWetoStore();`,
    afterStoreNew: `  } = useWetoStore();\n  const p = getThemeColors(themeMode);\n  const styles = useMemo(() => createStyles(p), [themeMode]);`,
    hasStarfield: true,
    starfieldTarget: null, // ProfileScreen has SafeAreaView - will handle separately
  },
  'src/screens/ContactProfileScreen.tsx': {
    themeImport: `import { Colors, Spacing, Radius, Typography } from '../theme/colors';`,
    themeImportNew: `import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';`,
    hasStarfield: false,
    afterStore: `  } = useWetoStore();`,
    afterStoreNew: `  } = useWetoStore();\n  const p = getThemeColors(themeMode);\n  const styles = useMemo(() => createStyles(p), [themeMode]);`,
  },
  'src/screens/WelcomeScreen.tsx': {
    themeImport: `import { Colors, Spacing, Radius, Typography } from '../theme/colors';`,
    themeImportNew: `import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';`,
    hasStarfield: false,
  },
  'src/screens/ChatDetailScreen.tsx': {
    themeImport: `import { Colors, Radius, Spacing, Typography } from '../theme/colors';`,
    themeImportNew: `import { Colors, Radius, Spacing, Typography, getThemeColors } from '../theme/colors';`,
    hasStarfield: false,
  },
};

// Generic transform: wrap const styles = StyleSheet.create({ ... }); at end of file
function wrapStyleSheet(content) {
  // Replace `const styles = StyleSheet.create({` → function
  content = content.replace(
    /^const styles = StyleSheet\.create\(\{$/m,
    `function createStyles(p: ReturnType<typeof getThemeColors>) {\n  return StyleSheet.create({`
  );
  // Replace the very last `});` in the file
  const lastIdx = content.lastIndexOf('});');
  if (lastIdx !== -1) {
    content = content.slice(0, lastIdx) + '  });\n}' + content.slice(lastIdx + 3);
  }
  return content;
}

for (const [file, cfg] of Object.entries(CONFIG)) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip already done
  if (content.includes('function createStyles(')) {
    console.log(`${file}: SKIP (already done)`);
    continue;
  }

  // 1. Add getThemeColors to theme import
  if (cfg.themeImport && content.includes(cfg.themeImport)) {
    content = content.replace(cfg.themeImport, cfg.themeImportNew);
  }

  // 2. Add StarfieldBackground import if needed
  if (cfg.hasStarfield) {
    const storeImport = `import { useWetoStore } from '../store/useWetoStore';`;
    if (content.includes(storeImport) && !content.includes('StarfieldBackground')) {
      content = content.replace(
        storeImport,
        `${storeImport}\nimport { StarfieldBackground } from '../components/StarfieldBackground';`
      );
    }
  }

  // 3. Wrap StyleSheet.create
  content = wrapStyleSheet(content);

  console.log(`${file}: transformed`);
  fs.writeFileSync(file, content, 'utf8');
}

console.log('Phase 1 done. Now apply per-file hook wiring manually...');
