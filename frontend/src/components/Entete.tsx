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
        <button
          type="button"
          className="reglages"
          disabled
          title="Paramètres : bientôt disponible"
          aria-label="Paramètres (bientôt disponible)"
        >
          <IconeReglages />
        </button>
      </header>
      {retour && (
        <button type="button" className="retour" onClick={retour}>
          <IconeFleche /> Retour
        </button>
      )}
    </>
  );
}
