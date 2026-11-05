import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { computeTrend, KpiCard } from "./KpiCard";

describe("computeTrend — régression sur le bug IA (division par previous = 0)", () => {
  it("ne produit pas Infinity% quand previous vaut 0 et current > 0", () => {
    const trend = computeTrend(5, 0, "percent");
    expect(trend.label).not.toMatch(/Infinity/);
    expect(trend.label).not.toMatch(/NaN/);
    expect(trend.direction).toBe("up");
  });

  it("affiche 'stable' sans erreur quand previous et current valent 0", () => {
    const trend = computeTrend(0, 0, "percent");
    expect(trend.direction).toBe("flat");
  });

  it("affiche un message explicite quand current ou previous est null (ex. CSAT sans donnée)", () => {
    expect(computeTrend(null, 4, "percent").direction).toBe("unavailable");
    expect(computeTrend(4, null, "percent").direction).toBe("unavailable");
  });

  it("calcule correctement une variation en points (taux de résolution)", () => {
    const trend = computeTrend(80, 75, "points");
    expect(trend.label).toContain("Hausse de 5 points");
  });
});

describe("KpiCard — accessibilité de la tendance", () => {
  it("affiche la tendance en texte, pas seulement via la couleur", () => {
    render(
      <KpiCard
        label="Comptes actifs"
        formattedValue="1 284"
        current={1284}
        previous={1200}
        deltaUnit="percent"
      />,
    );
    // Le texte de tendance doit être lisible indépendamment de la couleur.
    expect(screen.getByText(/vs période précédente/)).toBeInTheDocument();
  });

  it("n'affiche jamais Infinity ou NaN à l'écran, même sur des données limites", () => {
    render(
      <KpiCard
        label="Taux de résolution"
        formattedValue="n/a"
        current={null}
        previous={null}
        deltaUnit="points"
      />,
    );
    expect(screen.queryByText(/Infinity/)).not.toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.getByText("Pas de comparaison disponible")).toBeInTheDocument();
  });
});
