"use client";

import { useEffect, useState } from "react";
import type { ChatMessage, CoachResponse, Profile } from "@/lib/types";
import { useLocalStorage } from "@/lib/storage";
import { useProgress } from "@/lib/useProgress";
import { effectiveStreak, levelInfo } from "@/lib/gamification";
import Chat from "@/components/Chat";
import ProgressRail from "@/components/ProgressRail";
import Onboarding from "@/components/Onboarding";
import LevelUp, { type Celebration } from "@/components/LevelUp";

let _c = 0;
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${_c++}`;

function greeting(p: Profile): string {
  const g =
    p.goal && p.goal !== "General fitness"
      ? ` I see you're focused on ${p.goal.toLowerCase()} — love it.`
      : "";
  return `Hey, I'm Coach Rey 👋 your AI fitness coach.${g} Tell me what you'd like to work on, or tap a suggestion to get rolling. Every message earns XP and keeps your streak alive.`;
}

export default function Home() {
  const [profile, setProfile, pHydrated] = useLocalStorage<Profile | null>("profile", null);
  const [messages, setMessages, mHydrated] = useLocalStorage<ChatMessage[]>("messages", []);
  const { progress, hydrated: gHydrated, recordMessage } = useProgress();

  const [loading, setLoading] = useState(false);
  const [cels, setCels] = useState<Celebration[]>([]);

  const hydrated = pHydrated && mHydrated && gHydrated;

  // Seed the coach's greeting once a profile exists and the thread is empty.
  useEffect(() => {
    if (hydrated && profile && messages.length === 0) {
      setMessages([
        { id: uid(), role: "assistant", content: greeting(profile), animate: true, plan: null },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profile]);

  async function send(text: string) {
    if (!profile || loading) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, profile }),
      });
      const data = (await res.json()) as Partial<CoachResponse> & { error?: string };
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      const reply =
        (typeof data.reply === "string" && data.reply.trim()) ||
        "Hmm, I didn't catch that — mind rephrasing?";
      const plan = data.plan ?? null;

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: reply, animate: true, plan },
      ]);

      const delta = recordMessage({ plan: !!plan });
      celebrate(delta);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong reaching Coach Rey.";
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: `⚠️ I couldn't reach the coaching engine just now (${msg}). Check the connection and try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function celebrate(delta: ReturnType<typeof recordMessage>) {
    const next: Celebration[] = [];
    if (delta.leveledUp)
      next.push({
        id: uid(),
        kicker: "Level up",
        text: `You reached Level ${delta.newLevel}`,
        icon: "⭐",
        confetti: true,
      });
    if (delta.rankChanged)
      next.push({
        id: uid(),
        kicker: "New rank",
        text: `You're now a ${delta.newRank}`,
        icon: "🏆",
        confetti: true,
      });
    for (const b of delta.newBadges)
      next.push({ id: uid(), kicker: "Badge unlocked", text: b.label, icon: b.icon });
    if (next.length) setCels((prev) => [...prev, ...next]);
  }

  const info = levelInfo(progress.totalXp);
  const streak = effectiveStreak(progress);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            🤖
          </div>
          <div>
            <div className="brand-name">Coach Rey</div>
            <div className="brand-sub">AI Fitness Coach</div>
          </div>
        </div>
        <div className="topstats">
          <span className="chip-stat lime" title="Your level">
            LV <b>{info.level}</b>
          </span>
          <span className="chip-stat amber" title="Day streak">
            🔥 <b>{streak}</b>
          </span>
        </div>
      </header>

      <div className="layout">
        <Chat messages={messages} loading={loading} onSend={send} />
        <aside className="rail" aria-label="Your progress">
          <ProgressRail progress={progress} />
        </aside>
      </div>

      {hydrated && !profile && (
        <Onboarding
          onComplete={(p) => {
            setMessages([]);
            setProfile(p);
          }}
        />
      )}

      <LevelUp items={cels} onDismiss={(id) => setCels((prev) => prev.filter((c) => c.id !== id))} />
    </div>
  );
}
