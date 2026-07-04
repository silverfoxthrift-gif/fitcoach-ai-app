"use client";

import type { Progress } from "@/lib/types";
import {
  BADGES,
  effectiveStreak,
  levelInfo,
  streakAtRisk,
} from "@/lib/gamification";
import ResetProgress from "./ResetProgress";

export default function ProgressRail({ progress }: { progress: Progress }) {
  const info = levelInfo(progress.totalXp);
  const streak = effectiveStreak(progress);
  const atRisk = streakAtRisk(progress);
  const earnedCount = progress.badges.length;

  return (
    <>
      <p className="rail-intro">
        Your progress. <b>Every message earns XP</b> — level up and keep your streak alive.
      </p>

      {/* Level + XP */}
      <div className="card level-card">
        <div className="level-top">
          <div className="level-num">
            <span className="lv">Level</span>
            <span className="n">{info.level}</span>
          </div>
          <span className="rank-pill">{info.rank.title}</span>
        </div>
        <div className="xp-bar" role="progressbar" aria-valuenow={Math.round(info.pct * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="xp-fill" style={{ width: `${Math.max(info.pct * 100, 4)}%` }} />
        </div>
        <div className="xp-meta">
          <span>
            <b>{info.xpIntoLevel}</b> / {info.xpForLevel} XP
          </span>
          <span>{info.xpForLevel - info.xpIntoLevel} to next</span>
        </div>
      </div>

      {/* Streak */}
      <div className="card streak-card">
        <div className={`flame${streak > 0 ? "" : " cold"}`} aria-hidden>
          🔥
        </div>
        <div className="streak-meta">
          <div className="big">
            <span>{streak}</span> {streak === 1 ? "day" : "days"}
          </div>
          <div className={`lbl${atRisk ? " risk" : ""}`}>
            {streak === 0
              ? "Start your streak today"
              : atRisk
              ? "Train today to keep it!"
              : "Streak active"}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card pad" style={{ padding: 16 }}>
        <div className="card-title">
          <span className="ct">Achievements</span>
          <span className="cc">
            {earnedCount}/{BADGES.length}
          </span>
        </div>
        <div className="badges">
          {BADGES.map((b) => {
            const earned = progress.badges.includes(b.id);
            return (
              <div className={`badge ${earned ? "earned" : "locked"}`} key={b.id}>
                <span className="ic">{earned ? b.icon : "🔒"}</span>
                <span className="bl">{b.label}</span>
                <span className="tip">
                  <b>{b.label}</b> — {b.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ResetProgress />
    </>
  );
}
