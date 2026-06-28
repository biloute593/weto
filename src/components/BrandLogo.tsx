import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme/colors';

type BrandLogoVariant = 'hero' | 'header' | 'compact';
type BrandLogoAlign = 'left' | 'center';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  align?: BrandLogoAlign;
}

const BRAND_LOGO_CONFIG: Record<BrandLogoVariant, {
  orb: number;
  badge: number;
  wordmark: number;
  spacing: number;
  tracking: number;
  subtitle: boolean;
}> = {
  hero: {
    orb: 46,
    badge: 20,
    wordmark: 28,
    spacing: 14,
    tracking: 3.2,
    subtitle: true,
  },
  header: {
    orb: 34,
    badge: 16,
    wordmark: 22,
    spacing: 10,
    tracking: 2.2,
    subtitle: false,
  },
  compact: {
    orb: 28,
    badge: 13,
    wordmark: 18,
    spacing: 8,
    tracking: 1.6,
    subtitle: false,
  },
};

function BrandHeartGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.86} viewBox="0 0 21 18" fill="none">
      <Path
        d="M10.5 16.55C4.16 12.29 1.38 9.56 1.38 6.12c0-2.39 1.84-4.3 4.2-4.3 1.77 0 3.38.99 4.92 3.02 1.54-2.03 3.15-3.02 4.92-3.02 2.36 0 4.2 1.91 4.2 4.3 0 3.44-2.78 6.17-9.12 10.43Z"
        fill="#1F6FFF"
      />
      <Circle cx={14.9} cy={5.25} r={1.22} fill="#FFFFFF" opacity={0.92} />
    </Svg>
  );
}

export function BrandLogo({ variant = 'hero', align = 'center' }: BrandLogoProps) {
  const config = BRAND_LOGO_CONFIG[variant];

  return (
    <View style={[styles.root, align === 'center' ? styles.rootCenter : styles.rootLeft]}>
      <View style={[styles.lockup, { gap: config.spacing }]}> 
        <View style={styles.markWrap}>
          <View
            style={[
              styles.markOrb,
              {
                width: config.orb,
                height: config.orb,
                borderRadius: config.orb / 2,
              },
            ]}
          >
            <Text style={[styles.markLetter, { fontSize: config.orb * 0.44 }]}>W</Text>
          </View>
          <View
            style={[
              styles.markBadge,
              {
                width: config.badge,
                height: config.badge,
                borderRadius: config.badge / 2,
              },
            ]}
          >
            <BrandHeartGlyph size={config.badge * 0.8} />
          </View>
        </View>

        <View style={styles.wordmarkWrap}>
          <Text
            style={[
              styles.wordmark,
              {
                fontSize: config.wordmark,
                letterSpacing: config.tracking,
              },
            ]}
          >
            WETO
          </Text>
          {config.subtitle ? (
            <Text style={styles.signature}>Dilemmes. Compatibilités. Vrai signal.</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  rootCenter: {
    alignItems: 'center',
  },
  rootLeft: {
    alignItems: 'flex-start',
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markWrap: {
    position: 'relative',
    paddingRight: 4,
  },
  markOrb: {
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D6EFD',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  markLetter: {
    color: Colors.white,
    fontWeight: '900',
    letterSpacing: -1,
  },
  markBadge: {
    position: 'absolute',
    right: -2,
    bottom: -1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F6FFF',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  wordmarkWrap: {
    gap: 2,
  },
  wordmark: {
    color: Colors.text,
    fontWeight: '900',
  },
  signature: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
});