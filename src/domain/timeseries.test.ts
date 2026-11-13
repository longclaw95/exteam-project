import { describe, expect, it } from "vitest";

import { computeDailyActivitySeries } from "./timeseries";
import type { SeedData } from "./types";

describe("computeDailyActivitySeries", () => {
  it("retourne un point par jour de la période, même sans donnée", () => {
    const data: SeedData = { generatedThrough: "2026-11-04", accounts: [], tickets: [] };
    const points = computeDailyActivitySeries(data, { start: "2026-11-01", end: "2026-11-03" });
    expect(points).toHaveLength(3);
    expect(points[0]).toEqual({
      date: "2026-11-01",
      bySegment: { enterprise: 0, smb: 0, startup: 0 },
    });
  });

  it("compte un compte actif plusieurs jours dans chacun des points concernés (pas dédoubliconné sur la série)", () => {
    const data: SeedData = {
      generatedThrough: "2026-11-04",
      accounts: [
        {
          id: "a1",
          segment: "smb",
          createdAt: "2026-01-01",
          activeDates: ["2026-11-01", "2026-11-02"],
        },
      ],
      tickets: [],
    };
    const points = computeDailyActivitySeries(data, { start: "2026-11-01", end: "2026-11-02" });
    expect(points[0].bySegment.smb).toBe(1);
    expect(points[1].bySegment.smb).toBe(1);
  });

  it("ignore une activité en dehors de la période demandée", () => {
    const data: SeedData = {
      generatedThrough: "2026-11-04",
      accounts: [
        { id: "a1", segment: "startup", createdAt: "2026-01-01", activeDates: ["2026-10-01"] },
      ],
      tickets: [],
    };
    const points = computeDailyActivitySeries(data, { start: "2026-11-01", end: "2026-11-02" });
    expect(points.every((p) => p.bySegment.startup === 0)).toBe(true);
  });
});
