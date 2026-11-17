import { useCallback, useEffect, useRef, useState } from "react";
import { effacerCode, lireCode } from "./acces";
import { CLES, lirePref, parler, voixFrancaises } from "./voix";

const API = import.meta.env.VITE_API_URL ?? "";

export type Phase = "repos" | "transcription" | "reflexion" | "parole";
export type ErreurDialogue = { titre: string; texte: string };
type Tour = { role: "user" | "hermann"; texte: string };
type Echec = { statut: number; detail: string };

async function echec(r: Response): Promise<Echec> {
  let detail = "";
  try {
    const j = await r.json();
    if (typeof j.detail === "string") detail = j.detail;
  } catch {
    // Réponse sans détail lisible.
  }
  return { statut: r.status, detail };
}

function traduire(e: unknown): ErreurDialogue {
  if (typeof e === "object" && e !== null && "statut" in e) {
    const { statut, detail } = e as Echec;
    if (statut === 401) {
      effacerCode();
      return { titre: "Code d’accès refusé", texte: "Le code n’est pas valide. Touchez Activer micro pour le saisir à nouveau." };
    }
    if (statut === 429) return { titre: "Trop de demandes", texte: detail || "Patientez un instant avant de réessayer." };
    if (statut === 413) return { titre: "Enregistrement trop long", texte: "Parlez moins longtemps, puis réessayez." };
    return { titre: "Service indisponible", texte: detail || "Une erreur est survenue. Réessayez dans un instant." };
  }
  return { titre: "Serveur injoignable", texte: "Vérifiez votre connexion et que le serveur est allumé." };
}

// iPhone : la synthèse vocale doit être « réveillée » pendant un geste de l'utilisateur.
export function deverrouillerVoix() {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  window.speechSynthesis.speak(u);
}

export function useDialogue() {
  const [phase, setPhase] = useState<Phase>("repos");
  const [vous, setVous] = useState("");
  const [reponse, setReponse] = useState("");
  const [erreur, setErreur] = useState<ErreurDialogue | null>(null);
  const historique = useRef<Tour[]>([]);
  const ctrl = useRef<AbortController | null>(null);
  const coupe = useRef(false);
  const [fins, setFins] = useState(0);

  useEffect(
    () => () => {
      ctrl.current?.abort();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );

  const interrompre = useCallback(() => {
    ctrl.current?.abort();
    ctrl.current = null;
    coupe.current = true;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPhase("repos");
  }, []);

  const signaler = useCallback((titre: string, texte: string) => setErreur({ titre, texte }), []);
  const effacerErreur = useCallback(() => setErreur(null), []);

  const envoyer = useCallback(async (blob: Blob, nom: string) => {
    coupe.current = false;
    setErreur(null);
    setReponse("");
    setVous("");
    if (blob.size < 2000) {
      setErreur({ titre: "Je n’ai pas compris", texte: "Je n’ai rien entendu de clair. Touchez Activer micro et réessayez." });
      return;
    }
    const controle = new AbortController();
    ctrl.current = controle;
    const entetes = { "X-Access-Code": lireCode() };
    setPhase("transcription");
    try {
      const form = new FormData();
      form.append("audio", blob, nom);
      const r1 = await fetch(`${API}/api/voix/transcrire`, {
        method: "POST",
        headers: entetes,
        body: form,
        signal: controle.signal,
      });
      if (!r1.ok) throw await echec(r1);
      const { texte } = (await r1.json()) as { texte: string };
      if (!texte.trim()) {
        setErreur({ titre: "Je n’ai pas compris", texte: "Je n’ai rien entendu de clair. Touchez Activer micro et réessayez." });
        setPhase("repos");
        return;
      }
      setVous(texte);
      setPhase("reflexion");

      let messages: Tour[] = [...historique.current, { role: "user" as const, texte }].slice(-10);
      while (messages.length > 1 && messages[0].role !== "user") messages = messages.slice(1);

      const r2 = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { ...entetes, "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal: controle.signal,
      });
      if (!r2.ok) throw await echec(r2);
      const { reponse: texteReponse } = (await r2.json()) as { reponse: string };
      historique.current = [...messages, { role: "hermann" as const, texte: texteReponse }].slice(-10);
      setReponse(texteReponse);

      if (!("speechSynthesis" in window)) {
        setPhase("repos");
        return;
      }
      setPhase("parole");
      const uri = lirePref(CLES.voix);
      const voix = voixFrancaises().find((v) => v.voiceURI === uri);
      const vitesse = Number(lirePref(CLES.vitesse)) || 1;
      parler(texteReponse, voix, vitesse, () => {
        setPhase("repos");
        if (!coupe.current) setFins((n) => n + 1);
      });
    } catch (e) {
      if (controle.signal.aborted) return;
      setErreur(traduire(e));
      setPhase("repos");
    }
  }, []);

  return { phase, vous, reponse, erreur, fins, envoyer, interrompre, signaler, effacerErreur };
}
