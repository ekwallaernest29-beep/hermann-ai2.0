import { useState, type FormEvent } from "react";
import Apercu from "../components/Apercu";
import Entete from "../components/Entete";
import { IconeChevron, IconeCorbeille, IconeCrayon, IconeMemoire } from "../components/Icones";
import Introuvable from "../components/Introuvable";
import type { CategorieSouvenir, Souvenir } from "../donnees";
import { aller } from "../route";

export type VueMemoire = "liste" | "vide" | "chargement";
export type Champs = { titre: string; categorie: CategorieSouvenir; contenu: string };

const CATEGORIES: CategorieSouvenir[] = ["Préférences", "Habitudes", "Projets"];

const OPTIONS = [
  { id: "liste", nom: "Liste" },
  { id: "vide", nom: "Vide" },
  { id: "chargement", nom: "Chargement" },
];

const INTROUVABLE = {
  titre: "Souvenir introuvable",
  texte: "Ce souvenir n’existe plus ou a été supprimé.",
  bouton: "Retour à la mémoire",
  vers: "/memoire",
};

type PropsListe = {
  souvenirs: Souvenir[];
  vue: VueMemoire;
  changerVue: (v: VueMemoire) => void;
};

export function ListeMemoire({ souvenirs, vue, changerVue }: PropsListe) {
  const vide = vue === "vide" || (vue !== "chargement" && souvenirs.length === 0);

  return (
    <div className="ecran">
      <Entete retour={() => aller("/parametres/historique-memoire")} />
      <main className="page">
        <h1>Mémoire de Hermann</h1>
        <p className="sous-titre">Ce que Hermann retient pour mieux vous accompagner.</p>
        <p className="etiquette-exemple">Données d’exemple · aucun souvenir réel pour le moment</p>

        <div className="carte">
          <p>
            La mémoire conserve vos préférences et repères utiles dans la durée. Elle est distincte de
            l’historique, qui retrace vos échanges. Vous pouvez modifier ou supprimer chaque souvenir.
          </p>
        </div>

        {vue === "chargement" && (
          <>
            <div className="bandeau" role="status">
              <strong>
                <span className="rond" aria-hidden="true" /> Chargement de la mémoire
              </strong>
              <p>Hermann retrouve vos repères. Vos souvenirs restent privés.</p>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="squelette" aria-hidden="true" />
            ))}
          </>
        )}

        {vue !== "chargement" && vide && (
          <div className="etat-page">
            <IconeMemoire />
            <h2>Aucun souvenir pour le moment.</h2>
            <p>Les souvenirs durables apparaîtront ici. Vous pourrez les modifier ou les supprimer.</p>
          </div>
        )}

        {vue !== "chargement" &&
          !vide &&
          CATEGORIES.map((cat) => {
            const elements = souvenirs.filter((s) => s.categorie === cat);
            if (elements.length === 0) return null;
            return (
              <section key={cat} aria-label={cat}>
                <h2 className="groupe">{cat.toUpperCase()}</h2>
                {elements.map((s) => (
                  <a key={s.id} className="carte carte-souvenir" href={`#/memoire/${s.id}`}>
                    <span>
                      <h3>{s.titre}</h3>
                      <p>{s.resume}</p>
                      <p>Mis à jour le {s.maj}</p>
                    </span>
                    <IconeChevron />
                  </a>
                ))}
              </section>
            );
          })}
      </main>
      <Apercu
        note="Aperçu de l’interface · données d’exemple, non enregistrées"
        options={OPTIONS}
        valeur={vue}
        onChoisir={(id) => changerVue(id as VueMemoire)}
      />
    </div>
  );
}

