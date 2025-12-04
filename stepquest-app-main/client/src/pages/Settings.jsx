// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useInventory } from "../context/InventoryContext";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

export default function Settings() {
  const { user, logout } = useAuth();
  const { clearInventory } = useInventory();
  const navigate = useNavigate();

  // simple local preferences (stored in localStorage)
  const [soundOn, setSoundOn] = useState(
    () => localStorage.getItem("sq_soundOn") !== "false"
  );
  const [hapticsOn, setHapticsOn] = useState(
    () => localStorage.getItem("sq_hapticsOn") !== "false"
  );

  useEffect(() => {
    localStorage.setItem("sq_soundOn", soundOn.toString());
  }, [soundOn]);

  useEffect(() => {
    localStorage.setItem("sq_hapticsOn", hapticsOn.toString());
  }, [hapticsOn]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleClearBag = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all bag items? This can’t be undone."
      )
    ) {
      clearInventory();
    }
  };

  // grab avatar preview from ProfilePage choice (if any)
  const selectedAvatar = localStorage.getItem("selectedAvatar") || null;

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      {/* --- PROFILE SECTION (separate page inside settings) --- */}
      <section className="settings-card settings-profile-card">
        <h2 className="settings-section-title">Profile</h2>

        <button
          type="button"
          className="settings-row-button"
          onClick={() => navigate("/profile")}
        >
          <div className="settings-profile-left">
            <div className="settings-avatar-wrapper">
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="Avatar"
                  className="settings-avatar-img"
                />
              ) : (
                <span className="settings-avatar-fallback">👤</span>
              )}
            </div>
            <div>
              <p className="settings-profile-name">
                {user?.email || "StepQuest hero"}
              </p>
              <p className="settings-profile-sub">
                Edit avatar & player profile
              </p>
            </div>
          </div>
          <span className="settings-chevron">›</span>
        </button>
      </section>

      {/* --- ACCOUNT SECTION --- */}
      <section className="settings-card">
        <h2 className="settings-section-title">Account</h2>
        <p className="settings-email">
          Email: <span>{user?.email}</span>
        </p>
        <button className="settings-primary-btn" onClick={handleLogout}>
          Log out
        </button>
      </section>

      {/* --- PREFERENCES SECTION --- */}
      <section className="settings-card">
        <h2 className="settings-section-title">Preferences</h2>

        <label className="settings-toggle-row">
          <input
            type="checkbox"
            checked={soundOn}
            onChange={(e) => setSoundOn(e.target.checked)}
          />
          <span>Sound effects</span>
        </label>

        <label className="settings-toggle-row">
          <input
            type="checkbox"
            checked={hapticsOn}
            onChange={(e) => setHapticsOn(e.target.checked)}
          />
          <span>Vibration / haptics</span>
        </label>
      </section>

      {/* --- DANGER ZONE --- */}
      <section className="settings-card danger-card">
        <h2 className="settings-section-title">Danger zone</h2>
        <button className="settings-danger-btn" onClick={handleClearBag}>
          Clear bag items
        </button>
      </section>
    </div>
  );
}
