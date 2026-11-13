import type { ReactNode } from "react";

export function Liste({ children }: { children: ReactNode }) {
  return <div className="liste-reglages">{children}</div>;
}

type Props = { titre: string; detail?: string; droite?: ReactNode };

export function Ligne({ titre, detail, droite }: Props) {
  return (
    <div className="ligne-reglage">
      <span>
        <strong>{titre}</strong>
        {detail && <small>{detail}</small>}
      </span>
      {droite}
    </div>
  );
}
