import { useState, type FormEvent } from "react";
import Entete from "../components/Entete";
import type { CategorieSouvenir } from "../donnees";
import { aller } from "../route";
import type { Champs } from "./Memoire";

const CATEGORIES: CategorieSouvenir[] = ["Préférences", "Habitudes", "Projets"];

export default function AjoutSouvenir({ ajouter }: { ajouter: (champs: Champs) => void }) {
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState<CategorieSouvenir>("Préférences");
  const [contenu, setContenu] = useState("");
  const valide = titre.trim() !== "" && contenu.trim() !== "";

  const envoyer = (e: FormEvent) => {
    e.preventDefault();
    if (valide) ajouter({ titre: titre.trim(), categorie, contenu: contenu.trim() });
  };

  return (
    <div className="ecran">
      <Entete retour={() => aller("/memoire")} />
      <main className="page">
        <h1>Ajouter un souvenir</h1>
        <p className="sous-titre">Hermann s’en servira dans ses prochaines réponses.</p>
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
            <textarea
              id="contenu"
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              maxLength={300}
              required
            />
          </div>
          <p className="note-bas">
            Ce texte est transmis à l’IA avec vos demandes : n’y mettez rien de sensible. Il reste enregistré sur cet appareil.
          </p>
          <button type="submit" className="bouton menthe" disabled={!valide}>
            Enregistrer le souvenir
          </button>
          <button type="button" className="bouton" onClick={() => aller("/memoire")}>
            Annuler
          </button>
        </form>
      </main>
    </div>
  );
}
