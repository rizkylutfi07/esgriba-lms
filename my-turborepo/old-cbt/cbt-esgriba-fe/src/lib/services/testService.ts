import api from "../api";

export interface Test {
  id: number;
  title: string;
  description?: string;
  subject: string;
  kelas: string;
  duration: number;
  passing_score: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  cheat_detection_enabled?: boolean;
  session?: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  questions?: Question[];
  total_questions?: number;
  allowed_students_count?: number;
}

export interface Question {
  id: number;
  test_id: number;
  question_text: string;
  question_type: "multiple_choice" | "essay" | "true_false";
  points: number;
  order?: number;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
}

export interface CreateTestPayload {
  title: string;
  description?: string;
  subject: string;
  kelas: string;
  duration: number;
  passing_score: number;
  start_time: string;
  end_time: string;
  created_by?: number;
  cheat_detection_enabled?: boolean;
  session?: number | null;
}

export interface AddQuestionsPayload {
  questions: {
    question_text: string;
    question_type: "multiple_choice" | "essay" | "true_false";
    points: number;
    options?: {
      option_text: string;
      is_correct: boolean;
    }[];
  }[];
}

export interface TestFilters {
  subject?: string;
  kelas?: string;
  status?: "active" | "upcoming" | "finished" | "draft";
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface TestMonitorEvent {
  id: number;
  event_type: string;
  triggered_by: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface TestMonitorAttempt {
  id: number | null;
  student: {
    id: number;
    name: string;
    email: string;
    nisn?: string | null;
    class_name?: string | null;
  };
  status: "in_progress" | "completed" | "blocked" | "not_started" | string;
  status_label?: string;
  is_blocked: boolean;
  blocked_reason?: string | null;
  cheat_count?: number | null;
  answered_count: number;
  total_questions: number;
  progress_percent: number;
  started_at?: string | null;
  last_activity_at?: string | null;
  finished_at?: string | null;
  events: TestMonitorEvent[];
}

export interface TestMonitorResponse {
  test: {
    id: number;
    title: string;
    duration: number;
    kelas?: string | null;
    subject?: string | null;
    total_questions: number;
    cheat_detection_enabled?: boolean;
    is_remedial?: boolean;
    allowed_students_count?: number;
  };
  attempts: TestMonitorAttempt[];
}

const testService = {
  // Get all tests with filters
  getTests: async (filters?: TestFilters) => {
    const response = await api.get("/tests", { params: filters });
    return response.data;
  },

  // Get single test
  getTest: async (id: number, params?: any) => {
    const response = await api.get(`/tests/${id}`, { params });
    return response.data;
  },

  // Create new test
  createTest: async (data: CreateTestPayload) => {
    const response = await api.post("/tests", data);
    return response.data;
  },

  // Update test
  updateTest: async (id: number, data: Partial<CreateTestPayload>) => {
    const response = await api.put(`/tests/${id}`, data);
    return response.data;
  },

  // Delete test
  deleteTest: async (id: number) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },

  // Duplicate test
  duplicateTest: async (id: number) => {
    const response = await api.post(`/tests/${id}/duplicate`);
    return response.data;
  },

  // Clone as remedial test
  cloneRemedial: async (
    id: number,
    payload?: { start_time?: string; end_time?: string; student_ids?: number[] }
  ) => {
    const response = await api.post(
      `/tests/${id}/clone-remedial`,
      payload ?? {}
    );
    return response.data;
  },

  // Toggle publish/unpublish
  togglePublish: async (id: number) => {
    const response = await api.post(`/tests/${id}/toggle-publish`);
    return response.data;
  },

  // Add questions to test
  addQuestions: async (testId: number, data: AddQuestionsPayload) => {
    const response = await api.post(`/tests/${testId}/questions`, data);
    return response.data;
  },

  // Add single question to test
  addQuestion: async (testId: number, data: any) => {
    const response = await api.post(`/tests/${testId}/questions`, {
      questions: [data],
    });
    return response.data;
  },

  // Import questions from a package
  addPackage: async (testId: number, packageId: number) => {
    const response = await api.post(`/tests/${testId}/question-packages`, {
      package_id: packageId,
    });
    return response.data;
  },

  // Remove question from test
  removeQuestion: async (testId: number, questionId: number) => {
    const response = await api.delete(
      `/tests/${testId}/questions/${questionId}`
    );
    return response.data;
  },

  // Update question
  updateQuestion: async (testId: number, questionId: number, data: any) => {
    const response = await api.put(
      `/tests/${testId}/questions/${questionId}`,
      data
    );
    return response.data;
  },

  // Delete question
  deleteQuestion: async (testId: number, questionId: number) => {
    const response = await api.delete(
      `/tests/${testId}/questions/${questionId}`
    );
    return response.data;
  },

  // Get test attempts
  getTestAttempts: async (testId: number) => {
    const response = await api.get(`/tests/${testId}/attempts`);
    return response.data;
  },

  // Get monitoring payload for a test
  getTestMonitor: async (testId: number) => {
    const response = await api.get(`/tests/${testId}/monitor`);
    return response.data as TestMonitorResponse;
  },

  // Block attempt
  blockAttempt: async (attemptId: number, reason?: string) => {
    const payload = reason ? { reason } : undefined;
    const response = await api.post(`/attempts/${attemptId}/block`, payload);
    return response.data;
  },

  // Unblock attempt
  unblockAttempt: async (attemptId: number) => {
    const response = await api.post(`/attempts/${attemptId}/unblock`);
    return response.data;
  },
};

export default testService;
