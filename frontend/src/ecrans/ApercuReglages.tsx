import type { ReactNode } from "react";
import Interrupteur from "../components/Interrupteur";
import {
  IconeAvertissement,
  IconeBouclier,
  IconeChevron,
  IconeCorbeille,
  IconeHistorique,
  IconeMemoire,
  IconeMicro,
  IconeMicroCoupe,
  IconeNuage,
  IconeOrdinateur,
  IconePlay,
  IconeReglages,
  IconeSynchro,
  IconeTelephone,
  IconeUtilisateur,
} from "../components/Icones";
import { Ligne, Liste } from "../components/Lignes";
import PageApercu from "../components/PageApercu";
import { aller, type PageReglage } from "../route";

const BIENTOT = "Disponible avec le serveur";

function Compte() {
  return (
    <PageApercu titre="Compte" sousTitre="Votre espace personnel Hermann." retour="/parametres">
      <section className="carte carte-profil">
        <span className="avatar" aria-hidden="true">
          <IconeUtilisateur />
        </span>
        <span>
          <strong>Votre profil</strong>
          <small>Compte personnel</small>
        </span>
      </section>
      <div className="champ">
        <label htmlFor="nom">NOM COMPLET</label>
        <input id="nom" disabled placeholder="Votre nom" />
      </div>
      <div className="champ">
        <label htmlFor="mail">ADRESSE E-MAIL</label>
        <input id="mail" type="email" disabled placeholder="vous@exemple.fr" />
      </div>
      <div className="boutons-bas">
        <button type="button" className="bouton menthe" disabled title={BIENTOT}>
          Enregistrer
        </button>
        <button type="button" className="bouton" disabled title={BIENTOT}>
          Se déconnecter
        </button>
      </div>
      <p className="note-bas">La déconnexion désactive le micro et ferme la session sur cet appareil.</p>
    </PageApercu>
  );
}

function Securite() {
  return (
    <PageApercu titre="Sécurité" sousTitre="Protégez l’accès à votre espace personnel." retour="/parametres">
      <Liste>
        <Ligne titre="Mot de passe" detail="Modifiable depuis votre compte" />
        <Ligne titre="Authentification à deux facteurs" detail="Par application d’authentification (prévue)" />
        <Ligne
          titre="Alertes de connexion"
          detail="Être informé d’une nouvelle connexion"
          droite={<Interrupteur actif />}
        />
        <Ligne
          titre="Sessions actives"
          detail="Appareils autorisés"
          droite={
            <a className="lien" href="#/parametres/appareils">
              Voir <IconeChevron />
            </a>
          }
        />
      </Liste>
      <section className="carte">
        <p className="groupe">CETTE SESSION</p>
        <p className="titre-carte">Cet appareil</p>
        <p className="sous-titre">Aucune session ouverte : les comptes arrivent avec le serveur.</p>
      </section>
      <a className="bouton" href="#/parametres/appareils">
        Gérer les appareils
      </a>
      <p className="note-bas">
        Si vous ne reconnaissez pas une session, révoquez l’appareil concerné puis changez votre mot de passe.
      </p>
    </PageApercu>
  );
}

type Appareil = { nom: string; etat: string; icone: ReactNode; revocable: boolean };

const APPAREILS: Appareil[] = [
  { nom: "Téléphone (exemple)", etat: "Cet appareil · Connecté", icone: <IconeTelephone />, revocable: false },
  { nom: "Tablette (exemple)", etat: "Autorisée · Hors connexion", icone: <IconeTelephone />, revocable: true },
  { nom: "Ordinateur (exemple)", etat: "Autorisé · Connecté", icone: <IconeOrdinateur />, revocable: true },
];

