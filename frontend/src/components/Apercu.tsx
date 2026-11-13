type Option = { id: string; nom: string };

type Props = {
  note: string;
  options: Option[];
  valeur: string;
  onChoisir: (id: string) => void;
};

export default function Apercu({ note, options, valeur, onChoisir }: Props) {
  return (
    <aside className="demo" aria-label="Aperçu de l’interface">
      <p>{note}</p>
      <div role="group" aria-label="Choisir une vue à prévisualiser">
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={o.id === valeur} onClick={() => onChoisir(o.id)}>
            {o.nom}
          </button>
        ))}
      </div>
    </aside>
  );
}
