import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

// Pre-seeded star positions (percentage x/y + size variant 0|1|2)
const STARS: Array<{ x: number; y: number; s: 0 | 1 | 2; o: number }> = [
  { x: 4,  y: 3,  s: 0, o: 0.55 }, { x: 12, y: 7,  s: 1, o: 0.40 },
  { x: 22, y: 2,  s: 0, o: 0.70 }, { x: 33, y: 11, s: 2, o: 0.30 },
  { x: 47, y: 5,  s: 0, o: 0.60 }, { x: 58, y: 1,  s: 1, o: 0.50 },
  { x: 68, y: 9,  s: 0, o: 0.45 }, { x: 78, y: 4,  s: 2, o: 0.25 },
  { x: 88, y: 7,  s: 0, o: 0.65 }, { x: 95, y: 2,  s: 1, o: 0.40 },
  { x: 7,  y: 18, s: 1, o: 0.35 }, { x: 18, y: 22, s: 0, o: 0.55 },
  { x: 29, y: 16, s: 2, o: 0.20 }, { x: 41, y: 25, s: 0, o: 0.70 },
  { x: 53, y: 19, s: 1, o: 0.45 }, { x: 63, y: 28, s: 0, o: 0.50 },
  { x: 74, y: 14, s: 2, o: 0.30 }, { x: 85, y: 21, s: 0, o: 0.60 },
  { x: 93, y: 17, s: 1, o: 0.40 }, { x: 2,  y: 32, s: 0, o: 0.55 },
  { x: 15, y: 38, s: 2, o: 0.22 }, { x: 26, y: 35, s: 0, o: 0.65 },
  { x: 37, y: 42, s: 1, o: 0.38 }, { x: 49, y: 33, s: 0, o: 0.72 },
  { x: 60, y: 40, s: 2, o: 0.28 }, { x: 71, y: 36, s: 0, o: 0.58 },
  { x: 82, y: 44, s: 1, o: 0.42 }, { x: 91, y: 31, s: 0, o: 0.50 },
  { x: 5,  y: 52, s: 1, o: 0.35 }, { x: 16, y: 56, s: 0, o: 0.68 },
  { x: 27, y: 49, s: 2, o: 0.23 }, { x: 38, y: 58, s: 0, o: 0.55 },
  { x: 50, y: 53, s: 1, o: 0.44 }, { x: 62, y: 61, s: 0, o: 0.62 },
  { x: 73, y: 47, s: 2, o: 0.27 }, { x: 84, y: 55, s: 0, o: 0.57 },
  { x: 94, y: 63, s: 1, o: 0.38 }, { x: 9,  y: 70, s: 0, o: 0.66 },
  { x: 21, y: 67, s: 2, o: 0.24 }, { x: 32, y: 74, s: 0, o: 0.52 },
  { x: 44, y: 69, s: 1, o: 0.40 }, { x: 55, y: 76, s: 0, o: 0.70 },
  { x: 66, y: 72, s: 2, o: 0.29 }, { x: 77, y: 80, s: 0, o: 0.58 },
  { x: 88, y: 68, s: 1, o: 0.36 }, { x: 3,  y: 85, s: 0, o: 0.60 },
  { x: 14, y: 89, s: 2, o: 0.21 }, { x: 25, y: 82, s: 0, o: 0.55 },
  { x: 36, y: 91, s: 1, o: 0.43 }, { x: 48, y: 87, s: 0, o: 0.67 },
  { x: 59, y: 93, s: 2, o: 0.26 }, { x: 70, y: 86, s: 0, o: 0.54 },
  { x: 81, y: 95, s: 1, o: 0.39 }, { x: 92, y: 88, s: 0, o: 0.63 },
  { x: 11, y: 13, s: 0, o: 0.48 }, { x: 43, y: 46, s: 1, o: 0.33 },
  { x: 67, y: 58, s: 0, o: 0.71 }, { x: 89, y: 77, s: 2, o: 0.19 },
  { x: 23, y: 62, s: 0, o: 0.57 }, { x: 76, y: 29, s: 1, o: 0.41 },
];

const SIZES = [1.5, 2, 3];

export const StarfieldBackground = memo(function StarfieldBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STARS.map((star, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: `${star.x}%` as any,
            top: `${star.y}%` as any,
            width: SIZES[star.s],
            height: SIZES[star.s],
            borderRadius: SIZES[star.s] / 2,
            backgroundColor: '#FFFFFF',
            opacity: star.o,
          }}
        />
      ))}
    </View>
  );
});