function Appareils() {
  return (
    <PageApercu
      titre="Appareils autorisés"
      sousTitre="Seuls ces appareils peuvent accéder à votre compte."
      retour="/parametres/securite"
    >
      <p className="puce-date">3 appareils autorisés (exemple)</p>
      {APPAREILS.map((a) => (
        <article key={a.nom} className="carte carte-appareil">
          <div className="appareil-nom">
            <span className="icone-appareil" aria-hidden="true">
              {a.icone}
            </span>
            <span>
              <strong>{a.nom}</strong>
              <small>{a.etat}</small>
            </span>
          </div>
          {a.revocable && (
            <a className="bouton" href="#/parametres/appareils/revoquer">
              <IconeBouclier /> Révoquer l’accès
            </a>
          )}
        </article>
      ))}
      <p className="note-bas">
        Une révocation ferme la session de cet appareil. Elle ne supprime pas votre historique ni votre mémoire.
      </p>
    </PageApercu>
  );
}

function Revoquer() {
  return (
    <PageApercu
      titre="Révoquer un appareil"
      sousTitre="Vérifiez l’appareil avant de retirer son accès."
      retour="/parametres/appareils"
    >
      <section className="carte carte-alerte">
        <IconeBouclier />
        <h2>Retirer l’accès à cet appareil ?</h2>
        <p>
          L’appareil sera déconnecté et ne pourra plus synchroniser vos données. Vous devrez l’autoriser à
          nouveau pour le reconnecter. Les données de votre compte restent conservées.
        </p>
        <div className="boutons-bas">
          <button type="button" className="bouton" onClick={() => aller("/parametres/appareils")}>
            Annuler
          </button>
          <button type="button" className="bouton plein" disabled title={BIENTOT}>
            Révoquer
          </button>
        </div>
        <p className="note-bas">Aucune action n’est effectuée avant confirmation.</p>
      </section>
    </PageApercu>
  );
}

function Synchronisation() {
  return (
    <PageApercu
      titre="Synchronisation"
      sousTitre="Retrouvez vos échanges sur vos appareils autorisés."
      retour="/parametres"
    >
      <section className="carte">
        <p className="groupe">ÉTAT</p>
        <p className="titre-carte">Synchronisation non active</p>
        <p className="sous-titre">Elle démarrera avec le serveur et les comptes.</p>
      </section>
      <Liste>
        <Ligne titre="Synchronisation automatique" detail="Sur vos appareils autorisés" droite={<Interrupteur actif />} />
      </Liste>
      <h2 className="groupe">DONNÉES SYNCHRONISÉES</h2>
      <Liste>
        <Ligne titre="Historique des conversations" detail="Vos échanges écrits" droite={<span className="valeur">Oui</span>} />
        <Ligne titre="Mémoire durable" detail="Vos préférences et repères" droite={<span className="valeur">Oui</span>} />
      </Liste>
      <button type="button" className="bouton" disabled title={BIENTOT}>
        <IconeSynchro /> Synchroniser maintenant
      </button>
      <p className="note-bas">
        Une connexion Internet est nécessaire. Si elle est interrompue, les données déjà chargées restent
        consultables.
      </p>
    </PageApercu>
  );
}

function Voix() {
  return (
    <PageApercu
      titre="Voix et langue"
      sousTitre="Une présence naturelle, claire et posée."
      retour="/parametres"
    >
      <section className="carte carte-alerte">
        <p className="groupe">HERMANN · FRANÇAIS</p>
        <h2>Chaleureuse. Équilibrée. Professionnelle.</h2>
        <p>Une voix masculine naturelle, avec une diction claire et un rythme posé.</p>
        <button type="button" className="bouton" disabled title="La voix sera choisie en Phase 4">
          <IconePlay /> Écouter un extrait
        </button>
        <p className="note-bas">La voix définitive sera choisie après comparaison de plusieurs voix libres.</p>
      </section>
      <Liste>
        <Ligne titre="Langue de réponse" droite={<span className="valeur">Français</span>} />
        <Ligne
          titre="Détection automatique de la langue"
          detail="S’adapter à la langue de votre demande"
          droite={<Interrupteur actif />}
        />
        <Ligne titre="Rythme de la voix" droite={<span className="valeur">Équilibré</span>} />
        <Ligne titre="Préférence de réponse" droite={<span className="valeur">Concise</span>} />
      </Liste>
      <p className="note-bas">Vous pourrez interrompre Hermann à tout moment avec la commande Interrompre.</p>
    </PageApercu>
  );
}

