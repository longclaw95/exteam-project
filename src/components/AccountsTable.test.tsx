import { Profiler } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountsTable } from "./AccountsTable";

describe("AccountsTable", () => {
  it("affiche un état vide quand il n'y a aucune ligne", () => {
    render(<AccountsTable rows={[]} />);
    expect(screen.getByText(/Aucune donnée/)).toBeInTheDocument();
  });

  it("affiche n/a pour la CSAT quand elle est absente, jamais NaN", () => {
    render(
      <AccountsTable
        rows={[
          { accountId: "a1", segment: "smb", ticketsCount: 2, averageCsat: null, activeDaysCount: 5 },
        ]}
      />,
    );
    expect(screen.getByText("n/a")).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("affiche les lignes fournies", () => {
    render(
      <AccountsTable
        rows={[
          { accountId: "a1", segment: "enterprise", ticketsCount: 3, averageCsat: 4.5, activeDaysCount: 10 },
        ]}
      />,
    );
    expect(screen.getByText("a1")).toBeInTheDocument();
    // Même format que les cartes KPI (« 4,1 / 5 ») — anomalie trouvée en recette.
    expect(screen.getByText("4,5 / 5")).toBeInTheDocument();
  });

  it("trie par colonne au clic sur l'en-tête, dans les deux sens", async () => {
    const user = userEvent.setup();
    render(
      <AccountsTable
        rows={[
          { accountId: "b2", segment: "smb", ticketsCount: 1, averageCsat: null, activeDaysCount: 3 },
          { accountId: "a1", segment: "enterprise", ticketsCount: 5, averageCsat: 4, activeDaysCount: 9 },
        ]}
      />,
    );

    const rowsText = () => screen.getAllByRole("row").slice(1).map((r) => r.textContent ?? "");

    // Ordre par défaut : tickets décroissant -> a1 (5) avant b2 (1).
    expect(rowsText()[0]).toContain("a1");

    // 1er clic sur "Compte" : tri alphabétique décroissant -> b2 avant a1.
    await user.click(screen.getByRole("button", { name: /Compte/ }));
    expect(rowsText()[0]).toContain("b2");

    // 2e clic : inverse le sens -> a1 avant b2.
    await user.click(screen.getByRole("button", { name: /Compte/ }));
    expect(rowsText()[0]).toContain("a1");
  });

  // Preuve d'utilisabilité clavier (audit accessibilité S3) : le tri ne
  // dépend pas de la souris, "Entrée" sur un en-tête focalisé suffit.
  it("le tri est déclenchable au clavier et aria-sort reflète l'état", async () => {
    const user = userEvent.setup();
    render(
      <AccountsTable
        rows={[
          { accountId: "b2", segment: "smb", ticketsCount: 1, averageCsat: null, activeDaysCount: 3 },
          { accountId: "a1", segment: "enterprise", ticketsCount: 5, averageCsat: 4, activeDaysCount: 9 },
        ]}
      />,
    );

    const compteHeader = screen.getByRole("columnheader", { name: /Compte/ });
    expect(compteHeader).toHaveAttribute("aria-sort", "none");

    screen.getByRole("button", { name: /Compte/ }).focus();
    await user.keyboard("{Enter}");

    expect(compteHeader).toHaveAttribute("aria-sort", "descending");
    expect(screen.getAllByRole("row")[1].textContent ?? "").toContain("b2");
  });

  it("annonce le tri courant dans une région live (lecteur d'écran)", async () => {
    const user = userEvent.setup();
    render(
      <AccountsTable
        rows={[
          { accountId: "a1", segment: "enterprise", ticketsCount: 5, averageCsat: 4, activeDaysCount: 9 },
        ]}
      />,
    );

    expect(screen.getByText(/Trié par Tickets, ordre décroissant/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Compte/ }));
    expect(screen.getByText(/Trié par Compte, ordre décroissant/)).toBeInTheDocument();
  });

  // Budget de performance n°3 (cf. docs/06-audit-performance.md) : un clic
  // de tri ne doit déclencher qu'un seul re-rendu du tableau, pas une
  // cascade. <Profiler> compte les rendus réels de React, pas une
  // approximation.
  it("un tri déclenche exactement un seul re-rendu (budget perf n°3)", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();

    render(
      <Profiler id="accounts-table" onRender={onRender}>
        <AccountsTable
          rows={[
            { accountId: "a1", segment: "enterprise", ticketsCount: 5, averageCsat: 4, activeDaysCount: 9 },
            { accountId: "b2", segment: "smb", ticketsCount: 1, averageCsat: null, activeDaysCount: 3 },
          ]}
        />
      </Profiler>,
    );
    onRender.mockClear(); // on ne mesure que le re-rendu déclenché par le tri, pas le montage initial.

    await user.click(screen.getByRole("button", { name: /Compte/ }));

    expect(onRender).toHaveBeenCalledTimes(1);
  });
});
