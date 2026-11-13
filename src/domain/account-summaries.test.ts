import { describe, expect, it } from "vitest";

import { computeAccountSummaries } from "./account-summaries";
import type { SeedData } from "./types";

const RANGE = { start: "2026-11-01", end: "2026-11-07" };

function makeData(overrides: Partial<SeedData> = {}): SeedData {
  return { generatedThrough: "2026-11-07", accounts: [], tickets: [], ...overrides };
}

describe("computeAccountSummaries", () => {
  it("exclut les comptes sans aucun signal sur la période", () => {
    const data = makeData({
      accounts: [
        { id: "a1", segment: "smb", createdAt: "2026-01-01", activeDates: ["2026-01-01"] },
      ],
    });
    expect(computeAccountSummaries(data, RANGE, "all")).toHaveLength(0);
  });

  it("calcule le nombre de jours actifs et de tickets sur la période", () => {
    const data = makeData({
      accounts: [
        {
          id: "a1",
          segment: "enterprise",
          createdAt: "2026-01-01",
          activeDates: ["2026-11-01", "2026-11-02"],
        },
      ],
      tickets: [
        { id: "t1", accountId: "a1", segment: "enterprise", createdAt: "2026-11-02", csat: 4 },
      ],
    });
    const [row] = computeAccountSummaries(data, RANGE, "all");
    expect(row).toEqual({
      accountId: "a1",
      segment: "enterprise",
      ticketsCount: 1,
      averageCsat: 4,
      activeDaysCount: 2,
    });
  });

  it("retourne null pour la CSAT moyenne quand aucune note n'existe (pas de NaN)", () => {
    const data = makeData({
      accounts: [
        { id: "a1", segment: "smb", createdAt: "2026-01-01", activeDates: ["2026-11-01"] },
      ],
      tickets: [{ id: "t1", accountId: "a1", segment: "smb", createdAt: "2026-11-01" }],
    });
    const [row] = computeAccountSummaries(data, RANGE, "all");
    expect(row.averageCsat).toBeNull();
  });

  it("trie par nombre de tickets décroissant", () => {
    const data = makeData({
      accounts: [
        { id: "a1", segment: "smb", createdAt: "2026-01-01", activeDates: ["2026-11-01"] },
        { id: "a2", segment: "smb", createdAt: "2026-01-01", activeDates: ["2026-11-01"] },
      ],
      tickets: [
        { id: "t1", accountId: "a2", segment: "smb", createdAt: "2026-11-01" },
        { id: "t2", accountId: "a2", segment: "smb", createdAt: "2026-11-01" },
        { id: "t3", accountId: "a1", segment: "smb", createdAt: "2026-11-01" },
      ],
    });
    const rows = computeAccountSummaries(data, RANGE, "all");
    expect(rows.map((r) => r.accountId)).toEqual(["a2", "a1"]);
  });
});
