/**
 * État vide réutilisable : remplace le contenu d'un bloc (tableau,
 * graphique) quand il n'y a rien à afficher, sans faire disparaître la
 * structure autour (cf. docs/03-maquette-filaire.md).
 */

export interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-1 rounded-md border border-dashed border-[var(--color-border)] px-6 py-10 text-center"
    >
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
      {description && (
        <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
      )}
    </div>
  );
}
