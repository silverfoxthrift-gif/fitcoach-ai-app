"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";

const GOALS = ["Build muscle", "Lose fat", "Get stronger", "Endurance", "General fitness"];
const EXPERIENCE = ["Beginner", "Intermediate", "Advanced"];
const EQUIPMENT = ["No equipment", "Home dumbbells", "Full gym"];

export default function Onboarding({
  onComplete,
}: {
  onComplete: (p: Profile) => void;
}) {
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [equipment, setEquipment] = useState("");
  const [notes, setNotes] = useState("");

  const ready = goal && experience && equipment;

  function submit() {
    if (!ready) return;
    onComplete({ goal, experience, equipment, notes: notes.trim() });
  }

  return (
    <div className="overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Set up your coach">
        <div className="modal-head">
          <div className="mk">
            <div className="brand-mark" aria-hidden>
              🏋️
            </div>
            <div>
              <div className="kicker">Coach Rey</div>
              <h2>Let&apos;s tailor your training</h2>
            </div>
          </div>
          <p>Three quick taps so every answer fits you. Takes 20 seconds.</p>
        </div>

        <div className="modal-body">
          <Picker label="What's your main goal?" options={GOALS} value={goal} onChange={setGoal} />
          <Picker
            label="Experience level"
            options={EXPERIENCE}
            value={experience}
            onChange={setExperience}
          />
          <Picker
            label="What do you train with?"
            options={EQUIPMENT}
            value={equipment}
            onChange={setEquipment}
          />
          <div className="field">
            <label htmlFor="notes">Anything else? (optional)</label>
            <textarea
              id="notes"
              rows={2}
              placeholder="e.g. bad left knee, 30 min sessions, vegetarian…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn-primary" disabled={!ready} onClick={submit}>
            {ready ? "Meet Coach Rey →" : "Pick one from each"}
          </button>
          <button
            className="skip"
            onClick={() =>
              onComplete({
                goal: "General fitness",
                experience: "Beginner",
                equipment: "No equipment",
                notes: "",
              })
            }
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function Picker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="opts">
        {options.map((o) => (
          <button
            key={o}
            className={`opt${value === o ? " sel" : ""}`}
            onClick={() => onChange(o)}
            type="button"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
