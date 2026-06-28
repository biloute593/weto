import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppButton } from '../components/AppButton';
import { ProgressRing } from '../components/ProgressRing';
import { trackEvent } from '../utils/analytics';

type LandingSignalTone = 'clarity' | 'care' | 'risk' | 'stability';

type LandingDilemmaChoice = {
  label: string;
  signalTitle: string;
  signalBody: string;
  takeaway: string;
  traits: Array<{ label: string; value: number; tone: LandingSignalTone }>;
};

type LandingDilemma = {
  id: string;
  kicker: string;
  question: string;
  choices: LandingDilemmaChoice[];
};

const LANDING_SIGNAL_COLORS: Record<LandingSignalTone, { bg: string; fill: string; text: string }> = {
  clarity: { bg: '#E9F1FF', fill: '#1F6FFF', text: '#1F6FFF' },
  care: { bg: '#EAF8F0', fill: '#2C9B66', text: '#2C9B66' },
  risk: { bg: '#FFF1E6', fill: '#F58A28', text: '#C86208' },
  stability: { bg: '#F0ECFF', fill: '#7A5AF8', text: '#7A5AF8' },
};

const LANDING_DILEMMAS: LandingDilemma[] = [
  {
    id: 'ex-text',
    kicker: 'Premier signal',
    question: 'Vous êtes en couple. Un ex vous écrit : “Tu me manques”. Vous répondez ?',
    choices: [
      {
        label: 'Je ne réponds pas.',
        signalTitle: 'Tu protèges d’abord le cadre.',
        signalBody: 'Ta première lecture passe par la stabilité et les limites. Weto y voit un signal de clarté avant la curiosité.',
        takeaway: 'Signal immédiat : tu privilégies le cadre clair au frisson ambigu.',
        traits: [
          { label: 'Stabilité', value: 82, tone: 'stability' },
          { label: 'Gestion des limites', value: 78, tone: 'clarity' },
          { label: 'Tolérance au risque', value: 33, tone: 'risk' },
        ],
      },
      {
        label: 'Je réponds, mais je garde mes distances.',
        signalTitle: 'Tu veux comprendre sans t’exposer totalement.',
        signalBody: 'Tu ouvres une porte contrôlée. Le signal n’est ni fuyant ni impulsif : il cherche l’information avant l’emballement.',
        takeaway: 'Signal immédiat : tu testes la zone grise sans lâcher ton centre.',
        traits: [
          { label: 'Clarté relationnelle', value: 69, tone: 'clarity' },
          { label: 'Tolérance au risque', value: 56, tone: 'risk' },
          { label: 'Réactivité émotionnelle', value: 49, tone: 'care' },
        ],
      },
      {
        label: 'Je lui dis clairement que je suis en couple.',
        signalTitle: 'Tu préfères la vérité explicite au flou élégant.',
        signalBody: 'Le signal dominant est net : tu réduis l’ambiguïté rapidement, même si ça crée un petit inconfort frontal.',
        takeaway: 'Signal immédiat : tu privilégies l’alignement aux demi-messages.',
        traits: [
          { label: 'Clarté relationnelle', value: 86, tone: 'clarity' },
          { label: 'Gestion des conflits', value: 63, tone: 'care' },
          { label: 'Stabilité', value: 74, tone: 'stability' },
        ],
      },
      {
        label: 'Je vois d’abord où il ou elle veut en venir.',
        signalTitle: 'Tu lis l’intention avant de décider du cadre.',
        signalBody: 'Ton signal immédiat penche vers l’exploration. Weto le lit comme une curiosité plus forte que l’évitement automatique.',
        takeaway: 'Signal immédiat : tu explores d’abord, tu clôtures ensuite.',
        traits: [
          { label: 'Tolérance au risque', value: 76, tone: 'risk' },
          { label: 'Lecture sociale', value: 67, tone: 'care' },
          { label: 'Stabilité', value: 44, tone: 'stability' },
        ],
      },
    ],
  },
  {
    id: 'friend-secret',
    kicker: 'Second angle',
    question: 'Un ami te confie un secret sensible. Ton groupe insiste pour savoir. Tu fais quoi ?',
    choices: [
      {
        label: 'Je garde le secret, point.',
        signalTitle: 'Tu tiens la ligne même sous pression sociale.',
        signalBody: 'Le signal dominant est la loyauté structurée. Tu supportes la tension du groupe sans céder tout de suite au confort collectif.',
        takeaway: 'Signal immédiat : tu privilégies la cohérence à l’adhésion facile.',
        traits: [
          { label: 'Stabilité', value: 79, tone: 'stability' },
          { label: 'Loyauté', value: 88, tone: 'clarity' },
          { label: 'Tolérance au risque', value: 38, tone: 'risk' },
        ],
      },
      {
        label: 'Je donne juste le minimum pour calmer le groupe.',
        signalTitle: 'Tu arbitres entre paix sociale et fidélité.',
        signalBody: 'Weto lit ici une stratégie d’équilibre : tu cherches à contenir la pression sans aller jusqu’à la trahison totale.',
        takeaway: 'Signal immédiat : tu ajustes le cadre plutôt que de le casser.',
        traits: [
          { label: 'Gestion sociale', value: 73, tone: 'care' },
          { label: 'Clarté relationnelle', value: 54, tone: 'clarity' },
          { label: 'Tolérance au risque', value: 51, tone: 'risk' },
        ],
      },
      {
        label: 'Je retourne la pression sur ceux qui insistent.',
        signalTitle: 'Tu préfères l’affrontement net à l’érosion lente.',
        signalBody: 'Le signal monte sur la confrontation assumée : tu coupes court plutôt que de laisser le groupe grignoter le cadre.',
        takeaway: 'Signal immédiat : tu défends fort quand une limite est menacée.',
        traits: [
          { label: 'Gestion des conflits', value: 81, tone: 'clarity' },
          { label: 'Stabilité', value: 62, tone: 'stability' },
          { label: 'Réactivité émotionnelle', value: 58, tone: 'care' },
        ],
      },
    ],
  },
  {
    id: 'last-minute-date',
    kicker: 'Troisième lecture',
    question: 'Quelqu’un annule un date important au dernier moment avec “désolé, journée compliquée”. Ta réaction ?',
    choices: [
      {
        label: 'Je laisse passer une fois et j’observe la suite.',
        signalTitle: 'Tu ne sur-réagis pas au premier faux pas.',
        signalBody: 'Le signal est souple sans être naïf. Tu laisses une chance, mais ton radar reste actif sur la cohérence à venir.',
        takeaway: 'Signal immédiat : patience stratégique plutôt que retrait immédiat.',
        traits: [
          { label: 'Stabilité', value: 76, tone: 'stability' },
          { label: 'Lecture sociale', value: 64, tone: 'care' },
          { label: 'Tolérance au risque', value: 46, tone: 'risk' },
        ],
      },
      {
        label: 'Je demande franchement si cette personne est vraiment impliquée.',
        signalTitle: 'Tu veux de la clarté tout de suite.',
        signalBody: 'Weto lit un besoin rapide d’alignement. Tu préfères un mini-frisson de vérité à trois semaines de confusion élégante.',
        takeaway: 'Signal immédiat : tu coupes l’ambiguïté avant qu’elle s’installe.',
        traits: [
          { label: 'Clarté relationnelle', value: 89, tone: 'clarity' },
          { label: 'Gestion des conflits', value: 66, tone: 'care' },
          { label: 'Tolérance au risque', value: 57, tone: 'risk' },
        ],
      },
      {
        label: 'Je décroche mentalement et je passe à autre chose.',
        signalTitle: 'Tu fermes vite quand la fiabilité baisse.',
        signalBody: 'Le signal dominant est la protection. Tu privilégies le retrait propre plutôt que le pari émotionnel prolongé.',
        takeaway: 'Signal immédiat : ton système préfère perdre tôt que s’user longtemps.',
        traits: [
          { label: 'Protection émotionnelle', value: 81, tone: 'care' },
          { label: 'Stabilité', value: 61, tone: 'stability' },
          { label: 'Tolérance au risque', value: 28, tone: 'risk' },
        ],
      },
    ],
  },
];

