"use client";

/**
 * Tableau "Comptes par segment", triable au clic sur un en-tête. Le tri est
 * un état d'affichage local (pas besoin de passer par l'URL : ce n'est pas
 * une donnée à partager via un lien, contrairement à période/segment —
 * cf. ADR-001). L'ordre par défaut (tickets décroissant) reste celui déjà
 * produit par le domaine (src/domain/account-summaries.ts).
 */

import { useState } from "react";

import { EmptyState } from "./EmptyState";
import type { AccountSummaryRow } from "@/domain/account-summaries";

const SEGMENT_LABEL: Record<AccountSummaryRow["segment"], string> = {
  enterprise: "Enterprise",
  smb: "PME",
  startup: "Startup",
};

type SortKey = "accountId" | "segment" | "ticketsCount" | "averageCsat" | "activeDaysCount";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "accountId", label: "Compte" },
  { key: "segment", label: "Segment" },
  { key: "ticketsCount", label: "Tickets" },
  { key: "averageCsat", label: "CSAT" },
  { key: "activeDaysCount", label: "Jours actifs" },
];

const SORT_DIR_LABEL: Record<SortDir, string> = { asc: "croissant", desc: "décroissant" };

function sortValue(row: AccountSummaryRow, key: SortKey): string | number | null {
  if (key === "segment") return SEGMENT_LABEL[row.segment];
  return row[key];
}

function compareRows(a: AccountSummaryRow, b: AccountSummaryRow, key: SortKey): number {
  const av = sortValue(a, key);
  const bv = sortValue(b, key);
  // Les valeurs absentes (CSAT null) sont toujours reléguées en fin de liste,
  // quel que soit le sens du tri, pour ne pas laisser croire que "n/a" vaut 0.
  if (av === null) return bv === null ? 0 : 1;
  if (bv === null) return -1;
  if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv);
  return (av as number) - (bv as number);
}

export interface AccountsTableProps {
  rows: AccountSummaryRow[];
}

export function AccountsTable({ rows }: AccountsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("ticketsCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Aucune donnée pour ce segment et cette période"
        description="Essayez une période plus longue ou un autre segment."
      />
    );
  }

  const sortedRows = [...rows].sort((a, b) => {
    const result = compareRows(a, b, sortKey);
    return sortDir === "asc" ? result : -result;
  });

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <>
      {/*
        Annonce le changement de tri aux technologies d'assistance : la
        <caption> du tableau décrit sa fonction une fois, mais n'est pas
        réannoncée quand sortKey/sortDir changent (ce n'est pas une région
        "live", et un <table> ne peut avoir qu'une seule <caption>). Ce
        paragraphe séparé porte la même information au moment où elle change.
      */}
      <p className="sr-only" aria-live="polite">
        Trié par {COLUMNS.find((c) => c.key === sortKey)?.label}, ordre {SORT_DIR_LABEL[sortDir]}.
      </p>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Comptes par segment, triables par colonne.</caption>
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
            {COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                scope="col"
                className="py-2 pr-4 font-medium"
                aria-sort={sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <button
                  type="button"
                  onClick={() => handleSort(key)}
                  className="flex items-center gap-1 hover:text-[var(--color-text-primary)]"
                >
                  {label}
                  <span aria-hidden="true">
                    {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
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
    </>
  );
}
