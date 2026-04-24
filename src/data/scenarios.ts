export type TraitKey =
  | 'sociability'
  | 'emotionalReactivity'
  | 'riskTolerance'
  | 'humorStyle'
  | 'conflictStyle'
  | 'stability';

export type TraitDelta = Partial<Record<TraitKey, number>>;

export interface Choice {
  label: string;
  traitDeltas: TraitDelta;
}

export interface Scenario {
  id: string;
  category: 'Social' | 'Absurde' | 'Valeurs' | 'Relationnel';
  question: string;
  choices: Choice[];
}

export const SCENARIOS: Scenario[] = [
  // ─── SOCIAL (5) ───────────────────────────────────────────────
  {
    id: 'soc_01',
    category: 'Social',
    question:
      'Un ami annule à la dernière minute sans raison valable. Comment réagis-tu ?',
    choices: [
      { label: 'Je suis déçu·e mais je comprends, ça arrive.', traitDeltas: { stability: 5, conflictStyle: -3 } },
      { label: 'Je lui fais comprendre que ce n\'est pas cool.', traitDeltas: { conflictStyle: 5, emotionalReactivity: 3 } },
      { label: 'Je ne dis rien, mais je prends de la distance.', traitDeltas: { conflictStyle: -5, emotionalReactivity: 4 } },
      { label: 'Je profite de ma soirée solo, c\'est cool aussi.', traitDeltas: { sociability: -3, stability: 5, humorStyle: 3 } },
    ],
  },
  {
    id: 'soc_02',
    category: 'Social',
    question:
      'Tu es invité·e à une fête où tu ne connais personne. Tu fais quoi ?',
    choices: [
      { label: 'J\'y vais et j\'aborde tout le monde.', traitDeltas: { sociability: 8, riskTolerance: 5 } },
      { label: 'J\'y vais mais je reste proche du buffet.', traitDeltas: { sociability: 2, humorStyle: 4 } },
      { label: 'J\'invite un·e ami·e avec moi, sécurité d\'abord.', traitDeltas: { sociability: 3, stability: 4 } },
      { label: 'Je décline poliment, pas mon truc.', traitDeltas: { sociability: -5, stability: 3 } },
    ],
  },
  {
    id: 'soc_03',
    category: 'Social',
    question:
      'Un collègue s\'attribue ton idée en réunion devant le boss. Tu réagis comment ?',
    choices: [
      { label: 'Je rectifie immédiatement devant tout le monde.', traitDeltas: { conflictStyle: 7, riskTolerance: 5 } },
      { label: 'Je lui en parle en privé après.', traitDeltas: { conflictStyle: 2, stability: 4 } },
      { label: 'Je l\'ignore pour l\'instant et j\'en parle au boss plus tard.', traitDeltas: { conflictStyle: -2, stability: 3 } },
      { label: 'Je ravale ma frustration pour éviter le drame.', traitDeltas: { conflictStyle: -6, emotionalReactivity: 5 } },
    ],
  },
  {
    id: 'soc_04',
    category: 'Social',
    question:
      'Tu arrives en retard au travail avec une chemise rouge. Tu vois une story disant que le rouge porte malheur aujourd\'hui. Comment réagis-tu ?',
    choices: [
      { label: 'Je la garde, les superstitions c\'est nul.', traitDeltas: { riskTolerance: 6, stability: 4 } },
      { label: 'Je la change, on ne sait jamais.', traitDeltas: { emotionalReactivity: 5, riskTolerance: -4 } },
      { label: 'Je rigole en montrant la story à tout le monde.', traitDeltas: { humorStyle: 7, sociability: 4 } },
      { label: 'Je demande l\'avis des autres avant de décider.', traitDeltas: { sociability: 3, stability: -2 } },
    ],
  },
  {
    id: 'soc_05',
    category: 'Social',
    question:
      'Un inconnu dans le métro te parle et semble vouloir lier conversation. Tu fais ?',
    choices: [
      { label: 'Je discute, les rencontres imprévues sont sympa.', traitDeltas: { sociability: 7, riskTolerance: 4 } },
      { label: 'Je réponds poliment mais je reste bref·ve.', traitDeltas: { sociability: 2, stability: 3 } },
      { label: 'Je remets mes écouteurs subtilement.', traitDeltas: { sociability: -4, humorStyle: 3 } },
      { label: 'Je prétends être au téléphone.', traitDeltas: { sociability: -6, conflictStyle: -3 } },
    ],
  },

  // ─── ABSURDE (5) ──────────────────────────────────────────────
  {
    id: 'abs_01',
    category: 'Absurde',
    question:
      'Ton chat commence à te parler avec la voix de ton patron. Tu fais quoi ?',
    choices: [
      { label: 'Je lui demande ce qu\'il veut.', traitDeltas: { humorStyle: 6, riskTolerance: 4 } },
      { label: 'Je joue le jeu, on ne sait jamais.', traitDeltas: { humorStyle: 8, riskTolerance: 5 } },
      { label: 'Je filme direct, c\'est du contenu en or.', traitDeltas: { humorStyle: 7, sociability: 5 } },
      { label: 'Je prends RDV chez le médecin.', traitDeltas: { stability: 5, emotionalReactivity: 4 } },
    ],
  },
  {
    id: 'abs_02',
    category: 'Absurde',
    question:
      'Tu te réveilles et tu découvres que tout le monde parle à l\'envers. Tu fais ?',
    choices: [
      { label: 'J\'apprends la langue pour m\'adapter.', traitDeltas: { riskTolerance: 6, stability: 5 } },
      { label: 'Je mets ça sur TikTok immédiatement.', traitDeltas: { humorStyle: 7, sociability: 6 } },
      { label: 'Je cherche une explication scientifique.', traitDeltas: { stability: 4, emotionalReactivity: -3 } },
      { label: 'Je reste chez moi jusqu\'à ce que ça passe.', traitDeltas: { sociability: -5, stability: 2 } },
    ],
  },
  {
    id: 'abs_03',
    category: 'Absurde',
    question:
      'Une intelligence artificielle te propose d\'écrire ta vie à ta place. Tu acceptes ?',
    choices: [
      { label: 'Oui, tant qu\'elle fait mieux que moi.', traitDeltas: { humorStyle: 5, riskTolerance: 4 } },
      { label: 'Non, c\'est mon histoire, pas la sienne.', traitDeltas: { stability: 6, conflictStyle: 3 } },
      { label: 'Je lui demande de me faire un brouillon.', traitDeltas: { humorStyle: 4, stability: 2 } },
      { label: 'Je panique et débranche tout.', traitDeltas: { emotionalReactivity: 7, riskTolerance: -5 } },
    ],
  },
  {
    id: 'abs_04',
    category: 'Absurde',
    question:
      'Tu reçois un colis avec ton propre nom comme expéditeur ET comme destinataire. Tu ?',
    choices: [
      { label: 'Je l\'ouvre sans hésiter.', traitDeltas: { riskTolerance: 7, humorStyle: 4 } },
      { label: 'Je le laisse 3 jours pour voir si ça disparaît.', traitDeltas: { stability: 3, humorStyle: 5 } },
      { label: 'J\'appelle la poste pour signalement.', traitDeltas: { stability: 6, riskTolerance: -3 } },
      { label: 'Je partage le mystère avec mes proches.', traitDeltas: { sociability: 6, humorStyle: 4 } },
    ],
  },
  {
    id: 'abs_05',
    category: 'Absurde',
    question:
      'Tu découvres que ton reflet dans le miroir te suit avec 2 secondes de retard. Tu ?',
    choices: [
      { label: 'Je fais des danses pour le tester.', traitDeltas: { humorStyle: 8, riskTolerance: 5 } },
      { label: 'Je couvre tous les miroirs de la maison.', traitDeltas: { emotionalReactivity: 7, stability: -4 } },
      { label: 'Je poste une vidéo et attends les théories.', traitDeltas: { sociability: 6, humorStyle: 5 } },
      { label: 'Je l\'ignore et vaquerai à mes occupations.', traitDeltas: { stability: 7, emotionalReactivity: -4 } },
    ],
  },

  // ─── VALEURS (5) ──────────────────────────────────────────────
  {
    id: 'val_01',
    category: 'Valeurs',
    question:
      'Tu trouves un portefeuille plein de cash par terre. Que fais-tu ?',
    choices: [
      { label: 'Je le rapporte au commissariat immédiatement.', traitDeltas: { stability: 7, conflictStyle: 2 } },
      { label: 'Je cherche une pièce d\'identité pour contacter le propriétaire.', traitDeltas: { stability: 6, sociability: 4 } },
      { label: 'Je garde l\'argent et jette le portefeuille.', traitDeltas: { riskTolerance: 6, conflictStyle: -5 } },
      { label: 'Je garde mais espère en secret que quelqu\'un le réclame.', traitDeltas: { emotionalReactivity: 5, stability: -2 } },
    ],
  },
  {
    id: 'val_02',
    category: 'Valeurs',
    question:
      'Tu apprends qu\'un·e de tes proches a triché à un examen important. Tu fais ?',
    choices: [
      { label: 'Je lui dis clairement que c\'était mal.', traitDeltas: { conflictStyle: 6, stability: 5 } },
      { label: 'Je l\'aide à comprendre pourquoi c\'est problématique.', traitDeltas: { sociability: 5, stability: 4 } },
      { label: 'Je ne dis rien, ce n\'est pas mon problème.', traitDeltas: { conflictStyle: -4, stability: 2 } },
      { label: 'Je le/la dénonce à l\'administration.', traitDeltas: { conflictStyle: 7, riskTolerance: 4 } },
    ],
  },
  {
    id: 'val_03',
    category: 'Valeurs',
    question:
      'On te propose un travail très bien payé mais qui ne correspond pas à tes valeurs. Tu ?',
    choices: [
      { label: 'Je refuse, l\'argent ne fait pas tout.', traitDeltas: { stability: 7, riskTolerance: 3 } },
      { label: 'J\'accepte pour une période limitée et j\'économise.', traitDeltas: { stability: 4, riskTolerance: 4 } },
      { label: 'J\'accepte sans trop y réfléchir.', traitDeltas: { riskTolerance: 5, emotionalReactivity: -3 } },
      { label: 'Je négocie pour adapter le poste à mes valeurs.', traitDeltas: { conflictStyle: 5, stability: 5 } },
    ],
  },
  {
    id: 'val_04',
    category: 'Valeurs',
    question:
      'Tu es seul·e témoin d\'une injustice dans la rue. Ton réflexe ?',
    choices: [
      { label: 'J\'interviens directement.', traitDeltas: { riskTolerance: 8, sociability: 5 } },
      { label: 'J\'appelle les secours ou la police.', traitDeltas: { stability: 6, conflictStyle: 2 } },
      { label: 'Je filme pour avoir une preuve.', traitDeltas: { riskTolerance: 3, humorStyle: -2 } },
      { label: 'Je passe, de peur d\'aggraver la situation.', traitDeltas: { emotionalReactivity: 5, riskTolerance: -6 } },
    ],
  },
  {
    id: 'val_05',
    category: 'Valeurs',
    question:
      'Un mensonge "blanc" pourrait protéger quelqu\'un que tu aimes. Tu mens ?',
    choices: [
      { label: 'Oui, protéger les siens passe avant tout.', traitDeltas: { sociability: 6, emotionalReactivity: 4 } },
      { label: 'Non, la vérité, même difficile, vaut mieux.', traitDeltas: { stability: 7, conflictStyle: 3 } },
      { label: 'Je dis une demi-vérité pour tempérer.', traitDeltas: { stability: 3, conflictStyle: -2 } },
      { label: 'Ça dépend de la situation, pas de règle absolue.', traitDeltas: { stability: 4, humorStyle: 2 } },
    ],
  },

  // ─── RELATIONNEL (5) ──────────────────────────────────────────
  {
    id: 'rel_01',
    category: 'Relationnel',
    question:
      'Ton partenaire critique ton plat préféré devant tes parents. Tu fais ?',
    choices: [
      { label: 'Je ris avec eux, ça détend l\'atmosphère.', traitDeltas: { humorStyle: 7, stability: 5 } },
      { label: 'Je défends mon plat avec passion.', traitDeltas: { conflictStyle: 5, emotionalReactivity: 4 } },
      { label: 'Je le/la regarde et signale que c\'est pas ok.', traitDeltas: { conflictStyle: 6, stability: 3 } },
      { label: 'Je change de sujet pour sauver l\'ambiance.', traitDeltas: { sociability: 4, conflictStyle: -3 } },
    ],
  },
  {
    id: 'rel_02',
    category: 'Relationnel',
    question:
      'Tu réalises que tu as envoyé un message privé en mode public. Tu ?',
    choices: [
      { label: 'Je le supprime vite et fais semblant que rien n\'est arrivé.', traitDeltas: { stability: 3, emotionalReactivity: 4 } },
      { label: 'Je l\'assume avec humour.', traitDeltas: { humorStyle: 8, stability: 5 } },
      { label: 'Je m\'explique sérieusement.', traitDeltas: { stability: 5, conflictStyle: 2 } },
      { label: 'Je disparais d\'internet pendant une semaine.', traitDeltas: { emotionalReactivity: 7, sociability: -5 } },
    ],
  },
  {
    id: 'rel_03',
    category: 'Relationnel',
    question:
      'Un·e ami·e te demande ton avis honnête sur sa nouvelle coupe de cheveux ratée. Tu ?',
    choices: [
      { label: 'Je dis que ça me plaît, l\'amitié d\'abord.', traitDeltas: { sociability: 5, conflictStyle: -4 } },
      { label: 'Je suis honnête avec douceur.', traitDeltas: { stability: 6, conflictStyle: 3 } },
      { label: 'Je mens avec enthousiasme et conviction.', traitDeltas: { humorStyle: 4, conflictStyle: -3 } },
      { label: 'Je détourne la question avec une blague.', traitDeltas: { humorStyle: 7, conflictStyle: -2 } },
    ],
  },
  {
    id: 'rel_04',
    category: 'Relationnel',
    question:
      'Tu découvres que ton ex sort avec ton/ta meilleur·e ami·e. Ta réaction ?',
    choices: [
      { label: 'Je les congratule, la vie avance.', traitDeltas: { stability: 8, emotionalReactivity: -4 } },
      { label: 'Je parle ouvertement de ce que je ressens.', traitDeltas: { emotionalReactivity: 6, conflictStyle: 4 } },
      { label: 'Je prends de la distance le temps de digérer.', traitDeltas: { stability: 4, emotionalReactivity: 5 } },
      { label: 'Je supprime tout le monde de mes réseaux.', traitDeltas: { emotionalReactivity: 8, sociability: -6 } },
    ],
  },
  {
    id: 'rel_05',
    category: 'Relationnel',
    question:
      'En couple, ton/ta partenaire veut passer TOUTES ses soirées avec toi. Tu ?',
    choices: [
      { label: 'Je trouve ça adorable, je suis partant·e.', traitDeltas: { sociability: 6, emotionalReactivity: 4 } },
      { label: 'J\'explique que j\'ai besoin d\'espace aussi.', traitDeltas: { stability: 7, conflictStyle: 4 } },
      { label: 'Je cède mais je le regrette intérieurement.', traitDeltas: { conflictStyle: -5, emotionalReactivity: 6 } },
      { label: 'Je propose un compromis : 4 soirs sur 7.', traitDeltas: { stability: 5, conflictStyle: 3 } },
    ],
  },
];
