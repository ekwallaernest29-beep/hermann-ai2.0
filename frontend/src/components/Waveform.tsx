import type { CSSProperties } from "react";

const BARRES = 28;

type Props = { actif: boolean; reel?: boolean };

export default function Waveform({ actif, reel }: Props) {
  return (
    <div className={`onde-son${actif ? " actif" : ""}${reel ? " reel" : ""}`} aria-hidden="true">
      {Array.from({ length: BARRES }, (_, i) => (
        <span
          key={i}
          style={
            {
              animationDelay: `${(i * 83) % 700}ms`,
              "--h": `${30 + ((i * 37) % 70)}%`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
