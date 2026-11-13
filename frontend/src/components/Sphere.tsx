import type { Etat } from "../etats";

const R = 96;
const RAD = Math.PI / 180;

const meridiens = [0, 30, 60, 90, 120, 150].map((deg) =>
  Math.max(Math.abs(Math.cos(deg * RAD)) * R, 0.5),
);

const paralleles = [-60, -30, 0, 30, 60].map((deg) => ({
  cy: 120 + R * Math.sin(deg * RAD),
  rx: R * Math.cos(deg * RAD),
}));

export default function Sphere({ etat }: { etat: Etat }) {
  return (
    <div className={`sphere sphere-${etat}`} aria-hidden="true">
      <svg viewBox="0 0 240 240" focusable="false">
        <defs>
          <radialGradient id="sphere-fond" cx="35%" cy="30%" r="75%">
            <stop offset="0%" style={{ stopColor: "var(--blanc-casse)" }} />
            <stop offset="55%" style={{ stopColor: "var(--menthe)" }} />
            <stop offset="100%" style={{ stopColor: "var(--vert-profond)" }} />
          </radialGradient>
        </defs>
        <circle className="onde onde-1" cx="120" cy="120" r={R} />
        <circle className="onde onde-2" cx="120" cy="120" r={R} />
        <circle className="orbite" cx="120" cy="120" r={R + 14} />
        <g className="noyau">
          <circle cx="120" cy="120" r={R} fill="url(#sphere-fond)" />
          <g className="maillage">
            {meridiens.map((rx, i) => (
              <ellipse key={`m${i}`} cx="120" cy="120" rx={rx} ry={R} />
            ))}
            {paralleles.map((p, i) => (
              <ellipse key={`p${i}`} cx="120" cy={p.cy} rx={p.rx} ry={p.rx * 0.22} />
            ))}
          </g>
          <ellipse className="reflet" cx="92" cy="82" rx="30" ry="16" />
        </g>
      </svg>
    </div>
  );
}
