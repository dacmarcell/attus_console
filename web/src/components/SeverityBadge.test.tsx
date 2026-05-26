import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SeverityBadge from "./SeverityBadge";

describe("SeverityBadge", () => {
  it("renderiza severidade com classe em minúsculas", () => {
    render(<SeverityBadge severity="HIGH" />);

    const badge = screen.getByText("HIGH");
    expect(badge).toHaveClass("badge-high");
  });

  it("exibe texto da severidade", () => {
    render(<SeverityBadge severity="CRITICAL" />);

    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });
});
