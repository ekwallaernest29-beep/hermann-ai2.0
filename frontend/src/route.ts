import { useEffect, useState } from "react";

export type Route =
  | { nom: "accueil" }
  | { nom: "historique" }
  | { nom: "conversation"; id: string }
  | { nom: "suppression"; id: string }
  | { nom: "parametres" }
  | { nom: "parametres-hm" }
  | { nom: "memoire" }
  | { nom: "souvenir"; id: string }
  | { nom: "souvenir-modifier"; id: string }
  | { nom: "souvenir-suppression"; id: string };

function lire(): Route {
  const [a, b, c] = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (a === "historique") {
    if (b && c === "supprimer") return { nom: "suppression", id: b };
    if (b) return { nom: "conversation", id: b };
    return { nom: "historique" };
  }
  if (a === "memoire") {
    if (b && c === "modifier") return { nom: "souvenir-modifier", id: b };
    if (b && c === "supprimer") return { nom: "souvenir-suppression", id: b };
    if (b) return { nom: "souvenir", id: b };
    return { nom: "memoire" };
  }
  if (a === "parametres") {
    if (b === "historique-memoire") return { nom: "parametres-hm" };
    return { nom: "parametres" };
  }
  return { nom: "accueil" };
}

export function aller(chemin: string) {
  window.location.hash = chemin;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(lire);
  useEffect(() => {
    const surChangement = () => {
      setRoute(lire());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", surChangement);
    return () => window.removeEventListener("hashchange", surChangement);
  }, []);
  return route;
}
