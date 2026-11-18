import type { Conversation } from "./donnees";

const CLE = "hermann.historique";
export const EVENEMENT = "hermann-historique";
const MAX = 50;
const idSession = `s${Date.now()}`;
let idActif = idSession;
let titreReprise: string | null = null;

export function idConversationActive(): string {
  return idActif;
}

export function dernierId(): string | null {
  return chargerConversations()[0]?.id ?? null;
}

export function reprendre(id: string): boolean {
  const c = chargerConversations().find((x) => x.id === id);
  if (!c) return false;
  idActif = id;
  titreReprise = c.titre;
  return true;
}

export function consommerReprise(): string | null {
  const t = titreReprise;
  titreReprise = null;
  return t;
}

export function historiqueActif(): { role: "user" | "hermann"; texte: string }[] {
  const c = chargerConversations().find((x) => x.id === idActif);
  if (!c) return [];
  return c.messages
    .map((m) => ({ role: m.auteur === "vous" ? ("user" as const) : ("hermann" as const), texte: m.texte }))
    .slice(-10);
}

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
  const existante = liste.find((c) => c.id === idActif);
  if (existante) {
    existante.messages.push(...messages);
  } else {
    const titre = coupe(vous, 40);
    liste.unshift({
      id: idActif,
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
