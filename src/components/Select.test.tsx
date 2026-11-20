import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./Select";

const OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "smb", label: "PME" },
];

describe("Select", () => {
  it("associe le label au contrôle (accessibilité)", () => {
    render(<Select id="segment" label="Segment" options={OPTIONS} value="all" />);
    expect(screen.getByLabelText("Segment")).toBeInTheDocument();
  });

  it("est utilisable au clavier et déclenche onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select id="segment" label="Segment" options={OPTIONS} value="all" onChange={onChange} />);

    const select = screen.getByLabelText("Segment");
    select.focus();
    expect(select).toHaveFocus();

    await user.selectOptions(select, "smb");
    expect(onChange).toHaveBeenCalledWith("smb");
  });
});
