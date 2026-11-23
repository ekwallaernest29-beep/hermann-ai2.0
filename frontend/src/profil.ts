const CLE = "hermann.profil";
const PAR_DEFAUT = "Hermann";

export type Profil = { prenom: string };

export function lireProfil(): Profil {
  try {
    const p = JSON.parse(window.localStorage.getItem(CLE) ?? "");
    if (p && typeof p.prenom === "string" && p.prenom.trim()) {
      return { prenom: p.prenom.trim().slice(0, 30) };
    }
  } catch {
    // Aucun profil enregistré.
  }
  return { prenom: PAR_DEFAUT };
}

export function prenomAffiche(): string {
  return lireProfil().prenom;
}

export function enregistrerPrenom(prenom: string) {
  window.localStorage.setItem(CLE, JSON.stringify({ prenom: prenom.trim().slice(0, 30) }));
}
