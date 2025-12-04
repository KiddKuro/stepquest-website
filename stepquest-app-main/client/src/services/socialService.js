// src/services/socialService.js
import { supabase } from "../supabaseClient";

// ===== LEADERBOARD =====
export async function fetchLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from("player_stats")
    .select("user_id, total_steps")
    .order("total_steps", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error loading leaderboard:", error);
    return [];
  }
  return data || [];
}

// ===== FRIENDS =====
export async function fetchFriends(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("social_friends")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading friends:", error);
    return [];
  }
  return data || [];
}

export async function addFriend(ownerId, friendEmail, nickname) {
  if (!ownerId || !friendEmail) return { error: "Missing data" };

  const { error } = await supabase.from("social_friends").insert({
    owner_id: ownerId,
    friend_email: friendEmail,
    nickname,
  });

  if (error) {
    console.error("Error adding friend:", error);
  }
  return { error };
}
