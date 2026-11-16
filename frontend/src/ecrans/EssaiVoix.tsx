import { useEffect, useState } from "react";
import Entete from "../components/Entete";
import { IconePlay, IconeStop } from "../components/Icones";
import { aller } from "../route";

const PHRASE =
  "Bonjour Hermann. Voici votre journée : commençons par vos priorités, puis regroupons vos rendez-vous cet après-midi.";

export default function EssaiVoix() {
  const pris = "speechSynthesis" in window;
  const [voix, setVoix] = useState<SpeechSynthesisVoice[]>([]);
  const [vitesse, setVitesse] = useState(1);
  const [texte, setTexte] = useState(PHRASE);
  const [actuelle, setActuelle] = useState("");

  useEffect(() => {
    if (!pris) return;
    const synth = window.speechSynthesis;
    const charger = () =>
      setVoix(synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith("fr")));
    charger();
    synth.addEventListener("voiceschanged", charger);
    return () => {
      synth.removeEventListener("voiceschanged", charger);
      synth.cancel();
    };
  }, [pris]);

  const lire = (v: SpeechSynthesisVoice) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(texte);
    u.voice = v;
    u.lang = v.lang;
    u.rate = vitesse;
    u.onend = () => setActuelle("");
    u.onerror = () => setActuelle("");
    setActuelle(v.voiceURI);
    synth.speak(u);
  };

  const arreter = () => {
    window.speechSynthesis.cancel();
    setActuelle("");
  };

  return (
    <div className="ecran">
      <Entete retour={() => aller("/parametres/voix")} />
      <main className="page">
        <h1>Essai des voix</h1>
        <p className="sous-titre">
          Voix françaises installées sur cet appareil. Elles servent à comparer : ce n’est pas la voix
          définitive de Hermann.
        </p>

        {!pris && (
          <div className="etat-page">
            <h2>Synthèse vocale non disponible</h2>
            <p>Ce navigateur ne propose pas de voix. Essayez avec un autre navigateur.</p>
          </div>
        )}

        {pris && (
          <>
            <div className="champ">
              <label htmlFor="phrase">PHRASE À LIRE</label>
              <textarea id="phrase" value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={300} />
            </div>
            <div className="champ">
              <label htmlFor="vitesse">VITESSE : {vitesse.toFixed(1)}</label>
              <input
                id="vitesse"
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={vitesse}
                onChange={(e) => setVitesse(Number(e.target.value))}
              />
            </div>

            {voix.length === 0 && (
              <div className="bandeau" role="status">
                <strong>
                  <span className="rond" aria-hidden="true" /> Recherche des voix
                </strong>
                <p>Si rien n’apparaît après quelques secondes, aucune voix française n’est installée.</p>
              </div>
            )}

            {voix.map((v) => (
              <article key={v.voiceURI} className="carte carte-appareil">
                <div>
                  <strong>{v.name}</strong>
                  <p className="sous-titre">
                    {v.lang} · {v.localService ? "sur l’appareil" : "en ligne"}
                  </p>
                </div>
                {actuelle === v.voiceURI ? (
                  <button type="button" className="bouton plein" onClick={arreter}>
                    <IconeStop /> Arrêter
                  </button>
                ) : (
                  <button type="button" className="bouton menthe" onClick={() => lire(v)}>
                    <IconePlay /> Écouter
                  </button>
                )}
              </article>
            ))}
          </>
        )}
        <p className="note-bas">Aucun son n’est enregistré ni envoyé : tout se passe sur votre appareil.</p>
      </main>
    </div>
  );
}
