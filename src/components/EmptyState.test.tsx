import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("affiche le titre et, s'il est fourni, la description", () => {
    render(<EmptyState title="Aucune donnée" description="Essayez un autre filtre." />);
    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
    expect(screen.getByText("Essayez un autre filtre.")).toBeInTheDocument();
  });

  it("est annoncé par un lecteur d'écran via role=status", () => {
    render(<EmptyState title="Aucune donnée" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
