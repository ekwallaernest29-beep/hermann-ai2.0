import { useEffect, useState } from "react";

type Etat = "ok" | "horsligne" | "retabli";

export default function BandeauReseau() {
  const [etat, setEtat] = useState<Etat>(navigator.onLine ? "ok" : "horsligne");

  useEffect(() => {
    let minuteur = 0;
    const perdu = () => {
      window.clearTimeout(minuteur);
      setEtat("horsligne");
    };
    const retrouve = () => {
      setEtat("retabli");
      minuteur = window.setTimeout(() => setEtat("ok"), 4000);
    };
    window.addEventListener("offline", perdu);
    window.addEventListener("online", retrouve);
    return () => {
      window.clearTimeout(minuteur);
      window.removeEventListener("offline", perdu);
      window.removeEventListener("online", retrouve);
    };
  }, []);

  if (etat === "ok") return null;
  return (
    <p className={`bandeau-reseau ${etat}`} role="status">
      {etat === "horsligne"
        ? "Internet interrompu · vos écrans déjà chargés restent consultables, les nouvelles demandes sont indisponibles."
        : "Connexion rétablie."}
    </p>
  );
}
