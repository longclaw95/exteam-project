import { Suspense } from "react";

import { AccountsTable } from "@/components/AccountsTable";
import { ActivityChart } from "@/components/ActivityChart";
import { AppShell } from "@/components/AppShell";
import { Feedback } from "@/components/Feedback";
import { FilterBar } from "@/components/FilterBar";
import { KpiCard } from "@/components/KpiCard";
import { computeAccountSummaries } from "@/domain/account-summaries";
import { computePeriodRanges } from "@/domain/dates";
import { parsePeriod, parseSegment } from "@/domain/filters";
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

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <AppShell title="ProductPulse" subtitle="Filtrez par période et par segment ci-dessous">
      <Feedback
        tone="info"
        message="Démonstrateur sur données synthétiques — aucune donnée client réelle."
      />
      <Suspense fallback={<p className="mt-6 text-sm text-[var(--color-text-muted)]">Chargement…</p>}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </AppShell>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const segment = parseSegment(params.segment);

  // `error=1` simule une panne de chargement (ex. API indisponible), demandée
  // par le brief ("états vide/chargement/erreur simulés"). Pas de vraie
  // source de données distante dans ce projet, donc c'est la seule façon
  // honnête de montrer l'état d'erreur sans en inventer la cause.
  if (params.error === "1") {
    const retryParams = new URLSearchParams({ period: String(period), segment });
    return (
      <>
        <FilterBar period={period} segment={segment} />
        <div className="mt-6">
          <Feedback
            tone="critical"
            message="Impossible de charger les données du tableau de bord (panne simulée). Réessayez."
          />
          <a
            href={`/?${retryParams.toString()}`}
            className="mt-2 inline-block text-sm text-[var(--color-series-1)] underline"
          >
            Réessayer
          </a>
        </div>
      </>
    );
  }

  const kpis = computeDashboardKpis(data, data.generatedThrough, period, segment);
  const { current } = computePeriodRanges(data.generatedThrough, period);
  const activitySeries = computeDailyActivitySeries(data, current);
  const accountRows = computeAccountSummaries(data, current, segment);

  const errorDemoParams = new URLSearchParams({ period: String(period), segment, error: "1" });

  return (
    <>
      <FilterBar period={period} segment={segment} />
      <a
        href={`/?${errorDemoParams.toString()}`}
        className="mt-2 inline-block text-xs text-[var(--color-text-muted)] underline"
      >
        Simuler une erreur de chargement (démo)
      </a>

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
    </>
  );
}
