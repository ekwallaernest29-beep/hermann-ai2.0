import { useState, type FormEvent } from "react";
import Entete from "../components/Entete";
import { aller } from "../route";
import {
  EVT_VERROUILLER,
  changerDelai,
  definirCode,
  desactiver,
  lireVerrou,
  verifierCode,
} from "../verrou";

const DELAIS = [
  { min: 0, nom: "Immédiatement" },
  { min: 1, nom: "Après 1 minute" },
  { min: 5, nom: "Après 5 minutes" },
  { min: 15, nom: "Après 15 minutes" },
];
const CODE_OK = /^\d{6}$/;

type Mode = "menu" | "changer" | "desactiver";
type ChampProps = { id: string; label: string; valeur: string; onChange: (v: string) => void };

function Champ({ id, label, valeur, onChange }: ChampProps) {
  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        autoComplete="off"
        value={valeur}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
    </div>
  );
}

function SelectDelai({ valeur, onChange }: { valeur: number; onChange: (n: number) => void }) {
  return (
    <div className="champ">
      <label htmlFor="delai">VERROUILLER APRÈS AVOIR QUITTÉ L’APPLI</label>
      <select id="delai" value={valeur} onChange={(e) => onChange(Number(e.target.value))}>
        {DELAIS.map((d) => (
          <option key={d.min} value={d.min}>
            {d.nom}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SecuriteReelle() {
  const [actif, setActif] = useState(() => lireVerrou() !== null);
  const [delai, setDelai] = useState(() => lireVerrou()?.delaiMin ?? 1);
  const [mode, setMode] = useState<Mode>("menu");
  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState(false);

  const vider = () => {
    setAncien("");
    setNouveau("");
    setConfirmation("");
    setMode("menu");
  };

  const executer = async (action: () => Promise<string>) => {
    setOccupe(true);
    setMessage("");
    try {
      setMessage(await action());
    } catch {
      setMessage("Opération impossible : le stockage du navigateur est indisponible.");
    }
    setOccupe(false);
  };

  const activer = (e: FormEvent) => {
    e.preventDefault();
    void executer(async () => {
      if (!CODE_OK.test(nouveau)) return "Le code doit contenir exactement 6 chiffres.";
      if (nouveau !== confirmation) return "Les deux codes ne sont pas identiques.";
      await definirCode(nouveau, delai);
      setActif(true);
      vider();
      return "Verrouillage activé.";
    });
  };

  const changer = (e: FormEvent) => {
    e.preventDefault();
    void executer(async () => {
      if (!(await verifierCode(ancien))) return "Code actuel incorrect.";
      if (!CODE_OK.test(nouveau)) return "Le nouveau code doit contenir exactement 6 chiffres.";
      if (nouveau !== confirmation) return "Les deux nouveaux codes ne sont pas identiques.";
      await definirCode(nouveau, delai);
      vider();
      return "Code modifié.";
    });
  };

  const retirer = (e: FormEvent) => {
    e.preventDefault();
    void executer(async () => {
      if (!(await verifierCode(ancien))) return "Code actuel incorrect.";
      desactiver();
      setActif(false);
      vider();
      return "Verrouillage désactivé.";
    });
  };

  const surDelai = (min: number) => {
    setDelai(min);
    if (!actif) return;
    try {
      changerDelai(min);
    } catch {
      setMessage("Réglage non enregistré : stockage indisponible.");
    }
  };

  return (
    <div className="ecran">
      <Entete retour={() => aller("/parametres")} />
      <main className="page">
        <h1>Sécurité</h1>
        <p className="sous-titre">Protégez l’accès à HERMANN sur cet appareil.</p>

        <section className="carte">
          <p className="groupe">CODE DE VERROUILLAGE</p>
          <p className="titre-carte">{actif ? "Activé" : "Désactivé"}</p>
        </section>

        {message && (
          <div className="bandeau alerte" role="status">
            <strong>{message}</strong>
          </div>
        )}

        {!actif && (
          <form className="formulaire" onSubmit={activer}>
            <Champ id="nouveau" label="NOUVEAU CODE (6 CHIFFRES)" valeur={nouveau} onChange={setNouveau} />
            <Champ id="confirmation" label="CONFIRMER LE CODE" valeur={confirmation} onChange={setConfirmation} />
            <SelectDelai valeur={delai} onChange={surDelai} />
            <button type="submit" className="bouton menthe" disabled={occupe}>
              Activer le verrouillage
            </button>
            <p className="note-bas">
              Il n’existe pas de récupération du code. Faites d’abord une sauvegarde.
            </p>
            <a className="bouton" href="#/parametres/sauvegarde">
              Faire une sauvegarde
            </a>
          </form>
        )}

        {actif && mode === "menu" && (
          <div className="formulaire">
            <SelectDelai valeur={delai} onChange={surDelai} />
            <button
              type="button"
              className="bouton menthe"
              onClick={() => window.dispatchEvent(new Event(EVT_VERROUILLER))}
            >
              Verrouiller maintenant
            </button>
            <button type="button" className="bouton" onClick={() => setMode("changer")}>
              Changer le code
            </button>
            <button type="button" className="bouton" onClick={() => setMode("desactiver")}>
              Désactiver le verrouillage
            </button>
          </div>
        )}

        {actif && mode === "changer" && (
          <form className="formulaire" onSubmit={changer}>
            <Champ id="ancien" label="CODE ACTUEL" valeur={ancien} onChange={setAncien} />
            <Champ id="nouveau" label="NOUVEAU CODE (6 CHIFFRES)" valeur={nouveau} onChange={setNouveau} />
            <Champ id="confirmation" label="CONFIRMER LE NOUVEAU CODE" valeur={confirmation} onChange={setConfirmation} />
            <button type="submit" className="bouton menthe" disabled={occupe}>
              Enregistrer le nouveau code
            </button>
            <button type="button" className="bouton" onClick={vider}>
              Annuler
            </button>
          </form>
        )}

        {actif && mode === "desactiver" && (
          <form className="formulaire" onSubmit={retirer}>
            <Champ id="ancien" label="CODE ACTUEL" valeur={ancien} onChange={setAncien} />
            <button type="submit" className="bouton plein" disabled={occupe}>
              Désactiver le verrouillage
            </button>
            <button type="button" className="bouton" onClick={vider}>
              Annuler
            </button>
          </form>
        )}

        <h2 className="groupe">CE QUE CELA PROTÈGE</h2>
        <p>
          Le code empêche une autre personne d’ouvrir HERMANN sur votre téléphone déverrouillé. Il ne chiffre
          pas encore vos données ni vos clés IA : une personne qui maîtrise les outils du navigateur peut les
          lire. Il ne remplace pas le verrouillage de votre téléphone.
        </p>
        <h2 className="groupe">NON DISPONIBLE</h2>
        <p>
          Mot de passe de compte, double authentification et sessions : HERMANN n’utilise ni serveur ni compte
          en ligne, ces réglages n’existent donc pas.
        </p>
      </main>
    </div>
  );
}
