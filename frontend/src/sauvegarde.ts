import { VOIX_IA } from "./voixIA";

// Clés IA, code d'accès et voix de l'appareil sont volontairement exclus.
export const CLES_SAUVEGARDEES = [
  "hermann.historique",
  "hermann.souvenirs",
  "hermann.micro",
  "hermann.vitesse",
  "hermann.voixia",
] as const;

const APPLICATION = "HERMANN AI";
const TAILLE_MAX = 3_000_000;

export type Donnees = Record<string, string>;
export type Resume = { historique: number | null; souvenirs: number | null; reglages: boolean };
type Resultat =
  | { ok: true; donnees: Donnees; date: string; ignorees: number }
  | { ok: false; message: string };

function lire(cle: string): string | null {
  try {
    return window.localStorage.getItem(cle);
  } catch {
    return null;
  }
}

export function donneesActuelles(): Donnees {
  const d: Donnees = {};
  for (const cle of CLES_SAUVEGARDEES) {
    const v = lire(cle);
    if (v !== null) d[cle] = v;
  }
  return d;
}

function compter(brut: string | undefined): number | null {
  if (!brut) return null;
  try {
    const j = JSON.parse(brut);
    return Array.isArray(j) ? j.length : null;
  } catch {
    return null;
  }
}

export function resumer(d: Donnees): Resume {
  return {
    historique: compter(d["hermann.historique"]),
    souvenirs: compter(d["hermann.souvenirs"]),
    reglages: "hermann.micro" in d || "hermann.vitesse" in d || "hermann.voixia" in d,
  };
}

export function construire(): string {
  return JSON.stringify(
    { application: APPLICATION, version: 1, date: new Date().toISOString(), donnees: donneesActuelles() },
    null,
    2,
  );
}

function valide(cle: string, v: string): boolean {
  try {
    switch (cle) {
      case "hermann.historique":
      case "hermann.souvenirs":
        return Array.isArray(JSON.parse(v));
      case "hermann.micro": {
        const j = JSON.parse(v);
        return typeof j === "object" && j !== null && !Array.isArray(j);
      }
      case "hermann.vitesse": {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0.5 && n <= 2;
      }
      case "hermann.voixia":
        return v === "" || VOIX_IA.some((x) => x.nom === v);
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export function analyser(texte: string): Resultat {
  if (texte.length > TAILLE_MAX) {
    return { ok: false, message: "Ce fichier est trop volumineux pour être une sauvegarde HERMANN." };
  }
  let j: unknown;
  try {
    j = JSON.parse(texte);
  } catch {
    return { ok: false, message: "Ce fichier n’est pas lisible. Choisissez une sauvegarde HERMANN AI (.json)." };
  }
  const pasHermann: Resultat = { ok: false, message: "Ce fichier n’est pas une sauvegarde HERMANN AI." };
  if (typeof j !== "object" || j === null) return pasHermann;
  const o = j as { application?: unknown; version?: unknown; date?: unknown; donnees?: unknown };
  if (
    o.application !== APPLICATION ||
    o.version !== 1 ||
    typeof o.donnees !== "object" ||
    o.donnees === null ||
    Array.isArray(o.donnees)
  ) {
    return pasHermann;
  }
  const donnees: Donnees = {};
  let ignorees = 0;
  for (const [cle, v] of Object.entries(o.donnees as Record<string, unknown>)) {
    if (!(CLES_SAUVEGARDEES as readonly string[]).includes(cle) || typeof v !== "string" || !valide(cle, v)) {
      ignorees++;
      continue;
    }
    donnees[cle] = v;
  }
  if (Object.keys(donnees).length === 0) {
    return { ok: false, message: "Cette sauvegarde ne contient aucune donnée utilisable." };
  }
  return { ok: true, donnees, date: typeof o.date === "string" ? o.date : "", ignorees };
}

export function appliquer(donnees: Donnees): boolean {
  try {
    for (const cle of CLES_SAUVEGARDEES) {
      if (cle in donnees) window.localStorage.setItem(cle, donnees[cle]);
      else window.localStorage.removeItem(cle);
    }
    return true;
  } catch {
    return false;
  }
}
