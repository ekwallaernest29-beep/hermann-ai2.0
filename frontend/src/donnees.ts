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
