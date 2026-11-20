import Link from "next/link";
import { Suspense } from "react";

import { AccountsTable } from "@/components/AccountsTable";
import { ActivityChart } from "@/components/ActivityChart";
import { AppShell } from "@/components/AppShell";
import { Feedback } from "@/components/Feedback";
import { FilterBar } from "@/components/FilterBar";
import { KpiCard } from "@/components/KpiCard";
import type { KpiPolarity } from "@/components/KpiCard";
import { computeAccountSummaries } from "@/domain/account-summaries";
import { computePeriodRanges } from "@/domain/dates";
import { parsePeriod, parseSegment } from "@/domain/filters";
import { computeDashboardKpis } from "@/domain/kpi";
import { computeDailyActivitySeries } from "@/domain/timeseries";
import seed from "@/data/seed.json";
import type { DashboardKpis } from "@/domain/kpi";
import { SEGMENTS } from "@/domain/types";
import type { Period, SeedData } from "@/domain/types";
import type { SegmentFilterValue } from "@/domain/filters";

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

const SEGMENT_SCOPE_LABEL: Record<SegmentFilterValue, string> = {
  all: "tous segments",
  enterprise: "segment Enterprise",
  smb: "segment PME",
  startup: "segment Startup",
};

// Config déclarative des 4 cartes KPI (cf. ADR-002, docs/adr/0002-refactor-dashboard.md) :
// remplace 4 blocs JSX quasi identiques par une boucle sur cette liste.
const KPI_CONFIG: {
  key: keyof DashboardKpis;
  label: string;
  format: (value: number | null) => string;
  deltaUnit: "points" | "percent";
  polarity: KpiPolarity;
}[] = [
  { key: "activeAccounts", label: "Comptes actifs", format: formatInteger, deltaUnit: "percent", polarity: "higher-is-better" },
  // Neutre : plus de tickets peut signifier plus d'usage autant qu'un problème (note de cadrage § 3).
  { key: "ticketsCreated", label: "Tickets créés", format: formatInteger, deltaUnit: "percent", polarity: "neutral" },
  { key: "resolutionRate", label: "Taux de résolution", format: formatPercent, deltaUnit: "points", polarity: "higher-is-better" },
  { key: "csat", label: "Satisfaction (CSAT)", format: formatCsat, deltaUnit: "points", polarity: "higher-is-better" },
];

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
    return <DashboardError period={period} segment={segment} />;
  }

  const kpis = computeDashboardKpis(data, data.generatedThrough, period, segment);
  const { current } = computePeriodRanges(data.generatedThrough, period);
  const activitySeries = computeDailyActivitySeries(data, current);
  const accountRows = computeAccountSummaries(data, current, segment);

  const errorDemoParams = new URLSearchParams({ period: String(period), segment, error: "1" });

  return (
    <>
      <FilterBar period={period} segment={segment} />
      <Link
        href={`/?${errorDemoParams.toString()}`}
        className="mt-2 inline-block text-xs text-[var(--color-text-muted)] underline"
      >
        Simuler une erreur de chargement (démo)
      </Link>
      {/*
        Région live : annonce le résultat du filtrage aux technologies
        d'assistance. Sans ça, un changement de période/segment ne met à
        jour les chiffres qu'à l'écran — un utilisateur de lecteur d'écran
        ne serait pas informé que le contenu a changé (cf. docs/05-audit-accessibilite.md).
      */}
      <p className="sr-only" aria-live="polite">
        Période {period} jours, {SEGMENT_SCOPE_LABEL[segment]} : {accountRows.length} compte
        {accountRows.length > 1 ? "s" : ""} affiché{accountRows.length > 1 ? "s" : ""}.
      </p>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Indicateurs clés
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_CONFIG.map(({ key, label, format, deltaUnit, polarity }) => {
            const comparison = kpis[key];
            return (
              <KpiCard
                key={key}
                label={label}
                formattedValue={format(comparison.current)}
                current={comparison.current}
                previous={comparison.previous}
                deltaUnit={deltaUnit}
                polarity={polarity}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Évolution dans le temps
        </h2>
        <ActivityChart points={activitySeries} segments={segment === "all" ? SEGMENTS : [segment]} />
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

function DashboardError({ period, segment }: { period: Period; segment: SegmentFilterValue }) {
  const retryParams = new URLSearchParams({ period: String(period), segment });
  return (
    <>
      <FilterBar period={period} segment={segment} />
      <div className="mt-6">
        <Feedback
          tone="critical"
          message="Impossible de charger les données du tableau de bord (panne simulée). Réessayez."
        />
        <Link
          href={`/?${retryParams.toString()}`}
          className="mt-2 inline-block text-sm text-[var(--color-series-1)] underline"
        >
          Réessayer
        </Link>
      </div>
    </>
  );
}
