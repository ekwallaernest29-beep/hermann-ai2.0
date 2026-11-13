export type Message = { auteur: "vous" | "hermann"; heure: string; texte: string };

export type Conversation = {
  id: string;
  date: string;
  heure: string;
  titre: string;
  resume: string;
  messages: Message[];
};

// Données d'exemple pour l'aperçu de l'interface : aucun échange réel n'est enregistré.
export const EXEMPLES: Conversation[] = [
  {
    id: "c1",
    date: "8 novembre 2026",
    heure: "09:38",
    titre: "Préparer ma journée",
    resume: "Priorités du matin et rendez-vous de l’après-midi.",
    messages: [
      { auteur: "vous", heure: "09:38", texte: "Hermann, aide-moi à préparer ma journée." },
      {
        auteur: "hermann",
        heure: "09:38",
        texte:
          "Commençons par vos priorités. Gardez votre matinée pour le travail de fond, puis regroupez vos rendez-vous cet après-midi.\n\nPrévoyez une pause avant de reprendre. Quel est le sujet le plus important pour vous aujourd’hui ?",
      },
      { auteur: "vous", heure: "09:39", texte: "La présentation de lundi." },
      {
        auteur: "hermann",
        heure: "09:39",
        texte: "Concentrons-nous sur son fil conducteur. Nous pouvons commencer par les trois idées à retenir.",
      },
    ],
  },
  {
    id: "c2",
    date: "7 novembre 2026",
    heure: "18:24",
    titre: "Un week-end à Lyon",
    resume: "Une escapade à pied, entre musées et bonnes adresses.",
    messages: [
      { auteur: "vous", heure: "18:24", texte: "Je pars un week-end à Lyon, des idées à faire à pied ?" },
      {
        auteur: "hermann",
        heure: "18:24",
        texte: "Commencez par le Vieux Lyon, puis traversez vers la Croix-Rousse en vous arrêtant dans un musée.",
      },
    ],
  },
  {
    id: "c3",
    date: "6 novembre 2026",
    heure: "08:52",
    titre: "Mieux me concentrer",
    resume: "Des plages de travail au calme et des pauses régulières.",
    messages: [
      { auteur: "vous", heure: "08:52", texte: "Comment mieux me concentrer ?" },
      {
        auteur: "hermann",
        heure: "08:52",
        texte: "Essayez des plages de travail au calme, avec des pauses régulières.",
      },
    ],
  },
];

export type CategorieSouvenir = "Préférences" | "Habitudes" | "Projets";

export type Souvenir = {
  id: string;
  categorie: CategorieSouvenir;
  titre: string;
  resume: string;
  contenu: string;
  origine: string;
  maj: string;
};

// Données d'exemple pour l'aperçu de l'interface : aucun souvenir réel n'est enregistré.
export const SOUVENIRS_EXEMPLES: Souvenir[] = [
  {
    id: "s1",
    categorie: "Préférences",
    titre: "Des réponses concises",
    resume: "Vous préférez aller à l’essentiel, avec des exemples concrets.",
    contenu: "Je préfère les réponses concises, avec des exemples concrets.",
    origine: "Indiqué pendant votre échange du 8 novembre à 09:12.",
    maj: "8 novembre · 09:12",
  },
  {
    id: "s2",
    categorie: "Habitudes",
    titre: "Vos matinées au calme",
    resume: "Vous réservez le matin aux tâches qui demandent de la concentration.",
    contenu: "Je réserve le matin aux tâches qui demandent de la concentration.",
    origine: "Indiqué pendant votre échange du 6 novembre à 08:54.",
    maj: "6 novembre · 08:54",
  },
  {
    id: "s3",
    categorie: "Projets",
    titre: "La présentation de lundi",
    resume: "Votre présentation doit faire ressortir trois idées principales.",
    contenu: "Ma présentation de lundi doit faire ressortir trois idées principales.",
    origine: "Indiqué pendant votre échange du 7 novembre à 18:20.",
    maj: "7 novembre · 18:20",
  },
];
