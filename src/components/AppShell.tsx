/**
 * Ossature commune de l'application : en-tête + zone de contenu.
 * Centralise le titre et le sous-titre pour que toutes les pages aient la
 * même structure de navigation (une seule page pour l'instant, mais le
 * composant évite de dupliquer le markup d'en-tête si une 2e page arrive).
 */

import type { ReactNode } from "react";

export interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-page)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
