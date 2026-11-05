/**
 * Carte d'affichage d'un indicateur, avec sa variation par rapport à la
 * période précédente.
 *
 * Voir docs/registre-ia.md, entrée "KpiCard" : une première proposition
 * générée par IA divisait par `previous` sans garde (Infinity/NaN quand
 * previous vaut 0) et ne communiquait la tendance que par la couleur.
 * Ce composant corrige les deux problèmes.
 */

export type TrendDirection = "up" | "down" | "flat" | "unavailable";

export interface KpiCardProps {
  label: string;
  /** Valeur affichée déjà formatée (ex. "1 284", "78 %", "4.2 / 5"). */
  formattedValue: string;
  current: number | null;
  previous: number | null;
  /** Unité de la variation affichée : "points" pour un pourcentage, "%" pour une variation relative. */
  deltaUnit?: "points" | "percent";
}

export function computeTrend(
  current: number | null,
  previous: number | null,
  deltaUnit: "points" | "percent" = "percent",
): { direction: TrendDirection; label: string } {
  if (current === null || previous === null) {
    return { direction: "unavailable", label: "Pas de comparaison disponible" };
  }

  if (deltaUnit === "points") {
    const diff = current - previous;
    if (diff === 0) return { direction: "flat", label: "Stable vs période précédente" };
    const direction: TrendDirection = diff > 0 ? "up" : "down";
    const word = diff > 0 ? "Hausse" : "Baisse";
    return {
      direction,
      label: `${word} de ${Math.abs(diff)} points vs période précédente`,
    };
  }

  // deltaUnit === "percent" : variation relative, protégée contre previous = 0.
  if (previous === 0) {
    if (current === 0) return { direction: "flat", label: "Stable vs période précédente" };
    return { direction: "up", label: "Nouveau par rapport à une période précédente à zéro" };
  }

  const diff = ((current - previous) / previous) * 100;
  if (diff === 0) return { direction: "flat", label: "Stable vs période précédente" };
  const direction: TrendDirection = diff > 0 ? "up" : "down";
  const word = diff > 0 ? "Hausse" : "Baisse";
  return {
    direction,
    label: `${word} de ${Math.abs(Math.round(diff))}% vs période précédente`,
  };
}

const DIRECTION_SYMBOL: Record<TrendDirection, string> = {
  up: "▲",
  down: "▼",
  flat: "→",
  unavailable: "–",
};

const DIRECTION_CLASS: Record<TrendDirection, string> = {
  up: "text-emerald-700 dark:text-emerald-400",
  down: "text-red-700 dark:text-red-400",
  flat: "text-slate-600 dark:text-slate-400",
  unavailable: "text-slate-400 dark:text-slate-500",
};

export function KpiCard({ label, formattedValue, current, previous, deltaUnit }: KpiCardProps) {
  const trend = computeTrend(current, previous, deltaUnit);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
        {formattedValue}
      </p>
      {/*
        La tendance est toujours lisible en texte (trend.label), pas
        seulement via la couleur ou le symbole : accessible aux lecteurs
        d'écran et aux personnes daltoniennes.
      */}
      <p className={`mt-2 text-sm ${DIRECTION_CLASS[trend.direction]}`}>
        <span aria-hidden="true">{DIRECTION_SYMBOL[trend.direction]} </span>
        {trend.label}
      </p>
    </div>
  );
}
