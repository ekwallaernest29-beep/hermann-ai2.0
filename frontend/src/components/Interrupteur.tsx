export default function Interrupteur({ actif }: { actif: boolean }) {
  return (
    <span
      className={`interrupteur${actif ? " actif" : ""}`}
      role="switch"
      aria-checked={actif}
      aria-disabled="true"
      aria-label={actif ? "Activé" : "Désactivé"}
    />
  );
}
