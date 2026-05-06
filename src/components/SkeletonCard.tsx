import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius } from '../theme/colors';

export function SkeletonCard() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const bgColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.skeletonBase, Colors.skeletonHighlight],
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.badge, { backgroundColor: bgColor }]} />
        <Animated.View style={[styles.counter, { backgroundColor: bgColor }]} />
      </View>
      <Animated.View style={[styles.line, styles.lineWide, { backgroundColor: bgColor }]} />
      <Animated.View style={[styles.line, styles.lineMid, { backgroundColor: bgColor }]} />
      <Animated.View style={[styles.line, styles.lineNarrow, { backgroundColor: bgColor }]} />
      <View style={styles.buttonsContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View key={i} style={[styles.button, { backgroundColor: bgColor }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  badge: {
    width: 70,
    height: 24,
    borderRadius: Radius.pill,
  },
  counter: {
    width: 30,
    height: 24,
    borderRadius: Radius.sm,
  },
  line: {
    height: 16,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  lineWide: { width: '95%' },
  lineMid: { width: '80%' },
  lineNarrow: { width: '60%', marginBottom: Spacing.lg },
  buttonsContainer: {
    gap: Spacing.sm,
  },
  button: {
    height: 52,
    borderRadius: Radius.pill,
  },
});