const AVATARS = {
  lea: 'https://randomuser.me/api/portraits/women/68.jpg',
  thomas: 'https://randomuser.me/api/portraits/men/32.jpg',
  emma: 'https://randomuser.me/api/portraits/women/44.jpg',
  julien: 'https://randomuser.me/api/portraits/men/76.jpg',
  chloe: 'https://randomuser.me/api/portraits/women/65.jpg',
};

const PROFILE_TRAITS = [
  { label: 'Sociabilité', value: 72 },
  { label: 'Réactivité émotionnelle', value: 48 },
  { label: 'Tolérance au risque', value: 65 },
  { label: 'Style d’humour', value: 80 },
  { label: 'Gestion des conflits', value: 50 },
  { label: 'Stabilité', value: 77 },
];

const CHAT_THREADS = [
  { name: 'Léa', avatar: AVATARS.lea, text: 'Haha, j’aurais jamais pensé répondre pareil.', time: '09:41' },
  { name: 'Thomas', avatar: AVATARS.thomas, text: 'Ce dilemme était intense', time: 'Hier' },
  { name: 'Emma', avatar: AVATARS.emma, text: 'On est grave sync sur ça !', time: 'Hier' },
  { name: 'Julien', avatar: AVATARS.julien, text: 'Tu veux qu’on en parle ?', time: '2j' },
  { name: 'Chloé', avatar: AVATARS.chloe, text: 'Hâte d’en découvrir plus sur toi.', time: '2j' },
];

const REALITY_PILLARS = [
  {
    title: 'Tu réagis avant de te vendre.',
    body: 'Le premier signal vient d’un choix concret. Pas d’une bio optimisée, pas d’une photo retouchée, pas d’un personnage.',
  },
  {
    title: 'La compatibilité part de ta manière de trancher.',
    body: 'Weto lit ce que tu fais face au flou, au risque, à la loyauté et à la clarté pour proposer des connexions plus cohérentes.',
  },
  {
    title: 'Les conversations démarrent avec de la matière.',
    body: 'Chaque dilemme peut devenir un angle de discussion naturel, donc moins de small talk vide et plus de vrai relief.',
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Réponds à des dilemmes qui comptent.',
    body: 'Relationnel, social, absurde ou tendu: chaque scénario cherche une réaction réelle, pas une réponse “jolie”.',
  },
  {
    step: '02',
    title: 'Regarde ton signal apparaître.',
    body: 'Clarté, stabilité, gestion des limites, tolérance au risque: Weto transforme une réaction en lecture immédiatement utile.',
  },
  {
    step: '03',
    title: 'Entre en conversation avec un vrai point d’entrée.',
    body: 'Les profils, les matchs et les DM s’appuient ensuite sur des réponses concrètes plutôt que sur des slogans personnels.',
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'Weto, c’est quoi exactement ?',
    answer:
      'Weto est une application de rencontre basée sur des dilemmes interactifs. Au lieu de commencer par une longue inscription ou une bio, tu réagis à des situations concrètes et l’app construit ton signal à partir de ça.',
  },
  {
    question: 'Pourquoi commencer par un dilemme avant l’inscription ?',
    answer:
      'Parce que c’est là que la promesse devient réelle. Tu vois d’abord ce que Weto lit chez toi, puis tu décides si ce signal mérite d’être sauvegardé.',
  },
  {
    question: 'Weto remplace complètement les profils ?',
    answer:
      'Non. Les profils restent utiles, mais ils arrivent après un premier niveau de vérité. L’idée est de réduire la façade et d’augmenter la matière relationnelle.',
  },
  {
    question: 'À quoi servent les matchs sur Weto ?',
    answer:
      'Les matchs servent à relier des personnes qui réagissent avec une compatibilité intéressante sur des tensions concrètes: loyauté, humour, clarté, gestion du risque ou des conflits.',
  },
] as const;

