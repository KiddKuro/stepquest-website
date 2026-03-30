export const BASE_PIXELS = [
  "..1111..",
  ".122221.",
  ".122221.",
  "..3333..",
  "..3..3..",
  ".3....3.",
  ".3....3.",
  "..3333..",
];

// 1 = Helmet/Edge, 2 = Visor/Face, 3 = Armour/Body
const levelData = [
  // 🔥 Levels 1–10 (Early Game)
  { level: 1, title: "Ember Scout", colors: { "1": "#ef4444", "2": "#f97316", "3": "#374151" } },
  { level: 2, title: "Moss Runner", colors: { "1": "#22c55e", "2": "#65a30d", "3": "#78350f" } },
  { level: 3, title: "Sky Hopper", colors: { "1": "#7dd3fc", "2": "#ffffff", "3": "#d1d5db" } },
  { level: 4, title: "Dust Wanderer", colors: { "1": "#d6d3d1", "2": "#f5f5dc", "3": "#8b5a2b" } },
  { level: 5, title: "Spark Initiate", colors: { "1": "#fef08a", "2": "#fbbf24", "3": "#000000" } },
  { level: 6, title: "Pebble Guard", colors: { "1": "#9ca3af", "2": "#64748b", "3": "#334155" } },
  { level: 7, title: "Riverstepper", colors: { "1": "#14b8a6", "2": "#06b6d4", "3": "#1e3a8a" } },
  { level: 8, title: "Sun Sprinter", colors: { "1": "#fcd34d", "2": "#f97316", "3": "#ffffff" } },
  { level: 9, title: "Frostling", colors: { "1": "#bae6fd", "2": "#cffafe", "3": "#ffffff" } },
  { level: 10, title: "Shadow Cub", colors: { "1": "#4c1d95", "2": "#000000", "3": "#7f1d1d" } },

  // ⚔️ Levels 11–20 (Mid Game)
  { level: 11, title: "Iron Pathfinder", colors: { "1": "#94a3b8", "2": "#cbd5e1", "3": "#1d4ed8" } },
  { level: 12, title: "Flame Adept", colors: { "1": "#dc2626", "2": "#ea580c", "3": "#fbbf24" } },
  { level: 13, title: "Thorn Stalker", colors: { "1": "#065f46", "2": "#84cc16", "3": "#000000" } },
  { level: 14, title: "Storm Caller", colors: { "1": "#3b82f6", "2": "#ffffff", "3": "#8b5cf6" } },
  { level: 15, title: "Sandstrider", colors: { "1": "#fde047", "2": "#a16207", "3": "#ea580c" } },
  { level: 16, title: "Night Prowler", colors: { "1": "#000000", "2": "#312e81", "3": "#0ea5e9" } },
  { level: 17, title: "Glacier Knight", colors: { "1": "#7dd3fc", "2": "#ffffff", "3": "#cbd5e1" } },
  { level: 18, title: "Cinder Rogue", colors: { "1": "#475569", "2": "#ef4444", "3": "#000000" } },
  { level: 19, title: "Aurora Walker", colors: { "1": "#f472b6", "2": "#22d3ee", "3": "#a855f7" } },
  { level: 20, title: "Crystal Seeker", colors: { "1": "#2dd4bf", "2": "#ffffff", "3": "#06b6d4" } },

  // 🐉 Levels 21–30 (Advanced)
  { level: 21, title: "Dragon Knight", colors: { "1": "#b91c1c", "2": "#fbbf24", "3": "#000000" } },
  { level: 22, title: "Void Ranger", colors: { "1": "#581c87", "2": "#000000", "3": "#a855f7" } },
  { level: 23, title: "Solar Guardian", colors: { "1": "#f59e0b", "2": "#fef08a", "3": "#ffffff" } },
  { level: 24, title: "Lunar Phantom", colors: { "1": "#bfdbfe", "2": "#e2e8f0", "3": "#c084fc" } },
  { level: 25, title: "Obsidian Blade", colors: { "1": "#171717", "2": "#171717", "3": "#dc2626" } },
  { level: 26, title: "Emerald Warden", colors: { "1": "#15803d", "2": "#fbbf24", "3": "#451a03" } },
  { level: 27, title: "Blaze Champion", colors: { "1": "#ea580c", "2": "#ef4444", "3": "#fef08a" } },
  { level: 28, title: "Frost Sentinel", colors: { "1": "#67e8f9", "2": "#ffffff", "3": "#bfdbfe" } },
  { level: 29, title: "Thunder Striker", colors: { "1": "#fef08a", "2": "#3b82f6", "3": "#ffffff" } },
  { level: 30, title: "Runic Warrior", colors: { "1": "#64748b", "2": "#64748b", "3": "#60a5fa" } },

  // 🌌 Levels 31–40 (Epic)
  { level: 31, title: "Nebula Drifter", colors: { "1": "#f472b6", "2": "#a855f7", "3": "#1e3a8a" } },
  { level: 32, title: "Galaxy Knight", colors: { "1": "#000000", "2": "#ffffff", "3": "#3b82f6" } },
  { level: 33, title: "Inferno Titan", colors: { "1": "#b91c1c", "2": "#ea580c", "3": "#000000" } },
  { level: 34, title: "Toxic Reaper", colors: { "1": "#4ade80", "2": "#000000", "3": "#581c87" } },
  { level: 35, title: "Celestial Guard", colors: { "1": "#ffffff", "2": "#fcd34d", "3": "#bfdbfe" } },
  { level: 36, title: "Phantom Blaze", colors: { "1": "#f1f5f9", "2": "#f1f5f9", "3": "#ef4444" } },
  { level: 37, title: "Abyss Walker", colors: { "1": "#1e3a8a", "2": "#000000", "3": "#2dd4bf" } },
  { level: 38, title: "Radiant Hero", colors: { "1": "#fbbf24", "2": "#ffffff", "3": "#fef08a" } },
  { level: 39, title: "Shadow Infernal", colors: { "1": "#000000", "2": "#dc2626", "3": "#ea580c" } },
  { level: 40, title: "Crystal Phantom", colors: { "1": "#22d3ee", "2": "#ffffff", "3": "#22d3ee" } },

  // 👑 Levels 41–50 (Legendary)
  { level: 41, title: "Mythic Dragonlord", colors: { "1": "#fbbf24", "2": "#b91c1c", "3": "#6b21a8" } },
  { level: 42, title: "Eclipse Sovereign", colors: { "1": "#000000", "2": "#f59e0b", "3": "#991b1b" } },
  { level: 43, title: "Prism Champion", colors: { "1": "#ff007f", "2": "#00f0ff", "3": "#7df9ff" } },
  { level: 44, title: "Void Emperor", colors: { "1": "#000000", "2": "#d946ef", "3": "#3b82f6" } },
  { level: 45, title: "Starlight Ascendant", colors: { "1": "#ffffff", "2": "#e2e8f0", "3": "#bfdbfe" } },
  { level: 46, title: "Infernal Overlord", colors: { "1": "#7f1d1d", "2": "#000000", "3": "#ea580c" } },
  { level: 47, title: "Aurora Titan", colors: { "1": "#ec4899", "2": "#14b8a6", "3": "#a855f7" } },
  { level: 48, title: "Cosmic Deity", colors: { "1": "#1e1b4b", "2": "#ffffff", "3": "#8b5cf6" } },
  { level: 49, title: "Radiant Apex", colors: { "1": "#fbbf24", "2": "#ffffff", "3": "#fef08a" } },
  { level: 50, title: "Infinity Walker", colors: { "1": "#000000", "2": "#ffffff", "3": "#10b981" } }
];

export const getHeroProgression = (level) => {
  // Cap at 50
  const effectiveLevel = Math.max(1, Math.min(level, 50));
  const data = levelData[effectiveLevel - 1];
  
  // Determine CSS class based on tier
  let visualClass = "";
  if (effectiveLevel >= 41) visualClass = "hero-shimmer hero-glow";
  else if (effectiveLevel >= 31) visualClass = "hero-glow";
  else if (effectiveLevel >= 21) visualClass = "hero-pulse";

  return {
    title: data.title,
    pixels: BASE_PIXELS,
    colors: data.colors,
    visualClass: visualClass
  };
};
