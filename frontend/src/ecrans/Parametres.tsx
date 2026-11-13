import Entete from "../components/Entete";
import { IconeChevron } from "../components/Icones";
import { aller } from "../route";

type Ligne = { titre: string; detail: string; vers: string; apercu?: boolean };

const LIGNES: Ligne[] = [
  { titre: "Compte", detail: "Profil et informations personnelles", vers: "#/parametres/compte", apercu: true },
  { titre: "Sécurité", detail: "Mot de passe, 2FA et sessions", vers: "#/parametres/securite", apercu: true },
  { titre: "Appareils", detail: "Gérer les appareils autorisés", vers: "#/parametres/appareils", apercu: true },
  { titre: "Synchronisation", detail: "Cloud et mises à jour", vers: "#/parametres/synchronisation", apercu: true },
  { titre: "Voix et langue", detail: "Voix de Hermann et préférences", vers: "#/parametres/voix", apercu: true },
  { titre: "Microphone", detail: "Autorisation et confidentialité", vers: "#/parametres/microphone", apercu: true },
  { titre: "Historique et mémoire", detail: "Deux espaces à gérer séparément", vers: "#/parametres/historique-memoire" },
  { titre: "Notifications", detail: "Connexion, sécurité et alertes", vers: "#/parametres/notifications", apercu: true },
];

export function Parametres() {
  return (
    <div className="ecran">
      <Entete retour={() => aller("/")} />
      <main className="page">
        <h1>Paramètres</h1>
        <p className="sous-titre">Votre assistant, selon vos préférences.</p>
        <ul className="liste-reglages">
          {LIGNES.map((l) => (
            <li key={l.titre}>
              <a className="ligne-reglage" href={l.vers}>
                <span>
                  <strong>{l.titre}</strong>
                  <small>{l.detail}</small>
                </span>
                {l.apercu && <span className="bientot">Aperçu</span>}
                <IconeChevron />
              </a>
            </li>
          ))}
        </ul>
        <a className="bouton" href="#/etats">
          États du service (aperçu)
        </a>
      </main>
    </div>
  );
}

export function ParametresHM() {
  return (
    <div className="ecran">
      <Entete retour={() => aller("/parametres")} />
      <main className="page">
        <h1>Historique et mémoire</h1>
        <p className="sous-titre">Votre journal et vos repères durables sont distincts.</p>
        <section className="carte">
          <h2 className="groupe">HISTORIQUE</h2>
          <p>Le journal chronologique de vos conversations.</p>
          <button type="button" className="bouton" onClick={() => aller("/historique")}>
            Gérer l’historique
          </button>
        </section>
        <section className="carte">
          <h2 className="groupe">MÉMOIRE DE HERMANN</h2>
          <p>Les préférences et informations utiles que Hermann retient dans la durée.</p>
          <button type="button" className="bouton" onClick={() => aller("/memoire")}>
            Gérer les souvenirs
          </button>
        </section>
        <p className="note-bas">
          Supprimez une conversation ou un souvenir depuis son détail. Une confirmation est toujours
          demandée. Supprimer l’un ne supprime pas l’autre.
        </p>
      </main>
    </div>
  );
}
