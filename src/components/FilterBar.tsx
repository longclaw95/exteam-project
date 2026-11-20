"use client";

/**
 * Filtres globaux (période, segment), branchés sur l'URL (cf. ADR-001 :
 * docs/adr/0001-gestion-etat-filtres.md). Un changement pousse une nouvelle
 * URL via le router — c'est Next.js qui redéclenche le rendu côté serveur
 * avec les nouveaux searchParams, pas un état local dupliqué ici.
 */

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select } from "./Select";
import { SEGMENTS } from "@/domain/types";
import type { Period, Segment } from "@/domain/types";
import type { SegmentFilterValue } from "@/domain/filters";

const PERIODS: Period[] = [7, 30, 90];

const SEGMENT_LABEL: Record<Segment, string> = {
  enterprise: "Enterprise",
  smb: "PME",
  startup: "Startup",
};

export interface FilterBarProps {
  period: Period;
  segment: SegmentFilterValue;
}

export function FilterBar({ period, segment }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(next: { period?: Period; segment?: SegmentFilterValue }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", String(next.period ?? period));
    params.set("segment", next.segment ?? segment);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mt-6 flex flex-wrap items-end gap-6">
      <fieldset className="flex items-end gap-2">
        <legend className="sr-only">Période</legend>
        {PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={value === period}
            onClick={() => navigate({ period: value })}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm aria-pressed:bg-[var(--color-series-1)] aria-pressed:text-white"
          >
            {value}j
          </button>
        ))}
      </fieldset>
      <Select
        id="segment-filter"
        label="Segment"
        value={segment}
        onChange={(value) => navigate({ segment: value as SegmentFilterValue })}
        options={[
          { value: "all", label: "Tous" },
          ...SEGMENTS.map((s) => ({ value: s, label: SEGMENT_LABEL[s] })),
        ]}
      />
    </div>
  );
}
