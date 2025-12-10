import api from "../api";

export interface AttemptEvent {
  id: number;
  event_type: string;
  triggered_by: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface MonitorAttempt {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
    nisn?: string | null;
  };
  status: "in_progress" | "completed" | "blocked" | "abandoned";
  is_blocked: boolean;
  blocked_reason?: string | null;
  cheat_count: number;
  answered_count: number;
  total_questions: number;
  progress_percent: number;
  started_at?: string | null;
  last_activity_at?: string | null;
  finished_at?: string | null;
  events: AttemptEvent[];
}

export interface MonitorResponse {
  test: {
    id: number;
    title: string;
    duration: number;
    kelas: string;
    subject: string;
    total_questions: number;
  };
  attempts: MonitorAttempt[];
}

export interface LogEventPayload {
  event_type: string;
  description?: string;
  metadata?: Record<string, unknown>;
  is_violation?: boolean;
}

const testAttemptService = {
  getAttempt: async (attemptId: number) => {
    const response = await api.get(`/attempts/${attemptId}`);
    return response.data;
  },

  logEvent: async (attemptId: number, payload: LogEventPayload) => {
    const response = await api.post(`/attempts/${attemptId}/events`, payload);
    return response.data;
  },

  monitorTest: async (testId: number) => {
    const response = await api.get(`/tests/${testId}/monitor`);
    return response.data as MonitorResponse;
  },

  blockAttempt: async (attemptId: number, reason?: string) => {
    const response = await api.post(`/attempts/${attemptId}/block`, { reason });
    return response.data;
  },

  unblockAttempt: async (attemptId: number, reason?: string) => {
    const response = await api.post(`/attempts/${attemptId}/unblock`, {
      reason,
    });
    return response.data;
  },
};

export default testAttemptService;
