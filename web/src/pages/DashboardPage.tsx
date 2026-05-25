import { useCallback, useEffect, useState } from "react";
import DashboardView from "../components/DashboardView";
import DashboardPageHeader from "../components/headers/DashboardPageHeader";
import { API_BASE_URL } from "../constants/api";
import { useAppUi } from "../context/AppUiContext";
import type { Incident } from "../types/app";

export default function DashboardPage() {
  const { showModal } = useAppUi();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingSimulated, setIsSendingSimulated] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (!res.ok) throw new Error("Falha ao obter incidentes da API.");
      const data = await res.json();
      setIncidents(data);
    } catch (err: unknown) {
      setError((err as Error).message || "Erro ao carregar incidentes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleManualLogSubmit = useCallback(
    async (log: {
      application: string;
      environment: string;
      level: string;
      message: string;
      stackTrace: string;
    }): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE_URL}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(log),
        });

        if (!res.ok) throw new Error("Falha ao enviar log para a API.");

        fetchIncidents();
        showModal(
          "success",
          "Log Ingerido com Sucesso",
          "A análise de incidentes foi executada. Verifique o painel para novos incidentes detectados.",
        );
        return true;
      } catch (err: unknown) {
        showModal(
          "error",
          "Erro ao Enviar Log",
          (err as Error).message || "Ocorreu um erro ao enviar o log manual.",
        );
        return false;
      }
    },
    [fetchIncidents, showModal],
  );

  const handleSimulateIncident = useCallback(
    async (type: "TIMEOUT" | "DATABASE" | "MEMORY") => {
      setIsSendingSimulated(true);
      let logPayload = {
        application: "api",
        environment: "production",
        level: "ERROR",
        message: "",
        stackTrace: "",
      };

      if (type === "TIMEOUT") {
        logPayload = {
          application: "api",
          environment: "production",
          level: "ERROR",
          message: "Gateway Timeout connecting to bank server after 5000ms",
          stackTrace: "java.net.SocketTimeoutException: Connection timed out",
        };
      } else if (type === "DATABASE") {
        logPayload = {
          application: "auth-service",
          environment: "production",
          level: "FATAL",
          message:
            "HikariPool-1 - Connection refused: Could not connect to database at postgres-primary:5432",
          stackTrace: "org.postgresql.util.PSQLException: Connection refused",
        };
      } else if (type === "MEMORY") {
        logPayload = {
          application: "analytics-worker",
          environment: "staging",
          level: "ERROR",
          message: "OutOfMemoryError: Java heap space during batch processing",
          stackTrace: "java.lang.OutOfMemoryError: Java heap space",
        };
      }

      try {
        for (let i = 0; i < 5; i++) {
          await fetch(`${API_BASE_URL}/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(logPayload),
          });
        }

        await fetchIncidents();
        showModal(
          "success",
          "Simulação Concluída",
          `5 logs de ${type} foram inseridos consecutivamente. O painel foi atualizado com os novos incidentes detectados.`,
        );
      } catch (err: unknown) {
        showModal(
          "error",
          "Falha na Simulação",
          "Falha ao simular incidente: " + (err as Error).message,
        );
      } finally {
        setIsSendingSimulated(false);
      }
    },
    [fetchIncidents, showModal],
  );

  const triggerBrowserException = () => {
    throw new Error("Simulação de exceção não tratada no navegador!");
  };

  return (
    <>
      <DashboardPageHeader />
      <DashboardView
        incidents={incidents}
        loading={loading}
        error={error}
        onRefresh={fetchIncidents}
        onManualLogSubmit={handleManualLogSubmit}
        onSimulateIncident={handleSimulateIncident}
        isSimulating={isSendingSimulated}
        onForceError={triggerBrowserException}
      />
    </>
  );
}
