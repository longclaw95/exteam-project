"use client";

/**
 * Select accessible générique.
 *
 * Basé sur <select> natif plutôt qu'un listbox custom : navigation clavier
 * (flèches, lettre de recherche) gratuite, pas de JS à maintenir pour ça.
 * Toujours accompagné d'un <label> explicite — jamais un placeholder seul.
 *
 * "use client" : définit un gestionnaire onChange, donc ne peut pas rester
 * un Server Component même quand onChange n'est pas branché (cf. décision
 * SSR/CSR, docs/02-decision-ssr-csr.md — la frontière suit l'interactivité).
 */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function Select({ id, label, options, value, onChange, disabled }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-secondary)]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
