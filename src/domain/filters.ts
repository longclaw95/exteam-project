/**
 * Lecture des filtres depuis les search params d'URL (cf. ADR-001).
 * Toute valeur absente ou invalide retombe sur un défaut, plutôt que de
 * planter ou de propager une valeur incohérente aux calculs de KPIs.
 */

import { SEGMENTS } from "./types";
import type { Period, Segment } from "./types";

export type SegmentFilterValue = Segment | "all";

const VALID_PERIODS: readonly Period[] = [7, 30, 90];

export function parsePeriod(raw: string | string[] | undefined): Period {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return VALID_PERIODS.includes(parsed as Period) ? (parsed as Period) : 30;
}

export function parseSegment(raw: string | string[] | undefined): SegmentFilterValue {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "all" || (SEGMENTS as readonly string[]).includes(value ?? "")
    ? (value as SegmentFilterValue)
    : "all";
}
