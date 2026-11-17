import BandeauReseau from "./components/BandeauReseau";
import EssaiVoix from "./ecrans/EssaiVoix";
import { useEffect, useState } from "react";
import { EXEMPLES, SOUVENIRS_EXEMPLES, type Conversation, type Souvenir } from "./donnees";
import Accueil from "./ecrans/Accueil";
import { Reglage } from "./ecrans/ApercuReglages";
import {
  DetailEchange,
  ListeHistorique,
  SuppressionEchange,
  type VueHistorique,
} from "./ecrans/Historique";
import {
  DetailSouvenir,
  ListeMemoire,
  ModifierSouvenir,
  SuppressionSouvenir,
  type Champs,
  type VueMemoire,
} from "./ecrans/Memoire";
import { Parametres, ParametresHM } from "./ecrans/Parametres";
import { aller, useRoute } from "./route";
import { EVENEMENT, chargerConversations, enregistrerConversations } from "./stockage";

function Ecrans() {
  const route = useRoute();
  const [conversations, setConversations] = useState<Conversation[]>(chargerConversations);
  const [vue, setVue] = useState<VueHistorique>("liste");
  useEffect(() => {
    const maj = () => setConversations(chargerConversations());
    window.addEventListener(EVENEMENT, maj);
    return () => window.removeEventListener(EVENEMENT, maj);
  }, []);
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>(SOUVENIRS_EXEMPLES);
  const [vueMemoire, setVueMemoire] = useState<VueMemoire>("liste");

  const changerVue = (v: VueHistorique) => {
    setVue(v);
  };

  const changerVueMemoire = (v: VueMemoire) => {
    if (v === "liste" && souvenirs.length === 0) setSouvenirs(SOUVENIRS_EXEMPLES);
    setVueMemoire(v);
  };

  const trouver = (id: string) => conversations.find((c) => c.id === id);
  const trouverSouvenir = (id: string) => souvenirs.find((s) => s.id === id);

  const supprimer = (id: string) => {
    setConversations((liste) => {
      const reste = liste.filter((c) => c.id !== id);
      enregistrerConversations(reste);
      return reste;
    });
    setVue("liste");
    aller("/historique");
  };

  const modifierSouvenir = (id: string, champs: Champs) => {
    setSouvenirs((liste) =>
      liste.map((s) =>
        s.id === id
          ? { ...s, ...champs, resume: champs.contenu, maj: "Modifié à l’instant" }
          : s,
      ),
    );
    aller(`/memoire/${id}`);
  };

  const supprimerSouvenir = (id: string) => {
    setSouvenirs((liste) => liste.filter((s) => s.id !== id));
    setVueMemoire("liste");
    aller("/memoire");
  };

  switch (route.nom) {
    case "historique":
      return <ListeHistorique conversations={conversations} vue={vue} changerVue={changerVue} />;
    case "conversation":
      return <DetailEchange echange={trouver(route.id)} />;
    case "suppression":
      return <SuppressionEchange echange={trouver(route.id)} confirmer={supprimer} />;
    case "parametres":
      return <Parametres />;
    case "parametres-hm":
      return <ParametresHM />;
    case "memoire":
      return <ListeMemoire souvenirs={souvenirs} vue={vueMemoire} changerVue={changerVueMemoire} />;
    case "souvenir":
      return <DetailSouvenir souvenir={trouverSouvenir(route.id)} />;
    case "souvenir-modifier":
      return (
        <ModifierSouvenir
          key={route.id}
          souvenir={trouverSouvenir(route.id)}
          enregistrer={modifierSouvenir}
        />
      );
    case "souvenir-suppression":
      return <SuppressionSouvenir souvenir={trouverSouvenir(route.id)} confirmer={supprimerSouvenir} />;
    case "reglage":
      return <Reglage page={route.page} />;
    default:
      return <Accueil />;
  }
}

function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const maj = () => setHash(window.location.hash);
    window.addEventListener("hashchange", maj);
    return () => window.removeEventListener("hashchange", maj);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  if (hash === "#/essai-voix") return <EssaiVoix />;
  return (
    <>
      <BandeauReseau />
      <Ecrans />
    </>
  );
}
