import { IconeFleche, IconeReglages } from "./Icones";

export default function Entete({ retour }: { retour?: () => void }) {
  const Balise = retour ? "p" : "h1";
  return (
    <>
      <header className="entete">
        <div className="marque">
          <span className="logo" aria-hidden="true">H</span>
          <Balise className="nom">
            HERMANN <b>AI</b>
          </Balise>
        </div>
        <a className="reglages" href="#/parametres" aria-label="Paramètres">
          <IconeReglages />
        </a>
      </header>
      {retour && (
        <button type="button" className="retour" onClick={retour}>
          <IconeFleche /> Retour
        </button>
      )}
    </>
  );
}
