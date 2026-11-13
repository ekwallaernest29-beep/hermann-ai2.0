import { useState } from "react";
import { EXEMPLES, type Conversation } from "./donnees";
import Accueil from "./ecrans/Accueil";
import {
  DetailEchange,
  ListeHistorique,
  SuppressionEchange,
  type VueHistorique,
} from "./ecrans/Historique";
import { aller, useRoute } from "./route";

export default function App() {
  const route = useRoute();
  const [conversations, setConversations] = useState<Conversation[]>(EXEMPLES);
  const [vue, setVue] = useState<VueHistorique>("liste");

  const changerVue = (v: VueHistorique) => {
    if (v === "liste" && conversations.length === 0) setConversations(EXEMPLES);
    setVue(v);
  };

  const trouver = (id: string) => conversations.find((c) => c.id === id);

  const supprimer = (id: string) => {
    setConversations((liste) => liste.filter((c) => c.id !== id));
    setVue("liste");
    aller("/historique");
  };

  switch (route.nom) {
    case "historique":
      return <ListeHistorique conversations={conversations} vue={vue} changerVue={changerVue} />;
    case "conversation":
      return <DetailEchange echange={trouver(route.id)} />;
    case "suppression":
      return <SuppressionEchange echange={trouver(route.id)} confirmer={supprimer} />;
    default:
      return <Accueil />;
  }
}
