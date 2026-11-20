/**
 * Mesure de performance — budget qualité n°2 (cf. docs/06-audit-performance.md).
 *
 * `naiveComputeAccountSummaries` est une COPIE de l'implémentation
 * pré-optimisation de `computeAccountSummaries` (un `.filter()` sur tous
 * les tickets pour chaque compte, O(comptes × tickets)) — gardée ici
 * uniquement pour mesurer le gain avant/après, jamais utilisée en
 * production.
 *
 * Le jeu de données réel (123 comptes, 117 tickets) est trop petit pour
 * que la différence soit mesurable de façon fiable : on l'amplifie ×40
 * artificiellement pour ce test, en le disant explicitement plutôt que de
 * prétendre à un gain sur le jeu réel.
 */

import { describe, expect, it } from "vitest";

import { computeAccountSummaries } from "./account-summaries";
import { isWithinRange } from "./dates";
import seed from "@/data/seed.json";
import type { DateRange, SeedData, Segment } from "./types";

function naiveComputeAccountSummaries(data: SeedData, range: DateRange) {
  const rows: { accountId: string; ticketsCount: number }[] = [];
  for (const account of data.accounts) {
    const activeDaysCount = account.activeDates.filter((d) => isWithinRange(d, range)).length;
    const accountTickets = data.tickets.filter(
      (t) => t.accountId === account.id && isWithinRange(t.createdAt, range),
    );
    if (activeDaysCount === 0 && accountTickets.length === 0) continue;
    rows.push({ accountId: account.id, ticketsCount: accountTickets.length });
  }
  return rows;
}

function amplify(data: SeedData, factor: number): SeedData {
  const accounts = Array.from({ length: factor }, (_, i) =>
    data.accounts.map((a) => ({ ...a, id: `${a.id}-${i}` })),
  ).flat();
  const tickets = Array.from({ length: factor }, (_, i) =>
    data.tickets.map((t) => ({ ...t, accountId: `${t.accountId}-${i}` })),
  ).flat();
  return { ...data, accounts, tickets };
}

function medianDurationMs(fn: () => void, iterations = 5): number {
  const samples: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}

describe("budget de performance — computeAccountSummaries", () => {
  it("reste sous le budget mesuré (jeu amplifié ×40), avec comparaison avant/après", () => {
    const amplified = amplify(seed as SeedData, 40);
    const range: DateRange = { start: "2026-08-06", end: "2026-11-04" };
    const segment: Segment | "all" = "all";

    const naiveMedian = medianDurationMs(() => naiveComputeAccountSummaries(amplified, range));
    const optimizedMedian = medianDurationMs(() =>
      computeAccountSummaries(amplified, range, segment),
    );

    console.log(
      `[budget perf] computeAccountSummaries, jeu ×40 — avant: ${naiveMedian.toFixed(1)} ms (médiane/5), après: ${optimizedMedian.toFixed(1)} ms (médiane/5)`,
    );

    // Budget : reste sous 300 ms même sur un jeu 40x plus gros que le jeu
    // réel du projet — marge large pour ne pas rendre le test fragile
    // selon la machine. Valeurs réellement mesurées documentées dans
    // docs/06-audit-performance.md (pas une limite inventée après coup).
    expect(optimizedMedian).toBeLessThan(300);
  });
});
