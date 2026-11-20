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

/**
 * Sens métier d'une hausse. "neutral" : la hausse n'est ni bonne ni
 * mauvaise en soi (ex. tickets créés — note de cadrage § 3), donc pas de
 * couleur de jugement.
 */
export type KpiPolarity = "higher-is-better" | "neutral";

type TrendTone = "positive" | "negative" | "neutral" | "muted";

export interface KpiCardProps {
  label: string;
  /** Valeur affichée déjà formatée (ex. "1 284", "78 %", "4,2 / 5"). */
  formattedValue: string;
  current: number | null;
  previous: number | null;
  /** Unité de la variation affichée : "points" pour un pourcentage, "%" pour une variation relative. */
  deltaUnit?: "points" | "percent";
  polarity?: KpiPolarity;
}

const STABLE = { direction: "flat", label: "Stable vs période précédente" } as const;

const formatOneDecimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function computeTrend(
  current: number | null,
  previous: number | null,
  deltaUnit: "points" | "percent" = "percent",
): { direction: TrendDirection; label: string } {
  if (current === null || previous === null) {
    return { direction: "unavailable", label: "Pas de comparaison disponible" };
  }

  if (deltaUnit === "points") {
    // Arrondi à 1 décimale AVANT comparaison : 4.1 - 3.8 vaut
    // 0.2999999999999998 en virgule flottante.
    const diff = Math.round((current - previous) * 10) / 10;
    if (diff === 0) return STABLE;
    const amount = Math.abs(diff);
    const unit = amount < 2 ? "point" : "points";
    return {
      direction: diff > 0 ? "up" : "down",
      label: `${diff > 0 ? "Hausse" : "Baisse"} de ${formatOneDecimal.format(amount)} ${unit} vs période précédente`,
    };
  }

  // deltaUnit === "percent" : variation relative, protégée contre previous = 0.
  if (previous === 0) {
    if (current === 0) return STABLE;
    return { direction: "up", label: "Nouveau par rapport à une période précédente à zéro" };
  }

  // Arrondi AVANT de décider du sens : +0,1 % ne doit pas devenir "Hausse de 0 %".
  const diff = Math.round(((current - previous) / previous) * 100);
  if (diff === 0) return STABLE;
  return {
    direction: diff > 0 ? "up" : "down",
    label: `${diff > 0 ? "Hausse" : "Baisse"} de ${Math.abs(diff)} % vs période précédente`,
  };
}

function toneFor(direction: TrendDirection, polarity: KpiPolarity): TrendTone {
  if (direction === "unavailable") return "muted";
  if (direction === "flat" || polarity === "neutral") return "neutral";
  return direction === "up" ? "positive" : "negative";
}

const DIRECTION_SYMBOL: Record<TrendDirection, string> = {
  up: "▲",
  down: "▼",
  flat: "→",
  unavailable: "–",
};

// Teintes Tailwind 700/400 plutôt que les tokens --color-status-* : ces
// derniers sont calibrés pour des marques/bordures et passent sous 4,5:1 en
// texte de petite taille sur fond clair (ex. #0ca30c sur blanc ≈ 3,3:1).
const TONE_CLASS: Record<TrendTone, string> = {
  positive: "text-emerald-700 dark:text-emerald-400",
  negative: "text-red-700 dark:text-red-400",
  neutral: "text-slate-600 dark:text-slate-400",
  muted: "text-slate-500 dark:text-slate-400",
};

export function KpiCard({
  label,
  formattedValue,
  current,
  previous,
  deltaUnit,
  polarity = "higher-is-better",
}: KpiCardProps) {
  const trend = computeTrend(current, previous, deltaUnit);
  const tone = toneFor(trend.direction, polarity);

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
      <p data-tone={tone} className={`mt-2 text-sm ${TONE_CLASS[tone]}`}>
        <span aria-hidden="true">{DIRECTION_SYMBOL[trend.direction]} </span>
        {trend.label}
      </p>
    </div>
  );
}
