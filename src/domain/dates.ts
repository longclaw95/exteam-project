/**
 * Utilitaires de dates purs (pas de dépendance à l'horloge système : toute
 * fonction qui a besoin de "maintenant" le reçoit en paramètre explicite,
 * pour rester testable de façon déterministe).
 */

import type { DateRange, Period } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

export function diffInDays(a: string, b: string): number {
  return Math.round((toDate(a).getTime() - toDate(b).getTime()) / MS_PER_DAY);
}

/**
 * Calcule la période courante (inclusive, `period` jours se terminant à
 * `referenceDate` inclus) et la période précédente de même durée,
 * immédiatement avant.
 */
export function computePeriodRanges(
  referenceDate: string,
  period: Period,
): { current: DateRange; previous: DateRange } {
  const current: DateRange = {
    start: addDays(referenceDate, -(period - 1)),
    end: referenceDate,
  };
  const previous: DateRange = {
    start: addDays(current.start, -period),
    end: addDays(current.start, -1),
  };
  return { current, previous };
}

export function isWithinRange(iso: string, range: DateRange): boolean {
  return iso >= range.start && iso <= range.end;
}
