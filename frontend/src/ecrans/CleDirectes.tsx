import { useState, type FormEvent } from "react";
import Entete from "../components/Entete";
import { ecrireCles, effacerCles, lireCles, modeDirect } from "../direct";
import { aller } from "../route";

export default function CleDirectes() {
  const [groq, setGroq] = useState(() => lireCles().groq);
  const [gemini, setGemini] = useState(() => lireCles().gemini);
  const [actif, setActif] = useState(modeDirect);
  const [info, setInfo] = useState("");
  const valide = groq.trim() !== "" && gemini.trim() !== "";

  const enregistrer = (e: FormEvent) => {
    e.preventDefault();
    if (!valide) return;
    ecrireCles(groq, gemini);
    setActif(true);
    setInfo("Clés enregistrées sur cet appareil. Le mode direct est actif.");
  };

  const effacer = () => {
    effacerCles();
    setGroq("");
    setGemini("");
    setActif(false);
    setInfo("Clés effacées. Hermann repasse par le serveur.");
  };

  return (
    <div className="ecran">
      <Entete retour={() => aller("/parametres")} />
      <main className="page">
        <h1>Clés IA</h1>
        <p className="sous-titre">Mode direct : Hermann fonctionne sans serveur.</p>
        <p className="etiquette-exemple">{actif ? "Mode direct actif" : "Mode direct inactif"}</p>
        <form className="formulaire" onSubmit={enregistrer}>
          <div className="champ">
            <label htmlFor="groq">CLÉ GROQ (VOIX)</label>
            <input id="groq" type="password" autoComplete="off" value={groq} onChange={(e) => setGroq(e.target.value)} />
          </div>
          <div className="champ">
            <label htmlFor="gemini">CLÉ GEMINI (RÉPONSES)</label>
            <input id="gemini" type="password" autoComplete="off" value={gemini} onChange={(e) => setGemini(e.target.value)} />
          </div>
          {info && (
            <p className="sous-titre" role="status">
              {info}
            </p>
          )}
          <button type="submit" className="bouton menthe" disabled={!valide}>
            Enregistrer les clés
          </button>
          <button type="button" className="bouton" onClick={effacer}>
            Effacer les clés
          </button>
        </form>
        <p className="note-bas">
          Les deux clés sont nécessaires. Elles restent sur cet appareil et partent uniquement vers Groq et Google. Ne les partagez jamais, y compris en capture d’écran.
        </p>
      </main>
    </div>
  );
}
