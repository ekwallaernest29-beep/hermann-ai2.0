const CLE = "hermann.micro";

export type Sensibilite = "haute" | "normale" | "basse";
export type ReglagesMicro = {
  sensibilite: Sensibilite;
  silenceMs: number;
  relance: boolean;
  ecran: boolean;
};

export const DEFAUT: ReglagesMicro = { sensibilite: "normale", silenceMs: 1400, relance: true, ecran: true };

const SEUILS: Record<Sensibilite, { seuilMin: number; facteur: number }> = {
  haute: { seuilMin: 0.012, facteur: 2.2 },
  normale: { seuilMin: 0.02, facteur: 3 },
  basse: { seuilMin: 0.035, facteur: 4.5 },
};

export function seuilsDe(s: Sensibilite) {
  return SEUILS[s];
}

export function lireReglagesMicro(): ReglagesMicro {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return DEFAUT;
    const j = JSON.parse(brut) as Partial<ReglagesMicro>;
    const sens = j.sensibilite;
    return {
      sensibilite: sens === "haute" || sens === "normale" || sens === "basse" ? sens : DEFAUT.sensibilite,
      silenceMs:
        typeof j.silenceMs === "number" ? Math.min(3000, Math.max(600, j.silenceMs)) : DEFAUT.silenceMs,
      relance: typeof j.relance === "boolean" ? j.relance : DEFAUT.relance,
      ecran: typeof j.ecran === "boolean" ? j.ecran : DEFAUT.ecran,
    };
  } catch {
    return DEFAUT;
  }
}

export function ecrireReglagesMicro(r: ReglagesMicro) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(r));
  } catch {
    // Stockage indisponible : les réglages ne seront pas conservés.
  }
}

export const ecranPris = typeof navigator !== "undefined" && "wakeLock" in navigator;

let verrou: WakeLockSentinel | null = null;

export async function garderEcranAllume() {
  if (!ecranPris || !lireReglagesMicro().ecran) return;
  try {
    verrou = await navigator.wakeLock.request("screen");
  } catch {
    // Refusé par le navigateur : l'écran pourra s'éteindre.
  }
}

export function libererEcran() {
  verrou?.release().catch(() => {});
  verrou = null;
}
