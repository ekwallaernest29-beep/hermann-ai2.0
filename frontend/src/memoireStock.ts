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

export const EVENEMENT_MEMOIRE = "hermann-memoire";

// Détecte une demande explicite : « Retiens que… », « Souviens-toi que… », « Mémorise… », « N'oublie pas… ».
export function extraireSouvenir(texte: string): string | null {
  const m = texte
    .trim()
    .match(/^(?:hermann[\s,.!]*)?(?:retiens|souviens-toi|mémorise|n['’]oublie pas)\s+(?:bien\s+)?(?:que\s+|qu['’]\s*|ceci\s*:?\s*)?(.+)$/i);
  if (!m) return null;
  const brut = m[1].trim().replace(/[.!\s]+$/, "");
  if (brut.length < 4) return null;
  return (brut.charAt(0).toUpperCase() + brut.slice(1)).slice(0, 300);
}

export function retenir(contenu: string) {
  const d = new Date();
  const maj = `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  const titre = contenu.length > 40 ? contenu.slice(0, 39).trimEnd() + "…" : contenu;
  const liste = chargerSouvenirs();
  liste.unshift({
    id: `s${Date.now()}`,
    categorie: "Préférences",
    titre,
    resume: contenu,
    contenu,
    origine: "Retenu pendant une conversation, à votre demande.",
    maj,
  });
  enregistrerSouvenirs(liste);
  window.dispatchEvent(new Event(EVENEMENT_MEMOIRE));
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
