import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserVector, TraitKey } from '../types';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';
import { trackEvent } from '../utils/analytics';

// ─── Template rules — no LLM, as per guide ──────────────────────────

type InsightTemplate = {
  condition: (v: UserVector) => boolean;
  headline: string;
  body: string;
};

const TRAIT_LABELS: Record<TraitKey, string> = {
  sociability: 'le lien social',
  humor: 'l\'humour',
  risk: 'la prise de risque',
  emotion: 'l\'émotion',
  conflict: 'le conflit',
  stability: 'la stabilité',
};

const INSIGHT_TEMPLATES: InsightTemplate[] = [
  {
    condition: (v) => v.stability > 70 && v.risk < 40,
    headline: 'Tu préfères la clarté au frisson ambigu.',
    body: 'Tes réponses montrent une forte tendance à sécuriser le cadre avant d\'explorer. Ce n\'est pas de la prudence — c\'est de la cohérence.',
  },
  {
    condition: (v) => v.humor > 70 && v.emotion < 45,
    headline: 'Tu te protèges par l\'humour.',
    body: 'Là où d\'autres exposent une émotion brute, tu glisses une note légère. Weto le lit comme un filtre, pas une fuite.',
  },
  {
    condition: (v) => v.emotion > 70 && v.stability < 50,
    headline: 'Tu ressens vite, tu recalibres ensuite.',
    body: 'Tes réponses réagissent d\'abord à l\'affect. La réflexion arrive juste après. Ce tempo émotionnel est rare.',
  },
  {
    condition: (v) => v.risk > 70 && v.conflict > 60,
    headline: 'Tu traverses les zones grises sans cligner des yeux.',
    body: 'Les dilemmes inconfortables ne te freinent pas. Weto détecte une tolérance à l\'ambiguïté bien au-dessus de la moyenne.',
  },
  {
    condition: (v) => v.sociability > 75 && v.conflict < 40,
    headline: 'Tu veux le lien mais pas l\'affrontement.',
    body: 'Tes choix privilégient systématiquement la connexion douce. Ton signal est chaleureux et peu menaçant — et c\'est un atout rare.',
  },
  {
    condition: (v) => v.conflict > 70 && v.sociability < 50,
    headline: 'Tu dis ce que tu penses, même seul contre tous.',
    body: 'Tes réponses ne cherchent pas le consensus. Weto lit ça comme une indépendance relationnelle assumée.',
  },
  {
    condition: (v) => v.stability > 68 && v.emotion > 65,
    headline: 'Tu aimes profondément et tu tiens debout.',
    body: 'Stabilité haute, réactivité émotionnelle forte : tu es le type de personne qui ressent sans se noyer. Signal équilibré et difficile à trouver.',
  },
  {
    condition: () => true, // fallback
    headline: 'Ton profil prend forme.',
    body: 'Chaque dilemme affine le signal. Weto commence à distinguer ce qui compte vraiment pour toi — pas juste ce que tu dis, mais comment tu réagis.',
  },
];

function getInsight(vector: UserVector): InsightTemplate {
  return INSIGHT_TEMPLATES.find((t) => t.condition(vector)) ?? INSIGHT_TEMPLATES[INSIGHT_TEMPLATES.length - 1];
}

// ─── Component ───────────────────────────────────────────────────────

interface InsightCardProps {
  vector: UserVector;
  answeredCount: number;
  onDismiss: () => void;
}

const APP_LINK = 'https://weto-app.netlify.app';

export function InsightCard({ vector, answeredCount, onDismiss }: InsightCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const insight = useMemo(() => getInsight(vector), [vector]);

  if (dismissed) return null;

  const handleDismiss = () => {
    trackEvent('insight_dismissed', { answeredCount });
    setDismissed(true);
    onDismiss();
  };

  const handleShare = async () => {
    trackEvent('insight_shared', { answeredCount });
    const text = `"${insight.headline}"\n\n${insight.body}\n\nDécouvre ton signal sur Weto : ${APP_LINK}`;
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: 'Mon signal Weto', text, url: APP_LINK }).catch(() => {});
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        Alert.alert('Copié !', 'Ton insight Weto a été copié.');
      }
    } else {
      await Share.share({ message: text });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✦ Signal détecté</Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn} activeOpacity={0.7}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headline}>{insight.headline}</Text>
      <Text style={styles.body}>{insight.body}</Text>

      <Text style={styles.meta}>Après {answeredCount} dilemmes</Text>

      <TouchableOpacity style={styles.shareBtn} onPress={() => { void handleShare(); }} activeOpacity={0.85}>
        <Text style={styles.shareBtnText}>Partager mon signal →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(124,203,255,0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#0D6EFD',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 22,
    lineHeight: 22,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  body: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 21,
  },
  meta: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  shareBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
