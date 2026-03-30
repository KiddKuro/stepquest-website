import { useState, useEffect, useRef } from "react";
import { useQuest } from "../context/QuestContext";
import { startStepTracking } from "../services/realStepAPI";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "../context/Achievement";
import { useInventory } from "../context/InventoryContext";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import QuestCompleteModal from "../components/QuestCompleteModal";
import LevelUpModal from "../components/LevelUpModal";
import ZoneUnlockModal from "../components/ZoneUnlockModal";
import { ZONES } from "../data/zones";
import { useEnvironment } from "../hooks/useEnvironment";
import { getHeroProgression } from "../data/progression";
import "../components/Modals.css";

// Logic for dynamic XP scaling
const getXpRequired = (lvl) => 250 + (lvl * 50); // Lvl 1: 300, Lvl 2: 350, Lvl 3: 400...

export default function Home() {
  const navigate = useNavigate();
  const knightRef = useRef(null);

  const { 
    activeQuest,
    totalSteps,
    setTotalSteps,
    stepsToday,
    setStepsToday,
    statsLoaded,
    setStatsLoaded,
    level,
    setLevel,
    xp,
    setXp,
    dailyGoal,
    setDailyGoal
  } = useQuest();
  const { addItem } = useInventory();
  const { unlock } = useAchievements();
  const { user } = useAuth(); // current logged‑in Supabase user

  // Local UI state
  const [streak, setStreak] = useState(0);
  const [questProgress, setQuestProgress] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questRewardGiven, setQuestRewardGiven] = useState(false);

  // Modal states
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [recentLevelData, setRecentLevelData] = useState(null);
  const [recentRewardData, setRecentRewardData] = useState(null);
  const [unlockedZoneData, setUnlockedZoneData] = useState(null);

  // 🔹 NEW: avatar from ProfilePage (localStorage)
  const [avatar, setAvatar] = useState(null);

  // 🔹 NEW: Local Geolocation Weather Environment
  const { city, weather, temp } = useEnvironment();

  useEffect(() => {
    const stored = localStorage.getItem("selectedAvatar");
    if (stored) {
      setAvatar(stored);
    }
  }, []);

  /* -----------------------------
        LOAD STATS FROM SUPABASE
  ------------------------------*/
  useEffect(() => {
  if (!user || statsLoaded) return;

  const loadStats = async () => {
    const { data: results, error } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", user.id)
      .order("last_updated", { ascending: false })
      .limit(1);

    if (error && error.code !== "PGRST116") {
      console.error("Error loading stats:", error);
      return;
    }

    const data = results && results.length > 0 ? results[0] : null;

    const today = new Date().toISOString().split("T")[0];

    if (data) {
      const dbDate = data.last_updated ? String(data.last_updated).split("T")[0] : "";
      const isNewDay = dbDate !== today;

      // If new day → reset stepsToday
      setStepsToday(isNewDay ? 0 : data.steps_today ?? 0);
      setTotalSteps(data.total_steps ?? 0);
      setXp(data.xp ?? 0);
      setLevel(data.level ?? 1);
      setDailyGoal(data.daily_goal ?? 5000);

      // Update last_updated + reset daily steps in Supabase
      if (isNewDay) {
        await supabase
          .from("player_stats")
          .update({
            steps_today: 0,
            last_updated: today,
          })
          .eq("user_id", user.id);
      }
    } else {
      // First time user row
      const newUsername = user.email ? user.email.split("@")[0] : `Hero_${user.id.substring(0,4)}`;
      await supabase.from("player_stats").insert({
        user_id: user.id,
        username: newUsername,
        steps_today: 0,
        total_steps: 0,
        xp: 0,
        level: 1,
        daily_goal: 5000,
        last_updated: today,
      });
    }

    // Load Streak
    const { data: stepHistory } = await supabase
      .from("daily_steps")
      .select("date, steps")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (stepHistory) {
      const records = new Set(stepHistory.filter(d => d.steps > 0).map(d => d.date));
      let count = 0;
      let checkDate = new Date();
      let dateStr = checkDate.toISOString().split("T")[0];

      if (records.has(dateStr) || (data && data.steps_today > 0) || isNewDay === false) {
        // Evaluate today and step backwards
        if (records.has(dateStr) || (data && data.steps_today > 0)) count = 1;
        
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = checkDate.toISOString().split("T")[0];
        while (records.has(dateStr)) {
          count++;
          checkDate.setDate(checkDate.getDate() - 1);
          dateStr = checkDate.toISOString().split("T")[0];
        }
      } else {
        // Today has no steps yet, see if yesterday kept the streak alive
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = checkDate.toISOString().split("T")[0];
        if (records.has(dateStr)) {
          count = 1;
          checkDate.setDate(checkDate.getDate() - 1);
          dateStr = checkDate.toISOString().split("T")[0];
          while (records.has(dateStr)) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
            dateStr = checkDate.toISOString().split("T")[0];
          }
        }
      }
      setStreak(count);

      // --- ADAPTIVE GOAL LOGIC ---
      const currentGoal = data?.daily_goal ?? 5000;
      let goalDaysMet = 0;
      let checkDateGoal = new Date();
      let dateStrGoal = checkDateGoal.toISOString().split("T")[0];
      
      // Check if today met the goal
      if ((data && data.steps_today >= currentGoal)) {
         goalDaysMet++;
      }
      
      // Look back
      checkDateGoal.setDate(checkDateGoal.getDate() - 1);
      dateStrGoal = checkDateGoal.toISOString().split("T")[0];
      let pastRec = stepHistory.find(d => d.date === dateStrGoal);
      
      while(pastRec && pastRec.steps >= currentGoal) {
         goalDaysMet++;
         checkDateGoal.setDate(checkDateGoal.getDate() - 1);
         dateStrGoal = checkDateGoal.toISOString().split("T")[0];
         pastRec = stepHistory.find(d => d.date === dateStrGoal);
      }

      // If met for 3+ days, adaptive bump!
      if (goalDaysMet >= 3) {
        const newGoal = Math.round(currentGoal * 1.1); // 10% increase
        setDailyGoal(newGoal);
        await supabase.from("player_stats").update({ daily_goal: newGoal }).eq("user_id", user.id);
        
        // Let the user know they are scaling up!
        if ("Notification" in window && Notification.permission === "granted") {
           new Notification("Level Up Your Activity!", { body: `You crushed your goals! Your daily goal increased to ${newGoal} steps.` });
        }
      }

    }

    setStatsLoaded(true);
  };

  loadStats();
}, [user, statsLoaded, setTotalSteps, setStepsToday, setStatsLoaded]);


  /* -----------------------------
        HELPER TO SAVE STATS
  ------------------------------*/
  const saveStats = async (stats) => {
    if (!user) return;

    const username = user.email ? user.email.split("@")[0] : `Hero_${user.id.substring(0,4)}`;
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("player_stats").update({
      username,
      last_updated: today,
      ...stats,
    }).eq("user_id", user.id);

    await supabase.from("daily_steps").upsert({
      user_id: user.id,
      date: today,
      steps: stats.steps_today
    });

    if (error) {
      console.error("Error saving stats:", error);
    }
  };

  // Whenever stats change (after initial load), sync to Supabase
  useEffect(() => {
    if (!user || !statsLoaded) return;

    saveStats({
      steps_today: stepsToday,
      total_steps: totalSteps,
      xp,
      level,
    });
  }, [user, statsLoaded, stepsToday, totalSteps, xp, level]);

  /* -----------------------------
        LOOT TABLE
  ------------------------------*/
  const LOOT_TABLE = [
    { name: "Traveler Boots", rarity: "Uncommon", icon: "🥾", stats: { spd: 1 } },
    { name: "Bronze Sword", rarity: "Common", icon: "🗡️", stats: { atk: 1 } },
    { name: "Guardian Shield", rarity: "Rare", icon: "🛡️", stats: { def: 2 } },
    { name: "Crystal Amulet", rarity: "Epic", icon: "🔮", stats: { luck: 2 } },
    { name: "Endless Cloak", rarity: "Legendary", icon: "🧥", stats: { end: 3 } },
    {
      name: "Mythic Sun Relic",
      rarity: "Mythic",
      icon: "☀️",
      stats: { atk: 2, def: 2, spd: 2, luck: 2, end: 2 },
    },
  ];

  const rollLoot = () => {
    const r = Math.random();
    if (r < 0.5) return LOOT_TABLE[0];
    if (r < 0.75) return LOOT_TABLE[1];
    if (r < 0.88) return LOOT_TABLE[2];
    if (r < 0.96) return LOOT_TABLE[3];
    if (r < 0.99) return LOOT_TABLE[4];
    return LOOT_TABLE[5];
  };

  /* -----------------------------
        RESET QUEST WHEN SWITCHED
  ------------------------------*/
  useEffect(() => {
    if (activeQuest) {
      setQuestProgress(0);
      setQuestCompleted(false);
      setQuestRewardGiven(false);
    }
  }, [activeQuest]);

  /* -----------------------------
        QUEST REMINDER NOTIFICATIONS
  ------------------------------*/
  useEffect(() => {
    if (activeQuest && !questCompleted && "Notification" in window) {
      const today = new Date().toISOString().split("T")[0];
      const lastReminded = localStorage.getItem("quest_reminded");
      const currentHour = new Date().getHours();

      // Fire push notification if it's past noon, and we haven't already today
      if (currentHour >= 12 && lastReminded !== today) {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            const stepsLeft = Number(activeQuest.steps) - questProgress;
            new Notification("StepQuest: Hero Needed!", {
              body: `Don't forget to complete your active quest: ${activeQuest.title}. Only ${stepsLeft} steps remaining!`,
            });
            localStorage.setItem("quest_reminded", today);
          }
        });
      }
    }
  }, [activeQuest, questCompleted, questProgress]);

  /* -----------------------------
        LEVEL UP LISTENER
  ------------------------------*/
  useEffect(() => {
    const needed = getXpRequired(level);
    if (xp >= needed) {
      const leftoverXp = xp - needed;
      const newLevel = level + 1;

      // Update states
      setXp(leftoverXp);
      setLevel(newLevel);

      // Trigger Modal
      setRecentLevelData({
        oldLevel: level,
        newLevel: newLevel,
        newTitle: getHeroProgression(newLevel).title
      });
      setShowLevelModal(true);
    }
  }, [xp, level, totalSteps]);

  const handleStepGainRef = useRef(null);

  useEffect(() => {
    handleStepGainRef.current = handleStepGain;
  });

  /* -----------------------------
        STEP TRACKING (REAL)
  ------------------------------*/
  useEffect(() => {
    startStepTracking((steps) => {
      if (steps <= 0) return;

      setStepsToday((prev) => prev + steps);
      setTotalSteps((prev) => prev + steps);
      if (handleStepGainRef.current) handleStepGainRef.current(steps);
    });
  }, []);

  /* -----------------------------
        MAIN LOGIC FOR STEP GAINS
  ------------------------------*/
  const handleStepGain = (amount) => {
    const newTotal = totalSteps + amount;
    const questGoal = Number(activeQuest?.steps || 0);

    // ZONE UNLOCK DETECTION
    const prevUnlockedZones = ZONES.filter(z => totalSteps >= z.requiredSteps);
    const newUnlockedZones = ZONES.filter(z => newTotal >= z.requiredSteps);

    if (newUnlockedZones.length > prevUnlockedZones.length) {
      // Unlocked at least one new zone
      const newZone = newUnlockedZones[newUnlockedZones.length - 1];
      setUnlockedZoneData(newZone);
      setShowZoneModal(true);

      // Persist unlock in Supabase seamlessly
      if (user) {
        supabase.from("zone_unlocks").insert({
          user_id: user.id,
          zone_id: newZone.id
        }).then(({ error }) => {
          if (error) console.error("Error saving zone unlock:", error);
        });
      }
    }

    // Pixel knight "walk" animation
    if (knightRef.current) {
      knightRef.current.classList.add("knight-walk");
      setTimeout(() => knightRef.current.classList.remove("knight-walk"), 300);
    }

    /* XP SYSTEM */
    setXp((prev) => prev + Math.round(amount * 0.1));

    /* QUEST SYSTEM */
    if (activeQuest && !questCompleted) {
      setQuestProgress((prev) => {
        const updated = prev + amount;
        if (updated >= questGoal && !questRewardGiven) {
          setQuestCompleted(true);
          setQuestRewardGiven(true);
          setXp((prevXp) => prevXp + activeQuest.reward);

          const item = rollLoot();
          addItem(item);

          setRecentRewardData(item);
          setShowQuestModal(true);
        }
        return Math.min(updated, questGoal);
      });
    }

    /* ACHIEVEMENTS */
    if (newTotal >= 100) unlock("first100", "First Steps", "Walked 100 total steps!");
    if (newTotal >= 1000) unlock("stepRookie", "Step Rookie", "Walked 1,000 total steps!");
    if (newTotal >= 10000) unlock("stepWarrior", "Step Warrior", "Walked 10,000 total steps!");

    /* LOOT SYSTEM */
    const LOOT_STEP_INTERVAL = 50;
    const guaranteedDrop = newTotal % LOOT_STEP_INTERVAL === 0;
    const randomDrop = Math.random() < 0.05;

    if (guaranteedDrop || randomDrop) {
      const item = rollLoot();
      addItem(item);
      alert(`🎒 Loot Found!\n${item.name} (${item.rarity})`);
    }
  };

  /* -----------------------------
        SIMULATE STEPS (for testing)
  ------------------------------*/
  const simulateSteps = () => {
    const fakeSteps = 5000;
    setStepsToday((prev) => prev + fakeSteps);
    setTotalSteps((prev) => prev + fakeSteps);
    handleStepGain(fakeSteps);
  };

  /* -----------------------------
        UI VALUES
  ------------------------------*/
  const xpToNext = getXpRequired(level);
  const xpPercent = Math.min(100, Math.round((xp / xpToNext) * 100));

  const questGoal = Number(activeQuest?.steps || 0);
  const questPercent = activeQuest
    ? Math.min(100, Math.round((questProgress / questGoal) * 100))
    : 0;

  // Pixel knight sprite depends on level
  const heroSprite = getHeroProgression(level);
  const pixelRows = heroSprite.pixels;
  const cols = pixelRows[0].length;

  // mobile‑app style metrics
  const dayPercent = Math.min(100, Math.round((stepsToday / dailyGoal) * 100));
  const distanceKm = (stepsToday * 0.0008).toFixed(1); // rough km estimate
  const calories = Math.round(stepsToday * 0.05); // rough kcal
  const activeMinutes = Math.round(stepsToday / 100); // ~1 min per 100 steps

  return (
    <div className="page home-page">
      <div className="home-shell">
        {/* HEADER */}
        <header className="home-header">
          <div>
            <p className="home-header-label">Today</p>
            <p className="home-header-date">
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            {city && temp != null && (
              <p className="home-header-weather" style={{ fontSize: "0.85rem", color: "#a1a1aa", marginTop: "0.25rem", fontWeight: "600" }}>
                {weather} {temp}°C in {city}
              </p>
            )}
          </div>

          {/* 🔹 Avatar top‑right */}
          <button
            className="home-avatar-btn"
            onClick={() => navigate("/profile")}
            aria-label="Open profile"
          >
            {avatar ? (
              <img
                src={avatar}
                alt="Your avatar"
                className="home-avatar-img"
              />
            ) : (
              <span className="home-avatar-placeholder">🙂</span>
            )}
          </button>
        </header>

        {/* BIG CIRCLE CARD */}
        <section className="steps-card">
          <div
            className="steps-ring-circle"
            style={{
              backgroundImage: `conic-gradient(#22c55e ${dayPercent}%, #111827 ${dayPercent}% 100%)`,
            }}
          >
            <div className="steps-ring-inner">
              <p className="steps-today-number">
                {stepsToday.toLocaleString()}
              </p>
              <p className="steps-goal-text">
                of {dailyGoal.toLocaleString()} steps
              </p>
            </div>
          </div>

          <div className="steps-badge">
            {streak > 0 && (
              <>
                <span className="badge-icon">🔥</span>
                <span className="badge-text" style={{marginRight: "0.4rem"}}>{streak} Day Streak</span>
              </>
            )}
            <span className="badge-icon">⚔️</span>
            <span className="badge-text">LVL {level}</span>
          </div>
        </section>

        {/* METRIC ROW */}
        <section className="metrics-row">
          <div className="metric-card">
            <p className="metric-label">Distance</p>
            <p className="metric-value">{distanceKm} km</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Calories</p>
            <p className="metric-value">{calories}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Active</p>
            <p className="metric-value">{activeMinutes} min</p>
          </div>
        </section>

        {/* PIXEL KNIGHT SECTION */}
        <section className="knight-section">
          <div
            ref={knightRef}
            className={`hero-pixel-grid ${heroSprite.visualClass || ""}`}
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              boxShadow: `0 0 0 4px ${heroSprite.colors["1"]}33, 0 0 16px ${heroSprite.colors["3"]}66`,
            }}
          >
            {pixelRows.map((row, rowIndex) =>
              row.split("").map((cell, colIndex) => {
                const key = `${rowIndex}-${colIndex}`;
                if (cell === ".") {
                  return (
                    <div
                      key={key}
                      className="hero-pixel-cell pixel-empty"
                    />
                  );
                }
                const color = heroSprite.colors[cell] || "transparent";
                return (
                  <div
                    key={key}
                    className="hero-pixel-cell"
                    style={{ backgroundColor: color }}
                  />
                );
              })
            )}
          </div>

          <div className="knight-info">
            <p className="knight-level">LVL {level}</p>
            <p className="knight-title">{heroSprite.title}</p>
          </div>

          {/* Inventory floating button */}
          <button
            className="inventory-fab"
            onClick={() => navigate("/inventory")}
          >
            🎒
          </button>
        </section>

        {/* BOTTOM DETAILS CARD */}
        <section className="details-card">
          <p className="stat">
            Steps Today:{" "}
            <span className="stat-highlight">
              {stepsToday.toLocaleString()}
            </span>
          </p>
          <p className="stat">
            Total Steps:{" "}
            <span className="stat-highlight">
              {totalSteps.toLocaleString()}
            </span>
          </p>
          <p className="stat">
            Level: <span className="stat-highlight">{level}</span>
          </p>
          <p className="stat">
            XP: {xp} / {xpToNext}
          </p>

          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>

          <hr />

          {!activeQuest && (
            <p className="stat muted">No quest selected.</p>
          )}

          {activeQuest && (
            <>
              <h2 className="card-title">{activeQuest.title}</h2>
              <p className="stat">
                Progress: {questProgress} / {questGoal}
              </p>
              <div className="quest-bar">
                <div
                  className="quest-fill"
                  style={{ width: `${questPercent}%` }}
                />
              </div>
              {questCompleted && <p>✅ Quest Completed!</p>}
            </>
          )}

          <button className="btn-primary full-width" onClick={simulateSteps}>
            Simulate +5,000 Steps
          </button>
        </section>
      </div>

      {showQuestModal && (
        <QuestCompleteModal
          quest={activeQuest}
          xpGained={activeQuest.reward}
          itemDropped={recentRewardData}
          onClose={() => setShowQuestModal(false)}
        />
      )}

      {showLevelModal && recentLevelData && (
        <LevelUpModal
          oldLevel={recentLevelData.oldLevel}
          newLevel={recentLevelData.newLevel}
          newTitle={recentLevelData.newTitle}
          onClose={() => setShowLevelModal(false)}
        />
      )}

      {showZoneModal && unlockedZoneData && (
        <ZoneUnlockModal
          zone={unlockedZoneData}
          onClose={() => setShowZoneModal(false)}
        />
      )}
    </div>
  );
}
