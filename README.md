# Coach Rey — gamified AI fitness coach

A dark, focused chat app where you talk to an AI fitness coach (Claude, via n8n) and
level up as you go. Built on the shared `_template/` starter.

## How it works

```
Browser ──POST {message, history, profile}──► /api/run ──► N8N_WEBHOOK_URL
  (chat + gamification)                                    (Webhook → Build Request
                                                            → Anthropic → Parse → Respond)
Browser ◄────────── { reply, plan } ──────────────────────┘
```

- **Chat** with simulated streaming (reply types out word-by-word).
- **Gamification (100% client-side, localStorage):** XP + levels, rank titles
  (Rookie → Trainee → Athlete → Beast → Legend), daily streak, badges, level-up confetti.
- **Structured plans:** when you ask for a workout/week plan, the coach returns a
  `plan` object that renders as a card.

The n8n workflow returns the **same JSON envelope every turn**:
`{ "reply": string, "plan": null | { title, summary, days[] } }`.

## Run locally

1. `npm install`
2. Copy `.env.example` → `.env.local` and set `N8N_WEBHOOK_URL`.
   - Local: the **Fitness Coach Chat** workflow's webhook on your n8n
     (e.g. `http://localhost:5678/webhook/fitness-coach-chat`). The workflow must be
     **active** and have an **Anthropic API credential** attached to its HTTP node.
3. `npm run dev` → http://localhost:3000

## Structure

- `app/page.tsx` — orchestrator: chat state, send flow, gamification events, onboarding
- `app/api/run/route.ts` — forwards the browser body to the n8n webhook
- `components/` — `Chat`, `ProgressRail`, `PlanCard`, `Onboarding`, `LevelUp`
- `lib/gamification.ts` — pure XP / level / rank / streak / badge engine
- `lib/storage.ts`, `lib/useProgress.ts` — localStorage persistence
- `app/globals.css` — "Training Terminal" design system (dark + electric-lime accent)

## Model

The workflow calls `claude-haiku-4-5-20251001` (fast & cheap for chat). Swap to
`claude-sonnet-4-6` in the workflow's **Build Request** node for richer plans.
