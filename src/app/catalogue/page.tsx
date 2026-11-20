/**
 * Catalogue local des composants du design system (cf. docs/04-design-system.md
 * et le jalon "Catalogue de composants" de la semaine 2 — Storybook n'est pas
 * installé, une page locale suffit pour le périmètre du projet : cf. consigne
 * "pas de surenchère technique").
 *
 * Chaque section montre les variations utiles du composant (pas toutes les
 * combinaisons possibles — "éviter une abstraction prématurée").
 */

import type { ReactNode } from "react";
import Link from "next/link";

import { AccountsTable } from "@/components/AccountsTable";
import { ActivityChart } from "@/components/ActivityChart";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Feedback } from "@/components/Feedback";
import { KpiCard } from "@/components/KpiCard";
import { Select } from "@/components/Select";

const SAMPLE_POINTS = [
  { date: "2026-11-01", bySegment: { enterprise: 12, smb: 7, startup: 9 } },
  { date: "2026-11-02", bySegment: { enterprise: 14, smb: 8, startup: 8 } },
  { date: "2026-11-03", bySegment: { enterprise: 11, smb: 10, startup: 10 } },
  { date: "2026-11-04", bySegment: { enterprise: 13, smb: 9, startup: 9 } },
];

function Section({
  title,
  props,
  usage,
  children,
}: {
  title: string;
  props: string;
  usage: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{usage}</p>
      <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">{props}</p>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function CataloguePage() {
  return (
    <AppShell
      title="Catalogue de composants — ProductPulse"
      subtitle="Référence pour un développeur qui reprend le projet : chaque composant, ses props essentielles et ses états limites."
    >
      <Link href="/" className="text-sm text-[var(--color-series-1)] underline">
        ← Retour au tableau de bord
      </Link>

      <Section
        title="KpiCard"
        props="label, formattedValue, current, previous, deltaUnit?, polarity?"
        usage="Affiche un indicateur et sa tendance, toujours en texte. polarity='neutral' retire la couleur de jugement (ex. tickets créés). Gère les cas où la comparaison n'est pas possible (cf. docs/registre-ia.md)."
      >
        <KpiCard label="Comptes actifs" formattedValue="128" current={128} previous={110} deltaUnit="percent" />
        <KpiCard label="Tickets créés (polarité neutre)" formattedValue="40" current={40} previous={30} deltaUnit="percent" polarity="neutral" />
        <KpiCard label="Satisfaction (variation décimale)" formattedValue="4,1 / 5" current={4.1} previous={3.8} deltaUnit="points" />
        <KpiCard label="Taux de résolution" formattedValue="92 %" current={92} previous={92} deltaUnit="points" />
        <KpiCard label="Satisfaction (période précédente hors données)" formattedValue="4 / 5" current={4} previous={null} deltaUnit="points" />
      </Section>

      <Section
        title="ActivityChart"
        props="points: DailyActivityPoint[], segments: Segment[]"
        usage="Courbes par segment. Légende à partir de 2 séries ; échelle calculée sur les seules séries visibles ; la couleur suit le segment, pas son rang."
      >
        <ActivityChart points={SAMPLE_POINTS} segments={["enterprise", "smb", "startup"]} />
        <ActivityChart points={SAMPLE_POINTS} segments={["smb"]} />
      </Section>

      <Section
        title="Select"
        props="id, label, options, value, onChange?, disabled?"
        usage="Select natif accessible, toujours avec un label associé. Utilisé pour le filtre segment."
      >
        <Select
          id="catalogue-select-demo"
          label="Segment"
          value="all"
          options={[
            { value: "all", label: "Tous" },
            { value: "enterprise", label: "Enterprise" },
          ]}
        />
        <Select
          id="catalogue-select-disabled"
          label="Segment (désactivé)"
          value="all"
          disabled
          options={[{ value: "all", label: "Tous" }]}
        />
      </Section>

      <Section
        title="EmptyState"
        props="title, description?"
        usage="État vide générique, utilisé quand un filtre ne retourne aucune ligne."
      >
        <EmptyState
          title="Aucune donnée pour ce segment et cette période"
          description="Essayez une période plus longue ou un autre segment."
        />
      </Section>

      <Section
        title="Feedback"
        props="tone: info | good | warning | critical, message"
        usage="Bandeau de statut. La couleur n'est jamais le seul signal (icône + texte)."
      >
        <Feedback tone="info" message="Message d'information standard." />
        <Feedback tone="good" message="Opération réussie." />
        <Feedback tone="warning" message="Donnée partielle, à vérifier." />
        <Feedback tone="critical" message="Panne simulée (cf. /?error=1 sur le tableau de bord)." />
      </Section>

      <Section
        title="AccountsTable"
        props="rows: AccountSummaryRow[]"
        usage="Tableau triable au clic sur un en-tête (état local). Affiche EmptyState si rows est vide, 'n/a' (jamais NaN) si la CSAT est absente."
      >
        <AccountsTable
          rows={[
            { accountId: "a1", segment: "enterprise", ticketsCount: 5, averageCsat: 4.2, activeDaysCount: 12 },
            { accountId: "a2", segment: "smb", ticketsCount: 1, averageCsat: null, activeDaysCount: 3 },
          ]}
        />
        <AccountsTable rows={[]} />
      </Section>
    </AppShell>
  );
}
