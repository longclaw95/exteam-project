import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterBar } from "./FilterBar";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams("period=30&segment=all"),
}));

describe("FilterBar", () => {
  it("affiche la période active et le segment courant", () => {
    render(<FilterBar period={30} segment="all" />);
    expect(screen.getByRole("button", { name: "30j" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Segment")).toHaveValue("all");
  });

  // Preuve d'utilisabilité clavier (audit accessibilité S3) : un bouton de
  // période est atteignable au Tab et activable au clavier, sans souris.
  it("un bouton de période est activable au clavier (Tab puis Entrée)", async () => {
    const user = userEvent.setup();
    render(<FilterBar period={30} segment="all" />);

    await user.tab(); // 1er bouton de période (7j)
    expect(screen.getByRole("button", { name: "7j" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith("/?period=7&segment=all");
  });
});
