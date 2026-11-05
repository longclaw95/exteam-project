import { KpiCard } from "@/components/KpiCard";
import { computeDashboardKpis } from "@/domain/kpi";
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
  // Période par défaut : 30 jours, tous segments. Les filtres interactifs
  // (7/30/90j, segment, via l'URL — cf. ADR-001) arrivent en semaine 2.
  const kpis = computeDashboardKpis(data, data.generatedThrough, 30, "all");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          ProductPulse
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Vue d&apos;ensemble — 30 derniers jours, tous segments
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <section
          aria-label="Indicateurs clés"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
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

        <p className="mt-8 text-sm text-slate-400 dark:text-slate-600">
          Filtres de période/segment, graphique et tableau triable : à venir
          semaine 2 (cf. docs/adr/0001-gestion-etat-filtres.md).
        </p>
      </main>
    </div>
  );
}
