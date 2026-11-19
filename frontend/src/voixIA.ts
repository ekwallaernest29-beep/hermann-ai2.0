import { lireCles } from "./direct";

const CLE_VOIX = "hermann.voixia";
const MODELE = "gemini-3.8-flash-lite-tts";
const URL_TTS = "https://generativelanguage.googleapis.com/v1beta/interactions";

export const VOIX_IA: { nom: string; style: string }[] = [
  { nom: "Charon", style: "posée, informative" },
  { nom: "Puck", style: "enjouée" },
  { nom: "Fenrir", style: "énergique" },
  { nom: "Orus", style: "ferme" },
  { nom: "Kore", style: "ferme" },
  { nom: "Zephyr", style: "lumineuse" },
  { nom: "Leda", style: "jeune" },
  { nom: "Aoede", style: "légère" },
];

export function lireVoixIA(): string {
  try {
    return window.localStorage.getItem(CLE_VOIX) ?? "";
  } catch {
    return "";
  }
}

export function ecrireVoixIA(voix: string) {
  try {
    if (voix) window.localStorage.setItem(CLE_VOIX, voix);
    else window.localStorage.removeItem(CLE_VOIX);
  } catch {
    // Stockage indisponible : le choix ne sera pas conservé.
  }
}

export function voixIAActive(): boolean {
  return lireVoixIA() !== "" && lireCles().gemini.trim() !== "";
}

type Reponse = { steps?: { type: string; content?: { type: string; data?: string }[] }[] };

let element: HTMLAudioElement | null = null;
let courant: { url: string; fin: () => void } | null = null;
let controle: AbortController | null = null;

function lecteur(): HTMLAudioElement {
  if (!element) element = new Audio();
  return element;
}

// iPhone : la lecture audio doit être « réveillée » par un premier toucher de l'écran.
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
function deverrouiller() {
  const el = lecteur();
  el.onended = null;
  el.src = SILENCE;
  void el.play().catch(() => {});
}
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", deverrouiller, { once: true, capture: true });
}

function arreter(appelerFin: boolean) {
  controle?.abort();
  controle = null;
  const c = courant;
  courant = null;
  if (element) {
    element.onended = null;
    element.onerror = null;
    element.pause();
  }
  if (c) {
    URL.revokeObjectURL(c.url);
    if (appelerFin) c.fin();
  }
}

export function arreterVoixIA() {
  arreter(true);
}

// Interrompre (annuler la synthèse vocale) coupe aussi la voix IA.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const synth = window.speechSynthesis;
  const origine = synth.cancel.bind(synth);
  synth.cancel = () => {
    arreter(true);
    origine();
  };
}

function nettoyer(texte: string): string {
  return texte.replace(/[*_#`<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 1500);
}

async function synthese(texte: string, voix: string, signal: AbortSignal): Promise<Blob> {
  const r = await fetch(URL_TTS, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": lireCles().gemini.trim() },
    body: JSON.stringify({
      model: MODELE,
      input: [{ type: "user_input", content: [{ type: "text", text: texte }] }],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: voix }] },
    }),
  });
  if (!r.ok) throw new Error(`Synthèse vocale : ${r.status}`);
  const j = (await r.json()) as Reponse;
  const blocs = (j.steps ?? [])
    .filter((s) => s.type === "model_output")
    .flatMap((s) => s.content ?? [])
    .filter((c) => c.type === "audio");
  const donnees = blocs.length ? blocs[blocs.length - 1].data : "";
  if (!donnees) throw new Error("Synthèse vocale vide");
  const bin = atob(donnees);
  const octets = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
  return new Blob([octets], { type: "audio/wav" });
}

export function parlerAvec(
  texte: string,
  voix: string,
  vitesse: number,
  secours: () => void,
  fin: () => void,
) {
  arreter(false);
  const ctrl = new AbortController();
  controle = ctrl;
  synthese(nettoyer(texte), voix, ctrl.signal)
    .then((blob) => {
      if (ctrl.signal.aborted) return;
      const el = lecteur();
      const url = URL.createObjectURL(blob);
      const echec = () => {
        if (courant?.url !== url) return;
        courant = null;
        URL.revokeObjectURL(url);
        secours();
      };
      courant = { url, fin };
      el.onended = () => {
        if (courant?.url !== url) return;
        courant = null;
        URL.revokeObjectURL(url);
        fin();
      };
      el.onerror = echec;
      el.src = url;
      el.defaultPlaybackRate = vitesse;
      el.playbackRate = vitesse;
      el.play().catch(echec);
    })
    .catch(() => {
      if (!ctrl.signal.aborted) secours();
    });
}

export function parlerIA(texte: string, vitesse: number, secours: () => void, fin: () => void) {
  parlerAvec(texte, lireVoixIA(), vitesse, secours, fin);
}

// ---------- Lecture phrase par phrase ----------
function decouper(texte: string): string[] {
  const propre = nettoyer(texte);
  const morceaux = propre
    .replace(/([.!?…])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const phrases: string[] = [];
  for (const m of morceaux) {
    const derniere = phrases.length - 1;
    if (derniere >= 0 && phrases[derniere].length < 25) phrases[derniere] += " " + m;
    else phrases.push(m);
  }
  return phrases;
}

function jouer(blob: Blob, vitesse: number, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }
    const el = lecteur();
    const url = URL.createObjectURL(blob);
    let fini = false;
    const clore = (ok: boolean) => {
      if (fini) return;
      fini = true;
      el.onended = null;
      el.onerror = null;
      signal.removeEventListener("abort", surAbandon);
      URL.revokeObjectURL(url);
      resolve(ok);
    };
    const surAbandon = () => clore(false);
    signal.addEventListener("abort", surAbandon, { once: true });
    el.onended = () => clore(true);
    el.onerror = () => clore(false);
    el.src = url;
    el.defaultPlaybackRate = vitesse;
    el.playbackRate = vitesse;
    el.play().catch(() => clore(false));
  });
}

export function parlerIAPhrases(
  texte: string,
  vitesse: number,
  secours: (reste: string) => void,
  fin: () => void,
) {
  arreter(false);
  const phrases = decouper(texte);
  if (phrases.length === 0) {
    fin();
    return;
  }
  const ctrl = new AbortController();
  controle = ctrl;
  courant = { url: "", fin };
  const voix = lireVoixIA();
  const demandes: Promise<Blob>[] = [];
  const preparer = (i: number) => {
    if (i < phrases.length && !demandes[i]) {
      demandes[i] = synthese(phrases[i], voix, ctrl.signal);
      demandes[i].catch(() => {});
    }
  };
  const repli = (i: number) => {
    if (ctrl.signal.aborted) return;
    courant = null;
    secours(phrases.slice(i).join(" "));
  };
  void (async () => {
    for (let i = 0; i < phrases.length; i++) {
      preparer(i);
      preparer(i + 1);
      let blob: Blob;
      try {
        blob = await demandes[i];
      } catch {
        repli(i);
        return;
      }
      if (ctrl.signal.aborted) return;
      const ok = await jouer(blob, vitesse, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (!ok) {
        repli(i);
        return;
      }
    }
    if (controle === ctrl) {
      courant = null;
      controle = null;
      fin();
    }
  })();
}
