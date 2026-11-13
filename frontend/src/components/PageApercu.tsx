import type { ReactNode } from "react";
import { aller } from "../route";
import Entete from "./Entete";

type Props = {
  titre: string;
  sousTitre: string;
  retour: string;
  etiquette?: string;
  children: ReactNode;
};

export default function PageApercu({
  titre,
  sousTitre,
  retour,
  etiquette = "Aperçu · données d’exemple, réglage non actif pour le moment",
  children,
}: Props) {
  return (
    <div className="ecran">
      <Entete retour={() => aller(retour)} />
      <main className="page">
        <h1>{titre}</h1>
        <p className="sous-titre">{sousTitre}</p>
        <p className="etiquette-exemple">{etiquette}</p>
        {children}
      </main>
    </div>
  );
}
