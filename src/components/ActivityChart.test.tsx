import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActivityChart, spreadLabels } from "./ActivityChart";
import type { DailyActivityPoint } from "@/domain/timeseries";

const POINTS: DailyActivityPoint[] = [
  { date: "2026-11-01", bySegment: { enterprise: 40, smb: 2, startup: 5 } },
  { date: "2026-11-02", bySegment: { enterprise: 38, smb: 4, startup: 6 } },
];

describe("ActivityChart — synchronisation avec le filtre segment", () => {
  // Bug trouvé à l'audit pré-S4 : le graphique traçait toujours les 3
  // segments, même avec un segment sélectionné (story P0 n°4 non respectée).
  it("ne trace que la série du segment sélectionné", () => {
    const { container } = render(<ActivityChart points={POINTS} segments={["smb"]} />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(screen.queryByText("Enterprise")).not.toBeInTheDocument();
    expect(screen.getByText("PME")).toBeInTheDocument();
  });

  it("trace les 3 séries avec une légende quand tous les segments sont affichés", () => {
    const { container } = render(
      <ActivityChart points={POINTS} segments={["enterprise", "smb", "startup"]} />,
    );
    expect(container.querySelectorAll("path")).toHaveLength(3);
    expect(container.querySelector("figcaption")).toBeInTheDocument();
  });

  it("n'affiche pas de légende pour une série unique (le libellé direct suffit)", () => {
    const { container } = render(<ActivityChart points={POINTS} segments={["smb"]} />);
    expect(container.querySelector("figcaption")).not.toBeInTheDocument();
  });

  // L'échelle doit suivre les séries visibles : sinon la courbe PME (max 4)
  // serait écrasée en bas par l'échelle d'Enterprise (max 40), masquée.
  it("adapte l'échelle verticale aux seules séries visibles", () => {
    const { container } = render(<ActivityChart points={POINTS} segments={["smb"]} />);
    const d = container.querySelector("path")?.getAttribute("d") ?? "";
    const ys = [...d.matchAll(/[ML] [\d.]+ ([\d.]+)/g)].map((m) => Number(m[1]));
    expect(Math.min(...ys)).toBe(16); // max de PME = haut de la zone de tracé
  });

  it("décrit les séries affichées dans le texte alternatif", () => {
    render(<ActivityChart points={POINTS} segments={["smb"]} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(/PME/);
  });
});

describe("spreadLabels — libellés directs sans chevauchement", () => {
  it("écarte deux libellés trop proches d'au moins l'espacement minimal", () => {
    const [a, b] = spreadLabels([100, 104], 12, 0, 200);
    expect(b - a).toBeGreaterThanOrEqual(12);
  });

  it("préserve l'ordre vertical et laisse intacts les libellés déjà espacés", () => {
    expect(spreadLabels([150, 20, 80], 12, 0, 200)).toEqual([150, 20, 80]);
  });

  it("reste dans les bornes en remontant les libellés collés au bas", () => {
    const ys = spreadLabels([198, 199, 200], 12, 0, 200);
    expect(Math.max(...ys)).toBeLessThanOrEqual(200);
    expect(ys[1] - ys[0]).toBeGreaterThanOrEqual(12);
    expect(ys[2] - ys[1]).toBeGreaterThanOrEqual(12);
  });
});
