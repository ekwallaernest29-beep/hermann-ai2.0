import { useCallback, useEffect, useRef, useState } from "react";

export type ErreurMicro = { titre: string; texte: string };
export type StatutMicro = "inactif" | "demande" | "actif";

const NON_SUPPORTE: ErreurMicro = {
  titre: "Micro non pris en charge",
  texte: "Ce navigateur ne permet pas l’accès au microphone, ou la page n’est pas sécurisée (HTTPS).",
};

function traduire(e: unknown): ErreurMicro {
  const nom = e instanceof DOMException ? e.name : "";
  if (nom === "NotAllowedError" || nom === "SecurityError") {
    return {
      titre: "Permission micro refusée",
      texte: "Autorisez le microphone dans les réglages du navigateur ou du téléphone pour parler à Hermann.",
    };
  }
  if (nom === "NotFoundError" || nom === "OverconstrainedError") {
    return { titre: "Micro introuvable", texte: "Aucun microphone n’a été détecté sur cet appareil." };
  }
  if (nom === "NotReadableError" || nom === "AbortError") {
    return { titre: "Micro indisponible", texte: "Le microphone est utilisé ailleurs. Libérez-le, puis réessayez." };
  }
  return { titre: "Micro indisponible", texte: "Une erreur est survenue. Réessayez dans un instant." };
}

type Options = { onNiveau?: (niveau: number) => void };

// Micro réel : l'analyse du son reste sur l'appareil. Rien n'est enregistré ni envoyé.
export function useMicro({ onNiveau }: Options = {}) {
  const [statut, setStatut] = useState<StatutMicro>("inactif");
  const [parle, setParle] = useState(false);
  const [erreur, setErreur] = useState<ErreurMicro | null>(null);
  const flux = useRef<MediaStream | null>(null);
  const contexte = useRef<AudioContext | null>(null);
  const raf = useRef(0);
  const occupe = useRef(false);
  const surNiveau = useRef(onNiveau);

  useEffect(() => {
    surNiveau.current = onNiveau;
  });

  const arreter = useCallback(() => {
    cancelAnimationFrame(raf.current);
    flux.current?.getTracks().forEach((t) => t.stop());
    flux.current = null;
    contexte.current?.close().catch(() => {});
    contexte.current = null;
    surNiveau.current?.(0);
    setParle(false);
    setStatut("inactif");
  }, []);

  const demarrer = useCallback(async () => {
    if (occupe.current || flux.current) return;
    setErreur(null);
    const Contexte =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexte || !navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setErreur(NON_SUPPORTE);
      return;
    }
    occupe.current = true;
    setStatut("demande");
    try {
      // Créé pendant le geste de l'utilisateur (nécessaire sur iPhone).
      const ctx = new Contexte();
      contexte.current = ctx;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      flux.current = stream;
      await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyseur = ctx.createAnalyser();
      analyseur.fftSize = 1024;
      source.connect(analyseur); // non relié à la sortie : aucun retour sonore
      const donnees = new Float32Array(analyseur.fftSize);

      let fond = 0.005;
      let debutVoix = 0;
      let dernierSon = 0;
      let enParole = false;
      let lisse = 0;

      const boucle = (t: number) => {
        analyseur.getFloatTimeDomainData(donnees);
        let somme = 0;
        for (let i = 0; i < donnees.length; i++) somme += donnees[i] * donnees[i];
        const rms = Math.sqrt(somme / donnees.length);

        if (!enParole && rms < fond * 1.5 + 0.002) fond = fond * 0.95 + rms * 0.05;
        const seuil = Math.max(0.02, fond * 3);

        if (rms > seuil) {
          if (!debutVoix) debutVoix = t;
          dernierSon = t;
          if (!enParole && t - debutVoix > 150) {
            enParole = true;
            setParle(true);
          }
        } else if (enParole) {
          if (t - dernierSon > 600) {
            enParole = false;
            setParle(false);
          }
        } else {
          debutVoix = 0;
        }

        const niveau = Math.min(1, Math.max(0, (rms - fond * 1.2) * 12));
        lisse = lisse * 0.6 + niveau * 0.4;
        surNiveau.current?.(lisse);
        raf.current = requestAnimationFrame(boucle);
      };

      raf.current = requestAnimationFrame(boucle);
      setStatut("actif");
    } catch (e) {
      arreter();
      setErreur(traduire(e));
    } finally {
      occupe.current = false;
    }
  }, [arreter]);

  useEffect(() => {
    const surVisibilite = () => {
      if (document.hidden && flux.current) {
        arreter();
        setErreur({
          titre: "Micro coupé",
          texte: "L’écoute s’arrête quand l’application passe en arrière-plan.",
        });
      }
    };
    document.addEventListener("visibilitychange", surVisibilite);
    return () => {
      document.removeEventListener("visibilitychange", surVisibilite);
      arreter();
    };
  }, [arreter]);

  const effacerErreur = useCallback(() => setErreur(null), []);

  return { statut, parle, erreur, demarrer, arreter, effacerErreur };
}
