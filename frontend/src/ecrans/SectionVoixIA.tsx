import { useState } from "react";
import { IconePlay, IconeStop } from "../components/Icones";
import { lireCles } from "../direct";
import { CLES, lirePref } from "../voix";
import { VOIX_IA, arreterVoixIA, ecrireVoixIA, lireVoixIA, parlerAvec } from "../voixIA";

const EXTRAIT = "Bonjour, je suis Hermann. Je suis ravi de vous accompagner.";

export default function SectionVoixIA() {
  const cle = lireCles().gemini.trim() !== "";
  const [choisie, setChoisie] = useState(lireVoixIA());
  const [enCours, setEnCours] = useState("");
  const [message, setMessage] = useState("");
  const vitesse = Number(lirePref(CLES.vitesse)) || 1;

  const ecouter = (nom: string) => {
    setMessage("");
    setEnCours(nom);
    parlerAvec(
      EXTRAIT,
      nom,
      vitesse,
      () => {
        setEnCours("");
        setMessage("La voix IA est indisponible pour le moment (connexion, quota ou clé). Amélie reste utilisée à la place.");
      },
      () => setEnCours(""),
    );
  };

  const arreter = () => {
    arreterVoixIA();
    setEnCours("");
  };

  const choisir = (nom: string) => {
    ecrireVoixIA(nom);
    setChoisie(nom);
  };

  return (
    <>
      <h2 className="groupe">VOIX IA (PLUS NATURELLE)</h2>
      {!cle ? (
        <p className="sous-titre">
          Pour utiliser la voix IA, enregistrez votre clé Gemini dans Paramètres, puis Clés IA.
        </p>
      ) : (
        <>
          <p className="sous-titre">
            Voix générée par Gemini. Le texte de la réponse est envoyé à Google pour fabriquer la voix. Si elle échoue,
            Hermann utilise la voix de l’appareil.
          </p>
          {message && <p className="sous-titre" role="status">{message}</p>}
          {VOIX_IA.map((v) => (
            <article key={v.nom} className={`carte carte-appareil${v.nom === choisie ? " choisie" : ""}`}>
              <div>
                <strong>
                  {v.nom}
                  {v.nom === choisie ? " · choisie" : ""}
                </strong>
                <p className="sous-titre">{v.style}</p>
              </div>
              <div className="boutons-bas">
                {enCours === v.nom ? (
                  <button type="button" className="bouton plein" onClick={arreter}>
                    <IconeStop /> Arrêter
                  </button>
                ) : (
                  <button type="button" className="bouton" onClick={() => ecouter(v.nom)}>
                    <IconePlay /> Écouter
                  </button>
                )}
                <button type="button" className="bouton menthe" onClick={() => choisir(v.nom)} disabled={v.nom === choisie}>
                  {v.nom === choisie ? "Voix choisie" : "Choisir cette voix"}
                </button>
              </div>
            </article>
          ))}
          {choisie && (
            <button type="button" className="bouton" onClick={() => choisir("")}>
              Revenir à la voix de l’appareil
            </button>
          )}
        </>
      )}
    </>
  );
}
