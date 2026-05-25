import { Activity, Package } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
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
          <NavLink
            to="/produtos"
            className={({ isActive }) =>
              `nav-item-btn${isActive ? " active" : ""}`
            }
          >
            <Package size={18} />
            Produtos
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/incidentes"
            className={({ isActive }) =>
              `nav-item-btn${isActive ? " active" : ""}`
            }
          >
            <Activity size={18} />
            Incidentes
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
