import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../constants/api";
import { jsonResponse, sampleIncident } from "../test/fixtures";
import { renderWithProviders } from "../test/test-utils";
import DashboardPage from "./DashboardPage";

describe("DashboardPage (integração)", () => {
  it("carrega incidentes da API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse([sampleIncident])),
    );

    renderWithProviders(<DashboardPage />, { route: "/incidentes" });

    await waitFor(() => {
      expect(screen.getByText("NETWORK_TIMEOUT")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/incidents`);
  });

  it("envia log manual e exibe modal de sucesso", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse([]))
        .mockResolvedValueOnce(jsonResponse({}, true, 201))
        .mockResolvedValueOnce(jsonResponse([sampleIncident])),
    );

    renderWithProviders(<DashboardPage />, { route: "/incidentes" });

    await waitFor(() => {
      expect(screen.getByText(/Nenhum incidente ativo/i)).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /Enviar Log Individual/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Log Ingerido com Sucesso")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/logs`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("exibe erro quando listagem de incidentes falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(null, false, 500)),
    );

    renderWithProviders(<DashboardPage />, { route: "/incidentes" });

    await waitFor(() => {
      expect(
        screen.getByText(/Falha ao obter incidentes/i),
      ).toBeInTheDocument();
    });
  });
});
