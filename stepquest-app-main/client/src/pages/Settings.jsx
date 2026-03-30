// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useQuest } from "../context/QuestContext";
import { useInventory } from "../context/InventoryContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Settings.css";

export default function Settings() {
  const { user, logout } = useAuth();
  const { dailyGoal, setDailyGoal } = useQuest();
  const { clearInventory } = useInventory();
  const navigate = useNavigate();

  const [localGoal, setLocalGoal] = useState(dailyGoal || 5000);

  useEffect(() => {
    if (dailyGoal) setLocalGoal(dailyGoal);
  }, [dailyGoal]);

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

  const handleGoalSave = async () => {
    const parsed = parseInt(localGoal, 10);
    if (!parsed || parsed < 100) {
      alert("Goal must be a valid number of at least 100 steps.");
      return;
    }
    setDailyGoal(parsed);
    if (user) {
      const { error } = await supabase.from("player_stats").update({ daily_goal: parsed }).eq("user_id", user.id);
      if (error) {
        console.error("Error saving new daily goal:", error);
      } else {
        alert(`Awesome! Your daily goal is now ${parsed.toLocaleString()} steps.`);
      }
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

        <div className="settings-goal-container" style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", color: "#a1a1aa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Daily Step Goal
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="number"
              value={localGoal}
              onChange={(e) => setLocalGoal(e.target.value)}
              placeholder="e.g. 5000"
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e4e4e7",
                padding: "0.6rem 1rem",
                borderRadius: "10px",
                fontFamily: "inherit",
                fontSize: "1rem"
              }}
            />
            <button
              onClick={handleGoalSave}
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                color: "#000",
                border: "none",
                fontWeight: "700",
                padding: "0.6rem 1.25rem",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#a1a1aa", margin: 0 }}>
            Hitting your goal 3 days in a row permanently increases it by 10%!
          </p>
        </div>
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
