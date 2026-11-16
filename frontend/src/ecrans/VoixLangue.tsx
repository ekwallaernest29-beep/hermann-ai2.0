import { useEffect, useState } from "react";
import Entete from "../components/Entete";
import { IconePlay, IconeStop } from "../components/Icones";
import { Ligne, Liste } from "../components/Lignes";
import { aller } from "../route";
import { CLES, ecrirePref, lirePref, parler, voixFrancaises } from "../voix";

const EXTRAIT = "Bonjour, je suis Hermann. Je suis ravi de vous accompagner.";

export default function VoixLangue() {
  const pris = "speechSynthesis" in window;
  const [voix, setVoix] = useState<SpeechSynthesisVoice[]>([]);
  const [choix, setChoix] = useState<string | null>(() => lirePref(CLES.voix));
  const [vitesse, setVitesse] = useState<number>(() => Number(lirePref(CLES.vitesse)) || 1);
  const [enCours, setEnCours] = useState("");

  useEffect(() => {
    if (!pris) return;
    const synth = window.speechSynthesis;
    const charger = () => setVoix(voixFrancaises());
    charger();
    synth.addEventListener("voiceschanged", charger);
    return () => {
      synth.removeEventListener("voiceschanged", charger);
      synth.cancel();
    };
  }, [pris]);

  const actuelle = voix.find((v) => v.voiceURI === choix);

  const ecouter = (v: SpeechSynthesisVoice | undefined, cle: string) => {
    setEnCours(cle);
    parler(EXTRAIT, v, vitesse, () => setEnCours(""));
  };

  const arreter = () => {
    window.speechSynthesis.cancel();
    setEnCours("");
  };

  const choisir = (v: SpeechSynthesisVoice) => {
    setChoix(v.voiceURI);
    ecrirePref(CLES.voix, v.voiceURI);
  };

  const changerVitesse = (n: number) => {
    setVitesse(n);
    ecrirePref(CLES.vitesse, String(n));
  };

  return (
    <div className="ecran">
      <Entete retour={() => aller("/parametres")} />
      <main className="page">
        <h1>Voix et langue</h1>
        <p className="sous-titre">Choisissez la voix avec laquelle Hermann vous parlera.</p>

        {!pris && (
          <div className="etat-page">
            <h2>Synthèse vocale non disponible</h2>
            <p>Ce navigateur ne propose pas de voix. Essayez avec un autre navigateur.</p>
          </div>
        )}

        {pris && (
          <>
            <section className="carte carte-alerte">
              <p className="groupe">VOIX DE HERMANN SUR CET APPAREIL</p>
              <h2>{actuelle ? actuelle.name : "Voix par défaut de l’appareil"}</h2>
              <p>{actuelle ? `${actuelle.lang} · ${actuelle.localService ? "sur l’appareil" : "en ligne"}` : "Aucune voix choisie pour le moment."}</p>
              {enCours === "extrait" ? (
                <button type="button" className="bouton plein" onClick={arreter}>
                  <IconeStop /> Arrêter
                </button>
              ) : (
                <button type="button" className="bouton menthe" onClick={() => ecouter(actuelle, "extrait")}>
                  <IconePlay /> Écouter un extrait
                </button>
              )}
            </section>

            <div className="champ">
              <label htmlFor="vitesse">VITESSE : {vitesse.toFixed(1)}</label>
              <input
                id="vitesse"
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={vitesse}
                onChange={(e) => changerVitesse(Number(e.target.value))}
              />
            </div>

            <h2 className="groupe">CHOISIR UNE VOIX</h2>
            {voix.length === 0 && (
              <div className="bandeau" role="status">
                <strong>
                  <span className="rond" aria-hidden="true" /> Recherche des voix
                </strong>
                <p>Si rien n’apparaît après quelques secondes, aucune voix française n’est installée.</p>
              </div>
            )}
            {voix.map((v) => (
              <article key={v.voiceURI} className={`carte carte-appareil${v.voiceURI === choix ? " choisie" : ""}`}>
                <div>
                  <strong>
                    {v.name}
                    {v.voiceURI === choix ? " · choisie" : ""}
                  </strong>
                  <p className="sous-titre">
                    {v.lang} · {v.localService ? "sur l’appareil" : "en ligne"}
                  </p>
                </div>
                <div className="boutons-bas">
                  {enCours === v.voiceURI ? (
                    <button type="button" className="bouton plein" onClick={arreter}>
                      <IconeStop /> Arrêter
                    </button>
                  ) : (
                    <button type="button" className="bouton" onClick={() => ecouter(v, v.voiceURI)}>
                      <IconePlay /> Écouter
                    </button>
                  )}
                  <button type="button" className="bouton menthe" onClick={() => choisir(v)} disabled={v.voiceURI === choix}>
                    {v.voiceURI === choix ? "Voix choisie" : "Choisir cette voix"}
                  </button>
                </div>
              </article>
            ))}
          </>
        )}

        <Liste>
          <Ligne titre="Langue de réponse" droite={<span className="valeur">Français</span>} />
          <Ligne titre="Détection automatique de la langue" droite={<span className="bientot">Bientôt</span>} />
        </Liste>
        <p className="note-bas">
          Ce choix est enregistré sur cet appareil seulement. La voix définitive de Hermann, identique partout, viendra avec le serveur.
        </p>
      </main>
    </div>
  );
}
