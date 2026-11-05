/**
 * Calcul des 4 indicateurs ProductPulse.
 *
 * Définitions exactes : voir docs/01-note-de-cadrage.md § 3.
 * Ces fonctions sont pures (aucun accès réseau, horloge ou DOM) et ne
 * dépendent d'aucun composant React — elles sont testables isolément.
 */

import { computePeriodRanges, isWithinRange } from "./dates";
import type { Account, DateRange, Period, Segment, SeedData, Ticket } from "./types";

export type SegmentFilter = Segment | "all";

function matchesSegment(segment: Segment, filter: SegmentFilter): boolean {
  return filter === "all" || segment === filter;
}

function accountsInRange(
  accounts: Account[],
  range: DateRange,
  segment: SegmentFilter,
): Set<string> {
  const active = new Set<string>();
  for (const account of accounts) {
    if (!matchesSegment(account.segment, segment)) continue;
    if (account.activeDates.some((d) => isWithinRange(d, range))) {
      active.add(account.id);
    }
  }
  return active;
}

function ticketsInRange(tickets: Ticket[], range: DateRange, segment: SegmentFilter): Ticket[] {
  return tickets.filter(
    (t) => matchesSegment(t.segment, segment) && isWithinRange(t.createdAt, range),
  );
}

/** Comptes actifs distincts sur la période (dédoublonnés, cf. note de cadrage). */
export function countActiveAccounts(
  data: SeedData,
  range: DateRange,
  segment: SegmentFilter = "all",
): number {
  return accountsInRange(data.accounts, range, segment).size;
}

/** Tickets créés sur la période. */
export function countTicketsCreated(
  data: SeedData,
  range: DateRange,
  segment: SegmentFilter = "all",
): number {
  return ticketsInRange(data.tickets, range, segment).length;
}

/**
 * Taux de résolution : tickets créés sur la période et résolus avant la
 * fin de la période, divisé par les tickets créés sur la période.
 *
 * Retourne `null` si aucun ticket n'a été créé sur la période — jamais
 * une division par zéro ni un faux "0 %" (cf. note de cadrage § 3).
 */
export function computeResolutionRate(
  data: SeedData,
  range: DateRange,
  segment: SegmentFilter = "all",
): number | null {
  const created = ticketsInRange(data.tickets, range, segment);
  if (created.length === 0) return null;
  const resolved = created.filter((t) => t.resolvedAt !== undefined && t.resolvedAt <= range.end);
  return Math.round((resolved.length / created.length) * 100);
}

/**
 * Satisfaction moyenne (CSAT) sur la période, arrondie à 1 décimale.
 *
 * Retourne `null` si aucune note n'a été laissée sur la période — jamais
 * une moyenne sur tableau vide (NaN).
 */
export function computeCsat(
  data: SeedData,
  range: DateRange,
  segment: SegmentFilter = "all",
): number | null {
  const notes = ticketsInRange(data.tickets, range, segment)
    .map((t) => t.csat)
    .filter((csat): csat is number => csat !== undefined);
  if (notes.length === 0) return null;
  const average = notes.reduce((sum, n) => sum + n, 0) / notes.length;
  return Math.round(average * 10) / 10;
}

export interface KpiComparison<T> {
  current: T;
  previous: T;
}

/**
 * Calcule une valeur sur la période courante et sur la période précédente
 * de même durée, pour permettre l'affichage "vs période précédente".
 */
export function compareWithPreviousPeriod<T>(
  data: SeedData,
  referenceDate: string,
  period: Period,
  segment: SegmentFilter,
  compute: (data: SeedData, range: DateRange, segment: SegmentFilter) => T,
): KpiComparison<T> {
  const { current, previous } = computePeriodRanges(referenceDate, period);
  return {
    current: compute(data, current, segment),
    previous: compute(data, previous, segment),
  };
}

export interface DashboardKpis {
  activeAccounts: KpiComparison<number>;
  ticketsCreated: KpiComparison<number>;
  resolutionRate: KpiComparison<number | null>;
  csat: KpiComparison<number | null>;
}

/** Calcule les 4 indicateurs du dashboard pour une période et un segment donnés. */
export function computeDashboardKpis(
  data: SeedData,
  referenceDate: string,
  period: Period,
  segment: SegmentFilter = "all",
): DashboardKpis {
  return {
    activeAccounts: compareWithPreviousPeriod(
      data,
      referenceDate,
      period,
      segment,
      countActiveAccounts,
    ),
    ticketsCreated: compareWithPreviousPeriod(
      data,
      referenceDate,
      period,
      segment,
      countTicketsCreated,
    ),
    resolutionRate: compareWithPreviousPeriod(
      data,
      referenceDate,
      period,
      segment,
      computeResolutionRate,
    ),
    csat: compareWithPreviousPeriod(data, referenceDate, period, segment, computeCsat),
  };
}
