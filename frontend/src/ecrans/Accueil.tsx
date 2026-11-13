import { useEffect, useState, type ReactNode } from "react";
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
import { ETATS, NOMS, ORDRE, type Etat } from "../etats";
import { aller } from "../route";

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
  vers?: Etat;
  desactive?: boolean;
};

// Aperçu : la voix n'est pas encore active, ces transitions servent à visualiser l'interface.
const ACTION_PRINCIPALE: Record<Etat, Action> = {
  veille: { libelle: "Activer micro", icone: <IconeMicro />, vers: "ecoute" },
  ecoute: { libelle: "Couper micro", icone: <IconeMicro />, vers: "veille" },
  reflexion: { libelle: "Micro en pause", icone: <IconeMicroCoupe />, desactive: true },
  parole: { libelle: "Interrompre", icone: <IconeStop />, vers: "interruption" },
  interruption: { libelle: "Couper micro", icone: <IconeMicro />, vers: "veille" },
};

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

  const def = ETATS[etat];
  const action = ACTION_PRINCIPALE[etat];
  const ondesActives = etat === "ecoute" || etat === "interruption" || etat === "parole";

  return (
    <div className="ecran" data-etat={etat}>
      <Entete />

      <p className={`serveur serveur-${serveur}`} role="status">
        {LIBELLE_SERVEUR[serveur]}
      </p>

      <main className="scene">
        <Sphere etat={etat} />
        <section className="texte" aria-live="polite">
          <p className="badge">{def.badge}</p>
          {def.titre && <p className="titre">{def.titre}</p>}
          <p className="message">{def.texte}</p>
          <p className="detail">{def.detail}</p>
          <Waveform actif={ondesActives} />
        </section>
      </main>

      <nav className="actions" aria-label="Commandes">
        <Commande libelle="Historique" icone={<IconeHistorique />} onClick={() => aller("/historique")} />
        <Commande
          principal
          libelle={action.libelle}
          icone={action.icone}
          desactive={action.desactive}
          titre="Indisponible pendant la réflexion"
          onClick={() => action.vers && setEtat(action.vers)}
        />
        <Commande libelle="Reprendre" icone={<IconePlay />} desactive titre="Fonction à définir" />
        <Commande libelle="Veille" icone={<IconeLune />} onClick={() => setEtat("veille")} />
      </nav>

      <Apercu
        note="Aperçu de l’interface · la voix n’est pas encore active"
        options={ORDRE.map((e) => ({ id: e, nom: NOMS[e] }))}
        valeur={etat}
        onChoisir={(id) => setEtat(id as Etat)}
      />
    </div>
  );
}
