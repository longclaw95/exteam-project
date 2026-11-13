/**
 * Bandeau de retour (info/succès/erreur), pour les messages d'état.
 *
 * Chaque statut est porté par une icône ET un texte, jamais par la seule
 * couleur (cf. docs/registre-ia.md — même règle que pour KpiCard).
 */

export type FeedbackTone = "info" | "good" | "warning" | "critical";

const TONE_CONFIG: Record<FeedbackTone, { icon: string; className: string }> = {
  info: { icon: "ℹ", className: "border-[var(--color-series-1)] text-[var(--color-text-primary)]" },
  good: { icon: "✓", className: "border-[var(--color-status-good)] text-[var(--color-text-primary)]" },
  warning: {
    icon: "⚠",
    className: "border-[var(--color-status-warning)] text-[var(--color-text-primary)]",
  },
  critical: {
    icon: "✕",
    className: "border-[var(--color-status-critical)] text-[var(--color-text-primary)]",
  },
};

export interface FeedbackProps {
  tone: FeedbackTone;
  message: string;
}

export function Feedback({ tone, message }: FeedbackProps) {
  const config = TONE_CONFIG[tone];
  return (
    <div
      role={tone === "critical" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-md border-l-4 bg-[var(--color-surface)] px-4 py-2 text-sm ${config.className}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{message}</span>
    </div>
  );
}
