# Weto

L'app de rencontre qui te comprend vraiment.

## Concept
Weto remplace les profils traditionnels par des dilemmes interactifs qui révèlent ta vraie personnalité. L'app analyse tes réponses en temps réel pour te proposer des matchs compatibles et authentiques.

## Tech Stack
- React Native (Expo) + TypeScript
- Zustand (state management)
- React Navigation (bottom tabs)
- Deployed on Netlify (web)

## Démarrage local

```bash
npm install
npm run web        # Web dev server
npm run android    # Android
npm run ios        # iOS (macOS requis)
```

## Build web
```bash
npx expo export --platform web
```

## Structure
```
src/
  data/        # 20 scénarios QCM
  store/       # Zustand store + calculateProfile()
  theme/       # Design tokens (couleurs, typo)
  components/  # ScenarioCard, MatchModal, SkeletonCard
  screens/     # Feed, Match, Chat, Profile
```

## Algorithme de profil
Chaque réponse met à jour 6 traits : Sociabilité, Réactivité émotionnelle, Tolérance au risque, Style d'humour, Gestion des conflits, Stabilité.

## Déploiement
Netlify — build automatic depuis GitHub (biloute593/weto)
