import { describe, expect, it } from "vitest";

import { computePeriodRanges } from "../dates";
import { compareWithPreviousPeriod } from "../kpi";
import type { SeedData, Ticket } from "../types";
import { computeCsatResponseRate } from "./csat-response-rate";
import seed from "@/data/seed.json";

const REFERENCE = "2026-11-04";
const { current: LAST_7_DAYS } = computePeriodRanges(REFERENCE, 7);

function dataWith(tickets: Ticket[]): SeedData {
  return { generatedFrom: "2026-08-07", generatedThrough: REFERENCE, accounts: [], tickets };
}

describe("computeCsatResponseRate (exemple d'extension du guide d'onboarding)", () => {
  it("retourne null quand aucun ticket n'est résolu — pas de division par zéro", () => {
    const data = dataWith([{ id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01" }]);
    expect(computeCsatResponseRate(data, LAST_7_DAYS)).toBeNull();
  });

  it("distingue un vrai 0 % (tickets résolus, aucune note) de l'absence de donnée", () => {
    const data = dataWith([
      { id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01", resolvedAt: "2026-11-02" },
    ]);
    expect(computeCsatResponseRate(data, LAST_7_DAYS)).toBe(0);
  });

  it("calcule la part des tickets résolus qui ont reçu une note", () => {
    const data = dataWith([
      { id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01", resolvedAt: "2026-11-02", csat: 4 },
      { id: "t2", accountId: "a2", segment: "smb", createdAt: "2026-11-01", resolvedAt: "2026-11-02" },
    ]);
    expect(computeCsatResponseRate(data, LAST_7_DAYS)).toBe(50);
  });

  it("ne compte pas un ticket résolu après la fin de la période", () => {
    const data = dataWith([
      { id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01", resolvedAt: "2026-11-02", csat: 5 },
      { id: "t2", accountId: "a2", segment: "smb", createdAt: "2026-11-03", resolvedAt: "2026-11-09", csat: 5 },
    ]);
    expect(computeCsatResponseRate(data, LAST_7_DAYS)).toBe(100);
  });

  it("respecte le filtre segment", () => {
    const data = dataWith([
      { id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01", resolvedAt: "2026-11-02", csat: 4 },
      { id: "t2", accountId: "a2", segment: "startup", createdAt: "2026-11-01", resolvedAt: "2026-11-02" },
    ]);
    expect(computeCsatResponseRate(data, LAST_7_DAYS, "startup")).toBe(0);
  });

  // Étape 3 du guide : la fonction se branche telle quelle sur le mécanisme
  // de comparaison existant, y compris la règle "hors couverture → null".
  it("se branche sur compareWithPreviousPeriod sans adaptation", () => {
    const data = seed as SeedData;
    const on30 = compareWithPreviousPeriod(data, REFERENCE, 30, "all", computeCsatResponseRate);
    expect(on30.current).toBeGreaterThanOrEqual(0);
    expect(on30.current).toBeLessThanOrEqual(100);
    expect(on30.previous).not.toBeNull();

    const on90 = compareWithPreviousPeriod(data, REFERENCE, 90, "all", computeCsatResponseRate);
    expect(on90.previous).toBeNull();
  });
});
