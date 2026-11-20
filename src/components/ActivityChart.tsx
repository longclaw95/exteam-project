/**
 * Graphique d'évolution des comptes actifs par segment. Reçoit les points de
 * la période filtrée et la liste des segments à tracer (tous, ou le seul
 * segment sélectionné — cf. app/page.tsx + ADR-001). Purement
 * présentationnel.
 *
 * Pas de survol/tooltip — cf. contrainte du brief "pas de surenchère
 * technique" : libellés directs + légende suffisent pour lire les tendances,
 * et les valeurs exactes sont dans le tableau. Palette et repères suivent le
 * guide interne de dataviz (3 couleurs catégorielles validées CVD).
 */

import type { DailyActivityPoint } from "@/domain/timeseries";
import type { Segment } from "@/domain/types";

const SEGMENT_LABEL: Record<Segment, string> = {
  enterprise: "Enterprise",
  smb: "PME",
  startup: "Startup",
};

// La couleur suit le segment, jamais son rang : PME reste orange même
// quand c'est la seule série affichée.
const SEGMENT_COLOR_VAR: Record<Segment, string> = {
  enterprise: "var(--color-series-1)",
  smb: "var(--color-series-2)",
  startup: "var(--color-series-3)",
};

export interface ActivityChartProps {
  points: DailyActivityPoint[];
  segments: readonly Segment[];
}

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 16, right: 72, bottom: 24, left: 32 };
const LABEL_MIN_GAP = 12;

/**
 * Écarte verticalement des libellés (positions y) pour qu'ils ne se
 * chevauchent pas, en préservant leur ordre et en restant dans [min, max].
 * Passe descendante pour imposer l'écart, puis remontante si le dernier
 * libellé dépasse le bas.
 */
export function spreadLabels(ys: number[], minGap: number, min: number, max: number): number[] {
  const order = ys.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k += 1) {
    order[k].y = Math.max(order[k].y, order[k - 1].y + minGap);
  }
  order[order.length - 1].y = Math.min(order[order.length - 1].y, max);
  for (let k = order.length - 2; k >= 0; k -= 1) {
    order[k].y = Math.max(min, Math.min(order[k].y, order[k + 1].y - minGap));
  }
  const result = new Array<number>(ys.length);
  for (const { y, index } of order) result[index] = y;
  return result;
}

export function ActivityChart({ points, segments }: ActivityChartProps) {
  if (points.length === 0) {
    return null;
  }

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = Math.max(1, ...points.flatMap((p) => segments.map((s) => p.bySegment[s])));

  const xFor = (index: number) =>
    PADDING.left + (points.length === 1 ? 0 : (index / (points.length - 1)) * plotWidth);
  const yFor = (value: number) => PADDING.top + plotHeight - (value / maxValue) * plotHeight;

  const linePath = (segment: Segment) =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.bySegment[segment]).toFixed(1)}`)
      .join(" ");

  const gridLines = [0, 0.5, 1].map((fraction) => PADDING.top + plotHeight * fraction);
  const last = points[points.length - 1];
  const labelYs = spreadLabels(
    segments.map((s) => yFor(last.bySegment[s])),
    LABEL_MIN_GAP,
    PADDING.top,
    HEIGHT - PADDING.bottom,
  );
  const visibleNames = segments.map((s) => SEGMENT_LABEL[s]).join(", ");

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Évolution quotidienne des comptes actifs sur la période — ${visibleNames}`}
        className="w-full"
      >
        {gridLines.map((y) => (
          <line
            key={y}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={y}
            y2={y}
            stroke="var(--color-gridline)"
            strokeWidth={1}
          />
        ))}

        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={PADDING.top + plotHeight}
          y2={PADDING.top + plotHeight}
          stroke="var(--color-text-muted)"
          strokeWidth={1}
        />

        {segments.map((segment, i) => (
          <g key={segment}>
            <path
              d={linePath(segment)}
              fill="none"
              stroke={SEGMENT_COLOR_VAR[segment]}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Libellé direct en bout de ligne (en couleur de texte, pas de
                série) : compense le contraste plus faible d'une des 3
                couleurs sur fond clair. */}
            <text
              x={xFor(points.length - 1) + 6}
              y={labelYs[i]}
              dominantBaseline="middle"
              fontSize={11}
              fill="var(--color-text-secondary)"
            >
              {SEGMENT_LABEL[segment]}
            </text>
          </g>
        ))}
      </svg>

      {/* Légende seulement à partir de 2 séries : pour une série unique, le
          libellé direct et le texte alternatif la nomment déjà. */}
      {segments.length > 1 && (
        <figcaption className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)]">
          {segments.map((segment) => (
            <span key={segment} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SEGMENT_COLOR_VAR[segment] }}
              />
              {SEGMENT_LABEL[segment]}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
