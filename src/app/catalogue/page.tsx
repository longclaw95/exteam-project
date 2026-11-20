/**
 * Catalogue local des composants du design system (cf. docs/04-design-system.md
 * et le jalon "Catalogue de composants" de la semaine 2 — Storybook n'est pas
 * installé, une page locale suffit pour le périmètre du projet : cf. consigne
 * "pas de surenchère technique").
 *
 * Chaque section montre les variations utiles du composant (pas toutes les
 * combinaisons possibles — "éviter une abstraction prématurée").
 */

import { AccountsTable } from "@/components/AccountsTable";
import { EmptyState } from "@/components/EmptyState";
import { Feedback } from "@/components/Feedback";
import { KpiCard } from "@/components/KpiCard";
import { Select } from "@/components/Select";

function Section({
  title,
  props,
  usage,
  children,
}: {
  title: string;
  props: string;
  usage: string;
  children: React.ReactNode;
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
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Catalogue de composants — ProductPulse
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Page de référence pour un développeur qui reprend le projet : chaque
        composant, ses props essentielles et ses états limites.
      </p>

      <Section
        title="KpiCard"
        props="label, formattedValue, current, previous, deltaUnit?"
        usage="Affiche un indicateur et sa tendance. Gère les cas où la comparaison n'est pas possible (cf. docs/registre-ia.md)."
      >
        <KpiCard label="Comptes actifs" formattedValue="128" current={128} previous={110} deltaUnit="percent" />
        <KpiCard label="Taux de résolution" formattedValue="92 %" current={92} previous={92} deltaUnit="points" />
        <KpiCard label="Satisfaction" formattedValue="n/a" current={null} previous={null} deltaUnit="points" />
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
    </div>
  );
}
