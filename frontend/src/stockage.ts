import type { Conversation } from "./donnees";

const CLE = "hermann.historique";
export const EVENEMENT = "hermann-historique";
const MAX = 50;
const idSession = `s${Date.now()}`;

export function chargerConversations(): Conversation[] {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return [];
    const liste: unknown = JSON.parse(brut);
    if (!Array.isArray(liste)) return [];
    return liste.filter(
      (c): c is Conversation =>
        typeof c === "object" && c !== null && typeof c.id === "string" && Array.isArray(c.messages),
    );
  } catch {
    return [];
  }
}

export function enregistrerConversations(liste: Conversation[]) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(liste.slice(0, MAX)));
  } catch {
    // Stockage indisponible : l'historique ne sera pas conservé.
  }
}

function coupe(texte: string, max: number): string {
  const t = texte.trim().replace(/\s+/g, " ");
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

// Une conversation par session d'ouverture de l'appli ; chaque échange y est ajouté.
export function ajouterEchange(vous: string, hermann: string) {
  const maintenant = new Date();
  const heure = maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const date = maintenant.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const liste = chargerConversations();
  const messages = [
    { auteur: "vous" as const, heure, texte: vous },
    { auteur: "hermann" as const, heure, texte: hermann },
  ];
  const existante = liste.find((c) => c.id === idSession);
  if (existante) {
    existante.messages.push(...messages);
  } else {
    const titre = coupe(vous, 40);
    liste.unshift({
      id: idSession,
      date,
      heure,
      titre: titre.charAt(0).toUpperCase() + titre.slice(1),
      resume: coupe(hermann, 90),
      messages,
    });
  }
  enregistrerConversations(liste);
  window.dispatchEvent(new Event(EVENEMENT));
}
