// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="pixel-navbar">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">🏠</span>
        <span className="pixel-tab-label">Home</span>
      </NavLink>

      <NavLink
        to="/quests"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">📜</span>
        <span className="pixel-tab-label">Quests</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">🗺️</span>
        <span className="pixel-tab-label">Map</span>
      </NavLink>

      <NavLink
        to="/inventory"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">🎒</span>
        <span className="pixel-tab-label">Bag</span>
      </NavLink>

      <NavLink
        to="/leaderboard"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">🏆</span>
        <span className="pixel-tab-label">Rank</span>
      </NavLink>

      <NavLink
        to="/friends"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">👥</span>
        <span className="pixel-tab-label">Friends</span>
      </NavLink>

      <NavLink
        to="/insights"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">📊</span>
        <span className="pixel-tab-label">Insights</span>
      </NavLink>

      <NavLink
  to="/settings"
  className={({ isActive }) =>
    `pixel-tab ${isActive ? "active" : ""}`
  }
>
  <span className="pixel-tab-icon">⚙️</span>
  <span className="pixel-tab-label">Settings</span>
</NavLink>

      
    </nav>
  );
}
