import Entete from "../components/Entete";
import { IconeChevron } from "../components/Icones";
import { aller } from "../route";

type Ligne = { titre: string; detail: string; vers: string; apercu?: boolean };

const LIGNES: Ligne[] = [
  { titre: "Compte", detail: "Votre prénom et vos données sur cet appareil", vers: "#/parametres/compte" },
  { titre: "Sécurité", detail: "Code de verrouillage de l’appli", vers: "#/parametres/securite" },
  { titre: "Appareils", detail: "Gérer les appareils autorisés", vers: "#/parametres/appareils", apercu: true },
  { titre: "Synchronisation", detail: "Cloud et mises à jour", vers: "#/parametres/synchronisation", apercu: true },
  { titre: "Voix et langue", detail: "Voix de Hermann et préférences", vers: "#/parametres/voix" },
  { titre: "Microphone", detail: "Autorisation et confidentialité", vers: "#/parametres/microphone" },
  { titre: "Historique et mémoire", detail: "Deux espaces à gérer séparément", vers: "#/parametres/historique-memoire" },
  { titre: "Clés IA", detail: "Mode direct, sans serveur", vers: "#/parametres/cles" },
  { titre: "Sauvegarde", detail: "Exporter ou importer vos données", vers: "#/parametres/sauvegarde" },
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
