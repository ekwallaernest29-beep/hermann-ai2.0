const CLE = "hermann.code";

export function lireCode(): string {
  try {
    return window.localStorage.getItem(CLE) ?? "";
  } catch {
    return "";
  }
}

export function ecrireCode(code: string) {
  try {
    window.localStorage.setItem(CLE, code);
  } catch {
    // Stockage indisponible : le code sera redemandé.
  }
}

export function effacerCode() {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // Rien à effacer.
  }
}
