import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import "../verrou.css";
import {
  EVT_VERROUILLER,
  effacerDonneesAppareil,
  enregistrerEchec,
  lireVerrou,
  reinitialiserEssais,
  secondesRestantes,
  verifierCode,
  verrouActif,
} from "../verrou";

function arreterSon() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function EcranVerrou({ onOuvert }: { onOuvert: () => void }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [attente, setAttente] = useState(secondesRestantes);
  const [occupe, setOccupe] = useState(false);
  const [oubli, setOubli] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const enAttente = attente > 0;

  useEffect(() => {
    if (!enAttente) return;
    const t = window.setInterval(() => setAttente(secondesRestantes()), 1000);
    return () => window.clearInterval(t);
  }, [enAttente]);

  const tenter = async (valeur: string) => {
    if (occupe || secondesRestantes() > 0) return;
    setOccupe(true);
    let ok = false;
    try {
      ok = await verifierCode(valeur);
    } catch {
      setMessage("Vérification impossible sur ce navigateur.");
      setOccupe(false);
      return;
    }
    setOccupe(false);
    if (ok) {
      reinitialiserEssais();
      onOuvert();
      return;
    }
    enregistrerEchec();
    setCode("");
    setAttente(secondesRestantes());
    setMessage("Code incorrect.");
  };

  const surChangement = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(v);
    setMessage("");
    if (v.length === 6) void tenter(v);
  };

  const surSoumission = (e: FormEvent) => {
    e.preventDefault();
    if (code.length === 6) void tenter(code);
  };

  const effacer = () => {
    effacerDonneesAppareil();
    window.location.reload();
  };

  return (
    <main className="verrou">
      <span className="logo" aria-hidden="true">H</span>
      <h1>HERMANN est verrouillé</h1>
      <p className="sous-titre">Saisissez votre code à 6 chiffres.</p>
      <form className="verrou-form" onSubmit={surSoumission}>
        <label htmlFor="code-verrou" className="sr-seulement">Code à 6 chiffres</label>
        <input
          id="code-verrou"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={6}
          value={code}
          onChange={surChangement}
          disabled={occupe || enAttente}
          autoFocus
        />
        <button type="submit" className="bouton menthe" disabled={code.length !== 6 || occupe || enAttente}>
          Ouvrir
        </button>
      </form>
      {message && <p className="verrou-message" role="alert">{message}</p>}
      {enAttente && (
        <p className="verrou-message" role="status">
          Trop d’essais. Réessayez dans {attente} s.
        </p>
      )}
      {!oubli ? (
        <button type="button" className="lien-bouton" onClick={() => setOubli(true)}>
          Code oublié ?
        </button>
      ) : (
        <section className="carte">
          <p>
            Il n’existe pas de récupération du code : HERMANN n’a ni serveur ni compte. La seule issue est
            d’effacer les données de HERMANN sur cet appareil (conversations, souvenirs, clés IA). Si vous
            avez fait une sauvegarde, vous pourrez la restaurer ensuite.
          </p>
          {confirme ? (
            <div className="boutons-bas">
              <button type="button" className="bouton" onClick={() => setConfirme(false)}>
                Annuler
              </button>
              <button type="button" className="bouton plein" onClick={effacer}>
                Effacer définitivement
              </button>
            </div>
          ) : (
            <button type="button" className="bouton" onClick={() => setConfirme(true)}>
              Effacer les données de cet appareil
            </button>
          )}
        </section>
      )}
    </main>
  );
}

export default function Verrou({ children }: { children: ReactNode }) {
  const [verrouille, setVerrouille] = useState(verrouActif);

  useEffect(() => {
    let cache = 0;
    const verrouiller = () => {
      arreterSon();
      setVerrouille(true);
    };
    const surVisibilite = () => {
      if (document.hidden) {
        cache = Date.now();
        return;
      }
      const c = lireVerrou();
      if (c && cache && Date.now() - cache >= c.delaiMin * 60000) verrouiller();
      cache = 0;
    };
    const surDemande = () => {
      if (verrouActif()) verrouiller();
    };
    document.addEventListener("visibilitychange", surVisibilite);
    window.addEventListener(EVT_VERROUILLER, surDemande);
    return () => {
      document.removeEventListener("visibilitychange", surVisibilite);
      window.removeEventListener(EVT_VERROUILLER, surDemande);
    };
  }, []);

  if (verrouille) return <EcranVerrou onOuvert={() => setVerrouille(false)} />;
  return <>{children}</>;
}
