import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { sampleIncident } from "../test/fixtures";
import DashboardView from "./DashboardView";

const defaultProps = {
  loading: false,
  error: null,
  onRefresh: vi.fn(),
  onManualLogSubmit: vi.fn().mockResolvedValue(true),
  onSimulateIncident: vi.fn().mockResolvedValue(undefined),
  isSimulating: false,
  onForceError: vi.fn(),
};

describe("DashboardView", () => {
  it("exibe incidente com tipo e ocorrências", () => {
    render(
      <DashboardView
        {...defaultProps}
        incidents={[sampleIncident]}
      />,
    );

    expect(screen.getByText("NETWORK_TIMEOUT")).toBeInTheDocument();
    expect(screen.getByText(/ocorrências/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection timed out/i)).toBeInTheDocument();
  });

  it("filtra incidentes por busca", async () => {
    const user = userEvent.setup();
    render(
      <DashboardView
        {...defaultProps}
        incidents={[
          sampleIncident,
          {
            ...sampleIncident,
            id: "inc-2",
            type: "DATABASE_FAILURE",
            message: "Connection refused to database",
          },
        ]}
      />,
    );

    await user.type(
      screen.getByPlaceholderText(/Buscar incidentes/i),
      "database",
    );

    expect(screen.queryByText("NETWORK_TIMEOUT")).not.toBeInTheDocument();
    expect(screen.getByText("DATABASE_FAILURE")).toBeInTheDocument();
  });

  it("filtra incidentes por severidade", async () => {
    const user = userEvent.setup();
    render(
      <DashboardView
        {...defaultProps}
        incidents={[
          sampleIncident,
          { ...sampleIncident, id: "inc-2", severity: "MEDIUM", type: "APP_ERROR" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "HIGH" }));

    expect(screen.getByText("NETWORK_TIMEOUT")).toBeInTheDocument();
    expect(screen.queryByText("APP_ERROR")).not.toBeInTheDocument();
  });

  it("não envia log quando mensagem está vazia", async () => {
    const user = userEvent.setup();
    const onManualLogSubmit = vi.fn().mockResolvedValue(true);

    render(
      <DashboardView
        {...defaultProps}
        incidents={[]}
        onManualLogSubmit={onManualLogSubmit}
      />,
    );

    const messageInput = screen.getByPlaceholderText("Ex: Connection timed out");
    await user.clear(messageInput);

    const logForm = screen
      .getByRole("button", { name: /Enviar Log Individual/i })
      .closest("form");
    fireEvent.submit(logForm!);

    expect(onManualLogSubmit).not.toHaveBeenCalled();
  });

  it("dispara simulação de timeout", async () => {
    const user = userEvent.setup();
    const onSimulateIncident = vi.fn().mockResolvedValue(undefined);

    render(
      <DashboardView
        {...defaultProps}
        incidents={[]}
        onSimulateIncident={onSimulateIncident}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Exceção de Timeout/i }));

    expect(onSimulateIncident).toHaveBeenCalledWith("TIMEOUT");
  });

  it("exibe estado vazio quando não há incidentes", () => {
    render(<DashboardView {...defaultProps} incidents={[]} />);

    expect(screen.getByText(/Nenhum incidente ativo/i)).toBeInTheDocument();
  });
});
