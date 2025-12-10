import api from "../api";

export interface QuestionBank {
  id: number;
  subject_id: number;
  category: string;
  question_text: string;
  question_type: "multiple_choice" | "essay";
  expected_answer?: string;
  difficulty_level: 1 | 2 | 3;
  points: number;
  explanation?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  options?: QuestionBankOption[];
  subject?: any;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface QuestionBankOption {
  id: number;
  question_bank_id: number;
  text: string;
  is_correct: boolean;
}

export interface CreateQuestionBankPayload {
  subject_id: number;
  category: string;
  question_text: string;
  question_type: "multiple_choice" | "essay";
  expected_answer?: string;
  difficulty_level: 1 | 2 | 3;
  points: number;
  explanation?: string;
  teacher_id?: number;
  options?: {
    text: string;
    is_correct: boolean;
  }[];
}

export interface QuestionBankFilters {
  subject_id?: number;
  subject?: string;
  category?: string;
  difficulty_level?: 1 | 2 | 3;
  question_type?: "multiple_choice" | "essay";
  search?: string;
  creator_id?: number;
  per_page?: number;
  page?: number;
  limit?: number;
}

const questionBankService = {
  // Get all questions from bank
  getQuestions: async (filters?: QuestionBankFilters) => {
    const response = await api.get("/question-bank", { params: filters });
    return response.data;
  },

  // Get single question
  getQuestion: async (id: number) => {
    const response = await api.get(`/question-bank/${id}`);
    return response.data;
  },

  // Create question
  createQuestion: async (data: CreateQuestionBankPayload) => {
    const response = await api.post("/question-bank", data);
    return response.data;
  },

  // Update question
  updateQuestion: async (
    id: number,
    data: Partial<CreateQuestionBankPayload>
  ) => {
    const response = await api.put(`/question-bank/${id}`, data);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (id: number) => {
    const response = await api.delete(`/question-bank/${id}`);
    return response.data;
  },

  // Duplicate question
  duplicateQuestion: async (id: number) => {
    const response = await api.post(`/question-bank/${id}/duplicate`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get("/question-bank/categories/list");
    return response.data;
  },

  // Bulk add questions to test
  bulkAddToTest: async (testId: number, questionIds: number[]) => {
    const response = await api.post("/question-bank/bulk-add-to-test", {
      test_id: testId,
      question_ids: questionIds,
    });
    return response.data;
  },

  // Bulk delete questions
  bulkDeleteQuestions: async (ids: number[]) => {
    const response = await api.post("/question-bank/bulk-delete", {
      question_ids: ids,
    });
    return response.data;
  },
};

export default questionBankService;
