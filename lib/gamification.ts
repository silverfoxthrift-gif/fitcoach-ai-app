// Pure gamification engine — XP, levels, rank titles, streaks, badges.
// No React, no storage: just deterministic functions over Progress state.

import type { Progress } from "./types";

export const XP_PER_MESSAGE = 12;
export const DAILY_BONUS = 25; // first message of a new day

// XP needed to go from `level` -> `level + 1`.
export function xpToNext(level: number): number {
  return 50 * level;
}

// Total cumulative XP required to *reach* a given level.
// reach(L) = sum_{i=1}^{L-1} 50*i = 25 * (L-1) * L
function xpToReach(level: number): number {
  return 25 * (level - 1) * level;
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpToReach(level + 1)) level += 1;
  return level;
}

export interface LevelInfo {
  level: number;
  rank: Rank;
  /** XP accumulated inside the current level. */
  xpIntoLevel: number;
  /** XP span of the current level. */
  xpForLevel: number;
  /** 0..1 progress through the current level. */
  pct: number;
}

export function levelInfo(totalXp: number): LevelInfo {
  const level = levelFromXp(totalXp);
  const base = xpToReach(level);
  const span = xpToNext(level);
  const into = totalXp - base;
  return {
    level,
    rank: rankForLevel(level),
    xpIntoLevel: into,
    xpForLevel: span,
    pct: Math.max(0, Math.min(1, into / span)),
  };
}

export interface Rank {
  title: string;
  /** Inclusive lower level bound. */
  from: number;
}

const RANKS: Rank[] = [
  { title: "Rookie", from: 1 },
  { title: "Trainee", from: 3 },
  { title: "Athlete", from: 6 },
  { title: "Beast", from: 10 },
  { title: "Legend", from: 15 },
];

export function rankForLevel(level: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) if (level >= r.from) current = r;
  return current;
}

// ── Streak ────────────────────────────────────────────────────────────────

export function ymd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/** The streak to *show* — collapses to 0 if the last active day is stale. */
export function effectiveStreak(p: Progress): number {
  if (!p.lastActiveDate) return 0;
  const gap = daysBetween(p.lastActiveDate, ymd());
  if (gap <= 0) return p.streak; // today
  if (gap === 1) return p.streak; // yesterday — still alive (at risk)
  return 0; // broken
}

/** True when today's message would extend (not start) the streak. */
export function streakAtRisk(p: Progress): boolean {
  if (!p.lastActiveDate) return false;
  return daysBetween(p.lastActiveDate, ymd()) === 1;
}

// ── Badges ──────────────────────────────────────────────────────────────────

export interface BadgeDef {
  id: string;
  label: string;
  desc: string;
  icon: string; // emoji glyph
  earned: (p: Progress) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first_words",
    label: "First Words",
    desc: "Send your first message to Coach Rey.",
    icon: "💬",
    earned: (p) => p.totalMessages >= 1,
  },
  {
    id: "strategist",
    label: "Strategist",
    desc: "Get your first structured workout plan.",
    icon: "🧠",
    earned: (p) => p.plansGenerated >= 1,
  },
  {
    id: "streak_3",
    label: "Consistent",
    desc: "Train 3 days in a row.",
    icon: "🔥",
    earned: (p) => p.streak >= 3,
  },
  {
    id: "rising",
    label: "Rising",
    desc: "Reach Level 5.",
    icon: "📈",
    earned: (p) => levelFromXp(p.totalXp) >= 5,
  },
  {
    id: "streak_7",
    label: "Dedicated",
    desc: "Keep a 7-day streak.",
    icon: "🗓️",
    earned: (p) => p.streak >= 7,
  },
  {
    id: "unstoppable",
    label: "Unstoppable",
    desc: "Reach Level 10.",
    icon: "⚡",
    earned: (p) => levelFromXp(p.totalXp) >= 10,
  },
  {
    id: "centurion",
    label: "Centurion",
    desc: "Send 100 messages.",
    icon: "💯",
    earned: (p) => p.totalMessages >= 100,
  },
];

export function earnedBadgeIds(p: Progress): string[] {
  return BADGES.filter((b) => b.earned(p)).map((b) => b.id);
}

// ── Apply an event ────────────────────────────────────────────────────────────

export interface ProgressDelta {
  next: Progress;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  rankChanged: boolean;
  newRank: string;
  newBadges: BadgeDef[];
}

/** Records one sent user message: XP, daily bonus, streak, badges. */
export function applyMessage(prev: Progress, opts?: { plan?: boolean }): ProgressDelta {
  const today = ymd();
  const beforeLevel = levelFromXp(prev.totalXp);
  const beforeRank = rankForLevel(beforeLevel).title;

  // Streak
  let streak = prev.streak;
  if (!prev.lastActiveDate) {
    streak = 1;
  } else {
    const gap = daysBetween(prev.lastActiveDate, today);
    if (gap <= 0) streak = prev.streak; // same day
    else if (gap === 1) streak = prev.streak + 1; // consecutive
    else streak = 1; // reset
  }

  const firstOfDay = prev.lastActiveDate !== today;
  const xpGained = XP_PER_MESSAGE + (firstOfDay ? DAILY_BONUS : 0);

  const draft: Progress = {
    totalXp: prev.totalXp + xpGained,
    totalMessages: prev.totalMessages + 1,
    plansGenerated: prev.plansGenerated + (opts?.plan ? 1 : 0),
    streak,
    lastActiveDate: today,
    badges: prev.badges,
  };

  const afterLevel = levelFromXp(draft.totalXp);
  const afterRank = rankForLevel(afterLevel).title;

  const earned = earnedBadgeIds(draft);
  const newBadgeIds = earned.filter((id) => !prev.badges.includes(id));
  draft.badges = earned;

  return {
    next: draft,
    xpGained,
    leveledUp: afterLevel > beforeLevel,
    newLevel: afterLevel,
    rankChanged: afterRank !== beforeRank,
    newRank: afterRank,
    newBadges: BADGES.filter((b) => newBadgeIds.includes(b.id)),
  };
}

export const INITIAL_PROGRESS: Progress = {
  totalXp: 0,
  totalMessages: 0,
  plansGenerated: 0,
  streak: 0,
  lastActiveDate: null,
  badges: [],
};
