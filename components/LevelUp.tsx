"use client";

import { useEffect, useMemo, useRef } from "react";

export interface Celebration {
  id: string;
  kicker: string;
  text: string;
  icon: string;
  confetti?: boolean;
}

export default function LevelUp({
  items,
  onDismiss,
}: {
  items: Celebration[];
  onDismiss: (id: string) => void;
}) {
  const showConfetti = items.some((i) => i.confetti);

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="toast-wrap">
        {items.map((c) => (
          <Toast key={c.id} c={c} onDone={() => onDismiss(c.id)} />
        ))}
      </div>
    </>
  );
}

function Toast({ c, onDone }: { c: Celebration; onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current(), 3800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="toast">
      <div className="ti" aria-hidden>
        {c.icon}
      </div>
      <div>
        <div className="tt">{c.kicker}</div>
        <div className="tx">{c.text}</div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(() => {
    const colors = ["#c6f24e", "#d6ff52", "#ff9a3d", "#ecefe7", "#9fd531"];
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.6 + Math.random() * 1.4,
      color: colors[i % colors.length],
      rotate: Math.random() * 360,
    }));
  }, []);

  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p) => (
        <i
          key={p.id}
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
