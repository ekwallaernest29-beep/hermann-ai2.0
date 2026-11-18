import { useCallback, useEffect, useRef, useState } from "react";
import Entete from "../components/Entete";
import { IconeMicro, IconeStop } from "../components/Icones";
import { Ligne, Liste } from "../components/Lignes";
import {
  ecranPris,
  ecrireReglagesMicro,
  lireReglagesMicro,
  type ReglagesMicro as Reglages,
  type Sensibilite,
} from "../reglagesMicro";
import { aller } from "../route";
import { useMicro } from "../useMicro";

const NOMS: Record<Sensibilite, string> = { haute: "Haute", normale: "Normale", basse: "Basse" };
const AIDE: Record<Sensibilite, string> = {
  haute: "Pièce calme, voix douce : le micro réagit au moindre son.",
  normale: "Réglage par défaut, adapté à la plupart des situations.",
  basse: "Pièce bruyante : seule une voix nette déclenche la détection.",
};
const PERMISSIONS: Record<string, string> = {
  granted: "Autorisé",
  denied: "Refusé : à autoriser dans les réglages du navigateur ou du téléphone",
  prompt: "Pas encore demandé",
  inconnue: "Demandé au premier usage",
};

export default function ReglagesMicro() {
  const [reg, setReg] = useState<Reglages>(lireReglagesMicro);
  const [perm, setPerm] = useState("inconnue");
  const racine = useRef<HTMLDivElement>(null);
  const surNiveau = useCallback((n: number) => {
    racine.current?.style.setProperty("--niveau", n.toFixed(3));
  }, []);
  const micro = useMicro({ onNiveau: surNiveau });

  useEffect(() => {
    const q = navigator.permissions?.query({ name: "microphone" as PermissionName });
    if (!q) return;
    let statut: PermissionStatus | null = null;
    q.then((s) => {
      statut = s;
      setPerm(s.state);
      s.onchange = () => setPerm(s.state);
    }).catch(() => {});
    return () => {
      if (statut) statut.onchange = null;
    };
  }, [micro.statut]);

  const changer = (suite: Partial<Reglages>) => {
    const r = { ...reg, ...suite };
    setReg(r);
    ecrireReglagesMicro(r);
    if ("sensibilite" in suite && micro.statut === "actif") {
      micro.arreter();
      void micro.demarrer();
    }
  };

  const etatTest =
    micro.statut === "actif"
      ? micro.parle
        ? "Voix détectée"
        : "Silence"
      : micro.statut === "demande"
        ? "Autorisation en cours…"
        : "Micro éteint";

  return (
    <div className="ecran" ref={racine}>
      <Entete retour={() => aller("/parametres")} />
      <main className="page">
        <h1>Microphone</h1>
        <p className="sous-titre">Réglez l’écoute de Hermann selon votre environnement.</p>

        <section className="carte">
          <p className="groupe">AUTORISATION</p>
          <p className="titre-carte">{PERMISSIONS[perm] ?? PERMISSIONS.inconnue}</p>
        </section>

        <section className="carte">
          <p className="groupe">TESTER LE MICRO · {etatTest.toUpperCase()}</p>
          <div className="jauge" aria-hidden="true">
            <span />
          </div>
          {micro.erreur && (
            <p className="sous-titre" role="alert">
              {micro.erreur.titre} : {micro.erreur.texte}
            </p>
          )}
          {micro.statut === "actif" ? (
            <button type="button" className="bouton plein" onClick={micro.arreter}>
              <IconeStop /> Arrêter le test
            </button>
          ) : (
            <button
              type="button"
              className="bouton menthe"
              disabled={micro.statut === "demande"}
              onClick={() => void micro.demarrer()}
            >
              <IconeMicro /> Tester le micro
            </button>
          )}
          <p className="note-bas">Rien n’est enregistré ni envoyé pendant le test.</p>
        </section>

        <h2 className="groupe">SENSIBILITÉ DE LA DÉTECTION</h2>
        <div className="boutons-bas">
          {(["haute", "normale", "basse"] as Sensibilite[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`bouton${reg.sensibilite === s ? " menthe" : ""}`}
              aria-pressed={reg.sensibilite === s}
              onClick={() => changer({ sensibilite: s })}
            >
              {NOMS[s]}
            </button>
          ))}
        </div>
        <p className="sous-titre">{AIDE[reg.sensibilite]}</p>

        <div className="champ">
          <label htmlFor="silence">SILENCE AVANT L’ENVOI : {(reg.silenceMs / 1000).toFixed(1)} s</label>
          <input
            id="silence"
            type="range"
            min="600"
            max="3000"
            step="200"
            value={reg.silenceMs}
            onChange={(e) => changer({ silenceMs: Number(e.target.value) })}
          />
          <p className="sous-titre">Court : Hermann réagit vite mais peut couper vos pauses. S’applique au prochain échange.</p>
        </div>

        <Liste>
          <Ligne
            titre="Relancer l’écoute après la réponse"
            detail="Pour enchaîner sans retoucher l’écran"
            droite={
              <button
                type="button"
                className="bouton"
                aria-pressed={reg.relance}
                onClick={() => changer({ relance: !reg.relance })}
              >
                {reg.relance ? "Activé" : "Désactivé"}
              </button>
            }
          />
          <Ligne
            titre="Garder l’écran allumé pendant l’écoute"
            detail={ecranPris ? "Évite la mise en veille de l’écran" : "Non pris en charge sur cet appareil"}
            droite={
              <button
                type="button"
                className="bouton"
                aria-pressed={reg.ecran}
                disabled={!ecranPris}
                onClick={() => changer({ ecran: !reg.ecran })}
              >
                {reg.ecran && ecranPris ? "Activé" : "Désactivé"}
              </button>
            }
          />
        </Liste>

        <h2 className="groupe">VOTRE VOIX RESTE SOUS VOTRE CONTRÔLE</h2>
        <p>
          Quand vous parlez à Hermann, votre voix est envoyée à un service de reconnaissance vocale, puis le texte à
          une IA externe. L’application ne conserve pas l’audio.
        </p>
        <p className="note-bas">
          Le micro s’arrête quand l’écran se verrouille ou que vous changez d’application : c’est une limite des
          navigateurs, pas un réglage.
        </p>
      </main>
    </div>
  );
}
