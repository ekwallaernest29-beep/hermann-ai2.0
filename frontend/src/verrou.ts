export const EVT_VERROUILLER = "hermann:verrouiller";

const CLE = "hermann.verrou";
const CLE_ESSAIS = "hermann.verrou.essais";
const ITERATIONS = 210000;

export type ConfigVerrou = { v: 1; sel: string; hash: string; iter: number; delaiMin: number };

function enBase64(octets: Uint8Array): string {
  let s = "";
  octets.forEach((o) => {
    s += String.fromCharCode(o);
  });
  return btoa(s);
}

function deBase64(texte: string): Uint8Array {
  const s = atob(texte);
  const octets = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) octets[i] = s.charCodeAt(i);
  return octets;
}

async function deriver(code: string, sel: Uint8Array, iter: number): Promise<string> {
  const matiere = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(code) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: sel as BufferSource, iterations: iter, hash: "SHA-256" },
    matiere,
    256,
  );
  return enBase64(new Uint8Array(bits));
}

export function lireVerrou(): ConfigVerrou | null {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const c = JSON.parse(brut);
    if (
      c &&
      c.v === 1 &&
      typeof c.sel === "string" &&
      typeof c.hash === "string" &&
      typeof c.iter === "number" &&
      typeof c.delaiMin === "number"
    ) {
      return c as ConfigVerrou;
    }
  } catch {
    // Donnée illisible : traitée comme absente.
  }
  return null;
}

export function verrouActif(): boolean {
  return lireVerrou() !== null;
}

export async function definirCode(code: string, delaiMin: number): Promise<void> {
  const sel = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriver(code, sel, ITERATIONS);
  const config: ConfigVerrou = { v: 1, sel: enBase64(sel), hash, iter: ITERATIONS, delaiMin };
  window.localStorage.setItem(CLE, JSON.stringify(config));
  reinitialiserEssais();
}

export async function verifierCode(code: string): Promise<boolean> {
  const c = lireVerrou();
  if (!c) return true;
  const hash = await deriver(code, deBase64(c.sel), c.iter);
  return hash === c.hash;
}

export function changerDelai(delaiMin: number) {
  const c = lireVerrou();
  if (c) window.localStorage.setItem(CLE, JSON.stringify({ ...c, delaiMin }));
}

export function desactiver() {
  window.localStorage.removeItem(CLE);
  reinitialiserEssais();
}

type Essais = { n: number; jusque: number };

function lireEssais(): Essais {
  try {
    const e = JSON.parse(window.localStorage.getItem(CLE_ESSAIS) ?? "");
    if (e && typeof e.n === "number" && typeof e.jusque === "number") return e;
  } catch {
    // Aucun essai enregistré.
  }
  return { n: 0, jusque: 0 };
}

export function secondesRestantes(): number {
  return Math.max(0, Math.ceil((lireEssais().jusque - Date.now()) / 1000));
}

export function enregistrerEchec() {
  const e = lireEssais();
  const n = e.n + 1;
  let jusque = e.jusque;
  if (n % 5 === 0) {
    const attente = Math.min(900, 30 * 2 ** (n / 5 - 1));
    jusque = Date.now() + attente * 1000;
  }
  try {
    window.localStorage.setItem(CLE_ESSAIS, JSON.stringify({ n, jusque }));
  } catch {
    // Stockage indisponible.
  }
}

export function reinitialiserEssais() {
  try {
    window.localStorage.removeItem(CLE_ESSAIS);
  } catch {
    // Stockage indisponible.
  }
}

export function effacerDonneesAppareil() {
  try {
    const cles: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("hermann.")) cles.push(k);
    }
    cles.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Stockage indisponible.
  }
}