function Microphone() {
  return (
    <PageApercu
      titre="Microphone et confidentialité"
      sousTitre="Vous décidez quand Hermann peut vous écouter."
      retour="/parametres"
    >
      <section className="carte">
        <p className="groupe">ÉTAT</p>
        <p className="titre-carte">Permission non demandée · Micro désactivé</p>
        <p className="sous-titre">Hermann n’écoute pas en ce moment.</p>
      </section>
      <Liste>
        <Ligne
          titre="Détection de « Hermann »"
          detail="Fonctionnera uniquement lorsque l’application est ouverte"
          droite={<Interrupteur actif={false} />}
        />
        <Ligne
          titre="Autorisation du microphone"
          detail="Se règle dans le navigateur ou dans les réglages du téléphone"
        />
      </Liste>
      <h2 className="groupe">VOTRE VOIX RESTE SOUS VOTRE CONTRÔLE</h2>
      <p>
        Lorsque le micro est actif, votre demande est transmise en ligne pour être traitée, notamment par des
        services externes de reconnaissance vocale et d’intelligence artificielle. Un témoin visible indique
        toujours l’écoute.
      </p>
      <p>Aucun enregistrement audio brut n’est conservé par défaut.</p>
      <p className="note-bas">Passer en veille ou couper le micro arrête l’écoute de la demande.</p>
    </PageApercu>
  );
}

function Notifications() {
  return (
    <PageApercu
      titre="Notifications"
      sousTitre="Choisissez les informations qui vous sont utiles."
      retour="/parametres"
    >
      <h2 className="groupe">ALERTES DE CONNEXION</h2>
      <Liste>
        <Ligne
          titre="Connexion et reconnexion"
          detail="Quand votre accès au cloud change"
          droite={<Interrupteur actif />}
        />
      </Liste>
      <h2 className="groupe">SÉCURITÉ</h2>
      <Liste>
        <Ligne
          titre="Nouvelle connexion"
          detail="Un appareil accède à votre compte"
          droite={<Interrupteur actif />}
        />
        <Ligne
          titre="Modifications de sécurité"
          detail="Mot de passe et autorisations"
          droite={<Interrupteur actif />}
        />
      </Liste>
      <h2 className="groupe">INFORMATIONS IMPORTANTES</h2>
      <Liste>
        <Ligne
          titre="Informations de service"
          detail="Disponibilité et informations essentielles"
          droite={<Interrupteur actif />}
        />
        <Ligne titre="Autorisations système" detail="Gérées dans les réglages de l’appareil" />
      </Liste>
      <p className="note-bas">Les notifications ne contiennent pas le contenu de vos conversations.</p>
    </PageApercu>
  );
}

type EtatService = {
  titre: string;
  texte: string;
  icone: ReactNode;
  bouton?: string;
  principal?: boolean;
  note: string;
};

