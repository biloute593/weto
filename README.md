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
npm run build:web
```

## Preflight release
```bash
npm run preflight:release
```

Checklist detaillee disponible dans `RELEASE_PREP_APP_STORE.md`.

Contexte agent (historique + analyse code + dernieres modifs): `AGENT_HANDOVER_CONTEXT.md`.

Ce build exporte l'app web puis génère automatiquement les artefacts d'indexation suivants dans `dist/` :
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `manifest.webmanifest`
- balises SEO / Open Graph / JSON-LD dans `index.html`

Variables d'environnement supportées pour les moteurs de recherche :
- `GOOGLE_SITE_VERIFICATION` pour injecter la balise Search Console
- `BING_SITE_VERIFICATION` pour injecter la balise Bing Webmaster Tools

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
