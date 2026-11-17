import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Apercu from "../components/Apercu";
import Entete from "../components/Entete";
import Sphere from "../components/Sphere";
import Waveform from "../components/Waveform";
import {
  IconeHistorique,
  IconeLune,
  IconeMicro,
  IconeMicroCoupe,
  IconePlay,
  IconeStop,
} from "../components/Icones";
import { ecrireCode, lireCode } from "../acces";
import { ETATS, NOMS, ORDRE, type DefEtat, type Etat } from "../etats";
import { aller } from "../route";
import { deverrouillerVoix, useDialogue } from "../useDialogue";
import { useMicro } from "../useMicro";

const API = import.meta.env.VITE_API_URL ?? "";

type Serveur = "verification" | "connecte" | "injoignable";

const LIBELLE_SERVEUR: Record<Serveur, string> = {
  verification: "Vérification du serveur…",
  connecte: "Serveur connecté",
  injoignable: "Serveur injoignable",
};

type Action = {
  libelle: string;
  icone: ReactNode;
  desactive?: boolean;
  surClic?: () => void;
};

// Aperçu : ces transitions servent à visualiser l'interface, sans micro ni voix.
const APERCU: Record<Etat, { libelle: string; icone: ReactNode; vers?: Etat; desactive?: boolean }> = {
  veille: { libelle: "Activer micro", icone: <IconeMicro />, vers: "ecoute" },
  ecoute: { libelle: "Couper micro", icone: <IconeMicro />, vers: "veille" },
  reflexion: { libelle: "Micro en pause", icone: <IconeMicroCoupe />, desactive: true },
  parole: { libelle: "Interrompre", icone: <IconeStop />, vers: "interruption" },
  interruption: { libelle: "Couper micro", icone: <IconeMicro />, vers: "veille" },
};

function choisirFormat(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
}

function nomFichier(type: string): string {
  if (type.includes("mp4")) return "voix.m4a";
  if (type.includes("ogg")) return "voix.ogg";
  return "voix.webm";
}

type CommandeProps = {
  libelle: string;
  icone: ReactNode;
  onClick?: () => void;
  principal?: boolean;
  desactive?: boolean;
  titre?: string;
};

function Commande({ libelle, icone, onClick, principal, desactive, titre }: CommandeProps) {
  return (
    <button
      type="button"
      className={`commande${principal ? " principal" : ""}`}
      onClick={onClick}
      disabled={desactive}
      title={desactive ? titre : undefined}
    >
      <span className="pastille">{icone}</span>
      <span className="legende">{libelle}</span>
    </button>
  );
}

