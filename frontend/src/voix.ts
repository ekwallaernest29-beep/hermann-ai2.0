import { parlerIA, voixIAActive } from "./voixIA";
export const CLES = { voix: "hermann.voix", vitesse: "hermann.vitesse" };

export function lirePref(cle: string): string | null {
  try {
    return window.localStorage.getItem(cle);
  } catch {
    return null;
  }
}

export function ecrirePref(cle: string, valeur: string) {
  try {
    window.localStorage.setItem(cle, valeur);
  } catch {
    // Stockage indisponible : le choix ne sera pas conservé.
  }
}

export function voixFrancaises(): SpeechSynthesisVoice[] {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("fr"))
    .sort((a, b) => Number(b.localService) - Number(a.localService) || a.name.localeCompare(b.name));
}

function parlerSysteme(texte: string, voix: SpeechSynthesisVoice | undefined, vitesse: number, fin: () => void) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = voix?.lang ?? "fr-FR";
  if (voix) u.voice = voix;
  u.rate = vitesse;
  u.onend = fin;
  u.onerror = fin;
  synth.speak(u);
}


export function parler(texte: string, voix: SpeechSynthesisVoice | undefined, vitesse: number, fin: () => void) {
  if (voixIAActive()) {
    parlerIA(texte, vitesse, () => parlerSysteme(texte, voix, vitesse, fin), fin);
    return;
  }
  parlerSysteme(texte, voix, vitesse, fin);
}
