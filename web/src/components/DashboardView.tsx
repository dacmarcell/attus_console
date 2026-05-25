import {
  Activity,
  AlertTriangle,
  Bug,
  Clock,
  Cpu,
  Database,
  FolderOpen,
  Search,
  Send,
  Terminal,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { formatDate } from "../utils/helpers";
import SeverityBadge from "./SeverityBadge";

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

interface Props {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  onManualLogSubmit: (log: {
    application: string;
    environment: string;
    level: string;
    message: string;
    stackTrace: string;
  }) => Promise<boolean>;
  onSimulateIncident: (
    type: "TIMEOUT" | "DATABASE" | "MEMORY",
  ) => Promise<void>;
  isSimulating: boolean;
  onForceError: () => void;
}

export default function DashboardView({
  incidents,
  loading,
  error,
  onManualLogSubmit,
  onSimulateIncident,
  isSimulating,
  onForceError,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [appInput, setAppInput] = useState("api");
  const [envInput, setEnvInput] = useState("production");
  const [levelInput, setLevelInput] = useState("ERROR");
  const [messageInput, setMessageInput] = useState(
    "Connection timeout on gateway",
  );
  const [stackTraceInput, setStackTraceInput] = useState(
    "java.net.SocketTimeoutException: Connect timed out",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const success = await onManualLogSubmit({
      application: appInput,
      environment: envInput,
      level: levelInput,
      message: messageInput,
      stackTrace: stackTraceInput,
    });

    if (success) {
      setMessageInput("");
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      selectedSeverity === "ALL" || inc.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
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
            testar as regras de agrupamento de incidentes.
          </p>

          <div className="simulator-buttons">
            <button
              className="btn-simulator"
              onClick={() => onSimulateIncident("TIMEOUT")}
              disabled={isSimulating}
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
              onClick={() => onSimulateIncident("DATABASE")}
              disabled={isSimulating}
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
              onClick={() => onSimulateIncident("MEMORY")}
              disabled={isSimulating}
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
              onClick={onForceError}
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
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Aplicação <span style={{ color: "#FF7F7F" }}>*</span>
              </label>
              <select
                className="form-select"
                value={appInput}
                onChange={(e) => setAppInput(e.target.value)}
              >
                <option value="api">Api</option>
                <option value="web-frontend">Web</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Ambiente <span style={{ color: "#FF7F7F" }}>*</span>
              </label>
              <select
                className="form-select"
                value={envInput}
                onChange={(e) => setEnvInput(e.target.value)}
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nível <span style={{ color: "#FF7F7F" }}>*</span>
              </label>
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

            <div className="form-group">
              <label className="form-label">
                Mensagem do Erro <span style={{ color: "#FF7F7F" }}>*</span>
              </label>
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
              <label className="form-label">Stack Trace</label>
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
        {error && (
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
            <strong>Conectividade API:</strong> {error}. Verifique se o backend
            está ativo na porta 8080.
          </div>
        )}

        {/* Loading state */}
        {loading ? (
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
              return (
                <article key={incident.id} className="incident-card">
                  <div className="incident-header">
                    <div className="incident-type-group">
                      <SeverityBadge severity={incident.severity} />
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
                      <h4>💡 Recomendações</h4>
                      <ul>
                        {incident.recommendations.split(";").map((rec, i) => (
                          <li key={i}>{rec.trim()}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="suggestion-block">
                      <h4>🛡️ Medidas Preventivas</h4>
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
}
