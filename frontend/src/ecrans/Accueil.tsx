import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
import { ETATS, NOMS, ORDRE, type DefEtat, type Etat } from "../etats";
import { aller } from "../route";
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
  parole: { libelle: "Interrupteur", icone: <IconeStop />, vers: "interruption" },
  interruption: { libelle: "Couper micro", icone: <IconeMicro />, vers: "veille" },
};
APERCU.parole.libelle = "Interrompre";

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
  const racine = useRef<HTMLDivElement>(null);

  const surNiveau = useCallback((n: number) => {
    racine.current?.style.setProperty("--niveau", n.toFixed(3));
  }, []);
  const micro = useMicro({ onNiveau: surNiveau });
  const reel = micro.statut === "actif";
  const demande = micro.statut === "demande";

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

  const choisir = (e: Etat) => {
    micro.arreter();
    micro.effacerErreur();
    setEtat(e);
  };

  let def: DefEtat;
  let etatSphere: Etat = etat;
  if (reel) {
    etatSphere = "ecoute";
    def = {
      badge: "MICROPHONE ACTIF",
      texte: micro.parle ? "Je vous entends." : "Je vous écoute…",
      detail:
        "Détection de voix uniquement · rien n’est enregistré ni envoyé. La compréhension de la parole arrive ensuite.",
    };
  } else if (demande) {
    etatSphere = "veille";
    def = {
      badge: "AUTORISATION EN COURS",
      texte: "Acceptez la demande d’accès au microphone.",
      detail: "Votre navigateur va vous demander l’autorisation.",
    };
  } else if (micro.erreur) {
    etatSphere = "veille";
    def = {
      badge: micro.erreur.titre.toUpperCase(),
      texte: micro.erreur.texte,
      detail: "Aucun accès au microphone.",
    };
  } else {
    def = ETATS[etat];
  }

  let action: Action;
  if (reel) {
    action = { libelle: "Couper micro", icone: <IconeMicro />, surClic: micro.arreter };
  } else if (demande) {
    action = { libelle: "Autorisation…", icone: <IconeMicro />, desactive: true };
  } else if (etat === "veille") {
    action = { libelle: "Activer micro", icone: <IconeMicro />, surClic: micro.demarrer };
  } else {
    const p = APERCU[etat];
    action = {
      libelle: p.libelle,
      icone: p.icone,
      desactive: p.desactive,
      surClic: p.vers ? () => setEtat(p.vers as Etat) : undefined,
    };
  }

  const ondesActives = reel
    ? micro.parle
    : etat === "ecoute" || etat === "interruption" || etat === "parole";
  const afficherApercu = !reel && !demande && !micro.erreur;

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
        note="Aperçu de l’interface · seul le micro est réel, la compréhension et les réponses ne sont pas encore actives"
        options={ORDRE.map((e) => ({ id: e, nom: NOMS[e] }))}
        valeur={etat}
        onChoisir={(id) => choisir(id as Etat)}
      />
    </div>
  );
}
