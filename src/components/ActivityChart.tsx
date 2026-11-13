/**
 * Graphique d'évolution des comptes actifs par segment.
 *
 * Version statique (pas d'interaction au survol) : les filtres et le
 * recalcul dynamique arrivent en semaine 2 avec le reste de l'UI
 * interactive (cf. docs/adr/0001-gestion-etat-filtres.md). Ajouter un
 * survol/tooltip maintenant serait de la "surenchère technique" sur un
 * graphique qui n'est pas encore branché aux filtres — cf. contrainte du
 * brief. Palette et repères visuels suivent le guide interne de dataviz
 * (3 couleurs catégorielles validées CVD, légende + libellés directs).
 */

import type { DailyActivityPoint } from "@/domain/timeseries";
import type { Segment } from "@/domain/types";

const SEGMENT_LABEL: Record<Segment, string> = {
  enterprise: "Enterprise",
  smb: "PME",
  startup: "Startup",
};

// Slots 1/2/3 du guide dataviz interne — validés CVD pour 3 séries (toutes paires).
const SEGMENT_COLOR_VAR: Record<Segment, string> = {
  enterprise: "var(--color-series-1)",
  smb: "var(--color-series-2)",
  startup: "var(--color-series-3)",
};

const SEGMENTS: Segment[] = ["enterprise", "smb", "startup"];

export interface ActivityChartProps {
  points: DailyActivityPoint[];
}

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 16, right: 64, bottom: 24, left: 32 };

export function ActivityChart({ points }: ActivityChartProps) {
  if (points.length === 0) {
    return null;
  }

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = Math.max(
    1,
    ...points.flatMap((p) => SEGMENTS.map((s) => p.bySegment[s])),
  );

  const xFor = (index: number) =>
    PADDING.left + (points.length === 1 ? 0 : (index / (points.length - 1)) * plotWidth);
  const yFor = (value: number) => PADDING.top + plotHeight - (value / maxValue) * plotHeight;

  const linePath = (segment: Segment) =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.bySegment[segment]).toFixed(1)}`)
      .join(" ");

  const gridLines = [0, 0.5, 1].map((fraction) => PADDING.top + plotHeight * fraction);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Évolution quotidienne des comptes actifs par segment sur la période sélectionnée"
        className="w-full"
      >
        {/* Repères horizontaux, discrets */}
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

        {/* Axe de base */}
        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={PADDING.top + plotHeight}
          y2={PADDING.top + plotHeight}
          stroke="var(--color-text-muted)"
          strokeWidth={1}
        />

        {SEGMENTS.map((segment) => {
          const last = points[points.length - 1];
          return (
            <g key={segment}>
              <path
                d={linePath(segment)}
                fill="none"
                stroke={SEGMENT_COLOR_VAR[segment]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Libellé direct en bout de ligne — compense le contraste
                  plus faible d'une des 3 couleurs sur fond clair (cf.
                  règle "relief" du guide dataviz). */}
              <text
                x={xFor(points.length - 1) + 6}
                y={yFor(last.bySegment[segment])}
                dominantBaseline="middle"
                fontSize={11}
                fill="var(--color-text-secondary)"
              >
                {SEGMENT_LABEL[segment]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Légende textuelle — toujours présente dès 2 séries, indépendante
          des libellés directs (utile si l'espace à droite manque en
          petit écran). */}
      <figcaption className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)]">
        {SEGMENTS.map((segment) => (
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
    </figure>
  );
}
