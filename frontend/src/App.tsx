import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

type Etat = "verification" | "connecte" | "injoignable";

const LIBELLES: Record<Etat, string> = {
  verification: "Vérification du serveur…",
  connecte: "Serveur connecté",
  injoignable: "Serveur injoignable",
};

export default function App() {
  const [etat, setEtat] = useState<Etat>("verification");

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setEtat("connecte"))
      .catch(() => setEtat("injoignable"));
  }, []);

  return (
    <main className="accueil">
      <div className={`sphere sphere-${etat}`} aria-hidden="true" />
      <h1>HERMANN AI</h1>
      <p className="sous-titre">Votre assistant personnel intelligent.</p>
      <p className={`etat etat-${etat}`} role="status">
        {LIBELLES[etat]}
      </p>
    </main>
  );
}