export default function Accueil() {
  const [serveur, setServeur] = useState<Serveur>("verification");
  const [etat, setEtat] = useState<Etat>("veille");
  const [demandeCode, setDemandeCode] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [infoCode, setInfoCode] = useState("");
  const [verif, setVerif] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const finRef = useRef<() => void>(() => {});
  const enregistreur = useRef<MediaRecorder | null>(null);
  const morceaux = useRef<Blob[]>([]);

  const surNiveau = useCallback((n: number) => {
    racine.current?.style.setProperty("--niveau", n.toFixed(3));
  }, []);
  const dialogue = useDialogue();
  const micro = useMicro({ onNiveau: surNiveau, onFinParole: () => finRef.current() });
  const reel = micro.statut === "actif";
  const demande = micro.statut === "demande";
  const phase = dialogue.phase;

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${API}/api/health`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setServeur("connecte"))
      .catch(() => {
        if (!ctrl.signal.aborted) setServeur("injoignable");
      });
    return () => ctrl.abort();
  }, []);

  // Après la réponse de Hermann, le micro se réactive tout seul pour continuer la conversation.
  useEffect(() => {
    if (dialogue.fins > 0) void micro.demarrer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogue.fins]);

  // Fin de parole : on arrête l'enregistrement et on envoie la voix au serveur.
  const terminer = () => {
    const rec = enregistreur.current;
    if (!rec || rec.state === "inactive") return;
    const type = rec.mimeType || "audio/webm";
    rec.onstop = () => {
      const blob = new Blob(morceaux.current, { type });
      morceaux.current = [];
      micro.arreter();
      void dialogue.envoyer(blob, nomFichier(type));
    };
    rec.stop();
  };
  useEffect(() => {
    finRef.current = terminer;
  });

  // Enregistrement de la voix pendant que le micro est actif.
  useEffect(() => {
    if (micro.statut !== "actif") return;
    const flux = micro.lireFlux();
    if (!flux) return;
    if (typeof MediaRecorder === "undefined") {
      micro.arreter();
      dialogue.signaler("Enregistrement non pris en charge", "Ce navigateur ne permet pas d’enregistrer la voix.");
      return;
    }
    const type = choisirFormat();
    const rec = new MediaRecorder(flux, type ? { mimeType: type } : undefined);
    morceaux.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) morceaux.current.push(e.data);
    };
    rec.start(250);
    enregistreur.current = rec;
    const minuteur = window.setTimeout(() => finRef.current(), 30000);
    return () => {
      window.clearTimeout(minuteur);
      if (rec.state !== "inactive") {
        try {
          rec.stop();
        } catch {
          // Déjà arrêté.
        }
      }
      enregistreur.current = null;
    };
  }, [micro.statut, micro.lireFlux]);

  const choisir = (e: Etat) => {
    micro.arreter();
    micro.effacerErreur();
    dialogue.interrompre();
    dialogue.effacerErreur();
    setEtat(e);
  };

  const activer = () => {
    if (!lireCode()) {
      setInfoCode("");
      setDemandeCode(true);
      return;
    }
    deverrouillerVoix();
    dialogue.effacerErreur();
    void micro.demarrer();
  };

  const validerCode = async (e: FormEvent) => {
    e.preventDefault();
    setVerif(true);
    setInfoCode("");
    try {
      const r = await fetch(`${API}/api/acces/verifier`, { headers: { "X-Access-Code": saisie.trim() } });
      if (r.ok) {
        ecrireCode(saisie.trim());
        setSaisie("");
        setDemandeCode(false);
        setInfoCode("Code accepté. Touchez Activer micro pour parler à Hermann.");
      } else if (r.status === 429) {
        setInfoCode("Trop d’essais. Réessayez dans quelques minutes.");
      } else {
        setInfoCode("Code invalide.");
      }
    } catch {
      setInfoCode("Serveur injoignable. Vérifiez qu’il est allumé.");
    } finally {
      setVerif(false);
    }
  };

  let def: DefEtat;
  let etatSphere: Etat = etat;
  if (phase === "parole") {
    etatSphere = "parole";
    def = { badge: ETATS.parole.badge, texte: dialogue.reponse, detail: `Vous : « ${dialogue.vous} »` };
  } else if (phase !== "repos") {
    etatSphere = "reflexion";
    def = {
      badge: ETATS.reflexion.badge,
      texte: dialogue.vous ? `« ${dialogue.vous} »` : "Transcription de votre voix…",
      detail: phase === "transcription" ? "Transcription en cours" : "Analyse de la demande",
    };
  } else if (reel) {
    etatSphere = "ecoute";
    def = {
      badge: "HERMANN VOUS ÉCOUTE",
      texte: micro.parle ? "Je vous entends." : "Je vous écoute…",
      detail: "Quand vous vous taisez, votre voix est envoyée pour être transcrite, puis traitée par une IA externe.",
    };
  } else if (demande) {
    etatSphere = "veille";
    def = {
      badge: "AUTORISATION EN COURS",
      texte: "Acceptez la demande d’accès au microphone.",
      detail: "Votre navigateur va vous demander l’autorisation.",
    };
  } else if (dialogue.erreur) {
    etatSphere = "veille";
    def = { badge: dialogue.erreur.titre.toUpperCase(), texte: dialogue.erreur.texte, detail: "Aucune demande en cours." };
  } else if (micro.erreur) {
    etatSphere = "veille";
    def = { badge: micro.erreur.titre.toUpperCase(), texte: micro.erreur.texte, detail: "Aucun accès au microphone." };
  } else {
    def = ETATS[etat];
  }

  let action: Action;
  if (phase === "parole") {
    action = {
      libelle: "Interrompre",
      icone: <IconeStop />,
      surClic: () => {
        dialogue.interrompre();
        activer();
      },
    };
  } else if (phase !== "repos") {
    action = { libelle: "Micro en pause", icone: <IconeMicroCoupe />, desactive: true };
  } else if (reel) {
    action = { libelle: "Couper micro", icone: <IconeMicro />, surClic: micro.arreter };
  } else if (demande) {
    action = { libelle: "Autorisation…", icone: <IconeMicro />, desactive: true };
  } else if (etat === "veille") {
    action = { libelle: "Activer micro", icone: <IconeMicro />, surClic: activer };
  } else {
    const p = APERCU[etat];
    action = {
      libelle: p.libelle,
      icone: p.icone,
      desactive: p.desactive,
      surClic: p.vers ? () => setEtat(p.vers as Etat) : undefined,
    };
  }

  const ondesActives =
    phase === "parole" ||
    (phase === "repos" && (reel ? micro.parle : etat === "ecoute" || etat === "interruption" || etat === "parole"));
  const afficherApercu = phase === "repos" && !reel && !demande && !micro.erreur && !dialogue.erreur;

  return (
    <div className="ecran" data-etat={etatSphere} ref={racine}>
      <Entete />

      <p className={`serveur serveur-${serveur}`} role="status">
        {LIBELLE_SERVEUR[serveur]}
      </p>

      <main className="scene">
        <Sphere etat={etatSphere} />
        <section className="texte" aria-live="polite">
          <p className="badge">{def.badge}</p>
          {afficherApercu && def.titre && <p className="titre">{def.titre}</p>}
          <p className="message">{def.texte}</p>
          <p className="detail">{def.detail}</p>
          <Waveform actif={ondesActives} reel={reel} />
        </section>
        {infoCode && !demandeCode && (
          <p className="sous-titre" role="status">
            {infoCode}
          </p>
        )}
        {demandeCode && (
          <form className="carte formulaire" onSubmit={validerCode}>
            <div className="champ">
              <label htmlFor="code">CODE D’ACCÈS</label>
              <input
                id="code"
                type="password"
                autoComplete="off"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
              />
            </div>
            {infoCode && <p className="sous-titre">{infoCode}</p>}
            <button type="submit" className="bouton menthe" disabled={!saisie.trim() || verif}>
              {verif ? "Vérification…" : "Valider"}
            </button>
          </form>
        )}
      </main>

      <nav className="actions" aria-label="Commandes">
        <Commande libelle="Historique" icone={<IconeHistorique />} onClick={() => aller("/historique")} />
        <Commande
          principal
          libelle={action.libelle}
          icone={action.icone}
          desactive={action.desactive}
          titre="Indisponible pour le moment"
          onClick={action.surClic}
        />
        <Commande libelle="Reprendre" icone={<IconePlay />} desactive titre="Fonction à définir" />
        <Commande libelle="Veille" icone={<IconeLune />} onClick={() => choisir("veille")} />
      </nav>

      <Apercu
        note="Aperçu de l’interface · touchez Activer micro (en veille) pour un vrai dialogue"
        options={ORDRE.map((e) => ({ id: e, nom: NOMS[e] }))}
        valeur={etat}
        onChoisir={(id) => choisir(id as Etat)}
      />
    </div>
  );
}
