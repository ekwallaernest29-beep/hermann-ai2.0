import { useRef, useState, type ChangeEvent } from "react";
import Entete from "../components/Entete";
import { aller } from "../route";
import { analyser, appliquer, construire, donneesActuelles, resumer, type Donnees, type Resume } from "../sauvegarde";

function phrase(r: Resume): string {
  const p: string[] = [];
  if (r.historique !== null) p.push(`${r.historique} conversation${r.historique > 1 ? "s" : ""}`);
  if (r.souvenirs !== null) p.push(`${r.souvenirs} souvenir${r.souvenirs > 1 ? "s" : ""}`);
  if (r.reglages) p.push("vos réglages");
  return p.length ? p.join(", ") : "aucune donnée";
}

function dateLisible(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "date inconnue" : d.toLocaleDateString("fr-FR");
}

export default function Sauvegarde() {
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [lu, setLu] = useState<{ donnees: Donnees; date: string; ignorees: number } | null>(null);
  const champ = useRef<HTMLInputElement>(null);
  const actuel = resumer(donneesActuelles());

  const exporter = async () => {
    setErreur("");
    setMessage("");
    const nom = `hermann-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    const fichier = new File([construire()], nom, { type: "application/json" });
    if (navigator.canShare?.({ files: [fichier] })) {
      try {
        await navigator.share({ files: [fichier], title: "Sauvegarde HERMANN AI" });
        setMessage("Sauvegarde partagée. Enregistrez-la dans Fichiers ou envoyez-la à un endroit sûr.");
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(fichier);
    lien.download = nom;
    document.body.append(lien);
    lien.click();
    lien.remove();
    window.setTimeout(() => URL.revokeObjectURL(lien.href), 10000);
    setMessage("Sauvegarde téléchargée. Gardez le fichier en lieu sûr.");
  };

  const choisir = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    setErreur("");
    setMessage("");
    setLu(null);
    if (!f) return;
    const r = analyser(await f.text());
    if (!r.ok) {
      setErreur(r.message);
      return;
    }
    setLu({ donnees: r.donnees, date: r.date, ignorees: r.ignorees });
  };

  const confirmer = () => {
    if (!lu) return;
    if (!appliquer(lu.donnees)) {
      setErreur("Impossible d’enregistrer les données (stockage plein ou bloqué).");
      return;
    }
    setLu(null);
    setMessage("Données importées. Rechargement…");
    window.setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="ecran">
      <Entete retour={() => aller("/parametres")} />
      <main className="page">
        <h1>Sauvegarde</h1>
        <p className="sous-titre">Gardez une copie de vos données, ou retrouvez-les sur un autre téléphone.</p>

        <section className="carte">
          <p className="groupe">SUR CET APPAREIL</p>
          <p className="titre-carte">{phrase(actuel)}</p>
          <button type="button" className="bouton menthe" onClick={() => void exporter()}>
            Exporter mes données
          </button>
          <p className="note-bas">
            Le fichier contient vos conversations et souvenirs en clair : gardez-le en lieu sûr. Vos clés IA n’y sont
            jamais incluses.
          </p>
        </section>

        <section className="carte">
          <p className="groupe">RESTAURER UNE SAUVEGARDE</p>
          <input ref={champ} type="file" accept="application/json,.json" hidden onChange={(e) => void choisir(e)} />
          <button type="button" className="bouton" onClick={() => champ.current?.click()}>
            Choisir un fichier
          </button>
          {lu && (
            <>
              <p className="titre-carte">
                Sauvegarde du {dateLisible(lu.date)} : {phrase(resumer(lu.donnees))}.
              </p>
              {lu.ignorees > 0 && (
                <p className="sous-titre">{lu.ignorees} élément(s) non reconnu(s) seront ignorés.</p>
              )}
              <p className="sous-titre">Ces données remplaceront celles de cet appareil.</p>
              <div className="boutons-bas">
                <button type="button" className="bouton" onClick={() => setLu(null)}>
                  Annuler
                </button>
                <button type="button" className="bouton plein" onClick={confirmer}>
                  Remplacer mes données
                </button>
              </div>
            </>
          )}
        </section>

        {message && (
          <p className="sous-titre" role="status">
            {message}
          </p>
        )}
        {erreur && (
          <p className="sous-titre" role="alert">
            {erreur}
          </p>
        )}
        <p className="note-bas">
          Après une restauration, ressaisissez vos clés IA dans Paramètres, puis Clés IA, et choisissez la voix de
          l’appareil si besoin.
        </p>
      </main>
    </div>
  );
}
