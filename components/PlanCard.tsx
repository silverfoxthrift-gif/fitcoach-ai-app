"use client";

import type { WorkoutPlan } from "@/lib/types";

export default function PlanCard({ plan }: { plan: WorkoutPlan }) {
  return (
    <div className="plan">
      <div className="plan-head">
        <div className="kicker">Your plan</div>
        <h3>{plan.title}</h3>
        {plan.summary ? <p>{plan.summary}</p> : null}
      </div>
      {plan.days?.map((day, i) => (
        <div className="plan-day" key={i}>
          <div className="plan-day-top">
            <span className="d">{day.day}</span>
            <span className="f">{day.focus}</span>
          </div>
          {day.exercises?.map((ex, j) => (
            <div className="ex" key={j}>
              <span className="en">{ex.name}</span>
              <span className="sr">
                {ex.sets}×{ex.reps}
              </span>
              {ex.notes ? <span className="nt">{ex.notes}</span> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