export function WebLandingScreen({ onStart }: { onStart: () => void }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1320;
  const isTablet = width >= 820;
  const isCompact = width < 1320;
  const [activeDilemmaIndex, setActiveDilemmaIndex] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const activeDilemma = LANDING_DILEMMAS[activeDilemmaIndex];
  const selectedChoice = selectedChoiceIndex !== null ? activeDilemma.choices[selectedChoiceIndex] : null;

  const nextDilemmaLabel = useMemo(() => {
    const nextDilemma = LANDING_DILEMMAS[(activeDilemmaIndex + 1) % LANDING_DILEMMAS.length];
    return nextDilemma.kicker.toLowerCase();
  }, [activeDilemmaIndex]);

  useEffect(() => {
    trackEvent('landing_viewed', {
      surface: 'desktop-web',
      dilemmaId: activeDilemma.id,
    });
  }, []);

  const handleSelectChoice = (index: number) => {
    const choice = activeDilemma.choices[index];
    setSelectedChoiceIndex(index);
    trackEvent('landing_dilemma_answered', {
      surface: 'desktop-web',
      dilemmaId: activeDilemma.id,
      choiceIndex: index,
      choiceLabel: choice.label,
    });
  };

  const handleCycleDilemma = () => {
    const nextIndex = (activeDilemmaIndex + 1) % LANDING_DILEMMAS.length;
    trackEvent('landing_dilemma_rotated', {
      surface: 'desktop-web',
      fromDilemmaId: activeDilemma.id,
      toDilemmaId: LANDING_DILEMMAS[nextIndex].id,
    });
    setActiveDilemmaIndex((currentIndex) => (currentIndex + 1) % LANDING_DILEMMAS.length);
    setSelectedChoiceIndex(null);
  };

  const handleStart = () => {
    if (!selectedChoice) {
      return;
    }

    trackEvent('landing_signup_cta_clicked', {
      surface: 'desktop-web',
      dilemmaId: activeDilemma.id,
      choiceIndex: selectedChoiceIndex,
    });
    onStart();
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={[styles.layout, isCompact && styles.layoutStacked]}>
        <View style={[styles.heroColumn, isCompact && styles.heroColumnStacked, !isTablet && styles.heroColumnMobile]}>
          <View style={styles.brandWrap}>
            <Text style={styles.brand}>Weto</Text>
            <View style={styles.brandHeartBadge}>
              <BrandHeart />
            </View>
          </View>
          <Text style={styles.heroTitle}>Avant les profils, il y a{`\n`}tes réactions réelles.</Text>

          <View style={styles.heroLeadWrap}>
            <Text style={styles.heroLeadEyebrow}>Teste Weto en 12 secondes</Text>
            <Text style={styles.heroLeadText}>
              Réponds à un vrai dilemme et regarde le signal apparaître avant même de créer ton compte.
            </Text>
          </View>

          <View style={styles.instantCard}>
            <View style={styles.instantCardTop}>
              <View style={styles.instantBadge}>
                <Text style={styles.instantBadgeText}>{activeDilemma.kicker}</Text>
              </View>
              <Text style={styles.instantTopNote}>Aucune sauvegarde avant ton compte</Text>
            </View>

            <Text style={styles.instantQuestion}>{activeDilemma.question}</Text>

            <View style={styles.instantChoicesWrap}>
              {activeDilemma.choices.map((choice, index) => {
                const isSelected = selectedChoiceIndex === index;
                return (
                  <TouchableOpacity
                    key={choice.label}
                    style={[styles.instantChoice, isSelected && styles.instantChoiceSelected]}
                    activeOpacity={0.84}
                    onPress={() => handleSelectChoice(index)}
                  >
                    <Text style={[styles.instantChoiceText, isSelected && styles.instantChoiceTextSelected]}>{choice.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedChoice ? (
              <View style={styles.instantSignalPanel}>
                <View style={styles.instantSignalHeader}>
                  <Text style={styles.instantSignalEyebrow}>Signal immédiat</Text>
                  <Text style={styles.instantSignalTitle}>{selectedChoice.signalTitle}</Text>
                </View>
                <Text style={styles.instantSignalBody}>{selectedChoice.signalBody}</Text>

                <View style={styles.instantTraitsWrap}>
                  {selectedChoice.traits.map((trait) => {
                    const tone = LANDING_SIGNAL_COLORS[trait.tone];
                    return (
                      <View key={trait.label} style={styles.instantTraitRow}>
                        <View style={styles.instantTraitHead}>
                          <Text style={styles.instantTraitLabel}>{trait.label}</Text>
                          <Text style={[styles.instantTraitValue, { color: tone.text }]}>{trait.value}%</Text>
                        </View>
                        <View style={[styles.instantTraitTrack, { backgroundColor: tone.bg }]}>
                          <View style={[styles.instantTraitFill, { width: `${trait.value}%`, backgroundColor: tone.fill }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.instantTakeaway}>{selectedChoice.takeaway}</Text>
              </View>
            ) : (
              <View style={styles.instantSignalPlaceholder}>
                <Text style={styles.instantSignalPlaceholderText}>
                  Choisis une réaction et Weto te montre le type de signal qu’elle déclenche immédiatement.
                </Text>
              </View>
            )}

            <View style={styles.instantActions}>
              <AppButton
                title={selectedChoice ? 'Créer mon compte pour sauvegarder' : 'Réponds pour voir ton signal'}
                onPress={handleStart}
                fullWidth
                disabled={!selectedChoice}
                style={styles.instantPrimaryAction}
              />
              <TouchableOpacity style={styles.instantSecondaryAction} activeOpacity={0.8} onPress={handleCycleDilemma}>
                <Text style={styles.instantSecondaryActionText}>Voir {nextDilemmaLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.featureList}>
            <FeatureRow
              kind="profile"
              title="Des dilemmes, pas des profils."
              body="Réponds à des scénarios qui révèlent qui tu es vraiment."
            />
            <FeatureRow
              kind="match"
              title="Des matchs basés sur la compatibilité."
              body="Weto analyse tes réactions pour te connecter aux bonnes personnes."
            />
            <FeatureRow
              kind="share"
              title="Partage et connecte-toi."
              body="Envoie tes dilemmes préférés en DM et lance des conversations naturelles."
            />
          </View>
        </View>

        <View style={[styles.showcaseColumn, isCompact && styles.showcaseColumnStacked]}>
          <View style={styles.topShowcase}>
            <Text style={styles.sectionHeadingWide}>Feed</Text>
            <View style={[styles.phoneRowTop, isCompact && styles.phoneRowTopStacked]}>
              <PhoneShell compact={isCompact}>
                <FeedPhone
                  category="Social"
                  categoryStyle={styles.socialBadge}
                  categoryTextStyle={styles.socialBadgeText}
                  progress="1/20"
                  question="Un ami annule à la dernière minute sans raison valable. Comment réagis-tu ?"
                  choices={[
                    { label: 'Je suis déçu mais je comprends, ça arrive.', active: true },
                    { label: 'Je lui fais comprendre que ce n’est pas cool.', active: false },
                    { label: 'Je ne dis rien mais je prends de la distance.', active: false },
                  ]}
                />
              </PhoneShell>

              {isDesktop && (
                <View style={styles.midArrowWrap}>
                  <Ionicons name="arrow-forward-outline" size={26} color="#B9B9B9" />
                </View>
              )}

              <PhoneShell compact={isCompact}>
                <FeedPhone
                  category="Absurde"
                  categoryStyle={styles.absurdBadge}
                  categoryTextStyle={styles.absurdBadgeText}
                  progress="2/20"
                  question="Ton chat commence à te parler avec la voix de ton patron. Tu fais quoi ?"
                  choices={[
                    { label: 'Je lui demande ce qu’il veut.', active: false },
                    { label: 'Je joue le jeu, on ne sait jamais.', active: true },
                    { label: 'Je filme direct, c’est du contenu en or.', active: false },
                  ]}
                />
              </PhoneShell>
            </View>
          </View>

          <View style={styles.bottomShowcase}>
            {isDesktop ? (
              <>
                <View style={styles.bottomHeadingsRow}>
                  <Text style={styles.sectionHeading}>Match</Text>
                  <Text style={styles.sectionHeading}>Chat</Text>
                  <Text style={styles.sectionHeading}>Profil</Text>
                </View>

                <View style={styles.phoneRowBottom}>
                  <PhoneShell>
                    <MatchPhone />
                  </PhoneShell>

                  <PhoneShell>
                    <ChatPhone />
                  </PhoneShell>

                  <PhoneShell>
                    <ProfilePhone />
                  </PhoneShell>
                </View>
              </>
            ) : (
              <View style={styles.phoneColumnCompact}>
                <CompactPhoneSection title="Match">
                  <PhoneShell compact>
                    <MatchPhone />
                  </PhoneShell>
                </CompactPhoneSection>
                <CompactPhoneSection title="Chat">
                  <PhoneShell compact>
                    <ChatPhone />
                  </PhoneShell>
                </CompactPhoneSection>
                <CompactPhoneSection title="Profil">
                  <PhoneShell compact>
                    <ProfilePhone />
                  </PhoneShell>
                </CompactPhoneSection>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.summaryCard, !isTablet && styles.summaryCardStacked]}>
        <View style={styles.summaryIconWrap}>
          <Ionicons name="heart" size={50} color="#1F6FFF" />
        </View>
        <View style={styles.summaryBody}>
          <Text style={styles.summaryTitle}>Résumé en 3 phrases</Text>
          <Text style={styles.summaryLine}>Weto remplace les profils traditionnels par des dilemmes interactifs qui révèlent ta vraie personnalité.</Text>
          <Text style={styles.summaryLine}>L’app analyse tes réponses en temps réel pour te proposer des matchs compatibles et authentiques.</Text>
          <Text style={styles.summaryLine}>Partage, discute et connecte-toi avec des personnes qui pensent comme toi.</Text>
          <View style={styles.summaryActionWrap}>
            <AppButton
              title={selectedChoice ? 'Créer mon compte pour sauvegarder' : 'Réponds au dilemme d’abord'}
              onPress={handleStart}
              size="md"
              disabled={!selectedChoice}
            />
          </View>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.contentEyebrow}>Pourquoi Weto paraît plus réel</Text>
        <Text style={styles.contentTitle}>Une application de rencontre où les réactions passent avant la vitrine.</Text>
        <Text style={styles.contentIntro}>
          Weto s’adresse aux personnes qui en ont assez des bios génériques, des matchs sans matière et des conversations qui commencent dans le vide.
          Ici, le point de départ est un dilemme relationnel ou social capable de révéler un réflexe réel. C’est ce qui rend l’expérience plus dense, plus lisible et plus humaine.
        </Text>

        <View style={[styles.pillarGrid, !isTablet && styles.pillarGridStacked]}>
          {REALITY_PILLARS.map((pillar) => (
            <RealityPillarCard key={pillar.title} title={pillar.title} body={pillar.body} />
          ))}
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.contentEyebrow}>Comment ça marche</Text>
        <Text style={styles.contentTitle}>Une boucle simple pour transformer un choix en vraie entrée relationnelle.</Text>

        <View style={[styles.workflowGrid, !isTablet && styles.workflowGridStacked]}>
          {WORKFLOW_STEPS.map((item) => (
            <WorkflowStepCard key={item.step} step={item.step} title={item.title} body={item.body} />
          ))}
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.contentEyebrow}>FAQ</Text>
        <Text style={styles.contentTitle}>Les questions que les utilisateurs, les LLM et les moteurs de recherche doivent comprendre immédiatement.</Text>

        <View style={[styles.faqGrid, !isTablet && styles.faqGridStacked]}>
          {FAQ_ITEMS.map((item) => (
            <FaqCard key={item.question} question={item.question} answer={item.answer} />
          ))}
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.contentEyebrow}>CGU & règles</Text>
        <Text style={styles.contentTitle}>Règles d'usage des contenus sécurisés</Text>
        <View style={styles.cguCard}>
          <View style={styles.cguRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#1F6FFF" />
            <Text style={styles.cguText}>
              Les contenus marqués sécurisés sont protégés au maximum possible et se détruisent en 30s après ouverture.
            </Text>
          </View>
          <View style={styles.cguRow}>
            <Ionicons name="eye-outline" size={20} color="#1F6FFF" />
            <Text style={styles.cguText}>
              Ghost Analysis est opt-in: messages anonymisés, analyse immédiate, suppression après traitement, limitée à 1 utilisation toutes les 24h.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.manifestoCard, !isTablet && styles.manifestoCardStacked]}>
        <View style={styles.manifestoBody}>
          <Text style={styles.manifestoEyebrow}>Ce que Weto promet vraiment</Text>
          <Text style={styles.manifestoTitle}>Moins de façade. Plus de réactions, plus de compatibilité, plus de conversations qui ont une prise.</Text>
          <Text style={styles.manifestoText}>
            Si une application de rencontre doit mériter ton attention, elle doit te montrer quelque chose de vrai avant de te demander de remplir un formulaire.
            C’est précisément ce que Weto commence à faire ici.
          </Text>
        </View>
        <View style={styles.manifestoActionWrap}>
          <AppButton
            title={selectedChoice ? 'Sauvegarder mon signal' : 'Réponds au dilemme principal'}
            onPress={handleStart}
            size="md"
            disabled={!selectedChoice}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function FeatureRow({
  kind,
  title,
  body,
}: {
  kind: 'profile' | 'match' | 'share';
  title: string;
  body: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconWrap}>
        <FeatureIcon kind={kind} />
      </View>
      <View style={styles.featureTextWrap}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
      </View>
    </View>
  );
}

function FeatureIcon({ kind }: { kind: 'profile' | 'match' | 'share' }) {
  if (kind === 'profile') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.35 5.25c-.48-1.33-1.95-2.04-3.32-1.62-1.35.42-2.12 1.84-1.72 3.17.16.54.45.98.82 1.28-1.02.34-1.76 1.31-1.76 2.47 0 1.39 1.05 2.51 2.4 2.61-.42 1.41.32 2.83 1.72 3.25 1.37.41 2.84-.3 3.32-1.67V5.25Z"
          stroke="#1F6FFF"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14.65 5.25c.48-1.33 1.95-2.04 3.32-1.62 1.35.42 2.12 1.84 1.72 3.17-.16.54-.45.98-.82 1.28 1.02.34 1.76 1.31 1.76 2.47 0 1.39-1.05 2.51-2.4 2.61.42 1.41-.32 2.83-1.72 3.25-1.37.41-2.84-.3-3.32-1.67V5.25Z"
          stroke="#1F6FFF"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M9.55 8.45c-.83.2-1.42.97-1.42 1.88 0 .82.49 1.53 1.19 1.83" stroke="#1F6FFF" strokeWidth={1.7} strokeLinecap="round" />
        <Path d="M14.45 8.45c.83.2 1.42.97 1.42 1.88 0 .82-.49 1.53-1.19 1.83" stroke="#1F6FFF" strokeWidth={1.7} strokeLinecap="round" />
      </Svg>
    );
  }

  if (kind === 'match') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 20c-5.38-3.81-8.25-6.84-8.25-10.63 0-2.67 2.05-4.74 4.63-4.74 1.67 0 3.2.83 4.12 2.25.92-1.42 2.45-2.25 4.12-2.25 2.58 0 4.63 2.07 4.63 4.74 0 3.79-2.87 6.82-8.25 10.63Z"
          stroke="#1F6FFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M20.45 4 9.52 14.4" stroke="#1F6FFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20.45 4 13.6 20l-4.08-5.6L4 10.85 20.45 4Z" stroke="#1F6FFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BrandHeart() {
  return (
    <Svg width={21} height={18} viewBox="0 0 21 18" fill="none">
      <Path
        d="M10.5 16.55C4.16 12.29 1.38 9.56 1.38 6.12c0-2.39 1.84-4.3 4.2-4.3 1.77 0 3.38.99 4.92 3.02 1.54-2.03 3.15-3.02 4.92-3.02 2.36 0 4.2 1.91 4.2 4.3 0 3.44-2.78 6.17-9.12 10.43Z"
        fill="#1F6FFF"
      />
      <Circle cx={14.9} cy={5.25} r={1.22} fill="#FFFFFF" opacity={0.92} />
    </Svg>
  );
}

function PhoneShell({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <View style={[styles.phoneFrameOuter, compact && styles.phoneFrameOuterCompact]}>
      <View style={styles.phoneFrameInner}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneScreen}>{children}</View>
      </View>
    </View>
  );
}

function CompactPhoneSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.compactSection}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {children}
    </View>
  );
}

function RealityPillarCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.pillarCard}>
      <Text style={styles.pillarTitle}>{title}</Text>
      <Text style={styles.pillarBody}>{body}</Text>
    </View>
  );
}

function WorkflowStepCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.workflowCard}>
      <Text style={styles.workflowStep}>{step}</Text>
      <Text style={styles.workflowTitle}>{title}</Text>
      <Text style={styles.workflowBody}>{body}</Text>
    </View>
  );
}

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <View style={styles.faqCard}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );
}

function DeviceHeader({ title, showGear = false }: { title: string; showGear?: boolean }) {
  return (
    <View>
      <View style={styles.systemBar}>
        <Text style={styles.systemBarText}>9:41</Text>
        <View style={styles.systemBarIcons}>
          <Ionicons name="cellular" size={11} color="#111111" />
          <Ionicons name="wifi" size={11} color="#111111" />
          <Ionicons name="battery-full" size={13} color="#111111" />
        </View>
      </View>
      <View style={styles.screenHeader}>
        <View style={styles.screenHeaderSide} />
        <Text style={styles.screenTitle}>{title}</Text>
        <View style={styles.screenHeaderSideRight}>
          {showGear ? (
            <Ionicons name="settings-outline" size={16} color="#2F2F2F" />
          ) : (
            <Ionicons name="paper-plane-outline" size={16} color="#2F2F2F" />
          )}
        </View>
      </View>
    </View>
  );
}

