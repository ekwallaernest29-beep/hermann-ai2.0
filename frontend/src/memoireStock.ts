import type { Souvenir } from "./donnees";

const CLE = "hermann.souvenirs";

export function chargerSouvenirs(): Souvenir[] {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return [];
    const liste: unknown = JSON.parse(brut);
    if (!Array.isArray(liste)) return [];
    return liste.filter(
      (s): s is Souvenir =>
        typeof s === "object" && s !== null && typeof s.id === "string" && typeof s.contenu === "string",
    );
  } catch {
    return [];
  }
}

export function enregistrerSouvenirs(liste: Souvenir[]) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(liste.slice(0, 50)));
  } catch {
    // Stockage indisponible : les souvenirs ne seront pas conservés.
  }
}

// Ajoute les souvenirs au premier message envoyé à l'IA (800 caractères au maximum).
export function avecMemoire<T extends { texte: string }>(messages: T[]): T[] {
  const notes: string[] = [];
  let total = 0;
  for (const s of chargerSouvenirs()) {
    const ligne = `- ${s.contenu.trim()}`;
    if (total + ligne.length > 800) break;
    notes.push(ligne);
    total += ligne.length;
  }
  if (notes.length === 0 || messages.length === 0) return messages;
  const [premier, ...reste] = messages;
  const intro = `[Ce que l’utilisateur t’a demandé de retenir à son sujet :\n${notes.join("\n")}\nTiens-en compte sans le répéter.]\n\n`;
  return [{ ...premier, texte: intro + premier.texte }, ...reste];
}
