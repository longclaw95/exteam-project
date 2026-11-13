import { render, screen } from "@testing-library/react";
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
});
