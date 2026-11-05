import { describe, expect, it } from "vitest";

import { computePeriodRanges } from "./dates";
import {
  computeCsat,
  computeDashboardKpis,
  computeResolutionRate,
  countActiveAccounts,
  countTicketsCreated,
} from "./kpi";
import type { SeedData } from "./types";

const REFERENCE = "2026-11-04";

function makeData(overrides: Partial<SeedData> = {}): SeedData {
  return {
    generatedThrough: REFERENCE,
    accounts: [],
    tickets: [],
    ...overrides,
  };
}

describe("computePeriodRanges", () => {
  it("construit une période de 7 jours inclusive se terminant à la date de référence", () => {
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(current).toEqual({ start: "2026-10-29", end: "2026-11-04" });
  });

  it("construit la période précédente immédiatement avant, de même durée", () => {
    const { previous } = computePeriodRanges(REFERENCE, 7);
    expect(previous).toEqual({ start: "2026-10-22", end: "2026-10-28" });
  });
});

describe("countActiveAccounts", () => {
  it("dédoublonne un compte actif plusieurs jours dans la période", () => {
    const data = makeData({
      accounts: [
        {
          id: "a1",
          segment: "smb",
          createdAt: "2026-01-01",
          activeDates: ["2026-11-01", "2026-11-02", "2026-11-03"],
        },
      ],
    });
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(countActiveAccounts(data, current, "all")).toBe(1);
  });

  it("retourne 0 sans erreur quand le segment ne contient aucun compte", () => {
    const data = makeData({
      accounts: [
        { id: "a1", segment: "enterprise", createdAt: "2026-01-01", activeDates: ["2026-11-01"] },
      ],
    });
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(countActiveAccounts(data, current, "startup")).toBe(0);
  });

  it("ignore l'activité d'un compte en dehors de la période", () => {
    const data = makeData({
      accounts: [
        { id: "a1", segment: "smb", createdAt: "2026-01-01", activeDates: ["2026-01-05"] },
      ],
    });
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(countActiveAccounts(data, current, "all")).toBe(0);
  });
});

describe("countTicketsCreated", () => {
  it("compte les tickets créés dans la période pour le segment demandé", () => {
    const data = makeData({
      tickets: [
        { id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01" },
        { id: "t2", accountId: "a2", segment: "enterprise", createdAt: "2026-11-01" },
      ],
    });
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(countTicketsCreated(data, current, "smb")).toBe(1);
  });
});

describe("computeResolutionRate — cas limites", () => {
  it("retourne null quand aucun ticket n'a été créé sur la période (pas de division par zéro)", () => {
    const data = makeData({ tickets: [] });
    const { current } = computePeriodRanges(REFERENCE, 30);
    expect(computeResolutionRate(data, current, "all")).toBeNull();
  });

  it("calcule le taux correctement quand des tickets existent", () => {
    const data = makeData({
      tickets: [
        { id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01", resolvedAt: "2026-11-02" },
        { id: "t2", accountId: "a2", segment: "smb", createdAt: "2026-11-01" },
      ],
    });
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(computeResolutionRate(data, current, "all")).toBe(50);
  });

  it("ne compte pas un ticket résolu après la fin de la période comme résolu", () => {
    const data = makeData({
      tickets: [
        {
          id: "t1",
          accountId: "a1",
          segment: "smb",
          createdAt: "2026-10-30",
          resolvedAt: "2026-11-10", // après la fin de la période de 7 jours
        },
      ],
    });
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(computeResolutionRate(data, current, "all")).toBe(0);
  });
});

describe("computeCsat — cas limites", () => {
  it("retourne null quand aucune note n'a été laissée (pas de NaN)", () => {
    const data = makeData({
      tickets: [{ id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01" }],
    });
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(computeCsat(data, current, "all")).toBeNull();
  });

  it("calcule la moyenne arrondie à 1 décimale", () => {
    const data = makeData({
      tickets: [
        { id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01", csat: 4 },
        { id: "t2", accountId: "a2", segment: "smb", createdAt: "2026-11-01", csat: 5 },
        { id: "t3", accountId: "a3", segment: "smb", createdAt: "2026-11-01", csat: 3 },
      ],
    });
    const { current } = computePeriodRanges(REFERENCE, 7);
    expect(computeCsat(data, current, "all")).toBe(4);
  });
});

describe("computeDashboardKpis", () => {
  it("retourne les 4 indicateurs avec comparaison période précédente, même sur un jeu de données vide", () => {
    const data = makeData();
    const result = computeDashboardKpis(data, REFERENCE, 30, "all");
    expect(result.activeAccounts).toEqual({ current: 0, previous: 0 });
    expect(result.ticketsCreated).toEqual({ current: 0, previous: 0 });
    expect(result.resolutionRate).toEqual({ current: null, previous: null });
    expect(result.csat).toEqual({ current: null, previous: null });
  });
});
