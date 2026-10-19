/** Datumsfeld (nativ), gleiche Optik wie NumberField. */
interface Props { id: string; label: string; value: string; onChange: (v: string) => void; min?: string; max?: string; help?: string; className?: string }
export default function DateField({ id, label, value, onChange, min, max, help, className = '' }: Props) {
  return (
    <div className={`grid grid-rows-subgrid row-span-3 content-start gap-y-0 ${className}`}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-navy-700">{label}</label>
      <input id={id} type="date" value={value} min={min} max={max} onChange={(e) => e.target.value && onChange(e.target.value)} aria-describedby={help ? `${id}-help` : undefined}
        className="tabular-nums h-12 w-full self-start rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
      {help && <p id={`${id}-help`} className="mt-1 text-xs text-navy-600">{help}</p>}
    </div>
  );
}
