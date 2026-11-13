import { useEffect, useState } from "react";

export type PageReglage =
  | "compte"
  | "securite"
  | "appareils"
  | "revoquer"
  | "synchronisation"
  | "voix"
  | "microphone"
  | "notifications"
  | "etats";

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
  | { nom: "souvenir-suppression"; id: string }
  | { nom: "reglage"; page: PageReglage };

const PAGES: PageReglage[] = [
  "compte",
  "securite",
  "appareils",
  "synchronisation",
  "voix",
  "microphone",
  "notifications",
];

function lire(): Route {
  const [a, b, c] = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (a === "etats") return { nom: "reglage", page: "etats" };
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
    if (b === "appareils" && c === "revoquer") return { nom: "reglage", page: "revoquer" };
    const page = PAGES.find((p) => p === b);
    if (page) return { nom: "reglage", page };
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
