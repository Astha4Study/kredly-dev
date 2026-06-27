// === Request Types ===
export interface CreateSessionPayload {
  role: string;
  level: string;
  skills: string[];
  cv_summary: string;
  assessment_id?: string;
}

// === Response Types ===
export interface SessionResponse {
  session_id: string;
  role: string;
  theta_init: number;
}

export interface SessionDetails {
  id: string;
  role: string;
  level: string;
  total_items: number;
  max_items: number;
  min_items: number;
  completed: boolean;
  assessment_id?: string;
}

export interface QuizItem {
  id: string;
  type: 'multiple_choice' | 'essay';
  topic: string;
  pertanyaan: string;
  pilihan?: string[];
}

export interface NextItemResponse {
  item: QuizItem;
  question_number: number;
  max_questions?: number;
  min_questions?: number;
}

export interface AnswerResponse {
  correct: boolean;
  correct_answer: string; // The correct option key (A/B/C/D)
  explanation: string;
  theta_new: number;
  completed: boolean;
  stop_reason: string;
  question_number: number;
}

export interface ResultResponse {
  score: number;
  theta: number;
  level: string;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  verification_id: string;
  role: string;
  total_items: number;
  duration_seconds: number;
  candidate_name: string;
  assessment_id?: string;
}
