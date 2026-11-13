import { useEffect, useState } from "react";

export type Route =
  | { nom: "accueil" }
  | { nom: "historique" }
  | { nom: "conversation"; id: string }
  | { nom: "suppression"; id: string };

function lire(): Route {
  const morceaux = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (morceaux[0] === "historique") {
    if (morceaux[1] && morceaux[2] === "supprimer") return { nom: "suppression", id: morceaux[1] };
    if (morceaux[1]) return { nom: "conversation", id: morceaux[1] };
    return { nom: "historique" };
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
