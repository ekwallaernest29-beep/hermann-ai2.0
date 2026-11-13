import Apercu from "../components/Apercu";
import Entete from "../components/Entete";
import {
  IconeCorbeille,
  IconeHistorique,
  IconeMicro,
  IconeOuvrir,
  IconePlay,
} from "../components/Icones";
import type { Conversation } from "../donnees";
import { aller } from "../route";

export type VueHistorique = "liste" | "vide" | "chargement" | "horsligne" | "synchro";

const OPTIONS = [
  { id: "liste", nom: "Liste" },
  { id: "vide", nom: "Vide" },
  { id: "chargement", nom: "Chargement" },
  { id: "horsligne", nom: "Hors ligne" },
  { id: "synchro", nom: "Synchronisation" },
];

function grouper(conversations: Conversation[]) {
  const groupes: { date: string; elements: Conversation[] }[] = [];
  for (const c of conversations) {
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.date === c.date) dernier.elements.push(c);
    else groupes.push({ date: c.date, elements: [c] });
  }
  return groupes;
}

type PropsListe = {
  conversations: Conversation[];
  vue: VueHistorique;
  changerVue: (v: VueHistorique) => void;
};

export function ListeHistorique({ conversations, vue, changerVue }: PropsListe) {
  const vide = vue === "vide" || (vue !== "chargement" && conversations.length === 0);

  return (
    <div className="ecran">
      <Entete retour={() => aller("/")} />
      <main className="page">
        <h1>Historique</h1>
        <p className="sous-titre">Retrouvez le fil de vos échanges avec Hermann.</p>
        <p className="etiquette-exemple">Données d’exemple · aucun historique réel pour le moment</p>

        {vue === "chargement" && (
          <>
            <div className="bandeau" role="status">
              <strong>
                <span className="rond" aria-hidden="true" /> Chargement de l’historique
              </strong>
              <p>Vos échanges arrivent. Cela peut prendre un instant.</p>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="squelette" aria-hidden="true" />
            ))}
          </>
        )}

        {vue !== "chargement" && vide && (
          <div className="etat-page">
            <IconeHistorique />
            <h2>Aucun échange pour le moment.</h2>
            <p>Votre premier échange apparaîtra ici. La mémoire de Hermann se gère séparément.</p>
            <button type="button" className="bouton menthe" onClick={() => aller("/")}>
              <IconeMicro /> Parler à Hermann
            </button>
          </div>
        )}

        {vue !== "chargement" && !vide && (
          <>
            {vue === "horsligne" && (
              <div className="bandeau alerte" role="status">
                <strong>Internet interrompu</strong>
                <p>
                  Vos échanges déjà chargés restent consultables. Reprenez une conversation une fois la
                  connexion rétablie.
                </p>
                <button type="button" className="bouton" disabled title="Disponible avec le serveur">
                  Réessayer
                </button>
              </div>
            )}
            {vue === "synchro" && (
              <div className="bandeau" role="status">
                <strong>
                  <span className="rond" aria-hidden="true" /> Synchronisation en cours
                </strong>
                <p>Vos derniers échanges se mettent à jour. Vous pouvez consulter le journal disponible.</p>
              </div>
            )}

            {grouper(conversations).map((g) => (
              <section key={g.date} aria-label={g.date}>
                <h2 className="groupe">{g.date.toUpperCase()}</h2>
                {g.elements.map((c) => (
                  <article key={c.id} className="carte carte-echange">
                    <header>
                      <h3>{c.titre}</h3>
                      <time>{c.heure}</time>
                    </header>
                    <p>{c.resume}</p>
                    <footer>
                      <button type="button" className="lien-bouton" disabled title="Disponible avec la voix">
                        <IconePlay /> Reprendre
                      </button>
                      <a className="lien" href={`#/historique/${c.id}`}>
                        Ouvrir <IconeOuvrir />
                      </a>
                    </footer>
                  </article>
                ))}
              </section>
            ))}
          </>
        )}

        <p className="note-bas">L’historique n’est pas la mémoire durable de Hermann.</p>
      </main>
      <Apercu
        note="Aperçu de l’interface · données d’exemple, non enregistrées"
        options={OPTIONS}
        valeur={vue}
        onChoisir={(id) => changerVue(id as VueHistorique)}
      />
    </div>
  );
}

function Introuvable() {
  return (
    <div className="etat-page">
      <h1>Échange introuvable</h1>
      <p>Cette conversation n’existe plus ou a été supprimée.</p>
      <button type="button" className="bouton menthe" onClick={() => aller("/historique")}>
        Retour à l’historique
      </button>
    </div>
  );
}

export function DetailEchange({ echange }: { echange?: Conversation }) {
  return (
    <div className="ecran">
      <Entete retour={() => aller("/historique")} />
      <main className="page">
        {!echange ? (
          <Introuvable />
        ) : (
          <>
            <h1>{echange.titre}</h1>
            <p className="sous-titre">Le journal de vos échanges, sans enregistrement audio.</p>
            <p className="puce-date">
              {echange.date} · {echange.heure}
            </p>
            <div className="fil">
              {echange.messages.map((m, i) => (
                <div key={i} className={`tour ${m.auteur}`}>
                  <p className="qui">
                    {m.auteur === "vous" ? "VOUS" : "HERMANN"} · {m.heure}
                  </p>
                  <p className="texte-tour">{m.texte}</p>
                </div>
              ))}
            </div>
            <div className="boutons-bas">
              <button type="button" className="bouton menthe" disabled title="Disponible avec la voix">
                <IconePlay /> Reprendre à la voix
              </button>
              <button
                type="button"
                className="bouton"
                onClick={() => aller(`/historique/${echange.id}/supprimer`)}
              >
                <IconeCorbeille /> Supprimer
              </button>
            </div>
          </>
        )}
        <p className="note-bas">Données d’exemple · non enregistrées</p>
      </main>
    </div>
  );
}

type PropsSuppression = {
  echange?: Conversation;
  confirmer: (id: string) => void;
};

export function SuppressionEchange({ echange, confirmer }: PropsSuppression) {
  return (
    <div className="ecran">
      <Entete retour={() => aller(echange ? `/historique/${echange.id}` : "/historique")} />
      <main className="page">
        {!echange ? (
          <Introuvable />
        ) : (
          <>
            <h1>Supprimer cet échange ?</h1>
            <p className="sous-titre">Vous gardez le contrôle de vos données.</p>
            <div className="carte">
              <p className="groupe">
                {echange.date.toUpperCase()} · {echange.heure}
              </p>
              <p className="titre-carte">{echange.titre}</p>
            </div>
            <section className="carte carte-alerte">
              <IconeCorbeille />
              <h2>Supprimer la conversation ?</h2>
              <p>
                Le journal « {echange.titre} » sera supprimé de votre historique. Les souvenirs durables
                restent conservés. Cette action est définitive.
              </p>
              <div className="boutons-bas">
                <button type="button" className="bouton" onClick={() => aller(`/historique/${echange.id}`)}>
                  Annuler
                </button>
                <button type="button" className="bouton plein" onClick={() => confirmer(echange.id)}>
                  Supprimer
                </button>
              </div>
              <p className="note-bas">Aucune action n’est effectuée avant confirmation.</p>
            </section>
          </>
        )}
        <p className="note-bas">Aperçu : la suppression n’agit que sur les exemples.</p>
      </main>
    </div>
  );
}
