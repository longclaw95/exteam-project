/**
 * Tableau "Comptes par segment". Pas encore triable au clic (prévu
 * semaine 2, cf. planning) — ordre par défaut géré par le domaine
 * (src/domain/account-summaries.ts).
 */

import { EmptyState } from "./EmptyState";
import type { AccountSummaryRow } from "@/domain/account-summaries";

const SEGMENT_LABEL: Record<AccountSummaryRow["segment"], string> = {
  enterprise: "Enterprise",
  smb: "PME",
  startup: "Startup",
};

export interface AccountsTableProps {
  rows: AccountSummaryRow[];
}

export function AccountsTable({ rows }: AccountsTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Aucune donnée pour ce segment et cette période"
        description="Essayez une période plus longue ou un autre segment."
      />
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">Comptes par segment, triés par nombre de tickets</caption>
      <thead>
        <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
          <th scope="col" className="py-2 pr-4 font-medium">
            Compte
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Segment
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Tickets
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            CSAT
          </th>
          <th scope="col" className="py-2 font-medium">
            Jours actifs
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.accountId} className="border-b border-[var(--color-border)] last:border-0">
            <td className="py-2 pr-4 text-[var(--color-text-primary)]">{row.accountId}</td>
            <td className="py-2 pr-4 text-[var(--color-text-secondary)]">
              {SEGMENT_LABEL[row.segment]}
            </td>
            <td className="py-2 pr-4 tabular-nums text-[var(--color-text-primary)]">
              {row.ticketsCount}
            </td>
            <td className="py-2 pr-4 tabular-nums text-[var(--color-text-primary)]">
              {row.averageCsat === null ? "n/a" : `${row.averageCsat} / 5`}
            </td>
            <td className="py-2 tabular-nums text-[var(--color-text-primary)]">
              {row.activeDaysCount}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
