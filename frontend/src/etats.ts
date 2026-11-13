export type Etat = "veille" | "ecoute" | "reflexion" | "parole" | "interruption";

export type DefEtat = {
  badge: string;
  titre?: string;
  texte: string;
  detail: string;
};

export const ETATS: Record<Etat, DefEtat> = {
  veille: {
    badge: "HERMANN EST EN VEILLE",
    titre: "Bonjour, Hermann.",
    texte: "Votre assistant personnel intelligent.",
    detail: "Micro désactivé · Activez-le pour parler.",
  },
  ecoute: {
    badge: "HERMANN VOUS ÉCOUTE",
    texte: "« Hermann, aide-moi à préparer ma journée… »",
    detail: "Microphone actif · Transcription temporaire",
  },
  reflexion: {
    badge: "HERMANN RÉFLÉCHIT",
    texte: "« Aide-moi à préparer ma journée. »",
    detail: "Analyse de la demande",
  },
  parole: {
    badge: "HERMANN VOUS RÉPOND",
    texte:
      "Commençons par vos priorités. Gardez votre matinée pour le travail de fond, puis regroupez vos rendez-vous cet après-midi.",
    detail: "Vous : « Aide-moi à préparer ma journée. »",
  },
  interruption: {
    badge: "JE VOUS ÉCOUTE",
    texte: "La réponse est interrompue. Vous avez la parole.",
    detail: "Microphone actif · Écoute reprise",
  },
};

export const ORDRE: Etat[] = ["veille", "ecoute", "reflexion", "parole", "interruption"];

export const NOMS: Record<Etat, string> = {
  veille: "Veille",
  ecoute: "Écoute",
  reflexion: "Réflexion",
  parole: "Parole",
  interruption: "Interruption",
};