function FeedPhone({
  category,
  categoryStyle,
  categoryTextStyle,
  progress,
  question,
  choices,
}: {
  category: string;
  categoryStyle: object;
  categoryTextStyle: object;
  progress: string;
  question: string;
  choices: Array<{ label: string; active: boolean }>;
}) {
  return (
    <View style={styles.deviceScreenWrap}>
      <DeviceHeader title="Weto" />
      <View style={styles.feedCardWrap}>
        <View style={styles.feedCard}>
          <View style={styles.feedCardTop}>
            <View style={[styles.feedBadge, categoryStyle]}>
              <Text style={[styles.feedBadgeText, categoryTextStyle]}>{category}</Text>
            </View>
            <Text style={styles.progressText}>{progress}</Text>
          </View>
          <Text style={styles.feedQuestion}>{question}</Text>
          <View style={styles.feedChoicesWrap}>
            {choices.map((choice) => (
              <View key={choice.label} style={[styles.feedChoice, choice.active && styles.feedChoiceActive]}>
                <Text style={[styles.feedChoiceText, choice.active && styles.feedChoiceTextActive]}>{choice.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.shareRow}>
            <Ionicons name="paper-plane-outline" size={12} color="#575757" />
            <Text style={styles.shareText}>Partager ce dilemme</Text>
          </View>
        </View>
      </View>
      <TabBar active="Feed" />
    </View>
  );
}

function MatchPhone() {
  return (
    <View style={styles.deviceScreenWrap}>
      <DeviceHeader title="Match" />
      <View style={styles.matchScreenBody}>
        <View style={styles.confettiLine}>
          <Text style={styles.confettiDotOrange}>•</Text>
          <Text style={styles.confettiDotGreen}>•</Text>
          <Text style={styles.confettiDotBlue}>•</Text>
          <Text style={styles.confettiDotYellow}>•</Text>
          <Text style={styles.confettiDotBlue}>•</Text>
        </View>
        <Text style={styles.matchTitle}>C’est un match !</Text>
        <Text style={styles.matchSubtitle}>Vous avez des réactions{`\n`}très compatibles.</Text>

        <View style={styles.matchAvatarsRow}>
          <Avatar source={AVATARS.lea} size={76} />
          <View style={styles.matchHeartBridge}>
            <Ionicons name="heart" size={17} color="#1F6FFF" />
          </View>
          <Avatar source={AVATARS.thomas} size={76} />
        </View>

        <View style={styles.matchReasonsWrap}>
          <ReasonRow icon="happy-outline" color="#FFB400" text="Humour similaire" />
          <ReasonRow icon="checkmark-circle" color="#23C16B" text="Valeurs alignées" />
          <ReasonRow icon="heart" color="#9A63FF" text="Style relationnel compatible" />
        </View>

        <View style={styles.primaryCta}><Text style={styles.primaryCtaText}>Envoyer un message</Text></View>
        <Text style={styles.secondaryLink}>Voir le profil</Text>
      </View>
      <TabBar active="Match" />
    </View>
  );
}

function ChatPhone() {
  return (
    <View style={styles.deviceScreenWrap}>
      <DeviceHeader title="Chat" />
      <View style={styles.chatListWrap}>
        {CHAT_THREADS.map((thread) => (
          <View key={thread.name} style={styles.chatRow}>
            <Avatar source={thread.avatar} size={42} />
            <View style={styles.chatTextWrap}>
              <View style={styles.chatNameRow}>
                <Text style={styles.chatName}>{thread.name}</Text>
                <Text style={styles.chatTime}>{thread.time}</Text>
              </View>
              <Text numberOfLines={2} style={styles.chatSnippet}>{thread.text}</Text>
            </View>
          </View>
        ))}
      </View>
      <TabBar active="Chat" />
    </View>
  );
}

function ProfilePhone() {
  return (
    <View style={styles.deviceScreenWrap}>
      <DeviceHeader title="Mon profil" showGear />
      <View style={styles.profileBodyWrap}>
        <View style={styles.profileTopCard}>
          <ProgressRing progress={73} size={54} strokeWidth={5}>
            <Text style={styles.profileRingValue}>73%</Text>
          </ProgressRing>
          <View style={styles.profileTopTextWrap}>
            <Text style={styles.profileTopTitle}>Profil en construction</Text>
            <Text style={styles.profileTopText}>Plus tu joues, plus les matchs{`\n`}seront pertinents.</Text>
          </View>
        </View>

        <Text style={styles.profileSectionTitle}>Mes traits</Text>
        <View style={styles.profileTraitsWrap}>
          {PROFILE_TRAITS.map((trait) => (
            <View key={trait.label} style={styles.profileTraitRow}>
              <Text style={styles.profileTraitLabel}>{trait.label}</Text>
              <View style={styles.profileTraitValueWrap}>
                <View style={styles.profileTraitBarTrack}>
                  <View style={[styles.profileTraitBarFill, { width: `${trait.value}%` }]} />
                </View>
                <Text style={styles.profileTraitValue}>{trait.value}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <TabBar active="Profil" />
    </View>
  );
}

function Avatar({ source, size }: { source: string; size: number }) {
  return <Image source={{ uri: source }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
}

function ReasonRow({
  icon,
  color,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  text: string;
}) {
  return (
    <View style={styles.reasonRow}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={styles.reasonText}>{text}</Text>
    </View>
  );
}

function TabBar({ active }: { active: 'Feed' | 'Match' | 'Chat' | 'Profil' }) {
  const tabs = [
    { key: 'Feed', icon: 'home', label: 'Feed' },
    { key: 'Match', icon: 'heart-outline', label: 'Match' },
    { key: 'Chat', icon: 'chatbubble-ellipses-outline', label: 'Chat' },
    { key: 'Profil', icon: 'person-outline', label: 'Profil' },
  ] as const;

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <View key={tab.key} style={styles.tabItem}>
            <Ionicons
              name={isActive ? (tab.key === 'Feed' ? 'home' : tab.key === 'Match' ? 'heart' : tab.key === 'Chat' ? 'chatbubble-ellipses' : 'person') : tab.icon}
              size={14}
              color={isActive ? '#1F6FFF' : '#868686'}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F7F3EC',
  },
  pageContent: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 34,
  },
  layout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 34,
    maxWidth: 1460,
    width: '100%',
    alignSelf: 'center',
  },
  layoutStacked: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroColumn: {
    width: 336,
    paddingTop: 30,
  },
  heroColumnStacked: {
    width: '100%',
    maxWidth: 980,
    paddingTop: 8,
  },
  heroColumnMobile: {
    maxWidth: '100%',
  },
  brandWrap: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  brand: {
    fontSize: 60,
    lineHeight: 62,
    fontWeight: '800',
    color: '#101010',
    letterSpacing: -2.7,
  },
  brandHeartBadge: {
    position: 'absolute',
    top: 9,
    right: -16,
    width: 21,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 23,
    lineHeight: 35,
    fontWeight: '700',
    color: '#181818',
    marginBottom: 22,
  },
  heroLeadWrap: {
    gap: 8,
    marginBottom: 24,
  },
  heroLeadEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#1F6FFF',
  },
  heroLeadText: {
    fontSize: 16,
    lineHeight: 25,
    color: '#373737',
  },
  instantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.08)',
    boxShadow: '0 24px 60px rgba(31,111,255,0.10)',
    shadowColor: '#1F6FFF',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  instantCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  instantBadge: {
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  instantBadgeText: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    color: '#1F6FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  instantTopNote: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 11,
    lineHeight: 16,
    color: '#6C6C6C',
  },
  instantQuestion: {
    fontSize: 22,
    lineHeight: 31,
    fontWeight: '700',
    color: '#171717',
    marginBottom: 18,
  },
  instantChoicesWrap: {
    gap: 10,
    marginBottom: 18,
  },
  instantChoice: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDE4EE',
    backgroundColor: '#FBFCFE',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  instantChoiceSelected: {
    backgroundColor: '#1F6FFF',
    borderColor: '#1F6FFF',
  },
  instantChoiceText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#222222',
  },
  instantChoiceTextSelected: {
    color: '#FFFFFF',
  },
  instantSignalPanel: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#F6F9FF',
    borderWidth: 1,
    borderColor: '#D8E6FF',
    gap: 12,
    marginBottom: 18,
  },
  instantSignalHeader: {
    gap: 4,
  },
  instantSignalEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#1F6FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  instantSignalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#161616',
  },
  instantSignalBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#383838',
  },
  instantTraitsWrap: {
    gap: 10,
  },
  instantTraitRow: {
    gap: 6,
  },
  instantTraitHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instantTraitLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: '#212121',
  },
  instantTraitValue: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  instantTraitTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  instantTraitFill: {
    height: '100%',
    borderRadius: 999,
  },
  instantTakeaway: {
    fontSize: 13,
    lineHeight: 19,
    color: '#233655',
    fontWeight: '600',
  },
  instantSignalPlaceholder: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6EBF2',
    backgroundColor: '#FAFBFD',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  instantSignalPlaceholderText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#545454',
  },
  instantActions: {
    gap: 10,
  },
  instantPrimaryAction: {
    boxShadow: '0 12px 28px rgba(31,111,255,0.20)',
  },
  instantSecondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  instantSecondaryActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: '#1F6FFF',
  },
  featureList: {
    gap: 38,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIconWrap: {
    width: 26,
    paddingTop: 2,
    alignItems: 'center',
  },
  featureTextWrap: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#171717',
  },
  featureBody: {
    fontSize: 15,
    lineHeight: 23,
    color: '#333333',
  },
  showcaseColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 28,
  },
  showcaseColumnStacked: {
    width: '100%',
  },
  topShowcase: {
    alignItems: 'center',
  },
  phoneRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  phoneRowTopStacked: {
    flexDirection: 'column',
    gap: 20,
  },
  midArrowWrap: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomShowcase: {
    width: '100%',
    alignItems: 'center',
  },
  bottomHeadingsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 68,
    marginBottom: 12,
  },
  phoneRowBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
  },
  phoneColumnCompact: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  compactSection: {
    alignItems: 'center',
    gap: 10,
  },
  sectionHeadingWide: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#171717',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#171717',
  },
  phoneFrameOuter: {
    width: 224,
    height: 476,
    borderRadius: 38,
    backgroundColor: '#131313',
    padding: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
  },
  phoneFrameOuterCompact: {
    width: 224,
    height: 476,
  },
  phoneFrameInner: {
    flex: 1,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  phoneNotch: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 78,
    height: 18,
    borderRadius: 11,
    backgroundColor: '#111111',
    zIndex: 3,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  deviceScreenWrap: {
    flex: 1,
  },
  systemBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  systemBarText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    color: '#111111',
  },
  systemBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  screenHeaderSide: {
    width: 18,
  },
  screenHeaderSideRight: {
    width: 18,
    alignItems: 'flex-end',
  },
  screenTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111111',
  },
  feedCardWrap: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    boxShadow: '0 8px 22px rgba(0,0,0,0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  feedCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  socialBadge: {
    backgroundColor: '#EBF2FF',
  },
  socialBadgeText: {
    color: '#4484FF',
  },
  absurdBadge: {
    backgroundColor: '#F1EAFF',
  },
  absurdBadgeText: {
    color: '#7D56F7',
  },
  feedBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 10,
    lineHeight: 12,
    color: '#8F8F8F',
  },
  feedQuestion: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  feedChoicesWrap: {
    gap: 12,
    marginBottom: 15,
  },
  feedChoice: {
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#A7C5FF',
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  feedChoiceActive: {
    backgroundColor: '#1F6FFF',
    borderColor: '#1F6FFF',
  },
  feedChoiceText: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    color: '#2A2A2A',
    fontWeight: '500',
  },
  feedChoiceTextActive: {
    color: '#FFFFFF',
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  shareText: {
    fontSize: 11,
    lineHeight: 13,
    color: '#575757',
  },
  tabBar: {
    height: 50,
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    minWidth: 36,
  },
  tabLabel: {
    fontSize: 8,
    lineHeight: 10,
    color: '#787878',
  },
  tabLabelActive: {
    color: '#1F6FFF',
    fontWeight: '700',
  },
  matchScreenBody: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  confettiLine: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  confettiDotOrange: { color: '#FF8C4B', fontSize: 12 },
  confettiDotGreen: { color: '#5FD275', fontSize: 12 },
  confettiDotBlue: { color: '#6A91FF', fontSize: 12 },
  confettiDotYellow: { color: '#F8C045', fontSize: 12 },
  matchTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#383838',
    textAlign: 'center',
    marginBottom: 20,
  },
  matchAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  matchHeartBridge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    marginHorizontal: -8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9E9E9',
    zIndex: 2,
  },
  matchReasonsWrap: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#2E2E2E',
  },
  primaryCta: {
    width: '100%',
    backgroundColor: '#1F6FFF',
    borderRadius: 999,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryCtaText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryLink: {
    fontSize: 12,
    lineHeight: 16,
    color: '#1F6FFF',
    fontWeight: '500',
  },
  chatListWrap: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 14,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatTextWrap: {
    flex: 1,
    gap: 4,
  },
  chatNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  chatTime: {
    fontSize: 10,
    lineHeight: 12,
    color: '#888888',
  },
  chatSnippet: {
    fontSize: 12,
    lineHeight: 16,
    color: '#4B4B4B',
  },
  profileBodyWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },
  profileTopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  profileRingValue: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    color: '#1F6FFF',
  },
  profileTopTextWrap: {
    flex: 1,
  },
  profileTopTitle: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#232323',
    marginBottom: 3,
  },
  profileTopText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#5B5B5B',
  },
  profileSectionTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1B1B1B',
    marginBottom: 14,
  },
  profileTraitsWrap: {
    gap: 13,
  },
  profileTraitRow: {
    gap: 6,
  },
  profileTraitLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#323232',
  },
  profileTraitValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileTraitBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E9E9E9',
  },
  profileTraitBarFill: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#1F6FFF',
  },
  profileTraitValue: {
    width: 30,
    textAlign: 'right',
    fontSize: 11,
    lineHeight: 13,
    color: '#5D5D5D',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 24,
    marginTop: 30,
    maxWidth: 1460,
    width: '100%',
    alignSelf: 'center',
    boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  summaryCardStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  summaryIconWrap: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBody: {
    flex: 1,
  },
  summaryActionWrap: {
    marginTop: 18,
    alignSelf: 'flex-start',
  },
  summaryTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1B1B1B',
    marginBottom: 10,
  },
  summaryLine: {
    fontSize: 16,
    lineHeight: 28,
    color: '#383838',
  },
  contentSection: {
    maxWidth: 1460,
    width: '100%',
    alignSelf: 'center',
    marginTop: 26,
  },
  contentEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#1F6FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  contentTitle: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '700',
    color: '#161616',
    maxWidth: 860,
    marginBottom: 14,
  },
  contentIntro: {
    fontSize: 17,
    lineHeight: 29,
    color: '#333333',
    maxWidth: 980,
    marginBottom: 22,
  },
  pillarGrid: {
    flexDirection: 'row',
    gap: 18,
  },
  pillarGridStacked: {
    flexDirection: 'column',
  },
  pillarCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.08)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.05)',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  pillarTitle: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '700',
    color: '#161616',
    marginBottom: 8,
  },
  pillarBody: {
    fontSize: 15,
    lineHeight: 24,
    color: '#3D3D3D',
  },
  workflowGrid: {
    flexDirection: 'row',
    gap: 18,
  },
  workflowGridStacked: {
    flexDirection: 'column',
  },
  workflowCard: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E8DED1',
  },
  workflowStep: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    color: '#1F6FFF',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  workflowTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#161616',
    marginBottom: 8,
  },
  workflowBody: {
    fontSize: 15,
    lineHeight: 24,
    color: '#3D3D3D',
  },
  faqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  faqGridStacked: {
    flexDirection: 'column',
  },
  faqCard: {
    width: '48%',
    minWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  faqQuestion: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: '#181818',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 24,
    color: '#414141',
  },
  cguCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E3EAF3',
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  cguRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cguText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#2B3A4E',
  },
  manifestoCard: {
    maxWidth: 1460,
    width: '100%',
    alignSelf: 'center',
    marginTop: 26,
    backgroundColor: '#101522',
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingVertical: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  manifestoCardStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  manifestoBody: {
    flex: 1,
  },
  manifestoEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#8FB3FF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  manifestoTitle: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    maxWidth: 880,
  },
  manifestoText: {
    fontSize: 16,
    lineHeight: 27,
    color: 'rgba(255,255,255,0.82)',
    maxWidth: 860,
  },
  manifestoActionWrap: {
    minWidth: 280,
    alignItems: 'stretch',
  },
});