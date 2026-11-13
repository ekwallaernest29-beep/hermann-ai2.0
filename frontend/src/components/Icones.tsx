import type { ReactNode } from "react";

function Icone({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const CORPS_MICRO = "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z";

export const IconeMicro = () => (
  <Icone>
    <path d={CORPS_MICRO} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Icone>
);

export const IconeMicroCoupe = () => (
  <Icone>
    <path d={CORPS_MICRO} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M4 4l16 16" />
  </Icone>
);

export const IconeStop = () => (
  <Icone>
    <rect x="7" y="7" width="10" height="10" rx="2" />
  </Icone>
);

export const IconeHistorique = () => (
  <Icone>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5M12 7v5l3 2" />
  </Icone>
);

export const IconePlay = () => (
  <Icone>
    <path d="M8 5l11 7-11 7z" />
  </Icone>
);

export const IconeLune = () => (
  <Icone>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Icone>
);

export const IconeReglages = () => (
  <Icone>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
  </Icone>
);

export const IconeFleche = () => (
  <Icone>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icone>
);

export const IconeCorbeille = () => (
  <Icone>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Icone>
);

export const IconeOuvrir = () => (
  <Icone>
    <path d="M7 17L17 7M9 7h8v8" />
  </Icone>
);

export const IconeChevron = () => (
  <Icone>
    <path d="M9 6l6 6-6 6" />
  </Icone>
);

export const IconeCrayon = () => (
  <Icone>
    <path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3" />
  </Icone>
);

export const IconeMemoire = () => (
  <Icone>
    <path d="M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3zM9 19h6M10 22h4" />
  </Icone>
);

export const IconeNuage = () => (
  <Icone>
    <path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 4.5 4.5 0 0 1 17.5 18H7z" />
  </Icone>
);

export const IconeSynchro = () => (
  <Icone>
    <path d="M20 11a8 8 0 0 0-14-4M4 4v4h4M4 13a8 8 0 0 0 14 4M20 20v-4h-4" />
  </Icone>
);

export const IconeAvertissement = () => (
  <Icone>
    <path d="M12 3l10 18H2L12 3zM12 10v5M12 18v.5" />
  </Icone>
);

export const IconeBouclier = () => (
  <Icone>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
  </Icone>
);

export const IconeUtilisateur = () => (
  <Icone>
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />
  </Icone>
);

export const IconeTelephone = () => (
  <Icone>
    <path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2" />
  </Icone>
);

export const IconeOrdinateur = () => (
  <Icone>
    <path d="M4 5h16v11H4zM2 19h20" />
  </Icone>
);
