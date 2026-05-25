import { Activity, Package } from "lucide-react";

interface Props {
  activeView: "dashboard" | "products";
  setActiveView: (view: "dashboard" | "products") => void;
}

export default function Sidebar({ activeView, setActiveView }: Props) {
  return (
    <nav className="sidebar">
      <div className="brand-section">
        <img
          src="/logo.png"
          alt="Attus Console"
          className="brand-icon"
          width={32}
          height={32}
        />
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
  );
}
