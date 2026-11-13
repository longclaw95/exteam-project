/**
 * Lignes du tableau "Comptes par segment" (cf. maquette filaire).
 * Le tri interactif arrive semaine 2 — ici on retourne un ordre par
 * défaut stable (nombre de tickets décroissant), pour que le tableau soit
 * déjà exploitable sans attendre le tri.
 */

import { isWithinRange } from "./dates";
import type { DateRange, SeedData, Segment } from "./types";
import type { SegmentFilter } from "./kpi";

export interface AccountSummaryRow {
  accountId: string;
  segment: Segment;
  ticketsCount: number;
  averageCsat: number | null;
  activeDaysCount: number;
}

function matchesSegment(segment: Segment, filter: SegmentFilter): boolean {
  return filter === "all" || segment === filter;
}

export function computeAccountSummaries(
  data: SeedData,
  range: DateRange,
  segment: SegmentFilter = "all",
): AccountSummaryRow[] {
  const rows: AccountSummaryRow[] = [];

  for (const account of data.accounts) {
    if (!matchesSegment(account.segment, segment)) continue;

    const activeDaysCount = account.activeDates.filter((d) => isWithinRange(d, range)).length;
    const accountTickets = data.tickets.filter(
      (t) => t.accountId === account.id && isWithinRange(t.createdAt, range),
    );
    const csatNotes = accountTickets
      .map((t) => t.csat)
      .filter((v): v is number => v !== undefined);
    const averageCsat =
      csatNotes.length === 0
        ? null
        : Math.round((csatNotes.reduce((s, n) => s + n, 0) / csatNotes.length) * 10) / 10;

    // On n'inclut que les comptes avec au moins un signal sur la période
    // (actif ou ticket) : un compte totalement silencieux n'apporte rien
    // à ce tableau et alourdirait inutilement la lecture.
    if (activeDaysCount === 0 && accountTickets.length === 0) continue;

    rows.push({
      accountId: account.id,
      segment: account.segment,
      ticketsCount: accountTickets.length,
      averageCsat,
      activeDaysCount,
    });
  }

  return rows.sort((a, b) => b.ticketsCount - a.ticketsCount);
}
