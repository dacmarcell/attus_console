import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { jsonResponse, sampleIncident, sampleProduct } from "../test/fixtures";
import { renderWithProviders } from "../test/test-utils";
import AppRoutes from "./index";

describe("AppRoutes (integração)", () => {
  it("redireciona / para produtos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([])));

    renderWithProviders(<AppRoutes />, { route: "/" });

    await waitFor(() => {
      expect(screen.getByText("Gestão de Produtos")).toBeInTheDocument();
    });
  });

  it("navega entre produtos e incidentes", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse([sampleProduct]))
        .mockResolvedValueOnce(jsonResponse([sampleIncident])),
    );

    renderWithProviders(<AppRoutes />, { route: "/produtos" });

    await waitFor(() => {
      expect(screen.getByText("Teclado Mecânico")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /Incidentes/i }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard de Incidentes")).toBeInTheDocument();
      expect(screen.getByText("NETWORK_TIMEOUT")).toBeInTheDocument();
    });
  });
});
