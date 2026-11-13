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
