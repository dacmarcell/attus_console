import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Activity,
  Package,
  WifiOff,
  Database,
  Cpu,
  Bug,
  Terminal,
  RefreshCw,
  Send,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  PackageOpen,
  FolderOpen,
  Clock,
  Search,
  Check,
  Lightbulb,
} from "lucide-react";

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
  // Navigation State
  const [activeView, setActiveView] = useState<"dashboard" | "products">(
    "dashboard",
  );

  // API Config
  const API_BASE_URL = "http://localhost:8080/api";

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Dashboard Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  // Log Form State
  const [appInput, setAppInput] = useState("payment-api");
  const [envInput, setEnvInput] = useState("production");
  const [levelInput, setLevelInput] = useState("ERROR");
  const [messageInput, setMessageInput] = useState(
    "Connection timeout on gateway",
  );
  const [stackTraceInput, setStackTraceInput] = useState(
    "java.net.SocketTimeoutException: Connect timed out",
  );

  // Global Error Capture state
  const [errorBannerMsg, setErrorBannerMsg] = useState<string | null>(null);
  const [isSendingSimulated, setIsSendingSimulated] = useState(false);

  const fetchIncidents = async () => {
    try {
      setDashboardError(null);
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (!res.ok) throw new Error("Falha ao obter incidentes da API.");
      const data = await res.json();
      setIncidents(data);
    } catch (err: unknown) {
      setDashboardError(
        (err as Error).message || "Erro ao carregar incidentes.",
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  // Submit manual log form
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application: appInput,
          environment: envInput,
          level: levelInput,
          message: messageInput,
          stackTrace: stackTraceInput,
        }),
      });

      if (!res.ok) throw new Error("Falha ao enviar log.");

      setMessageInput("");
      fetchIncidents();
      alert("Log ingerido com sucesso! A análise de incidentes foi executada.");
    } catch (err: unknown) {
      alert((err as Error).message || "Erro ao enviar log manual.");
    }
  };

  // Simulates 5 logs consecutively to trigger automatic incident creation
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
        stackTrace:
          "java.net.SocketTimeoutException: Connection timed out\n\tat java.net.PlainSocketImpl.socketConnect(Native Method)",
      };
    } else if (type === "DATABASE") {
      logPayload = {
        application: "auth-service",
        environment: "production",
        level: "FATAL",
        message:
          "HikariPool-1 - Connection refused: Could not connect to database at postgres-primary:5432",
        stackTrace:
          "org.postgresql.util.PSQLException: Connection refused\n\tat org.postgresql.core.v3.ConnectionFactoryImpl.openConnection",
      };
    } else if (type === "MEMORY") {
      logPayload = {
        application: "analytics-worker",
        environment: "staging",
        level: "ERROR",
        message: "OutOfMemoryError: Java heap space during batch processing",
        stackTrace:
          "java.lang.OutOfMemoryError: Java heap space\n\tat java.util.Arrays.copyOf(Arrays.java:3512)",
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
        `Sucesso! 5 logs de ${type} foram ingeridos. Incidentes atualizados no Dashboard!`,
      );
    } catch (err: unknown) {
      alert("Falha ao simular incidente: " + (err as Error).message);
    } finally {
      setIsSendingSimulated(false);
    }
  };

  // Helper to force an error to test window.onerror
  const triggerBrowserException = () => {
    throw new Error("Simulação de exceção não tratada no navegador!");
  };

  // Filter and Search logic for Incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      selectedSeverity === "ALL" || inc.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  // ==========================================
  // PRODUCTS CRUD STATE & LOGIC
  // ==========================================
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Product Form Input States
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");

  // Track if we are currently editing a product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setProductsError(null);
      const res = await fetch(`${API_BASE_URL}/produtos`);
      if (!res.ok) throw new Error("Falha ao carregar produtos do servidor.");
      const data = await res.json();
      setProducts(data);
    } catch (err: unknown) {
      setProductsError((err as Error).message || "Erro ao obter produtos.");
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle product form submission (Create or Update)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prodName.trim()) {
      alert("O nome do produto é obrigatório.");
      return;
    }

    const parsedPrice = parseFloat(prodPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Insira um preço válido maior que zero.");
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parsedPrice,
    };

    try {
      let res;
      if (editingProduct) {
        // Edit Action (PUT)
        res = await fetch(`${API_BASE_URL}/produtos/${editingProduct.id}`, {
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
            : "Erro ao processar produto.",
        );
      }

      // Reset form states
      setProdName("");
      setProdDesc("");
      setProdPrice("");
      setEditingProduct(null);

      // Refresh list
      fetchProducts();
      alert(
        editingProduct
          ? "Produto atualizado com sucesso!"
          : "Produto criado com sucesso!",
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "Ocorreu um erro ao salvar o produto.");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/produtos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Falha ao deletar o produto na API.");

      fetchProducts();
      alert("Produto excluído com sucesso!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "Erro ao excluir produto.");
    }
  };

  // Populate form to start editing
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description || "");
    setProdPrice(product.price.toString());
  };

  // Cancel editing flow
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setProdName("");
    setProdDesc("");
    setProdPrice("");
  };

  // Filter products by search query
  const filteredProducts = products.filter(
    (prod) =>
      prod.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (prod.description &&
        prod.description
          .toLowerCase()
          .includes(productSearchQuery.toLowerCase())),
  );

  const sendBrowserLog = useCallback(async (msg: string, stack: string) => {
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
  }, []);

  // Error capture
  useEffect(() => {
    // Initial fetches
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
  }, [sendBrowserLog]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  // ==========================================
  // SUB-RENDER: INCIDENT DASHBOARD
  // ==========================================
  const renderDashboardView = () => (
    <div className="dashboard-grid">
      {/* Left column: Controls and Simulation */}
      <section
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        {/* Simulator Panel */}
        <div className="panel">
          <h2 className="panel-title">
            <Activity size={20} style={{ color: "var(--accent-color)" }} />{" "}
            Simulador de Incidentes
          </h2>
          <p className="panel-subtitle">
            Dispare rapidamente uma sequência de 5 logs idênticos à API para
            testar as regras de agrupamento de incidentes da V1.
          </p>

          <div className="simulator-buttons">
            <button
              className="btn-simulator"
              onClick={() => handleSimulateIncident("TIMEOUT")}
              disabled={isSendingSimulated}
            >
              <div className="simulator-title">
                <WifiOff size={16} style={{ color: "var(--severity-high)" }} />{" "}
                Exceção de Timeout
              </div>
              <div className="simulator-desc">
                Gera incidente NETWORK_TIMEOUT (HIGH)
              </div>
            </button>

            <button
              className="btn-simulator"
              onClick={() => handleSimulateIncident("DATABASE")}
              disabled={isSendingSimulated}
            >
              <div className="simulator-title">
                <Database
                  size={16}
                  style={{ color: "var(--severity-critical)" }}
                />{" "}
                Falha de Banco de Dados
              </div>
              <div className="simulator-desc">
                Gera incidente DATABASE_FAILURE (CRITICAL)
              </div>
            </button>

            <button
              className="btn-simulator"
              onClick={() => handleSimulateIncident("MEMORY")}
              disabled={isSendingSimulated}
            >
              <div className="simulator-title">
                <Cpu size={16} style={{ color: "var(--severity-critical)" }} />{" "}
                Estouro de Memória Heap
              </div>
              <div className="simulator-desc">
                Gera incidente MEMORY_LEAK (CRITICAL)
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ marginTop: "10px" }}
              onClick={triggerBrowserException}
            >
              <Bug size={16} /> Forçar Erro JavaScript
            </button>
          </div>
        </div>

        {/* Log Ingest Form Panel */}
        <div className="panel">
          <h2 className="panel-title">
            <Terminal size={20} style={{ color: "var(--accent-color)" }} />{" "}
            Ingestão de Log
          </h2>
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label className="form-label">Aplicação</label>
              <input
                type="text"
                className="form-input"
                value={appInput}
                onChange={(e) => setAppInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ambiente</label>
              <input
                type="text"
                className="form-input"
                value={envInput}
                onChange={(e) => setEnvInput(e.target.value)}
                required
              />
            </div>

            <div
              className="form-group"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              <div>
                <label className="form-label">Nível</label>
                <select
                  className="form-select"
                  value={levelInput}
                  onChange={(e) => setLevelInput(e.target.value)}
                >
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                  <option value="FATAL">FATAL</option>
                </select>
              </div>
              <div>
                <label className="form-label">Sincronizar</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={fetchIncidents}
                >
                  <RefreshCw size={12} /> Atualizar
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mensagem do Erro</label>
              <input
                type="text"
                className="form-input"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Ex: Connection timed out"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stack Trace (Opcional)</label>
              <textarea
                className="form-textarea"
                value={stackTraceInput}
                onChange={(e) => setStackTraceInput(e.target.value)}
                placeholder="StackTrace..."
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Send size={14} /> Enviar Log Individual
            </button>
          </form>
        </div>
      </section>

      {/* Right column: Dashboard display */}
      <section>
        {/* Filters Bar */}
        <div className="filters-bar">
          <div
            className="search-input-wrapper"
            style={{ position: "relative" }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Buscar incidentes por tipo ou mensagem de erro..."
              style={{ paddingLeft: "35px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "12px",
                color: "var(--text-secondary)",
              }}
            />
          </div>

          <div className="severity-tabs">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                className={`tab-btn ${selectedSeverity === sev ? "active" : ""}`}
                onClick={() => setSelectedSeverity(sev)}
              >
                {sev === "ALL" ? "Todos" : sev}
              </button>
            ))}
          </div>
        </div>

        {/* API Error Status */}
        {dashboardError && (
          <div
            className="panel"
            style={{
              borderColor: "var(--severity-critical)",
              color: "var(--severity-critical)",
              marginBottom: "20px",
            }}
          >
            <AlertTriangle
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            <strong>Conectividade API:</strong> {dashboardError}. Verifique se o
            backend está ativo na porta 8080.
          </div>
        )}

        {/* Loading state */}
        {dashboardLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Buscando console de incidentes...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          /* Empty State */
          <div className="empty-state">
            <FolderOpen size={48} className="empty-state-icon" />
            <h3>Nenhum incidente ativo</h3>
            <p>
              {searchQuery || selectedSeverity !== "ALL"
                ? "Nenhum incidente corresponde à busca e filtros."
                : "Excelente! Nenhum erro com mais de 5 repetições nos últimos 5 minutos."}
            </p>
          </div>
        ) : (
          /* List of incidents */
          <div className="incidents-list">
            {filteredIncidents.map((incident) => {
              const severityLower = incident.severity.toLowerCase();
              return (
                <article key={incident.id} className="incident-card">
                  <div className="incident-header">
                    <div className="incident-type-group">
                      <span className={`badge badge-${severityLower}`}>
                        {incident.severity}
                      </span>
                      <h3 className="incident-type">{incident.type}</h3>
                    </div>

                    <div className="occurrences-counter">
                      <AlertTriangle
                        size={14}
                        style={{
                          marginRight: "4px",
                          display: "inline",
                          verticalAlign: "middle",
                        }}
                      />
                      <strong>{incident.occurrences}</strong> ocorrências
                    </div>
                  </div>

                  <div className="incident-date">
                    <Clock
                      size={12}
                      style={{ marginRight: "5px", verticalAlign: "middle" }}
                    />
                    Data da ocorrência: {formatDate(incident.createdAt)}
                  </div>

                  <p className="incident-message">{incident.message}</p>

                  <div className="suggestions-grid">
                    <div className="suggestion-block">
                      <h4>
                        <Lightbulb style={{ width: 15, height: 15 }} />{" "}
                        Recomendações
                      </h4>
                      <ul>
                        {incident.recommendations.split(";").map((rec, i) => (
                          <li key={i}>{rec.trim()}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="suggestion-block">
                      <h4>
                        <Shield style={{ width: 15, height: 15 }} /> Medidas
                        Preventivas
                      </h4>
                      <ul>
                        {incident.preventions.split(";").map((prev, i) => (
                          <li key={i}>{prev.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );

  // ==========================================
  // SUB-RENDER: PRODUCTS CRUD
  // ==========================================
  const renderProductsView = () => (
    <div className="products-layout">
      {/* Left Column: Product Listing Grid */}
      <section>
        {/* Filters and search for products */}
        <div className="filters-bar">
          <div
            className="search-input-wrapper"
            style={{ position: "relative" }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Buscar produtos cadastrados pelo nome..."
              style={{ paddingLeft: "35px" }}
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
            />
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "12px",
                color: "var(--text-secondary)",
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "auto" }}
            onClick={fetchProducts}
          >
            <RefreshCw size={12} /> Sincronizar
          </button>
        </div>

        {/* API Error Status for Products */}
        {productsError && (
          <div
            className="panel"
            style={{
              borderColor: "var(--color-danger)",
              color: "var(--color-danger)",
              marginBottom: "20px",
            }}
          >
            <AlertTriangle
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            <strong>Erro de Rede:</strong> {productsError}
          </div>
        )}

        {/* Loading and display grid */}
        {productsLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Carregando base de produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <PackageOpen size={48} className="empty-state-icon" />
            <h3>Nenhum produto cadastrado</h3>
            <p>
              {productSearchQuery
                ? "Nenhum resultado corresponde à sua busca."
                : "Cadastre o seu primeiro produto utilizando o formulário lateral!"}
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-details">
                  <div className="product-name">{product.name}</div>
                  <div className="product-desc">
                    {product.description || "Sem descrição."}
                  </div>
                  <div className="product-price-tag">
                    R${" "}
                    {product.price.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="product-card-footer">
                  <span className="product-meta">ID: {product.id}</span>
                  <div className="btn-action-group">
                    <button
                      className="btn-action btn-action-edit"
                      onClick={() => handleStartEdit(product)}
                    >
                      <Pencil
                        size={12}
                        style={{
                          display: "inline",
                          marginRight: "4px",
                          verticalAlign: "middle",
                        }}
                      />{" "}
                      Editar
                    </button>
                    <button
                      className="btn-action btn-action-delete"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2
                        size={12}
                        style={{
                          display: "inline",
                          marginRight: "4px",
                          verticalAlign: "middle",
                        }}
                      />{" "}
                      Deletar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Right Column: Manage Product Form */}
      <section>
        <div className="panel">
          <h2 className="panel-title">
            {editingProduct ? (
              <Pencil size={20} style={{ color: "var(--accent-color)" }} />
            ) : (
              <Plus size={20} style={{ color: "var(--accent-color)" }} />
            )}
            {editingProduct ? "Editar Produto" : "Cadastrar Produto"}
          </h2>
          <p className="panel-subtitle">
            {editingProduct
              ? `Atualizando informações do produto ID ${editingProduct.id}.`
              : "Adicione novos produtos à base de dados executando o formulário completo."}
          </p>

          <form onSubmit={handleSubmitProduct}>
            <div className="form-group">
              <label className="form-label">Nome do Produto</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Teclado Mecânico RGB"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="Ex: 299.90"
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-textarea"
                placeholder="Ex: Teclado ABNT2 com switch Red mecânico"
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              <button type="submit" className="btn btn-primary">
                {editingProduct ? <Check size={16} /> : <Plus size={16} />}
                {editingProduct ? "Salvar Alterações" : "Cadastrar"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );

  return (
    <div className="app-container">
      {/* Sidebar Section */}
      <nav className="sidebar">
        <div className="brand-section">
          <Shield size={24} style={{ color: "var(--accent-color)" }} />
          <span className="brand-name">Attus Console</span>
        </div>

        <ul className="nav-list">
          <li>
            <button
              className={`nav-item-btn ${activeView === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveView("dashboard")}
            >
              <Activity size={18} />
              Incidentes
            </button>
          </li>
          <li>
            <button
              className={`nav-item-btn ${activeView === "products" ? "active" : ""}`}
              onClick={() => setActiveView("products")}
            >
              <Package size={18} />
              Produtos
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Workspace Area */}
      <div className="main-content">
        {/* Global Error Banner */}
        {errorBannerMsg && (
          <div className="error-banner">
            <span>
              <AlertTriangle
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              {errorBannerMsg}
            </span>
            <button
              className="error-banner-btn"
              onClick={() => setErrorBannerMsg(null)}
            >
              Fechar
            </button>
          </div>
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

        {/* View Switch */}
        {activeView === "dashboard"
          ? renderDashboardView()
          : renderProductsView()}
      </div>
    </div>
  );
}

export default App;
