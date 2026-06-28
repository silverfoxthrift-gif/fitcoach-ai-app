"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { ChatMessage } from "@/lib/types";
import PlanCard from "./PlanCard";

const PROMPTS = [
  "Build me a 3-day plan",
  "How do I fix my squat form?",
  "What should I eat post-workout?",
  "I've only got 20 minutes — go",
];

export default function Chat({
  messages,
  loading,
  onSend,
}: {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (text: string) => void;
}) {
  const streamRef = useRef<HTMLDivElement>(null);
  const hasUserMsg = messages.some((m) => m.role === "user");

  const scrollToBottom = () => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useLayoutEffect(scrollToBottom, [messages.length, loading]);

  return (
    <div className="chat">
      <div className="stream" ref={streamRef}>
        {messages.map((m) => (
          <Bubble key={m.id} m={m} onGrow={scrollToBottom} />
        ))}

        {loading && (
          <div className="msg coach">
            <div className="avatar coach" aria-hidden>
              🤖
            </div>
            <div className="bubble">
              <span className="name">Coach Rey</span>
              <span className="typing" aria-label="Coach is typing">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        )}

        {!hasUserMsg && !loading && (
          <div className="chips" style={{ justifyContent: "flex-start", marginTop: 4 }}>
            {PROMPTS.map((p) => (
              <button className="chip" key={p} onClick={() => onSend(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Composer loading={loading} onSend={onSend} />
    </div>
  );
}

function Bubble({ m, onGrow }: { m: ChatMessage; onGrow: () => void }) {
  const isCoach = m.role === "assistant";
  const shown = useTypewriter(m.animate ? m.content : null, onGrow);
  const text = m.animate ? shown.text : m.content;
  const typing = m.animate && !shown.done;

  return (
    <div className={`msg ${isCoach ? "coach" : "user"}`}>
      <div className={`avatar ${isCoach ? "coach" : ""}`} aria-hidden>
        {isCoach ? "🤖" : "🧑"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
        <div className="bubble">
          {isCoach && <span className="name">Coach Rey</span>}
          {text}
          {typing && <span className="caret" />}
        </div>
        {isCoach && m.plan && !typing ? <PlanCard plan={m.plan} /> : null}
      </div>
    </div>
  );
}

/** Reveals `full` word-by-word. Pass null to show nothing/animate off. */
function useTypewriter(full: string | null, onGrow: () => void) {
  const [count, setCount] = useState(0);
  const words = useRef<string[]>([]);
  const grow = useRef(onGrow);
  grow.current = onGrow;

  useEffect(() => {
    if (full == null) return;
    words.current = full.split(/(\s+)/); // keep whitespace tokens
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      grow.current();
      if (i >= words.current.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [full]);

  if (full == null) return { text: "", done: true };
  const tokens = full.split(/(\s+)/);
  return { text: tokens.slice(0, count).join(""), done: count >= tokens.length };
}

function Composer({
  loading,
  onSend,
}: {
  loading: boolean;
  onSend: (t: string) => void;
}) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function autosize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function submit() {
    const t = text.trim();
    if (!t || loading) return;
    onSend(t);
    setText("");
    requestAnimationFrame(() => {
      if (ref.current) ref.current.style.height = "auto";
    });
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="composer">
      <div className="composer-inner">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder="Ask Coach Rey anything…"
          onChange={(e) => {
            setText(e.target.value);
            autosize();
          }}
          onKeyDown={onKey}
        />
        <button
          className="send"
          onClick={submit}
          disabled={!text.trim() || loading}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 12L20 4L13 20L11 13L4 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="composer-hint">
        Enter to send · Shift + Enter for a new line · Coach Rey can be wrong — train safe
      </div>
    </div>
  );
}
