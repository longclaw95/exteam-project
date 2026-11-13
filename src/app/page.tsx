import { AccountsTable } from "@/components/AccountsTable";
import { ActivityChart } from "@/components/ActivityChart";
import { AppShell } from "@/components/AppShell";
import { Feedback } from "@/components/Feedback";
import { KpiCard } from "@/components/KpiCard";
import { Select } from "@/components/Select";
import { computeAccountSummaries } from "@/domain/account-summaries";
import { computePeriodRanges } from "@/domain/dates";
import { computeDashboardKpis } from "@/domain/kpi";
import { computeDailyActivitySeries } from "@/domain/timeseries";
import seed from "@/data/seed.json";
import type { SeedData } from "@/domain/types";

const data = seed as SeedData;

function formatInteger(value: number | null): string {
  if (value === null) return "n/a";
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "n/a" : `${value} %`;
}

function formatCsat(value: number | null): string {
  return value === null ? "n/a" : `${value.toLocaleString("fr-FR")} / 5`;
}

export default function Home() {
  // Période par défaut : 30 jours, tous segments. Les boutons de période et
  // le select de segment ci-dessous sont visuels pour l'instant : le
  // branchement aux filtres d'URL (ADR-001) arrive semaine 2.
  const period = 30;
  const kpis = computeDashboardKpis(data, data.generatedThrough, period, "all");
  const { current } = computePeriodRanges(data.generatedThrough, period);
  const activitySeries = computeDailyActivitySeries(data, current);
  const accountRows = computeAccountSummaries(data, current, "all");

  return (
    <AppShell title="ProductPulse" subtitle="Vue d'ensemble — 30 derniers jours, tous segments">
      <Feedback
        tone="info"
        message="Démonstrateur sur données synthétiques — aucune donnée client réelle."
      />

      <div className="mt-6 flex flex-wrap items-end gap-6">
        <fieldset className="flex items-end gap-2" disabled>
          <legend className="sr-only">Période</legend>
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={value === period}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm aria-pressed:bg-[var(--color-series-1)] aria-pressed:text-white"
            >
              {value}j
            </button>
          ))}
        </fieldset>
        <Select
          id="segment-filter"
          label="Segment"
          value="all"
          disabled
          options={[
            { value: "all", label: "Tous" },
            { value: "enterprise", label: "Enterprise" },
            { value: "smb", label: "PME" },
            { value: "startup", label: "Startup" },
          ]}
        />
        <p className="text-xs text-[var(--color-text-muted)]">
          Filtres interactifs : semaine 2
        </p>
      </div>

      <section aria-label="Indicateurs clés" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Comptes actifs"
          formattedValue={formatInteger(kpis.activeAccounts.current)}
          current={kpis.activeAccounts.current}
          previous={kpis.activeAccounts.previous}
          deltaUnit="percent"
        />
        <KpiCard
          label="Tickets créés"
          formattedValue={formatInteger(kpis.ticketsCreated.current)}
          current={kpis.ticketsCreated.current}
          previous={kpis.ticketsCreated.previous}
          deltaUnit="percent"
        />
        <KpiCard
          label="Taux de résolution"
          formattedValue={formatPercent(kpis.resolutionRate.current)}
          current={kpis.resolutionRate.current}
          previous={kpis.resolutionRate.previous}
          deltaUnit="points"
        />
        <KpiCard
          label="Satisfaction (CSAT)"
          formattedValue={formatCsat(kpis.csat.current)}
          current={kpis.csat.current}
          previous={kpis.csat.previous}
          deltaUnit="points"
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Évolution dans le temps
        </h2>
        <ActivityChart points={activitySeries} />
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Comptes par segment
        </h2>
        <AccountsTable rows={accountRows} />
      </section>

      <p className="mt-8 text-sm text-[var(--color-text-muted)]">
        Tri du tableau et filtres synchronisés : à venir semaine 2 (cf.
        docs/adr/0001-gestion-etat-filtres.md).
      </p>
    </AppShell>
  );
}