export function DetailSouvenir({ souvenir }: { souvenir?: Souvenir }) {
  return (
    <div className="ecran">
      <Entete retour={() => aller("/memoire")} />
      <main className="page">
        {!souvenir ? (
          <Introuvable {...INTROUVABLE} />
        ) : (
          <>
            <h1>{souvenir.titre}</h1>
            <p className="sous-titre">Mémoire durable · {souvenir.categorie}</p>
            <p className="puce-date">Souvenir durable</p>
            <section className="carte">
              <p className="groupe">{souvenir.categorie.toUpperCase()}</p>
              <p className="titre-carte">{souvenir.resume}</p>
            </section>
            <h2 className="groupe">ORIGINE</h2>
            <p>{souvenir.origine}</p>
            <h2 className="groupe">UTILISATION</h2>
            <p>
              Hermann en tient compte pour adapter ses prochaines réponses. Ce souvenir ne remplace pas
              votre historique.
            </p>
            <p className="sous-titre">Dernière mise à jour : {souvenir.maj}</p>
            <div className="boutons-bas">
              <button type="button" className="bouton menthe" onClick={() => aller(`/memoire/${souvenir.id}/modifier`)}>
                <IconeCrayon /> Modifier le souvenir
              </button>
              <button type="button" className="bouton" onClick={() => aller(`/memoire/${souvenir.id}/supprimer`)}>
                <IconeCorbeille /> Supprimer le souvenir
              </button>
            </div>
          </>
        )}
        <p className="note-bas">Données d’exemple · non enregistrées</p>
      </main>
    </div>
  );
}

type PropsModifier = {
  souvenir?: Souvenir;
  enregistrer: (id: string, champs: Champs) => void;
};

export function ModifierSouvenir({ souvenir, enregistrer }: PropsModifier) {
  const [titre, setTitre] = useState(souvenir?.titre ?? "");
  const [categorie, setCategorie] = useState<CategorieSouvenir>(souvenir?.categorie ?? "Préférences");
  const [contenu, setContenu] = useState(souvenir?.contenu ?? "");
  const valide = titre.trim() !== "" && contenu.trim() !== "";

  const envoyer = (e: FormEvent) => {
    e.preventDefault();
    if (souvenir && valide) {
      enregistrer(souvenir.id, { titre: titre.trim(), categorie, contenu: contenu.trim() });
    }
  };

  return (
    <div className="ecran">
      <Entete retour={() => aller(souvenir ? `/memoire/${souvenir.id}` : "/memoire")} />
      <main className="page">
        {!souvenir ? (
          <Introuvable {...INTROUVABLE} />
        ) : (
          <>
            <h1>Modifier le souvenir</h1>
            <p className="sous-titre">Vos changements s’appliqueront aux prochains échanges.</p>
            <form className="formulaire" onSubmit={envoyer}>
              <div className="champ">
                <label htmlFor="titre">TITRE</label>
                <input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={80} required />
              </div>
              <div className="champ">
                <label htmlFor="categorie">CATÉGORIE</label>
                <select
                  id="categorie"
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value as CategorieSouvenir)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="champ">
                <label htmlFor="contenu">CONTENU DU SOUVENIR</label>
                <textarea id="contenu" value={contenu} onChange={(e) => setContenu(e.target.value)} maxLength={500} required />
              </div>
              <p className="note-bas">
                Enregistrer modifie uniquement ce souvenir. Le journal d’origine n’est pas modifié.
              </p>
              <button type="submit" className="bouton menthe" disabled={!valide}>
                Enregistrer les modifications
              </button>
              <button type="button" className="bouton" onClick={() => aller(`/memoire/${souvenir.id}`)}>
                Annuler
              </button>
            </form>
          </>
        )}
        <p className="note-bas">Aperçu : les modifications ne sont pas conservées après rechargement.</p>
      </main>
    </div>
  );
}

type PropsSuppression = {
  souvenir?: Souvenir;
  confirmer: (id: string) => void;
};

export function SuppressionSouvenir({ souvenir, confirmer }: PropsSuppression) {
  return (
    <div className="ecran">
      <Entete retour={() => aller(souvenir ? `/memoire/${souvenir.id}` : "/memoire")} />
      <main className="page">
        {!souvenir ? (
          <Introuvable {...INTROUVABLE} />
        ) : (
          <>
            <h1>Supprimer le souvenir ?</h1>
            <p className="sous-titre">Mémoire durable · {souvenir.categorie}</p>
            <section className="carte carte-alerte">
              <IconeCorbeille />
              <h2>Oublier ce souvenir ?</h2>
              <p>
                Le souvenir « {souvenir.titre} » sera supprimé de la mémoire durable. Votre historique
                restera disponible. Cette action est définitive.
              </p>
              <div className="boutons-bas">
                <button type="button" className="bouton" onClick={() => aller(`/memoire/${souvenir.id}`)}>
                  Annuler
                </button>
                <button type="button" className="bouton plein" onClick={() => confirmer(souvenir.id)}>
                  Supprimer le souvenir
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
