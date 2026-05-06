import { Scenario, ScenarioCategory, TraitDelta } from '../types';

const CURATED_SCENARIOS: Scenario[] = [
  // ═══════════════════════════════════════════════════════════════════
  // SOCIAL (8)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'soc_01',
    category: 'Social',
    question:
      "Tu trouves un portefeuille dans la rue avec 500€ en liquide et une carte d'identité. La personne semble très riche. Tu fais quoi ?",
    choices: [
      { label: 'Je contacte la police et rends tout.', traitDeltas: { stability: 5, conflict: -3 } },
      { label: "Je prends 50€ pour l'effort et rends le reste.", traitDeltas: { conflict: 5, risk: 3 } },
      { label: "Je garde tout. C'est un cadeau de l'univers.", traitDeltas: { sociability: -5, emotion: 4 } },
    ],
  },
  {
    id: 'soc_02',
    category: 'Social',
    question:
      "Tu arrives en retard au travail avec une chemise rouge. Tu vois une story disant que le rouge porte malheur aujourd'hui. Comment réagis-tu ?",
    choices: [
      { label: "Je la garde, les superstitions c'est nul.", traitDeltas: { risk: 6, stability: 4 } },
      { label: 'Je la change, on ne sait jamais.', traitDeltas: { emotion: 5, risk: -4 } },
      { label: 'Je rigole en montrant la story à tout le monde.', traitDeltas: { humor: 7, sociability: 4 } },
    ],
  },
  {
    id: 'soc_03',
    category: 'Social',
    question:
      'Un inconnu dans le métro te parle et semble vouloir lier conversation. Tu fais ?',
    choices: [
      { label: 'Je discute, les rencontres imprévues sont sympa.', traitDeltas: { sociability: 7, risk: 4 } },
      { label: 'Je réponds poliment mais je reste bref·ve.', traitDeltas: { sociability: 2, stability: 3 } },
      { label: 'Je remets mes écouteurs subtilement.', traitDeltas: { sociability: -4, humor: 3 } },
    ],
  },
  {
    id: 'soc_04',
    category: 'Social',
    question:
      "Ton voisin met de la musique à fond à 23h un mardi soir. Ta réaction ?",
    choices: [
      { label: 'Je vais sonner chez lui pour lui demander gentiment de baisser.', traitDeltas: { sociability: 5, conflict: 4 } },
      { label: "J'appelle la police directement.", traitDeltas: { conflict: 6, stability: 3 } },
      { label: 'Je monte le son de mon côté, guerre déclarée.', traitDeltas: { humor: 5, risk: 6 } },
    ],
  },
  {
    id: 'soc_05',
    category: 'Social',
    question:
      "Tu es en soirée et quelqu'un raconte une blague raciste. Tout le monde rit. Tu fais quoi ?",
    choices: [
      { label: 'Je dis clairement que ça ne me fait pas rire.', traitDeltas: { conflict: 7, stability: 5 } },
      { label: 'Je ne ris pas mais je ne dis rien.', traitDeltas: { conflict: -3, emotion: 4 } },
      { label: 'Je réponds avec une blague plus intelligente pour détourner.', traitDeltas: { humor: 6, sociability: 4 } },
    ],
  },
  {
    id: 'soc_06',
    category: 'Social',
    question:
      "Tu croises ton patron au supermarché un dimanche. Il est en pyjama. Tu fais ?",
    choices: [
      { label: "Je le salue naturellement, tout le monde a une vie privée.", traitDeltas: { sociability: 5, stability: 4 } },
      { label: 'Je fais semblant de ne pas le voir.', traitDeltas: { sociability: -3, conflict: -2 } },
      { label: "Je prends une photo discrète pour les collègues.", traitDeltas: { humor: 7, risk: 5 } },
    ],
  },
  {
    id: 'soc_07',
    category: 'Social',
    question:
      "Un ami te demande de l'aider à déménager ce week-end. Tu avais prévu de ne rien faire. Tu ?",
    choices: [
      { label: "J'y vais sans hésiter, c'est ça l'amitié.", traitDeltas: { sociability: 7, stability: 3 } },
      { label: "J'invente une excuse, j'ai besoin de repos.", traitDeltas: { sociability: -4, stability: 5 } },
      { label: "J'y vais mais je négocie un resto en échange.", traitDeltas: { humor: 4, conflict: 3 } },
    ],
  },
  {
    id: 'soc_08',
    category: 'Social',
    question:
      "Tu reçois un message vocal de 7 minutes d'un ami. Ta réaction ?",
    choices: [
      { label: "J'écoute en entier, il a sûrement besoin de parler.", traitDeltas: { sociability: 6, emotion: 4 } },
      { label: "J'écoute en accéléré x2.", traitDeltas: { humor: 4, stability: 3 } },
      { label: "Je réponds par un 'résume stp' 😅", traitDeltas: { humor: 6, sociability: -2 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ABSURD (8)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'abs_01',
    category: 'Absurd',
    question:
      "L'apocalypse zombie éclate pendant que tu es aux toilettes publiques... et il n'y a plus de papier. Quelle est ta stratégie ?",
    choices: [
      { label: "J'utilise mes chaussettes et sors me battre !", traitDeltas: { risk: 8, sociability: 5 } },
      { label: "J'attends que ça se calme sur TikTok.", traitDeltas: { stability: 4, emotion: -4 } },
      { label: 'Je me sacrifie sur le trône.', traitDeltas: { humor: 8, risk: 3 } },
    ],
  },
  {
    id: 'abs_02',
    category: 'Absurd',
    question:
      "Ton chat commence à te parler avec la voix de ton patron. Tu fais quoi ?",
    choices: [
      { label: 'Je lui demande une augmentation.', traitDeltas: { humor: 8, risk: 5 } },
      { label: 'Je joue le jeu, on ne sait jamais.', traitDeltas: { humor: 6, risk: 4 } },
      { label: 'Je prends RDV chez le médecin.', traitDeltas: { stability: 5, emotion: 4 } },
    ],
  },
  {
    id: 'abs_03',
    category: 'Absurd',
    question:
      "Tu te réveilles et tu découvres que tout le monde parle à l'envers. Tu fais ?",
    choices: [
      { label: "J'apprends la langue pour m'adapter.", traitDeltas: { risk: 6, stability: 5 } },
      { label: 'Je mets ça sur TikTok immédiatement.', traitDeltas: { humor: 7, sociability: 6 } },
      { label: 'Je reste chez moi en attendant que ça passe.', traitDeltas: { sociability: -5, stability: 2 } },
    ],
  },
  {
    id: 'abs_04',
    category: 'Absurd',
    question:
      "Une intelligence artificielle te propose d'écrire ta vie à ta place. Tu acceptes ?",
    choices: [
      { label: "Oui, tant qu'elle fait mieux que moi.", traitDeltas: { humor: 5, risk: 4 } },
      { label: "Non, c'est mon histoire, pas la sienne.", traitDeltas: { stability: 6, conflict: 3 } },
      { label: 'Je panique et débranche tout.', traitDeltas: { emotion: 7, risk: -5 } },
    ],
  },
  {
    id: 'abs_05',
    category: 'Absurd',
    question:
      "Tu reçois un colis avec ton propre nom comme expéditeur ET comme destinataire. Tu ?",
    choices: [
      { label: "Je l'ouvre sans hésiter.", traitDeltas: { risk: 7, humor: 4 } },
      { label: "J'appelle la poste pour signalement.", traitDeltas: { stability: 6, risk: -3 } },
      { label: 'Je partage le mystère avec mes proches.', traitDeltas: { sociability: 6, humor: 4 } },
    ],
  },
  {
    id: 'abs_06',
    category: 'Absurd',
    question:
      "Tu découvres que ton reflet dans le miroir te suit avec 2 secondes de retard. Tu ?",
    choices: [
      { label: 'Je fais des danses pour le tester.', traitDeltas: { humor: 8, risk: 5 } },
      { label: 'Je couvre tous les miroirs de la maison.', traitDeltas: { emotion: 7, stability: -4 } },
      { label: "Je l'ignore et je vaque à mes occupations.", traitDeltas: { stability: 7, emotion: -4 } },
    ],
  },
  {
    id: 'abs_07',
    category: 'Absurd',
    question:
      "Tu gagnes le pouvoir de lire les pensées pendant 24h. Tu fais quoi en premier ?",
    choices: [
      { label: "Je vérifie ce que pense vraiment mon crush.", traitDeltas: { emotion: 7, risk: 5 } },
      { label: "Je vais au poker et je deviens riche.", traitDeltas: { risk: 8, humor: 4 } },
      { label: "Je reste seul, j'ai trop peur de ce que je vais entendre.", traitDeltas: { stability: 3, sociability: -5 } },
    ],
  },
  {
    id: 'abs_08',
    category: 'Absurd',
    question:
      "Tu peux voyager dans le temps mais seulement de 10 minutes. Tu l'utilises pour ?",
    choices: [
      { label: "Refaire mes blagues qui n'ont pas marché.", traitDeltas: { humor: 8, sociability: 4 } },
      { label: 'Éviter toutes les situations gênantes.', traitDeltas: { stability: 5, conflict: -3 } },
      { label: 'Gagner à pile ou face à chaque fois.', traitDeltas: { risk: 6, humor: 3 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // VALUES (8)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'val_01',
    category: 'Values',
    question:
      "Tu apprends qu'un·e de tes proches a triché à un examen important. Tu fais ?",
    choices: [
      { label: "Je lui dis clairement que c'était mal.", traitDeltas: { conflict: 6, stability: 5 } },
      { label: "Je l'aide à comprendre pourquoi c'est problématique.", traitDeltas: { sociability: 5, stability: 4 } },
      { label: "Je ne dis rien, ce n'est pas mon problème.", traitDeltas: { conflict: -4, stability: 2 } },
    ],
  },
  {
    id: 'val_02',
    category: 'Values',
    question:
      "On te propose un travail très bien payé mais qui ne correspond pas à tes valeurs. Tu ?",
    choices: [
      { label: "Je refuse, l'argent ne fait pas tout.", traitDeltas: { stability: 7, risk: 3 } },
      { label: "J'accepte pour une période limitée et j'économise.", traitDeltas: { stability: 4, risk: 4 } },
      { label: 'Je négocie pour adapter le poste à mes valeurs.', traitDeltas: { conflict: 5, stability: 5 } },
    ],
  },
  {
    id: 'val_03',
    category: 'Values',
    question:
      "Tu es seul·e témoin d'une injustice dans la rue. Ton réflexe ?",
    choices: [
      { label: "J'interviens directement.", traitDeltas: { risk: 8, sociability: 5 } },
      { label: "J'appelle les secours ou la police.", traitDeltas: { stability: 6, conflict: 2 } },
      { label: "Je passe, de peur d'aggraver la situation.", traitDeltas: { emotion: 5, risk: -6 } },
    ],
  },
  {
    id: 'val_04',
    category: 'Values',
    question:
      "Un mensonge \"blanc\" pourrait protéger quelqu'un que tu aimes. Tu mens ?",
    choices: [
      { label: 'Oui, protéger les siens passe avant tout.', traitDeltas: { sociability: 6, emotion: 4 } },
      { label: 'Non, la vérité, même difficile, vaut mieux.', traitDeltas: { stability: 7, conflict: 3 } },
      { label: 'Je dis une demi-vérité pour tempérer.', traitDeltas: { stability: 3, conflict: -2 } },
    ],
  },
  {
    id: 'val_05',
    category: 'Values',
    question:
      "Tu trouves une faille dans le système de ta banque qui pourrait te rapporter 10 000€ sans risque de te faire prendre. Tu ?",
    choices: [
      { label: 'Je signale la faille à la banque.', traitDeltas: { stability: 8, conflict: 2 } },
      { label: "J'en profite, le système est injuste de toute façon.", traitDeltas: { risk: 7, conflict: 5 } },
      { label: "Je ne fais rien et j'oublie ce que j'ai vu.", traitDeltas: { stability: 4, emotion: 3 } },
    ],
  },
  {
    id: 'val_06',
    category: 'Values',
    question:
      "Ton meilleur ami lance un business. Son idée est mauvaise. Il te demande ton avis. Tu ?",
    choices: [
      { label: "Je suis honnête, quitte à le blesser.", traitDeltas: { conflict: 6, stability: 5 } },
      { label: "Je l'encourage, il a besoin de soutien.", traitDeltas: { sociability: 6, emotion: 4 } },
      { label: "Je souligne les points faibles constructivement.", traitDeltas: { stability: 5, sociability: 3 } },
    ],
  },
  {
    id: 'val_07',
    category: 'Values',
    question:
      "Tu hérites d'une somme importante. Ta priorité ?",
    choices: [
      { label: "Je sécurise : épargne et investissement long terme.", traitDeltas: { stability: 8, risk: -3 } },
      { label: "Je vis l'instant : voyage, expériences, kiff.", traitDeltas: { risk: 7, sociability: 5 } },
      { label: "Je partage avec ma famille et mes proches.", traitDeltas: { sociability: 7, emotion: 5 } },
    ],
  },
  {
    id: 'val_08',
    category: 'Values',
    question:
      "Tu peux effacer un seul souvenir de ta mémoire pour toujours. Tu effaces ?",
    choices: [
      { label: "Mon plus gros regret.", traitDeltas: { emotion: 6, stability: -3 } },
      { label: "Rien. Chaque souvenir m'a construit.", traitDeltas: { stability: 8, emotion: 3 } },
      { label: "Ma plus grosse honte publique.", traitDeltas: { humor: 4, sociability: 3 } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // RELATIONSHIP (8)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'rel_01',
    category: 'Relationship',
    question:
      "Premier date, la personne passe 80% du temps à se plaindre de son ex. Ta réaction ?",
    choices: [
      { label: "Je fais le psy pour l'aider.", traitDeltas: { sociability: 7, emotion: 5 } },
      { label: "J'écoute poliment, mais je ghoste demain.", traitDeltas: { conflict: -6, stability: 4 } },
      { label: 'Je parle de mon ex encore plus fort.', traitDeltas: { humor: 6, conflict: 7 } },
    ],
  },
  {
    id: 'rel_02',
    category: 'Relationship',
    question:
      "Ton partenaire critique ton plat préféré devant tes parents. Tu fais ?",
    choices: [
      { label: "Je ris avec eux, ça détend l'atmosphère.", traitDeltas: { humor: 7, stability: 5 } },
      { label: 'Je défends mon plat avec passion.', traitDeltas: { conflict: 5, emotion: 4 } },
      { label: "Je change de sujet pour sauver l'ambiance.", traitDeltas: { sociability: 4, conflict: -3 } },
    ],
  },
  {
    id: 'rel_03',
    category: 'Relationship',
    question:
      "Tu réalises que tu as envoyé un message privé en mode public. Tu ?",
    choices: [
      { label: "Je le supprime vite et fais semblant que rien n'est arrivé.", traitDeltas: { stability: 3, emotion: 4 } },
      { label: "Je l'assume avec humour.", traitDeltas: { humor: 8, stability: 5 } },
      { label: "Je disparais d'internet pendant une semaine.", traitDeltas: { emotion: 7, sociability: -5 } },
    ],
  },
  {
    id: 'rel_04',
    category: 'Relationship',
    question:
      "Un·e ami·e te demande ton avis honnête sur sa nouvelle coupe de cheveux ratée. Tu ?",
    choices: [
      { label: "Je dis que ça me plaît, l'amitié d'abord.", traitDeltas: { sociability: 5, conflict: -4 } },
      { label: 'Je suis honnête avec douceur.', traitDeltas: { stability: 6, conflict: 3 } },
      { label: 'Je détourne la question avec une blague.', traitDeltas: { humor: 7, conflict: -2 } },
    ],
  },
  {
    id: 'rel_05',
    category: 'Relationship',
    question:
      "Tu découvres que ton ex sort avec ton/ta meilleur·e ami·e. Ta réaction ?",
    choices: [
      { label: 'Je les congratule, la vie avance.', traitDeltas: { stability: 8, emotion: -4 } },
      { label: 'Je parle ouvertement de ce que je ressens.', traitDeltas: { emotion: 6, conflict: 4 } },
      { label: 'Je supprime tout le monde de mes réseaux.', traitDeltas: { emotion: 8, sociability: -6 } },
    ],
  },
  {
    id: 'rel_06',
    category: 'Relationship',
    question:
      "En couple, ton/ta partenaire veut passer TOUTES ses soirées avec toi. Tu ?",
    choices: [
      { label: "Je trouve ça adorable, je suis partant·e.", traitDeltas: { sociability: 6, emotion: 4 } },
      { label: "J'explique que j'ai besoin d'espace aussi.", traitDeltas: { stability: 7, conflict: 4 } },
      { label: 'Je propose un compromis : 4 soirs sur 7.', traitDeltas: { stability: 5, conflict: 3 } },
    ],
  },
  {
    id: 'rel_07',
    category: 'Relationship',
    question:
      "Ton/ta partenaire oublie votre anniversaire de couple. Tu ?",
    choices: [
      { label: "Je le/la taquine gentiment pour lui rappeler.", traitDeltas: { humor: 6, sociability: 4 } },
      { label: "Je suis blessé·e et je le dis.", traitDeltas: { emotion: 7, conflict: 5 } },
      { label: "Je fais comme si de rien n'était mais je note.", traitDeltas: { conflict: -4, emotion: 5 } },
    ],
  },
  {
    id: 'rel_08',
    category: 'Relationship',
    question:
      "Tu surprends ton/ta meilleur·e ami·e en train de parler de toi dans ton dos. Tu ?",
    choices: [
      { label: "Je le/la confronte immédiatement.", traitDeltas: { conflict: 8, risk: 5 } },
      { label: "Je prends du recul pour comprendre pourquoi.", traitDeltas: { stability: 6, emotion: 3 } },
      { label: "Je fais la même chose pour qu'il/elle comprenne.", traitDeltas: { humor: 4, conflict: 6 } },
    ],
  },
];

type ChoiceSet = {
  labels: [string, string, string];
  deltas: [TraitDelta, TraitDelta, TraitDelta];
};

type GeneratedPackConfig = {
  category: ScenarioCategory;
  prefix: string;
  stems: string[];
  twists: string[];
  endings: string[];
  choiceSets: ChoiceSet[];
  target: number;
};

function makeScenario(
  id: string,
  category: ScenarioCategory,
  question: string,
  choiceSet: ChoiceSet
): Scenario {
  return {
    id,
    category,
    question,
    choices: choiceSet.labels.map((label, index) => ({
      label,
      traitDeltas: choiceSet.deltas[index],
    })),
  };
}

function buildGeneratedPack({
  category,
  prefix,
  stems,
  twists,
  endings,
  choiceSets,
  target,
}: GeneratedPackConfig): Scenario[] {
  const scenarios: Scenario[] = [];
  const seenQuestions = new Set<string>();
  let comboIndex = 0;

  for (const stem of stems) {
    for (const twist of twists) {
      const ending = endings[comboIndex % endings.length];
      const question = `${stem} ${twist}. ${ending}`;

      if (seenQuestions.has(question)) {
        comboIndex += 1;
        continue;
      }

      seenQuestions.add(question);
      const choiceSet = choiceSets[comboIndex % choiceSets.length];
      scenarios.push(
        makeScenario(
          `${prefix}_${String(scenarios.length + 1).padStart(3, '0')}`,
          category,
          question,
          choiceSet
        )
      );

      comboIndex += 1;

      if (scenarios.length >= target) {
        return scenarios;
      }
    }
  }

  return scenarios;
}

const SOCIAL_STEMS = [
  'En soirée,',
  'Dans un dîner avec des inconnus,',
  'Au travail pendant une réunion,',
  'Dans une conversation de groupe en ligne,',
  'Pendant un week-end entre amis,',
  'Dans ta famille au moment du dessert,',
  'À un anniversaire où tu connais peu de monde,',
  'Dans un open space un lundi matin,',
  'À la salle de sport entre deux exercices,',
  'Pendant un trajet en covoiturage,',
  'Dans un projet bénévole,',
  'Lors d une sortie entre collègues,',
  'À un mariage où tout le monde se jauge un peu,',
  'Dans un groupe qui prépare un voyage ensemble,',
];

const SOCIAL_TWISTS = [
  'quelqu un monopolise la parole sans s en rendre compte',
  'deux personnes se lancent des piques passives-agressives',
  'une personne très discrète semble décrocher complètement',
  'quelqu un cherche à te faire choisir un camp',
  'une blague met soudain tout le monde mal à l aise',
  'quelqu un se vante un peu trop pour être crédible',
  'une tension silencieuse s installe sans raison claire',
  'quelqu un révèle une info intime qui n était pas pour le groupe',
];

const SOCIAL_ENDINGS = [
  'Comment tu te places ?',
  'Ton premier réflexe ?',
  'Tu fais quoi concrètement ?',
  'Tu prends quelle posture ?',
  'Tu réagis comment ?',
  'Tu te positionnes de quelle manière ?',
];

const SOCIAL_CHOICES: ChoiceSet[] = [
  {
    labels: [
      'Je pose calmement le cadre et je remets un peu d air dans la pièce.',
      'Je regarde d abord ce qui se joue avant de choisir mon moment.',
      'Je fais un léger pas de côté humoristique pour faire redescendre la pression.',
    ],
    deltas: [
      { sociability: 6, conflict: 4, stability: 4 },
      { stability: 6, emotion: -1, sociability: 2 },
      { humor: 7, sociability: 4, risk: 2 },
    ],
  },
  {
    labels: [
      'Je vais vers la personne la moins à l aise pour la ramener dans le jeu.',
      'Je garde une posture neutre pour ne pas amplifier le malaise.',
      'Je change l énergie du groupe avec une question inattendue.',
    ],
    deltas: [
      { sociability: 7, emotion: 4, stability: 2 },
      { stability: 5, conflict: -2, emotion: 1 },
      { humor: 5, risk: 4, sociability: 4 },
    ],
  },
  {
    labels: [
      'Je dis franchement ce qui me dérange, sans monter le ton.',
      'Je temporise et je reformule pour éviter le clash inutile.',
      'Je détourne avec un second degré très assumé pour tester la maturité du groupe.',
    ],
    deltas: [
      { conflict: 7, stability: 4, sociability: 3 },
      { stability: 6, conflict: 2, emotion: -1 },
      { humor: 6, risk: 5, sociability: 2 },
    ],
  },
  {
    labels: [
      'Je relance la discussion vers quelque chose de plus sincère.',
      'Je reste en retrait et j observe qui tient vraiment la pièce.',
      'Je crée un micro-dérapage drôle pour voir qui suit et qui se crispe.',
    ],
    deltas: [
      { sociability: 6, emotion: 3, conflict: 2 },
      { stability: 5, sociability: -1, emotion: 1 },
      { humor: 7, risk: 5, emotion: 1 },
    ],
  },
];

const VALUES_STEMS = [
  'On te propose un avantage que tu n as pas vraiment mérité',
  'Tu découvres qu un proche a arrangé la vérité pour sauver son image',
  'Un collègue prend le crédit d un travail collectif',
  'Tu peux obtenir quelque chose d important en restant silencieux',
  'On attend de toi une loyauté qui entre en collision avec tes principes',
  'Tu apprends qu une injustice profite à quelqu un que tu apprécies',
  'Tu vois une personne manipuler le récit à son avantage',
  'On te demande de fermer les yeux sur une petite triche utile',
  'Tu peux protéger ton confort personnel en laissant un doute planer',
  'Tu réalises qu une personne vulnérable va payer pour une décision pratique',
  'Quelqu un utilise une confidence pour mieux se placer',
  'Tu as accès à une information qui pourrait tout faire basculer',
  'Une récompense est distribuée de façon clairement biaisée',
  'On te pousse à choisir l efficacité plutôt que l équité',
  'Tu peux éviter un conflit en laissant passer quelque chose de faux',
  'Tu observes une scène où tout le monde préfère faire comme si de rien n était',
  'On veut te convaincre qu une bonne intention excuse n importe quel moyen',
  'Tu peux dire la vérité au risque de casser une ambiance confortable',
  'Une règle absurde pénalise quelqu un de bien, mais te favorise toi',
  'Tu comprends que ton silence serait applaudi parce qu il arrange tout le monde',
];

const VALUES_TWISTS = [
  'alors que personne autour de toi ne semble le voir',
  'et ça pourrait clairement te simplifier la vie',
  'au moment exact où tout le monde attend une réaction',
  'alors qu une personne plus fragile risque d en payer le prix',
  'et le contexte te donne une bonne excuse pour te taire',
  'alors que la version la plus simple n est pas la plus juste',
  'dans un moment où ta réputation pourrait aussi être touchée',
  'et tout le monde te dira sûrement de ne pas compliquer les choses',
  'alors que personne n est totalement innocent dans l histoire',
  'et ta première impulsion risque de révéler tes vraies valeurs',
];

const VALUES_ENDINGS = [
  'Tu fais quoi ?',
  'Ton premier geste ?',
  'Tu choisis quelle ligne ?',
  'Tu réagis comment au fond ?',
  'Tu assumes quoi exactement ?',
];

const VALUES_CHOICES: ChoiceSet[] = [
  {
    labels: [
      'Je tiens la ligne juste, même si ça rend la scène inconfortable.',
      'Je cherche une manière propre de réparer sans humilier personne.',
      'Je protège l équilibre immédiat, quitte à revenir plus tard sur le fond.',
    ],
    deltas: [
      { stability: 7, conflict: 4, risk: 2 },
      { sociability: 4, stability: 5, emotion: 2 },
      { stability: 2, conflict: -2, emotion: 3 },
    ],
  },
  {
    labels: [
      'Je dis la vérité telle que je la vois, sans arrondir pour plaire.',
      'Je pose des questions pour que les gens voient eux-mêmes le problème.',
      'Je cherche un compromis qui limite la casse et garde une porte ouverte.',
    ],
    deltas: [
      { conflict: 6, stability: 6 },
      { sociability: 5, stability: 4, conflict: 1 },
      { stability: 4, conflict: -1, emotion: 2 },
    ],
  },
  {
    labels: [
      'Je refuse de profiter d un truc qui me met moralement à l aise deux minutes seulement.',
      'Je temporise pour comprendre tout le système avant de trancher.',
      'Je prends le bénéfice tout en gardant en tête la dette symbolique que ça crée.',
    ],
    deltas: [
      { stability: 8, risk: -2 },
      { stability: 5, emotion: -1, conflict: 1 },
      { risk: 5, humor: 2, conflict: 2 },
    ],
  },
  {
    labels: [
      'Je protège d abord la personne la plus exposée.',
      'Je protège la relation, puis je règle le fond dès que le calme revient.',
      'Je teste une réponse un peu décalée pour voir qui tient vraiment à ses valeurs.',
    ],
    deltas: [
      { emotion: 4, stability: 5, sociability: 3 },
      { sociability: 5, stability: 3, conflict: -1 },
      { humor: 5, risk: 4, conflict: 2 },
    ],
  },
];

const RELATIONSHIP_STEMS = [
  'Quelqu un que tu viens de rencontrer',
  'Une personne avec qui tu flirtes depuis peu',
  'Ton ou ta partenaire',
  'Quelqu un qui te plaît beaucoup mais reste flou',
  'Une personne très démonstrative au début',
  'Quelqu un d ultra stable en apparence',
  'Une personne qui te ressemble beaucoup émotionnellement',
  'Quelqu un qui te trouble sans jamais te rassurer vraiment',
  'Une personne très indépendante',
  'Un ex qui réapparaît sans prévenir',
  'Quelqu un qui te dit qu il ou elle te comprend vite',
  'Une personne avec qui la connexion est forte mais irrégulière',
  'Quelqu un qui t impressionne socialement',
  'Une personne très tendre mais difficile à lire',
  'Quelqu un qui veut aller très vite',
  'Une personne qui avance exactement au rythme inverse du tien',
  'Quelqu un qui adore parler du futur sans sécuriser le présent',
  'Une personne qui te donne beaucoup d intensité mais peu de clarté',
  'Quelqu un qui dit détester les drames mais en fabrique autour de lui ou d elle',
  'Une personne qui a visiblement peur d être vraiment connue',
];

const RELATIONSHIP_TWISTS = [
  'te dit qu il ou elle a besoin de silence pendant quelques jours',
  'annule un moment important à la dernière minute',
  'se confie énormément puis redevient soudain très distant·e',
  'te teste avec une petite jalousie à peine assumée',
  'te demande plus de transparence que ce qu il ou elle donne',
  'te lance un vrai compliment juste après un moment froid',
  'semble vouloir la proximité sans supporter la friction',
  'te dit qu il ou elle a peur de s attacher pour de vrai',
  'ramène souvent l histoire à ses anciennes blessures',
  'te donne un signal fort puis agit comme si de rien n était',
];

const RELATIONSHIP_ENDINGS = [
  'Ton premier réflexe ?',
  'Tu réagis comment ?',
  'Tu prends quelle posture ?',
  'Tu fais quoi sans te trahir ?',
  'Tu réponds de quelle manière ?',
];

const RELATIONSHIP_CHOICES: ChoiceSet[] = [
  {
    labels: [
      'Je pose une question claire, même si la réponse peut piquer.',
      'Je laisse de l espace, mais je garde mon axe bien visible.',
      'Je réponds avec une touche de légèreté pour sentir la vraie texture du lien.',
    ],
    deltas: [
      { conflict: 5, stability: 5, emotion: 2 },
      { stability: 6, emotion: -1, sociability: 1 },
      { humor: 6, emotion: 2, risk: 3 },
    ],
  },
  {
    labels: [
      'Je nomme ce que ça me fait sans dramatiser.',
      'Je prends un peu de recul pour voir si les actes suivent enfin les mots.',
      'Je teste le lien avec un pas de côté presque fou, juste pour voir la vérité revenir.',
    ],
    deltas: [
      { emotion: 6, conflict: 3, stability: 2 },
      { stability: 7, emotion: -2 },
      { humor: 4, risk: 6, sociability: 2 },
    ],
  },
  {
    labels: [
      'Je garde mon niveau d ouverture, mais je demande une vraie cohérence.',
      'Je m adapte au rythme proposé tant qu il reste respectueux.',
      'Je transforme la tension en jeu léger pour voir s il y a de la maturité derrière.',
    ],
    deltas: [
      { stability: 6, conflict: 4, sociability: 2 },
      { sociability: 4, stability: 3, conflict: -1 },
      { humor: 7, risk: 3, emotion: 1 },
    ],
  },
  {
    labels: [
      'Je protège mon centre avant de protéger la relation.',
      'Je privilégie l empathie, sans perdre mes limites.',
      'Je prends le pari d un geste inattendu pour casser le scénario habituel.',
    ],
    deltas: [
      { stability: 7, emotion: -1, conflict: 2 },
      { sociability: 5, emotion: 4, stability: 2 },
      { risk: 6, humor: 4, emotion: 2 },
    ],
  },
];

const ABSURD_STEMS = [
  'Tu te réveilles et ton ombre ne copie plus exactement tes gestes',
  'Une version future de toi t envoie des vocaux incompréhensibles',
  'Ton téléphone affiche les émotions des gens au lieu de leurs notifications',
  'Chaque fois que tu mens, un pigeon apparaît près de toi',
  'Ton reflet te juge à voix haute uniquement quand tu hésites',
  'Un distributeur automatique te pose des questions existentielles avant de rendre ta monnaie',
  'Tu découvres qu une plante de ton salon anticipe les disputes',
  'Pendant une journée, tous les feux rouges semblent te parler de ton passé',
  'Une IA de cuisine décide de commenter ta vie amoureuse pendant que tu fais bouillir des pâtes',
  'Tu peux entendre les pensées des objets qui te suivent partout',
  'Ton réveil refuse de sonner si tu n es pas honnête avec toi-même',
  'Une lune minuscule flotte au-dessus de toi dès que tu caches quelque chose',
];

const ABSURD_TWISTS = [
  'juste avant un rendez-vous important',
  'au moment où tu dois choisir entre confort et vérité',
  'pendant que tout le monde autour de toi agit normalement',
  'alors que tu n as dormi que quatre heures',
  'dans un lieu où tu ne peux pas facilement t expliquer',
  'et plus tu paniques, plus le phénomène devient théâtral',
  'au moment précis où quelqu un essaie de te séduire',
  'alors que tu es déjà en retard de vingt minutes',
];

const ABSURD_ENDINGS = [
  'Ta première réaction ?',
  'Tu fais quoi ?',
  'Tu gères ça comment ?',
  'Ton réflexe profond ?',
];

const ABSURD_CHOICES: ChoiceSet[] = [
  {
    labels: [
      'Je teste la faille jusqu au bout, quitte à passer pour étrange.',
      'Je garde mon calme et j essaie de comprendre la règle cachée.',
      'Je joue avec le chaos comme si c était un mini cadeau cosmique.',
    ],
    deltas: [
      { risk: 7, humor: 3, sociability: 1 },
      { stability: 6, emotion: -2, risk: 1 },
      { humor: 8, risk: 4, emotion: 1 },
    ],
  },
  {
    labels: [
      'Je documente tout, parce que personne ne me croira sinon.',
      'Je cherche l angle rationnel avant d offrir mon énergie à l étrange.',
      'Je réponds à l univers avec une décision encore plus foufoue.',
    ],
    deltas: [
      { stability: 4, risk: 3, sociability: 2 },
      { stability: 7, emotion: -3 },
      { humor: 7, risk: 6, sociability: 1 },
    ],
  },
  {
    labels: [
      'Je confronte immédiatement le phénomène comme s il avait rendez-vous avec moi.',
      'Je temporise et j attends de voir ce qu il révèle vraiment.',
      'Je transforme la scène en expérience presque artistique.',
    ],
    deltas: [
      { conflict: 4, risk: 5, stability: 1 },
      { stability: 6, emotion: -1, humor: 1 },
      { humor: 6, sociability: 3, risk: 4 },
    ],
  },
  {
    labels: [
      'Je vérifie si le délire parle surtout de moi ou du monde autour.',
      'Je protège ma journée d abord, le mystère ensuite.',
      'Je plonge dedans pour voir jusqu où ça ose aller.',
    ],
    deltas: [
      { emotion: 4, stability: 3, risk: 2 },
      { stability: 7, risk: -1 },
      { risk: 8, humor: 4, emotion: 1 },
    ],
  },
];

const GENERATED_SCENARIOS: Scenario[] = [
  ...buildGeneratedPack({
    category: 'Social',
    prefix: 'socx',
    stems: SOCIAL_STEMS,
    twists: SOCIAL_TWISTS,
    endings: SOCIAL_ENDINGS,
    choiceSets: SOCIAL_CHOICES,
    target: 112,
  }),
  ...buildGeneratedPack({
    category: 'Values',
    prefix: 'valx',
    stems: VALUES_STEMS,
    twists: VALUES_TWISTS,
    endings: VALUES_ENDINGS,
    choiceSets: VALUES_CHOICES,
    target: 148,
  }),
  ...buildGeneratedPack({
    category: 'Relationship',
    prefix: 'relx',
    stems: RELATIONSHIP_STEMS,
    twists: RELATIONSHIP_TWISTS,
    endings: RELATIONSHIP_ENDINGS,
    choiceSets: RELATIONSHIP_CHOICES,
    target: 148,
  }),
  ...buildGeneratedPack({
    category: 'Absurd',
    prefix: 'absx',
    stems: ABSURD_STEMS,
    twists: ABSURD_TWISTS,
    endings: ABSURD_ENDINGS,
    choiceSets: ABSURD_CHOICES,
    target: 60,
  }),
];

export const PROFILE_COMPLETION_TARGET = 20;

export const SCENARIOS: Scenario[] = [
  ...CURATED_SCENARIOS,
  ...GENERATED_SCENARIOS,
];
