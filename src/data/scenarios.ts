import { Scenario, ScenarioCategory, ScenarioLevel, TraitDelta } from '../types';

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
      { label: "Je réponds par un 'résume stp'.", traitDeltas: { humor: 6, sociability: -2 } },
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
      { label: "Je lui jette mon assiete sur sa gueule.", traitDeltas: { sociability: 4, conflict: -3 } },
    ],
  },
  {
    id: 'rel_03',
    category: 'Relationship',
    question:
      "Tu réalises que tu as envoyé une video privé en mode public. Tu ?",
    choices: [
      { label: "Je le supprime vite et fais semblant que rien n'est arrivé.", traitDeltas: { stability: 3, emotion: 4 } },
      { label: "Je l'assume avec humour.", traitDeltas: { humor: 8, stability: 5 } },
      { label: "Je disparais d'internet pour toujours.", traitDeltas: { emotion: 7, sociability: -5 } },
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
      { label: 'Je lui dis de porter plainte.', traitDeltas: { humor: 7, conflict: -2 } },
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
      { label: 'Je propose une relation à 3.', traitDeltas: { emotion: 8, sociability: -6 } },
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
      { label: "Je lui achete un kdo de merde.", traitDeltas: { emotion: 7, conflict: 5 } },
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

  // ═══════════════════════════════════════════════════════════════════
  // VIRAL — dilemmes haute viralité (partage, choc, débat)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'viral_01',
    category: 'Values',
    question:
      "Tu trouves 200€ dans la veste que ta mère t'a donnée. Elle ne sait pas qu'ils étaient là. Tu fais quoi ?",
    choices: [
      { label: "Je lui dis immédiatement et je les lui rends.", traitDeltas: { stability: 7, conflict: 2 } },
      { label: "Je les garde — finders keepers, même en famille.", traitDeltas: { risk: 5, humor: 3 } },
      { label: "Je l'invite à dîner avec cet argent sans rien dire.", traitDeltas: { humor: 6, sociability: 5 } },
    ],
  },
  {
    id: 'viral_02',
    category: 'Social',
    question:
      "Tu mets accidentellement un like sur une photo Instagram de ton crush... datant de 2019. Il/elle a vu la notification. Ta stratégie ?",
    choices: [
      { label: "Je unlike en 0,3 secondes et je fais le mort.", traitDeltas: { stability: 3, humor: 5 } },
      { label: "J'envoie un message : 'Ouais, j'ai stalké, et alors ?'", traitDeltas: { risk: 8, sociability: 6 } },
      { label: "Je supprime mon compte et je déménage.", traitDeltas: { humor: 9, emotion: -4 } },
    ],
  },
  {
    id: 'viral_03',
    category: 'Relationship',
    question:
      "Ton/ta partenaire te demande sincèrement : 'Si tu avais eu une autre vie, tu m'aurais quand même choisi·e ?' Tu réponds quoi ?",
    choices: [
      { label: "Oui, sans hésiter — et je le pense vraiment.", traitDeltas: { emotion: 8, sociability: 4 } },
      { label: "Je suis honnête : 'Je ne sais pas, la vie est complexe.'", traitDeltas: { stability: 6, conflict: 4 } },
      { label: "Je détourne avec humour pour éviter la bombe émotionnelle.", traitDeltas: { humor: 7, conflict: -3 } },
    ],
  },
  {
    id: 'viral_04',
    category: 'Values',
    question:
      "Ta banque te crédite par erreur de 3 000€. Elle ne s'en rend pas compte depuis 1 mois. Légalement, garder cet argent = vol. Tu fais quoi ?",
    choices: [
      { label: "Je signale l'erreur, évidemment.", traitDeltas: { stability: 8, conflict: 2 } },
      { label: "Je garde tout. Le système bancaire me doit bien ça.", traitDeltas: { risk: 7, conflict: 5 } },
      { label: "Je dépense 300€ puis j'attends que ça se règle.", traitDeltas: { humor: 5, risk: 4 } },
    ],
  },
  {
    id: 'viral_05',
    category: 'Social',
    question:
      "Tu vois ton manager mentir effrontément à un client en réunion. La direction est présente. La vérité ne ferait pas de dégâts. Tu ?",
    choices: [
      { label: "Je rectifie poliment en public.", traitDeltas: { conflict: 7, risk: 6 } },
      { label: "Je me tais maintenant et je lui en parle après.", traitDeltas: { stability: 5, conflict: -2 } },
      { label: "Je note tout et j'envoie un email à la direction plus tard.", traitDeltas: { stability: 6, conflict: 4 } },
    ],
  },
  {
    id: 'viral_06',
    category: 'Values',
    question:
      "Un médecin te dit 'vous devriez faire attention à votre poids' alors que tu venais pour une angine. Ta réaction ?",
    choices: [
      { label: "Je lui dis poliment que c'est hors sujet.", traitDeltas: { conflict: 6, stability: 5 } },
      { label: "Je prends note et je rentre chez moi vexé·e.", traitDeltas: { emotion: 6, conflict: -3 } },
      { label: "Je lui demande si il/elle a pensé à ses propres bilans de santé.", traitDeltas: { humor: 7, conflict: 6 } },
    ],
  },
  {
    id: 'viral_07',
    category: 'Absurd',
    question:
      "Superpouvour : tu deviens invisible... mais seulement quand personne ne te regarde déjà. Tu prends le pouvoir quand même ?",
    choices: [
      { label: "Oui, le principe suffit — je travaillerai les détails.", traitDeltas: { humor: 8, risk: 5 } },
      { label: "Non, c'est littéralement inutile.", traitDeltas: { stability: 5, humor: 3 } },
      { label: "J'accepte et je passe ma vie à chercher des témoins.", traitDeltas: { humor: 9, sociability: -3 } },
    ],
  },
  {
    id: 'viral_08',
    category: 'Values',
    question:
      "Tu peux effacer complètement ta présence sur internet : tous comptes, toutes photos, toutes traces. Définitivement. Tu le fais ?",
    choices: [
      { label: "Oui, immédiatement. La liberté d'abord.", traitDeltas: { stability: 7, sociability: -4 } },
      { label: "Non, c'est une partie de mon histoire.", traitDeltas: { sociability: 6, stability: 4 } },
      { label: "Je le fais... mais je crée un nouveau compte deux heures après.", traitDeltas: { humor: 8, risk: 3 } },
    ],
  },
  {
    id: 'viral_09',
    category: 'Values',
    question:
      "Ton meilleur ami te demande un alibi pour cette nuit. Il ne te dit pas pourquoi. Tu sens que c'est pas anodin. Tu couvres ?",
    choices: [
      { label: "Je couvre, sans question — c'est mon ami.", traitDeltas: { sociability: 7, conflict: -3 } },
      { label: "Je refuse sans une explication honnête.", traitDeltas: { stability: 7, conflict: 5 } },
      { label: "Je couvre mais je lui fais promettre de tout me dire après.", traitDeltas: { sociability: 5, stability: 4 } },
    ],
  },
  {
    id: 'viral_10',
    category: 'Relationship',
    question:
      "Tu as accès par hasard au téléphone déverrouillé de ton/ta partenaire. Aucune app ouverte. Vous vous faites confiance. Tu ?",
    choices: [
      { label: "Je repose le téléphone sans regarder.", traitDeltas: { stability: 8, emotion: 3 } },
      { label: "Je jette un coup d'œil rapide — juste pour être sûr·e.", traitDeltas: { emotion: 5, conflict: 4 } },
      { label: "Je lis tout. La confiance n'exclut pas la transparence.", traitDeltas: { conflict: 7, risk: 5 } },
    ],
  },
  {
    id: 'viral_11',
    category: 'Absurd',
    question:
      "On te propose : dors parfaitement 8h chaque nuit pour toujours... mais plus jamais aucun rêve. Tu acceptes ?",
    choices: [
      { label: "Oui, le sommeil de qualité ça n'a pas de prix.", traitDeltas: { stability: 7, emotion: -3 } },
      { label: "Non, mes rêves font partie de moi.", traitDeltas: { emotion: 7, stability: -2 } },
      { label: "Je teste 2 semaines pour voir si les rêves me manquent.", traitDeltas: { risk: 5, humor: 3 } },
    ],
  },
  {
    id: 'viral_12',
    category: 'Social',
    question:
      "Ton groupe WhatsApp familial. Ton oncle envoie une info clairement fausse (mais inoffensive). Tout le monde répond avec un signe d'approbation. Tu ?",
    choices: [
      { label: "Je corrige avec un lien factuel, calmement.", traitDeltas: { conflict: 5, stability: 5 } },
      { label: "Je valide aussi — la paix sociale avant tout.", traitDeltas: { sociability: 4, conflict: -5 } },
      { label: "Je fais un vocal de 3 minutes pour débunker avec passion.", traitDeltas: { humor: 5, conflict: 7 } },
    ],
  },
  {
    id: 'viral_13',
    category: 'Relationship',
    question:
      "Tu tombes sincèrement amoureux·se de quelqu'un. Petit détail : c'est le/la meilleur·e ami·e de ton/ta ex. Tu ?",
    choices: [
      { label: "Je l'assume — les sentiments, ça ne se contrôle pas.", traitDeltas: { risk: 8, emotion: 6 } },
      { label: "Je garde ça pour moi et je laisse passer.", traitDeltas: { stability: 6, emotion: -4 } },
      { label: "Je préviens mon ex avant toute chose.", traitDeltas: { conflict: 5, stability: 5 } },
    ],
  },
  {
    id: 'viral_14',
    category: 'Values',
    question:
      "Une app te propose de connaître l'opinion EXACTE de chaque personne qui compte dans ta vie sur toi. Gratuit. Anonymisé. Tu l'installes ?",
    choices: [
      { label: "Oui, je préfère savoir la vérité.", traitDeltas: { risk: 7, stability: -3 } },
      { label: "Non, certaines vérités sont mieux non-dites.", traitDeltas: { stability: 7, conflict: -2 } },
      { label: "J'installe mais je lis que les avis positifs.", traitDeltas: { humor: 8, emotion: 3 } },
    ],
  },
  {
    id: 'viral_15',
    category: 'Absurd',
    question:
      "Tu peux parler toutes les langues du monde... mais uniquement en chantant. Conversations normales interdites. Seulement chanté. Tu prends le pouvoir ?",
    choices: [
      { label: "Absolument. Je me vois déjà à l'ONU.", traitDeltas: { humor: 9, sociability: 5 } },
      { label: "Non, ça ruinerait ma vie professionnelle.", traitDeltas: { stability: 6, humor: -2 } },
      { label: "J'accepte et je choisis soigneusement mon genre musical.", traitDeltas: { humor: 7, risk: 4 } },
    ],
  },
  {
    id: 'viral_16',
    category: 'Values',
    question:
      "Tes parents t'ont aidé à acheter ton appart (50K€). 5 ans plus tard, ils traversent une grosse crise financière. Ils ne demandent rien. Tu ?",
    choices: [
      { label: "Je leur propose spontanément de les rembourser progressivement.", traitDeltas: { sociability: 7, stability: 5 } },
      { label: "J'attends qu'ils me le demandent si besoin.", traitDeltas: { stability: 4, conflict: -2 } },
      { label: "Je vends l'appart et on partage.", traitDeltas: { emotion: 8, risk: 5 } },
    ],
  },
  {
    id: 'viral_17',
    category: 'Social',
    question:
      "Tu découvres que ton collègue préféré a menti sur son CV pour être embauché. Vous êtes dans la même équipe depuis 2 ans. Tu fais quoi ?",
    choices: [
      { label: "Je ne dis rien — les résultats sont là et c'est mon ami.", traitDeltas: { sociability: 6, conflict: -4 } },
      { label: "Je lui en parle en privé d'abord.", traitDeltas: { stability: 6, conflict: 4 } },
      { label: "Je signale aux RH — les règles sont les règles.", traitDeltas: { stability: 7, conflict: 7 } },
    ],
  },
  {
    id: 'viral_18',
    category: 'Absurd',
    question:
      "Tout le monde peut lire tes pensées 1 jour par an, mais tu ne sais pas lequel. Comment tu prépares ça ?",
    choices: [
      { label: "Je vis chaque jour comme si on lisait mes pensées — ça me rend meilleur·e.", traitDeltas: { stability: 8, emotion: 4 } },
      { label: "Je note un calendrier mental de jours 'safe'.", traitDeltas: { humor: 6, risk: 3 } },
      { label: "Je pense à des trucs si bizarres que personne ne comprendra.", traitDeltas: { humor: 9, sociability: -2 } },
    ],
  },
  {
    id: 'viral_19',
    category: 'Values',
    question:
      "Tu peux sauver 5 inconnus d'un danger certain au prix d'une grande souffrance pour 1 autre inconnu. Personne ne le saurait jamais. Tu agis ?",
    choices: [
      { label: "Oui. 5 vies contre 1 souffrance, c'est mathématique.", traitDeltas: { stability: 6, conflict: 5 } },
      { label: "Non. Je ne peux pas infliger une souffrance directe, peu importe le calcul.", traitDeltas: { emotion: 7, stability: 4 } },
      { label: "J'essaie de trouver une troisième voie — toujours.", traitDeltas: { risk: 4, emotion: 5 } },
    ],
  },
  {
    id: 'viral_20',
    category: 'Relationship',
    question:
      "Ton/ta partenaire a un 'journal intime' sur son téléphone. Il/elle ne te l'a jamais montré. Un soir, son téléphone sonne sur l'appli ouverte. Tu ?",
    choices: [
      { label: "Je retourne le téléphone face cachée — ce n'est pas pour moi.", traitDeltas: { stability: 8, emotion: 3 } },
      { label: "Je lis la notification visible, c'est venu à moi.", traitDeltas: { emotion: 5, conflict: 3 } },
      { label: "Je déverrouille et je lis. Il faut bien qu'il/elle sache.", traitDeltas: { conflict: 7, risk: 5 } },
    ],
  },
  {
    id: 'viral_21',
    category: 'Social',
    question:
      "Tu es invité a un mariage. Le DJ passe ton morceau honteux prefere et personne ne sait que tu l'adores. Tu ?",
    choices: [
      { label: "Je vais au centre et j'assume la choré honteuse.", traitDeltas: { humor: 8, sociability: 6 } },
      { label: "Je souris discrètement mais je reste assis.", traitDeltas: { stability: 5, sociability: -2 } },
      { label: "Je filme les autres pour détourner l'attention.", traitDeltas: { humor: 5, risk: 4 } },
    ],
  },
  {
    id: 'viral_22',
    category: 'Values',
    question:
      "Tu apprends qu'un proche a ete trompe. La personne infidele te supplie de ne rien dire, promettant d'avouer bientot. Tu ?",
    choices: [
      { label: "Je donne un delai tres court puis je parle si rien ne bouge.", traitDeltas: { stability: 7, conflict: 5 } },
      { label: "Je parle tout de suite a mon proche, sans negocier.", traitDeltas: { conflict: 8, stability: 4 } },
      { label: "Je me retire du drame, ce n'est pas mon couple.", traitDeltas: { emotion: -3, stability: 3 } },
    ],
  },
  {
    id: 'viral_23',
    category: 'Absurd',
    question:
      "Tu peux connaitre l'heure exacte de ta mort... mais la notification arrive avec le son d'un micro-ondes. Tu actives ?",
    choices: [
      { label: "Oui, je prefere savoir et organiser ma vie.", traitDeltas: { stability: 6, risk: 5 } },
      { label: "Non, je refuse de vivre avec ce bip mental.", traitDeltas: { emotion: 6, stability: 4 } },
      { label: "Oui, mais je change tous les micro-ondes du monde.", traitDeltas: { humor: 9, risk: 3 } },
    ],
  },
  {
    id: 'viral_24',
    category: 'Relationship',
    question:
      "Au bout de 3 semaines, quelqu'un te dit deja 'je t'aime'. Tu sens que c'est sincere. Tu reagis comment ?",
    choices: [
      { label: "Je dis ce que je ressens vraiment, meme si c'est plus lent.", traitDeltas: { stability: 7, emotion: 5 } },
      { label: "Je le/la rassure sans prononcer les memes mots.", traitDeltas: { sociability: 5, conflict: -2 } },
      { label: "Je panique, je fais une blague et je change de sujet.", traitDeltas: { humor: 7, emotion: -3 } },
    ],
  },
  {
    id: 'viral_25',
    category: 'Values',
    question:
      "Un ami gagne beaucoup d'argent avec un contenu que tu trouves moralement vide mais legal. Il te propose de le rejoindre. Tu ?",
    choices: [
      { label: "Je refuse si je ne peux pas me respecter dedans.", traitDeltas: { stability: 8, risk: 2 } },
      { label: "J'essaie une periode test avant de juger.", traitDeltas: { risk: 6, stability: 3 } },
      { label: "J'y vais et je prends l'argent tant que ca dure.", traitDeltas: { risk: 8, humor: 3 } },
    ],
  },
  {
    id: 'viral_26',
    category: 'Social',
    question:
      "En plein restaurant, un enfant a une crise et ses parents sont a bout. La salle soupire. Toi, tu ?",
    choices: [
      { label: "Je garde un regard doux, zero jugement.", traitDeltas: { emotion: 6, sociability: 4 } },
      { label: "Je propose une aide concrete si je peux.", traitDeltas: { sociability: 7, stability: 4 } },
      { label: "Je commande un dessert pour survivre a la scene.", traitDeltas: { humor: 6, stability: 2 } },
    ],
  },
  {
    id: 'viral_27',
    category: 'Absurd',
    question:
      "Chaque fois que tu mens, ton nez ne grandit pas: il annonce juste 'attention storytelling' avec la voix de ta mere. Tu survis comment ?",
    choices: [
      { label: "Je deviens brutalement honnete avec tout le monde.", traitDeltas: { stability: 6, conflict: 5 } },
      { label: "Je mens moins, mais seulement quand ca vaut vraiment le coup.", traitDeltas: { risk: 5, stability: 3 } },
      { label: "Je vis pour entendre cette phrase au mauvais moment.", traitDeltas: { humor: 9, sociability: 4 } },
    ],
  },
  {
    id: 'viral_28',
    category: 'Relationship',
    question:
      "Quelqu'un avec qui tu parles tous les jours disparait 4 jours sans explication puis revient avec 'desole, j'avais besoin d'espace'. Tu ?",
    choices: [
      { label: "J'ecoute et je vois si le lien vaut encore le coup.", traitDeltas: { stability: 7, emotion: 4 } },
      { label: "Je dis clairement que ca m'a blesse et que j'ai besoin d'un cadre.", traitDeltas: { conflict: 6, stability: 5 } },
      { label: "Je reponds 4 jours plus tard, pure symetrie.", traitDeltas: { humor: 5, conflict: 6 } },
    ],
  },
  {
    id: 'viral_29',
    category: 'Values',
    question:
      "Tu peux faire annuler en secret la dette d'un inconnu tres pauvre, mais l'argent sera preleve sans douleur sur 1000 comptes riches. Tu le fais ?",
    choices: [
      { label: "Oui, sans hesiter.", traitDeltas: { emotion: 7, risk: 5 } },
      { label: "Non, voler reste voler, meme pour une bonne raison.", traitDeltas: { stability: 8, conflict: 3 } },
      { label: "Seulement si le systeme permet ensuite de prevenir les gens.", traitDeltas: { stability: 5, sociability: 3 } },
    ],
  },
  {
    id: 'viral_30',
    category: 'Social',
    question:
      "Un ami rate encore son train parce qu'il est incapable d'etre a l'heure. Il rigole, toi tu l'attends depuis 45 minutes. Tu ?",
    choices: [
      { label: "Je lui dis franchement que ce n'est plus drole.", traitDeltas: { conflict: 7, stability: 5 } },
      { label: "Je fais une vanne, puis je pose une vraie limite.", traitDeltas: { humor: 6, conflict: 4 } },
      { label: "Je commande un cafe et je m'adapte, encore.", traitDeltas: { emotion: 4, conflict: -4 } },
    ],
  },
  {
    id: 'viral_31',
    category: 'Absurd',
    question:
      "Tu peux teleporter uniquement tes chaussettes n'importe ou dans le monde. Tu fais quoi de ce pouvoir ridicule ?",
    choices: [
      { label: "Je cree un business absurde mais rentable.", traitDeltas: { humor: 8, risk: 6 } },
      { label: "Je l'utilise pour semer le chaos chez mes proches.", traitDeltas: { humor: 9, conflict: 4 } },
      { label: "Je refuse ce don, j'ai ma dignite.", traitDeltas: { stability: 5, humor: -2 } },
    ],
  },
  {
    id: 'viral_32',
    category: 'Relationship',
    question:
      "Au debut d'une histoire, tu sens une alchimie folle mais aussi un enorme drapeau rouge. Tu privilegies quoi ?",
    choices: [
      { label: "Je coupe net: l'alchimie ne compense pas le danger.", traitDeltas: { stability: 8, risk: -2 } },
      { label: "J'avance doucement, yeux ouverts, sans me mentir.", traitDeltas: { stability: 6, emotion: 4 } },
      { label: "J'y vais quand meme, au moins j'aurai une histoire.", traitDeltas: { risk: 8, emotion: 6 } },
    ],
  },
  {
    id: 'viral_33',
    category: 'Absurd',
    question:
      "Un bouton te donne 1 million d'euros. Seul hic : un escargot immortel te traque en permanence et s'il te touche, tu meurs. Tu appuies ?",
    choices: [
      { label: "J'appuie direct, j'ai déjà un plan pour l'enfermer dans du béton.", traitDeltas: { risk: 8, humor: 6 } },
      { label: "Jamais de la vie. La paranoïa constante ne vaut pas l'argent.", traitDeltas: { stability: 8, emotion: -4 } },
      { label: "J'appuie et j'utilise l'argent pour voyager sans fin.", traitDeltas: { risk: 7, sociability: 5 } },
    ],
  },
  {
    id: 'viral_34',
    category: 'Social',
    question:
      "Tu te retrouves bloqué·e seul·e dans une forêt. Tu préfères y passer la nuit avec un ours sauvage ou avec un homme inconnu ?",
    choices: [
      { label: "L'ours. Au moins, je sais exactement à quoi m'attendre.", traitDeltas: { emotion: 6, conflict: 4 } },
      { label: "L'homme. L'entraide humaine reste notre meilleure chance.", traitDeltas: { sociability: 7, stability: 5 } },
      { label: "Je construis une cabane secrète pour les éviter tous les deux.", traitDeltas: { humor: 6, risk: 4 } },
    ],
  },
  {
    id: 'viral_35',
    category: 'Relationship',
    question:
      "Ton ex te propose de se remettre ensemble, mais la condition est que vous partagiez vos mots de passe de téléphone. Tu acceptes ?",
    choices: [
      { label: "Oui, la transparence totale est nécessaire pour reconstruire.", traitDeltas: { stability: 6, emotion: 4 } },
      { label: "Non. Le jardin secret est indispensable, même en couple.", traitDeltas: { stability: 8, conflict: 5 } },
      { label: "J'accepte, mais j'efface tout mon historique d'abord.", traitDeltas: { humor: 8, risk: 5 } },
    ],
  },
  {
    id: 'viral_36',
    category: 'Absurd',
    question:
      "On t'offre d'être un 10/10 absolu en beauté, mais tu as la voix de Donald Duck pour le reste de tes jours. Tu signes ?",
    choices: [
      { label: "Oui, j'écrirai des petits mots ou je parlerai en langue des signes.", traitDeltas: { humor: 8, risk: 6 } },
      { label: "Non, ma voix fait partie intégrante de mon identité.", traitDeltas: { stability: 8, emotion: 3 } },
      { label: "Oui, et je me lance dans une carrière de comédie sur TikTok.", traitDeltas: { humor: 9, sociability: 6 } },
    ],
  },
  {
    id: 'viral_37',
    category: 'Values',
    question:
      "Tu reçois 10 000€ par mois, mais tu as une chanson de Jul en boucle H24 dans ta tête sans possibilité de l'éteindre. Tu signes ?",
    choices: [
      { label: "Je signe ! Le rap marseillais sera la bande-son de ma richesse.", traitDeltas: { humor: 9, risk: 7 } },
      { label: "Jamais. Je préfère la paix mentale et le silence à tout l'or du monde.", traitDeltas: { stability: 8, emotion: -3 } },
      { label: "Je signe, mais je dépense tout en thérapies pour essayer de l'ignorer.", traitDeltas: { humor: 6, risk: 5 } },
    ],
  },
  {
    id: 'viral_38',
    category: 'Relationship',
    question:
      "Ton/ta meilleur·e pote commence à fréquenter ton ex. Ils te demandent ta bénédiction. Tu réagis comment ?",
    choices: [
      { label: "Je la donne sincèrement. Le bonheur de mes proches passe avant mon ego.", traitDeltas: { stability: 8, emotion: 5 } },
      { label: "Je dis franchement que c'est un énorme red flag amical.", traitDeltas: { conflict: 8, stability: 4 } },
      { label: "Je dis oui, mais je prévois de me venger subtilement.", traitDeltas: { humor: 5, conflict: 6 } },
    ],
  },
  {
    id: 'viral_39',
    category: 'Social',
    question:
      "Tu gagnes le pouvoir de te téléporter n'importe où, mais chaque téléportation te coûte 1 mois d'espérance de vie. Tu l'utilises ?",
    choices: [
      { label: "Uniquement pour les urgences absolues ou des vacances de rêve.", traitDeltas: { risk: 6, stability: 5 } },
      { label: "Jamais. Je préfère le train et la marche à pied pour vivre vieux.", traitDeltas: { stability: 8, risk: -3 } },
      { label: "Je l'utilise tous les matins pour éviter les bouchons du taf.", traitDeltas: { humor: 8, risk: 7 } },
    ],
  },
  {
    id: 'viral_40',
    category: 'Relationship',
    question:
      "Tu découvrez que ton crush mange des pâtes avec du ketchup et coupe ses spaghettis au couteau. C'est un motif de rupture ?",
    choices: [
      { label: "Oui, c'est un crime culinaire impardonnable.", traitDeltas: { conflict: 6, humor: 6 } },
      { label: "Non, je l'aime avec ses défauts (même les pires).", traitDeltas: { emotion: 8, stability: 5 } },
      { label: "Non, mais je l'inscris de force à un cours de cuisine italienne.", traitDeltas: { humor: 8, sociability: 5 } },
    ],
  },
  {
    id: 'viral_41',
    category: 'Absurd',
    question:
      "Tu peux lire dans les pensées des gens, mais ils reçoivent une notification sur leur téléphone chaque fois que tu le fais. Tu l'utilises ?",
    choices: [
      { label: "Oui, j'assume totalement ma curiosité.", traitDeltas: { risk: 8, conflict: 6 } },
      { label: "Non, c'est le meilleur moyen de détruire toutes mes relations.", traitDeltas: { stability: 8, conflict: -4 } },
      { label: "Uniquement lors d'entretiens d'embauche ou de négociations.", traitDeltas: { humor: 7, risk: 5 } },
    ],
  },
  {
    id: 'viral_42',
    category: 'Values',
    question:
      "Tu peux arrêter le temps, mais tu vieillis deux fois plus vite pendant que le monde est figé. Quelle est ta stratégie ?",
    choices: [
      { label: "Je ne l'utilise jamais, ma vie passe déjà trop vite.", traitDeltas: { stability: 8, risk: -3 } },
      { label: "Uniquement pour grappiller quelques minutes de sommeil en plus.", traitDeltas: { humor: 8, stability: 4 } },
      { label: "Je fige le temps pour cambrioler des banques et devenir riche.", traitDeltas: { risk: 9, conflict: 7 } },
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
  level?: ScenarioLevel;
  stems: string[];
  twists: string[];
  endings: string[];
  choiceSets: ChoiceSet[];
  target: number;
};

type MultiCategoryGeneratedPackConfig = {
  categories: ScenarioCategory[];
  prefix: string;
  level: ScenarioLevel;
  stems: string[];
  twists: string[];
  endings: string[];
  choiceSets: ChoiceSet[];
  target: number;
};

const GENERATED_QUESTION_SIMILARITY_THRESHOLD = 0.74;

function normalizeGeneratedQuestion(question: string): string {
  return question
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getGeneratedQuestionSimilarity(left: string, right: string): number {
  const leftTokens = new Set(normalizeGeneratedQuestion(left).split(/\s+/).filter(Boolean));
  const rightTokens = new Set(normalizeGeneratedQuestion(right).split(/\s+/).filter(Boolean));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

function isQuestionTooSimilar(question: string, seenQuestions: string[]): boolean {
  return seenQuestions.some(
    (seenQuestion) => getGeneratedQuestionSimilarity(seenQuestion, question) >= GENERATED_QUESTION_SIMILARITY_THRESHOLD
  );
}

function makeScenario(
  id: string,
  category: ScenarioCategory,
  question: string,
  choiceSet: ChoiceSet,
  level: ScenarioLevel = 'standard'
): Scenario {
  return {
    id,
    category,
    level,
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
  level = 'standard',
  stems,
  twists,
  endings,
  choiceSets,
  target,
}: GeneratedPackConfig): Scenario[] {
  const scenarios: Scenario[] = [];
  const seenQuestions: string[] = [];
  const seenQuestionKeys = new Set<string>();
  let comboIndex = 0;

  for (const stem of stems) {
    for (const twist of twists) {
      const ending = endings[comboIndex % endings.length];
      const question = `${stem} ${twist}. ${ending}`;
      const normalizedQuestion = normalizeGeneratedQuestion(question);

      if (seenQuestionKeys.has(normalizedQuestion) || isQuestionTooSimilar(question, seenQuestions)) {
        comboIndex += 1;
        continue;
      }

      seenQuestionKeys.add(normalizedQuestion);
      seenQuestions.push(question);
      const choiceSet = choiceSets[comboIndex % choiceSets.length];
      scenarios.push(
        makeScenario(
          `${prefix}_${String(scenarios.length + 1).padStart(3, '0')}`,
          category,
          question,
          choiceSet,
          level
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

function buildMultiCategoryGeneratedPack({
  categories,
  prefix,
  level,
  stems,
  twists,
  endings,
  choiceSets,
  target,
}: MultiCategoryGeneratedPackConfig): Scenario[] {
  const scenarios: Scenario[] = [];
  const seenQuestions: string[] = [];
  const seenQuestionKeys = new Set<string>();
  let comboIndex = 0;

  for (const stem of stems) {
    for (const twist of twists) {
      const ending = endings[comboIndex % endings.length];
      const category = categories[comboIndex % categories.length];
      const question = `${stem} ${twist}. ${ending}`;
      const normalizedQuestion = normalizeGeneratedQuestion(question);

      if (seenQuestionKeys.has(normalizedQuestion) || isQuestionTooSimilar(question, seenQuestions)) {
        comboIndex += 1;
        continue;
      }

      seenQuestionKeys.add(normalizedQuestion);
      seenQuestions.push(question);
      const choiceSet = choiceSets[comboIndex % choiceSets.length];
      scenarios.push(
        makeScenario(
          `${prefix}_${String(scenarios.length + 1).padStart(3, '0')}`,
          category,
          question,
          choiceSet,
          level
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
  'Dans une file d attente où tout le monde soupire déjà,',
  'Pendant un brunch qui vire doucement au débat moral,',
  'Sur un serveur Discord où l ambiance change en trente secondes,',
  'Lors d une répétition ou tout le monde est un peu à cran,',
  'À une pendaison de crémaillère qui mélange plusieurs cercles sociaux,',
  'Dans un taxi partagé avec des inconnus très bavards,',
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

const STANDARD_GENERATED_SCENARIOS: Scenario[] = [
  ...buildGeneratedPack({
    category: 'Social',
    prefix: 'socx',
    level: 'standard',
    stems: SOCIAL_STEMS,
    twists: SOCIAL_TWISTS,
    endings: SOCIAL_ENDINGS,
    choiceSets: SOCIAL_CHOICES,
    target: 112,
  }),
  ...buildGeneratedPack({
    category: 'Values',
    prefix: 'valx',
    level: 'standard',
    stems: VALUES_STEMS,
    twists: VALUES_TWISTS,
    endings: VALUES_ENDINGS,
    choiceSets: VALUES_CHOICES,
    target: 148,
  }),
  ...buildGeneratedPack({
    category: 'Relationship',
    prefix: 'relx',
    level: 'standard',
    stems: RELATIONSHIP_STEMS,
    twists: RELATIONSHIP_TWISTS,
    endings: RELATIONSHIP_ENDINGS,
    choiceSets: RELATIONSHIP_CHOICES,
    target: 148,
  }),
  ...buildGeneratedPack({
    category: 'Absurd',
    prefix: 'absx',
    level: 'standard',
    stems: ABSURD_STEMS,
    twists: ABSURD_TWISTS,
    endings: ABSURD_ENDINGS,
    choiceSets: ABSURD_CHOICES,
    target: 60,
  }),
];

const STANDARD_SCENARIOS: Scenario[] = [
  ...CURATED_SCENARIOS.map((scenario) => ({ ...scenario, level: 'standard' as const })),
  ...STANDARD_GENERATED_SCENARIOS,
];

const INTENSE_STEMS = [
  'Une personne avec qui l attirance est forte te demande ce qui t attire d abord dans l intimite',
  'Au debut d une relation, on te propose de parler franchement de tes limites intimes',
  'Quelqu un qui te plait beaucoup te demande ce que tu reveles rarement sur ton desir',
  'Pendant une nuit tres complice, la conversation glisse vers vos fantasmes respectifs',
  'Une personne avec qui le flirt devient serieux veut savoir ce qui te met vraiment en confiance',
  'Apres une tension tres palpable entre vous, on te demande ce que tu voudrais explorer un jour',
  'Quelqu un te propose un jeu de questions tres personnelles pour tester votre compatibilite intime',
  'Lors d un echange nocturne tres honnete, la personne en face veut savoir ce qui te fait reculer net',
  'Un crush tres assume te demande ce qui compte le plus pour toi quand le desir monte',
  'Tu sens qu une relation peut devenir tres charnelle et on te demande comment tu poses le cadre',
  'Quelqu un te dit vouloir connaitre ta part la plus tendre et la plus sensuelle',
  'Dans un moment de confiance rare, on te demande a quel point tu aimes garder du mystere',
];

const INTENSE_TWISTS = [
  'alors que la confiance est la mais pas totalement installee',
  'et la reponse peut clairement changer la dynamique entre vous',
  'au moment ou la tension est deja tres palpable',
  'sans savoir si l autre cherche de la profondeur ou juste du frisson',
  'et tu sens que l honnetete va creer soit un vrai lien soit un grand malaise',
  'alors que vous n avez jamais ete aussi proches d un basculement',
  'dans un cadre ou personne ne peut se cacher derriere l humour trop longtemps',
  'et chacun attend que l autre ose en premier',
  'au moment ou tu pourrais choisir la prudence ou la verite',
  'et la conversation devient soudain beaucoup plus adulte que prevu',
];

const INTENSE_ENDINGS = [
  'Tu reponds quoi ?',
  'Tu poses quoi sur la table ?',
  'Tu reveles quoi vraiment ?',
  'Tu t ouvres jusqu ou ?',
  'Tu prends quelle posture ?',
];

const INTENSE_CHOICES: ChoiceSet[] = [
  {
    labels: [
      'Je reponds franchement sur mes envies, mes limites et ce qui me rassure.',
      'Je revele une partie seulement pour garder du mystere et voir comment l autre accueille ca.',
      'Je detourne legerement pour garder la tension sans tout donner tout de suite.',
    ],
    deltas: [
      { emotion: 5, stability: 4, conflict: 2 },
      { stability: 4, risk: 3, emotion: 2 },
      { humor: 5, risk: 4, sociability: 2 },
    ],
  },
  {
    labels: [
      'Je parle d abord de confiance, de respect et de consentement avant le reste.',
      'Je dis ce qui m attire le plus, sans entrer dans des details trop crus.',
      'Je prefere tester la complicite dans le jeu avant de mettre des mots trop nets.',
    ],
    deltas: [
      { stability: 6, emotion: 3, conflict: 1 },
      { emotion: 5, risk: 4, sociability: 2 },
      { humor: 4, sociability: 4, risk: 3 },
    ],
  },
  {
    labels: [
      'J ose avouer un fantasme soft si l echange reste elegant et reciproque.',
      'Je demande a l autre de commencer, pour sentir son niveau d ouverture.',
      'Je garde mes cartes et j observe si la personne sait creer un vrai espace sur.',
    ],
    deltas: [
      { risk: 5, emotion: 4, humor: 1 },
      { sociability: 4, stability: 3, emotion: 2 },
      { stability: 6, conflict: 1, emotion: 1 },
    ],
  },
  {
    labels: [
      'Je pose clairement mes non negociables et ce qui me fait vraiment vibrer.',
      'Je parle avec douceur de mes curiosites sans me mettre a nu d un coup.',
      'Je garde une part d enigme pour laisser le desir travailler un peu.',
    ],
    deltas: [
      { conflict: 4, stability: 5, emotion: 3 },
      { emotion: 4, stability: 4, sociability: 3 },
      { humor: 3, risk: 5, stability: 2 },
    ],
  },
];

const FIRE_STEMS = [
  'Une personne avec qui la tension est quasiment incontrôlable te demande ton fantasme le plus inavoue',
  'On te propose un week-end hors cadre pour explorer vos desirs sans faux-semblants',
  'Quelqu un te dit vouloir entendre la version la plus brute de ce qui t attire vraiment',
  'Dans un echange ou plus rien n est tiede, on te demande jusqu ou tu aimes perdre le controle',
  'La personne qui te trouble le plus veut savoir ce que tu n as encore jamais ose vivre',
  'Au cœur d une attirance presque dangereuse, on te propose un pacte de franchise totale sur vos envies',
  'Quelqu un te regarde droit dans les yeux et te demande ce que tu caches derriere ton apparente maitrise',
  'Une discussion nocturne devient un duel de confessions sur vos zones les plus intenses',
  'On te propose de nommer la frontiere entre ce qui t excite et ce qui te depasse',
  'Une personne tres assumee te demande ce qui pourrait te faire totalement craquer',
  'Dans un moment ou tout peut deraper ou se sublimer, on te demande ce que tu veux vraiment',
  'Quelqu un veut savoir si tu preferes le vertige, la tendresse, ou la folie quand tout s enflamme',
];

const FIRE_TWISTS = [
  'alors qu il n y a plus vraiment de place pour les reponses tiedes',
  'et ton silence serait presque une reponse en soi',
  'au moment ou vous savez tous les deux que ca peut devenir tres reel',
  'sans possibilite de te refugier derriere un personnage lisse',
  'et la verite peut autant rapprocher que faire exploser la scene',
  'alors que la confiance est intense mais encore jeune',
  'et tu sens qu une confession peut redefinir tout le lien',
  'au moment ou le desir et le risque emotionnel montent ensemble',
  'dans une ambiance ou la pudeur commence clairement a ceder',
  'et tu sais qu il faudra assumer ce que tu ouvres',
];

const FIRE_ENDINGS = [
  'Tu l assumes comment ?',
  'Tu vas jusqu ou ?',
  'Tu dis quoi sans filtre ?',
  'Tu ouvres quelle porte ?',
  'Tu montres quelle version de toi ?',
];

const FIRE_CHOICES: ChoiceSet[] = [
  {
    labels: [
      'Je dis la verite nue, mais toujours avec le cadre du consentement et du respect.',
      'J avoue une envie forte sans tout devoiler, juste assez pour faire monter la tension.',
      'Je reponds par une question encore plus troublante pour renverser la scene.',
    ],
    deltas: [
      { emotion: 6, conflict: 3, stability: 3 },
      { risk: 6, emotion: 4, humor: 1 },
      { humor: 5, risk: 5, sociability: 3 },
    ],
  },
  {
    labels: [
      'Je vais au bout de ma sincerite sur ce qui me consume et ce qui me bloque.',
      'Je garde le cap sur mes limites, meme si l energie pousse a tout accelerer.',
      'Je joue avec le feu verbalement pour voir si l autre sait vraiment tenir l intensite.',
    ],
    deltas: [
      { emotion: 7, conflict: 2, risk: 3 },
      { stability: 6, conflict: 3, emotion: 2 },
      { humor: 4, risk: 7, sociability: 2 },
    ],
  },
  {
    labels: [
      'J ose nommer ce que je n ai jamais ose dire, si l echange reste reciproque.',
      'Je transforme l aveu en terrain de jeu mental avant toute vraie bascule.',
      'Je coupe court si je sens que l intensite n est pas aussi mature qu elle en a l air.',
    ],
    deltas: [
      { risk: 6, emotion: 5, sociability: 2 },
      { humor: 5, risk: 5, emotion: 3 },
      { stability: 7, conflict: 4, emotion: 1 },
    ],
  },
  {
    labels: [
      'Je choisis la version la plus audacieuse de moi, sans trahir ma securite.',
      'Je ralentis volontairement pour savourer la montee plutot que la brulure.',
      'Je teste si la personne veut juste du choc ou une vraie profondeur dans le feu.',
    ],
    deltas: [
      { risk: 7, stability: 2, emotion: 4 },
      { stability: 6, emotion: 3, risk: 1 },
      { conflict: 4, stability: 4, sociability: 2 },
    ],
  },
];

const INTENSE_SCENARIOS = buildMultiCategoryGeneratedPack({
  categories: ['Relationship', 'Values', 'Social', 'Absurd'],
  prefix: 'intx',
  level: 'intense',
  stems: INTENSE_STEMS,
  twists: INTENSE_TWISTS,
  endings: INTENSE_ENDINGS,
  choiceSets: INTENSE_CHOICES,
  target: 100,
});

const FIRE_SCENARIOS = buildMultiCategoryGeneratedPack({
  categories: ['Relationship', 'Values', 'Social', 'Absurd'],
  prefix: 'firex',
  level: 'fire',
  stems: FIRE_STEMS,
  twists: FIRE_TWISTS,
  endings: FIRE_ENDINGS,
  choiceSets: FIRE_CHOICES,
  target: 100,
});

const ALL_SCENARIOS: Scenario[] = [
  ...STANDARD_SCENARIOS,
  ...INTENSE_SCENARIOS,
  ...FIRE_SCENARIOS,
];

export const PROFILE_COMPLETION_TARGET = 20;

export const SCENARIO_LEVELS: ScenarioLevel[] = ['standard', 'intense', 'fire'];

export const SCENARIO_LEVEL_META: Record<ScenarioLevel, { label: string; accent: string; minAge?: number }> = {
  standard: { label: 'Standard', accent: '#B8C6FF' },
  intense: { label: 'Intense', accent: '#FF5F7A', minAge: 18 },
  fire: { label: 'Fire', accent: '#FF8A00', minAge: 18 },
};

export function isAdultBirthYear(birthYear: string): boolean {
  const parsed = Number.parseInt(birthYear, 10);
  if (!Number.isFinite(parsed)) return false;
  return new Date().getFullYear() - parsed >= 18;
}

export function getAllowedScenarioLevels(birthYear: string): ScenarioLevel[] {
  const normalizedBirthYear = birthYear.trim();

  // Legacy accounts can exist without a stored birth year.
  // Keep those users unblocked instead of silently forcing standard only.
  if (!normalizedBirthYear) {
    return SCENARIO_LEVELS;
  }

  return isAdultBirthYear(normalizedBirthYear) ? SCENARIO_LEVELS : ['standard'];
}

export function getScenariosForLevel(
  level: ScenarioLevel,
  scenarios: Scenario[] = ALL_SCENARIOS
): Scenario[] {
  return scenarios.filter((scenario) => (scenario.level ?? 'standard') === level);
}

export const SCENARIOS: Scenario[] = [
  ...ALL_SCENARIOS,
];
