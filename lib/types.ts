// Shared types for Coach Rey.

export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  /** When true, the bubble reveals word-by-word (simulated streaming). */
  animate?: boolean;
  /** Optional structured workout plan attached to a coach message. */
  plan?: WorkoutPlan | null;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface PlanDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  title: string;
  summary: string;
  days: PlanDay[];
}

/** The exact JSON envelope the n8n workflow returns every turn. */
export interface CoachResponse {
  reply: string;
  plan: WorkoutPlan | null;
}

export interface Profile {
  goal: string;
  experience: string;
  equipment: string;
  notes?: string;
}

export interface Progress {
  totalXp: number;
  totalMessages: number;
  plansGenerated: number;
  streak: number;
  /** YYYY-MM-DD of the last day a message was sent, or null. */
  lastActiveDate: string | null;
  /** Ids of unlocked badges. */
  badges: string[];
}
