import type { CSSProperties } from "react";

const BARRES = 28;

export default function Waveform({ actif }: { actif: boolean }) {
  return (
    <div className={`onde-son${actif ? " actif" : ""}`} aria-hidden="true">
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
