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

describe("computeTrend — formatage (bugs trouvés à l'audit pré-S4)", () => {
  // Visible sur la vue par défaut (30j, tous segments) : CSAT 3.8 → 4.1
  // affichait "Hausse de 0.2999999999999998 points".
  it("n'affiche jamais d'artefact de virgule flottante sur une variation en points", () => {
    expect(computeTrend(4.1, 3.8, "points").label).toBe("Hausse de 0,3 point vs période précédente");
    expect(computeTrend(4.1, 4.2, "points").label).toBe("Baisse de 0,1 point vs période précédente");
  });

  it("accorde 'point' au singulier sous 2 et au pluriel à partir de 2", () => {
    expect(computeTrend(4.5, 3, "points").label).toBe("Hausse de 1,5 point vs période précédente");
    expect(computeTrend(80, 78, "points").label).toBe("Hausse de 2 points vs période précédente");
  });

  // Une variation de +0,1 % arrondie à l'entier donnait "Hausse de 0%" :
  // une hausse annoncée de zéro, contradictoire et trompeuse.
  it("considère comme stable une variation relative qui s'arrondit à 0 %", () => {
    const trend = computeTrend(1001, 1000, "percent");
    expect(trend.direction).toBe("flat");
    expect(trend.label).toBe("Stable vs période précédente");
  });

  it("formate le pourcentage avec une espace, comme les valeurs affichées (« 12 % »)", () => {
    expect(computeTrend(112, 100, "percent").label).toBe("Hausse de 12 % vs période précédente");
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

describe("KpiCard — polarité de l'indicateur (note de cadrage § 3)", () => {
  // La note de cadrage précise que « plus de tickets créés n'est pas
  // automatiquement négatif » : une hausse ne doit pas être peinte en
  // vert/rouge pour un indicateur dont le sens dépend du contexte.
  it("ne colore pas en 'positif' une hausse d'un indicateur neutre", () => {
    render(
      <KpiCard
        label="Tickets créés"
        formattedValue="40"
        current={40}
        previous={30}
        deltaUnit="percent"
        polarity="neutral"
      />,
    );
    expect(screen.getByText(/Hausse de 33 %/)).toHaveAttribute("data-tone", "neutral");
  });

  it("colore une baisse en 'négatif' pour un indicateur où plus haut = mieux", () => {
    render(
      <KpiCard
        label="Satisfaction"
        formattedValue="3,8 / 5"
        current={3.8}
        previous={4.3}
        deltaUnit="points"
      />,
    );
    expect(screen.getByText(/Baisse de 0,5 point/)).toHaveAttribute("data-tone", "negative");
  });
});
