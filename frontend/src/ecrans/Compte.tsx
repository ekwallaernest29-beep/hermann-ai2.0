import { useState, type FormEvent } from "react";
import Entete from "../components/Entete";
import { enregistrerPrenom, lireProfil } from "../profil";
import { aller } from "../route";
import { effacerDonneesAppareil, verifierCode, verrouActif } from "../verrou";

export default function CompteReel() {
  const [prenom, setPrenom] = useState(() => lireProfil().prenom);
  const [message, setMessage] = useState("");
  const [effacement, setEffacement] = useState(false);
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const avecCode = verrouActif();

  const enregistrer = (e: FormEvent) => {
    e.preventDefault();
    const p = prenom.trim();
    if (!p) {
      setMessage("Le prénom ne peut pas être vide.");
      return;
    }
    try {
      enregistrerPrenom(p);
      setPrenom(p);
      setMessage("Prénom enregistré.");
    } catch {
      setMessage("Enregistrement impossible : le stockage du navigateur est indisponible.");
    }
  };

  const annuler = () => {
    setEffacement(false);
    setCode("");
    setErreur("");
  };

  const effacer = async () => {
    if (avecCode) {
      let ok = false;
      try {
        ok = await verifierCode(code);
      } catch {
        ok = false;
      }
      if (!ok) {
        setErreur("Code incorrect.");
        return;
      }
    }
    effacerDonneesAppareil();
    window.location.hash = "#/";
    window.location.reload();
  };

  return (
    <div className="ecran">
      <Entete retour={() => aller("/parametres")} />
      <main className="page">
        <h1>Compte</h1>
        <p className="sous-titre">Votre profil sur cet appareil.</p>

        <section className="carte">
          <p>
            HERMANN n’a pas de compte en ligne : votre profil et vos données restent sur cet appareil,
            jamais sur un serveur.
          </p>
        </section>

        <form className="formulaire" onSubmit={enregistrer}>
          <div className="champ">
            <label htmlFor="prenom">COMMENT HERMANN DOIT VOUS APPELER</label>
            <input
              id="prenom"
              value={prenom}
              maxLength={30}
              autoComplete="given-name"
              onChange={(e) => {
                setPrenom(e.target.value);
                setMessage("");
              }}
            />
          </div>
          <button type="submit" className="bouton menthe">
            Enregistrer
          </button>
        </form>

        {message && (
          <div className="bandeau alerte" role="status">
            <strong>{message}</strong>
          </div>
        )}

        <h2 className="groupe">VOS DONNÉES</h2>
        <p>Conversations, souvenirs et réglages sont stockés sur cet appareil.</p>
        <a className="bouton" href="#/parametres/sauvegarde">
          Faire une sauvegarde
        </a>

        <h2 className="groupe">EFFACER MES DONNÉES</h2>
        <p>
          Supprime sur cet appareil les conversations, les souvenirs, les clés IA, les réglages et le code de
          verrouillage. C’est définitif : faites d’abord une sauvegarde. Les clés IA ne sont jamais incluses
          dans la sauvegarde et devront être ressaisies.
        </p>
        {!effacement ? (
          <button type="button" className="bouton" onClick={() => setEffacement(true)}>
            Effacer les données de cet appareil
          </button>
        ) : (
          <section className="carte carte-alerte">
            <h2>Tout effacer ?</h2>
            {avecCode && (
              <div className="champ">
                <label htmlFor="code-effacer">CODE DE VERROUILLAGE</label>
                <input
                  id="code-effacer"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="off"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setErreur("");
                  }}
                />
              </div>
            )}
            {erreur && (
              <p role="alert">
                <strong>{erreur}</strong>
              </p>
            )}
            <div className="boutons-bas">
              <button type="button" className="bouton" onClick={annuler}>
                Annuler
              </button>
              <button type="button" className="bouton plein" onClick={() => void effacer()}>
                Effacer définitivement
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
