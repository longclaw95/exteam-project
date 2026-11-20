/**
 * Lignes du tableau "Comptes par segment" (cf. maquette filaire), dans un
 * ordre par défaut stable (nombre de tickets décroissant). Le tri interactif
 * est un état d'affichage géré par AccountsTable, pas par le domaine.
 */

import { isWithinRange } from "./dates";
import type { DateRange, SeedData, Segment, Ticket } from "./types";
import { matchesSegment } from "./kpi";
import type { SegmentFilter } from "./kpi";

export interface AccountSummaryRow {
  accountId: string;
  segment: Segment;
  ticketsCount: number;
  averageCsat: number | null;
  activeDaysCount: number;
}

// Regroupe les tickets par compte en un seul passage (O(tickets)), pour
// éviter de re-scanner tous les tickets pour chaque compte (O(comptes ×
// tickets) dans la version initiale — cf. docs/06-audit-performance.md,
// budget "calcul des KPIs").
function groupTicketsByAccount(tickets: Ticket[]): Map<string, Ticket[]> {
  const byAccount = new Map<string, Ticket[]>();
  for (const ticket of tickets) {
    const existing = byAccount.get(ticket.accountId);
    if (existing) {
      existing.push(ticket);
    } else {
      byAccount.set(ticket.accountId, [ticket]);
    }
  }
  return byAccount;
}

export function computeAccountSummaries(
  data: SeedData,
  range: DateRange,
  segment: SegmentFilter = "all",
): AccountSummaryRow[] {
  const rows: AccountSummaryRow[] = [];
  const ticketsByAccount = groupTicketsByAccount(data.tickets);

  for (const account of data.accounts) {
    if (!matchesSegment(account.segment, segment)) continue;

    const activeDaysCount = account.activeDates.filter((d) => isWithinRange(d, range)).length;
    const accountTickets = (ticketsByAccount.get(account.id) ?? []).filter((t) =>
      isWithinRange(t.createdAt, range),
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
