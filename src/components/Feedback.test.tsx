import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Feedback } from "./Feedback";

describe("Feedback", () => {
  it("affiche le message en texte, pas seulement via la couleur", () => {
    render(<Feedback tone="warning" message="Donnée partielle" />);
    expect(screen.getByText("Donnée partielle")).toBeInTheDocument();
  });

  it("utilise role=alert pour un message critique (annoncé immédiatement)", () => {
    render(<Feedback tone="critical" message="Erreur de chargement" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("utilise role=status (poli) pour les autres tons", () => {
    render(<Feedback tone="info" message="Données synthétiques" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
