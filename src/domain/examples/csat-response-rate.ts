/**
 * EXEMPLE D'EXTENSION — le « 5e KPI » du guide docs/08-guide-onboarding.md.
 *
 * Volontairement NON affiché dans le tableau de bord : le périmètre produit
 * reste de 4 indicateurs (note de cadrage). Ce fichier et son test existent
 * pour que l'exemple du guide compile et reste juste quand le domaine évolue
 * — un guide dont l'exemple ne compile plus est pire que pas de guide.
 *
 * Taux de réponse à l'enquête CSAT : part des tickets créés sur la période
 * et résolus avant sa fin qui ont reçu une note. Retourne `null` si aucun
 * ticket n'est résolu (pas de 0 % trompeur), en entier comme le taux de
 * résolution.
 */

import { ticketsInRange } from "../kpi";
import type { SegmentFilter } from "../kpi";
import type { DateRange, SeedData } from "../types";

export function computeCsatResponseRate(
  data: SeedData,
  range: DateRange,
  segment: SegmentFilter = "all",
): number | null {
  const resolved = ticketsInRange(data.tickets, range, segment).filter(
    (t) => t.resolvedAt !== undefined && t.resolvedAt <= range.end,
  );
  if (resolved.length === 0) return null;
  const rated = resolved.filter((t) => t.csat !== undefined).length;
  return Math.round((rated / resolved.length) * 100);
}
