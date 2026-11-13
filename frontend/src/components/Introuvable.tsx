import { aller } from "../route";

type Props = { titre: string; texte: string; bouton: string; vers: string };

export default function Introuvable({ titre, texte, bouton, vers }: Props) {
  return (
    <div className="etat-page">
      <h1>{titre}</h1>
      <p>{texte}</p>
      <button type="button" className="bouton menthe" onClick={() => aller(vers)}>
        {bouton}
      </button>
    </div>
  );
}
