import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

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
    expect(screen.getByText("4.5 / 5")).toBeInTheDocument();
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
});