const ETATS_SERVICE: EtatService[] = [
  { titre: "Cloud connecté", texte: "Hermann est disponible. Vous pouvez lui parler.", icone: <IconeNuage />, note: "Connexion active." },
  { titre: "Synchronisation en cours", texte: "Vos échanges se mettent à jour. Le journal disponible reste consultable.", icone: <IconeSynchro />, note: "Aucune action requise." },
  { titre: "Internet interrompu", texte: "La connexion est interrompue. Vos échanges déjà chargés restent disponibles.", icone: <IconeAvertissement />, bouton: "Réessayer", principal: true, note: "Aucune nouvelle demande n’est envoyée." },
  { titre: "Reconnexion en cours", texte: "Nous essayons de retrouver la connexion. Vous n’avez rien à faire.", icone: <IconeSynchro />, note: "Pas de nouvelle demande sans connexion." },
  { titre: "Micro désactivé", texte: "Hermann ne vous écoute pas. Activez le micro pour parler.", icone: <IconeMicroCoupe />, bouton: "Activer le micro", principal: true, note: "Aucune demande vocale en cours." },
  { titre: "Micro actif", texte: "Je vous écoute. Vous pouvez couper le micro à tout moment.", icone: <IconeMicro />, bouton: "Couper le micro", note: "Votre demande est traitée en ligne." },
  { titre: "Micro indisponible", texte: "Le microphone est utilisé ailleurs. Libérez-le, puis réessayez.", icone: <IconeMicroCoupe />, bouton: "Réessayer", principal: true, note: "Aucune écoute en cours." },
  { titre: "Permission micro refusée", texte: "Autorisez le microphone dans les réglages pour parler à Hermann.", icone: <IconeBouclier />, bouton: "Réglages", principal: true, note: "Aucun accès au microphone." },
  { titre: "Session expirée", texte: "Reconnectez-vous pour retrouver votre espace personnel.", icone: <IconeUtilisateur />, bouton: "Se reconnecter", principal: true, note: "Le micro est désactivé." },
  { titre: "Appareil non autorisé", texte: "Cet appareil n’a pas accès à votre compte. Vérifiez vos appareils autorisés.", icone: <IconeBouclier />, bouton: "Vérifier l’accès", principal: true, note: "Aucune donnée n’est synchronisée." },
  { titre: "Erreur de traitement", texte: "Je n’ai pas pu traiter votre demande. Vous pouvez réessayer.", icone: <IconeAvertissement />, bouton: "Réessayer", principal: true, note: "Aucune action n’a été confirmée." },
  { titre: "Chargement de l’historique", texte: "Vos échanges arrivent. Cela peut prendre un instant.", icone: <IconeHistorique />, note: "Votre journal reste privé." },
  { titre: "Chargement de la mémoire", texte: "Hermann retrouve vos préférences et vos repères.", icone: <IconeMemoire />, note: "Mémoire privée, distincte du journal." },
  { titre: "Confirmation de suppression", texte: "Supprimer cette conversation ? Cette action est définitive. Les souvenirs restent conservés.", icone: <IconeCorbeille />, bouton: "Supprimer", note: "Annuler reste possible avant confirmation." },
];

function EtatsService() {
  return (
    <PageApercu
      titre="Une présence claire. Même dans l’attente."
      sousTitre="Messages de service à intégrer en contexte. L’état est annoncé par une icône et un libellé, jamais uniquement par la couleur."
      retour="/parametres"
      etiquette="Aperçu · planche de référence, boutons non actifs"
    >
      <div className="grille-etats">
        {ETATS_SERVICE.map((e) => (
          <article key={e.titre} className="carte carte-etat">
            <h2>
              <span className="icone-etat" aria-hidden="true">
                {e.icone}
              </span>
              {e.titre}
            </h2>
            <p>{e.texte}</p>
            {e.bouton && (
              <button type="button" className={`bouton${e.principal ? " menthe" : ""}`} disabled>
                {e.bouton}
              </button>
            )}
            <small>{e.note}</small>
          </article>
        ))}
      </div>
    </PageApercu>
  );
}

export function Reglage({ page }: { page: PageReglage }) {
  switch (page) {
    case "compte":
      return <Compte />;
    case "securite":
      return <Securite />;
    case "appareils":
      return <Appareils />;
    case "revoquer":
      return <Revoquer />;
    case "synchronisation":
      return <Synchronisation />;
    case "voix":
      return <Voix />;
    case "microphone":
      return <Microphone />;
    case "notifications":
      return <Notifications />;
    case "etats":
      return <EtatsService />;
  }
}

export const ICONE_PARAMETRES = IconeReglages;
