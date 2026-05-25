import { useState, useEffect } from "react";

// Import modular components
import Sidebar from "./components/Sidebar";
import ErrorBanner from "./components/ErrorBanner";
import DashboardView from "./components/DashboardView";
import ProductsView from "./components/ProductsView";

interface Incident {
  id: string;
  type: string;
  severity: string;
  message: string;
  occurrences: number;
  recommendations: string;
  preventions: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

function App() {
  // Navigation Routing State
  const [activeView, setActiveView] = useState<"dashboard" | "products">(
    "dashboard",
  );

  // API Config
  const API_BASE_URL = "http://localhost:8080/api";

  // ==========================================
  // SHARED STATES
  // ==========================================
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [errorBannerMsg, setErrorBannerMsg] = useState<string | null>(null);
  const [isSendingSimulated, setIsSendingSimulated] = useState(false);

  // ==========================================
  // API SERVICE CALLS
  // ==========================================

  // Fetch all incidents
  const fetchIncidents = async () => {
    try {
      setDashboardError(null);
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (!res.ok) throw new Error("Falha ao obter incidentes da API.");
      const data = await res.json();
      setIncidents(data);
    } catch (err: any) {
      setDashboardError(err.message || "Erro ao carregar incidentes.");
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setProductsError(null);
      const res = await fetch(`${API_BASE_URL}/produtos`);
      if (!res.ok) throw new Error("Falha ao carregar produtos do servidor.");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setProductsError(err.message || "Erro ao obter produtos.");
    } finally {
      setProductsLoading(false);
    }
  };

  // ==========================================
  // ACTION CALLBACK HANDLERS
  // ==========================================

  // Submit manual log
  const handleManualLogSubmit = async (log: {
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
      alert("Log ingerido com sucesso! A análise de incidentes foi executada.");
      return true;
    } catch (err: any) {
      alert(err.message || "Erro ao enviar log manual.");
      return false;
    }
  };

  // Simulate 5 logs consecutively to trigger incident
  const handleSimulateIncident = async (
    type: "TIMEOUT" | "DATABASE" | "MEMORY",
  ) => {
    setIsSendingSimulated(true);
    let logPayload = {
      application: "payment-api",
      environment: "production",
      level: "ERROR",
      message: "",
      stackTrace: "",
    };

    if (type === "TIMEOUT") {
      logPayload = {
        application: "payment-api",
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
      alert(
        `Sucesso! 5 logs de ${type} foram ingeridos consecutivamente. Verifique o painel!`,
      );
    } catch (err: any) {
      alert("Falha ao simular incidente: " + err.message);
    } finally {
      setIsSendingSimulated(false);
    }
  };

  // Handle product save action (Unified POST / PUT callback)
  const handleSaveProduct = async (
    payload: { name: string; description: string; price: number },
    id?: number,
  ): Promise<boolean> => {
    try {
      let res;
      if (id) {
        // Edit Action (PUT)
        res = await fetch(`${API_BASE_URL}/produtos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create Action (POST)
        res = await fetch(`${API_BASE_URL}/produtos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.validationErrors
            ? Object.values(errorData.validationErrors).join(", ")
            : "Erro ao processar produto na API.",
        );
      }

      fetchProducts();
      alert(
        id
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!",
      );
      return true;
    } catch (err: any) {
      alert(err.message || "Ocorreu um erro ao salvar o produto.");
      return false;
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/produtos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Falha ao deletar o produto na API.");

      fetchProducts();
      alert("Produto excluído com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao excluir produto.");
    }
  };

  // Force an intentional browser exception
  const triggerBrowserException = () => {
    throw new Error("Simulação de exceção não tratada no navegador!");
  };

  // SHARED GLOBAL LIFECYCLE (Error capture)
  useEffect(() => {
    // Initial fetch of DB resources
    fetchIncidents();
    fetchProducts();

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || "Erro desconhecido";
      const stack = event.error ? event.error.stack : "N/A";

      sendBrowserLog(msg, stack);
      setErrorBannerMsg(
        `Capturado globalmente: "${msg}" (Log enviado com sucesso!)`,
      );

      setTimeout(() => setErrorBannerMsg(null), 8000);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
        ? String(event.reason)
        : "Promise rejeitada sem motivo";
      const stack =
        event.reason && event.reason.stack ? event.reason.stack : "N/A";

      sendBrowserLog(`Unhandled Rejection: ${reason}`, stack);
      setErrorBannerMsg(
        `Capturado globalmente: Promise rejeitada - "${reason}" (Log enviado!)`,
      );

      setTimeout(() => setErrorBannerMsg(null), 8000);
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  // Send errors caught globally by the web app
  const sendBrowserLog = async (msg: string, stack: string) => {
    try {
      await fetch(`${API_BASE_URL}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application: "web-frontend",
          environment: "production",
          level: "ERROR",
          message: msg,
          stackTrace: stack,
        }),
      });
      fetchIncidents();
    } catch (e) {
      console.error("Erro ao enviar log automático:", e);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Workspace Area */}
      <div className="main-content">
        {/* Global Error Banner */}
        {errorBannerMsg && (
          <ErrorBanner
            message={errorBannerMsg}
            onClose={() => setErrorBannerMsg(null)}
          />
        )}

        {/* Dynamic header title based on active tab */}
        <div className="header-container">
          <h1>
            {activeView === "dashboard"
              ? "Dashboard de Incidentes"
              : "Gestão de Produtos"}
          </h1>
          <p>
            {activeView === "dashboard"
              ? "Análise em tempo real de logs ingeridos, detecção automatizada de recorrências e prevenção de anomalias."
              : "Painel administrativo para inclusão, consulta, edição e exclusão de itens na base de dados."}
          </p>
        </div>

        {/* View Routing Switch */}
        {activeView === "dashboard" ? (
          <DashboardView
            incidents={incidents}
            loading={dashboardLoading}
            error={dashboardError}
            onRefresh={fetchIncidents}
            onManualLogSubmit={handleManualLogSubmit}
            onSimulateIncident={handleSimulateIncident}
            isSimulating={isSendingSimulated}
            onForceError={triggerBrowserException}
            formatDate={formatDate}
          />
        ) : (
          <ProductsView
            products={products}
            loading={productsLoading}
            error={productsError}
            onRefresh={fetchProducts}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </div>
    </div>
  );
}

export default App;
