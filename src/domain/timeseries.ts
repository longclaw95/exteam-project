/**
 * Série temporelle d'activité, pour le graphique "évolution dans le
 * temps" (cf. docs/03-maquette-filaire.md). Pur, testable sans React.
 */

import { addDays, isWithinRange } from "./dates";
import { SEGMENTS } from "./types";
import type { DateRange, SeedData, Segment } from "./types";

export interface DailyActivityPoint {
  date: string;
  bySegment: Record<Segment, number>;
}

/**
 * Pour chaque jour de la période, compte les comptes actifs CE jour-là,
 * par segment. Note : contrairement à `countActiveAccounts` (qui dédoublonne
 * sur toute la période), ceci est un instantané quotidien — un compte actif
 * 10 jours sur 10 apparaît dans les 10 points, ce qui est le but ici
 * (dessiner une courbe, pas calculer un total).
 */
export function computeDailyActivitySeries(
  data: SeedData,
  range: DateRange,
): DailyActivityPoint[] {
  const days: string[] = [];
  for (let d = range.start; d <= range.end; d = addDays(d, 1)) {
    days.push(d);
  }

  const points: DailyActivityPoint[] = days.map((date) => ({
    date,
    bySegment: { enterprise: 0, smb: 0, startup: 0 },
  }));
  const indexByDate = new Map(points.map((p, i) => [p.date, i] as const));

  for (const account of data.accounts) {
    for (const activeDate of account.activeDates) {
      if (!isWithinRange(activeDate, range)) continue;
      const index = indexByDate.get(activeDate);
      if (index === undefined) continue;
      points[index].bySegment[account.segment] += 1;
    }
  }

  return points;
}

export { SEGMENTS };
