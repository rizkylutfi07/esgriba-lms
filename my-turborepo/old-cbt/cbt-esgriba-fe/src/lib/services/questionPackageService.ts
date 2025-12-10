import api from "../api";

export interface QuestionPackage {
  id: number;
  name: string;
  description?: string;
  subject_id: number;
  subject?: any;
  created_by: number;
  creator?: any;
  difficulty_level: "easy" | "medium" | "hard";
  total_questions: number;
  total_points: number;
  questions?: any[];
  created_at: string;
  updated_at: string;
}

export interface CreatePackagePayload {
  name: string;
  description?: string;
  subject_id: number;
  difficulty_level: "easy" | "medium" | "hard";
  teacher_id?: number; // For admin to assign package to specific teacher
  question_ids?: number[];
}

const questionPackageService = {
  // Get all packages
  getAll: async (filters?: any) => {
    const response = await api.get("/question-packages", { params: filters });
    return response.data;
  },

  // Get single package
  getOne: async (id: number, bustCache = false) => {
    const response = await api.get(`/question-packages/${id}`, {
      params: bustCache ? { _t: Date.now() } : {},
    });
    return response.data.data;
  },

  // Create package
  create: async (data: CreatePackagePayload) => {
    const response = await api.post("/question-packages", data);
    return response.data;
  },

  // Update package
  update: async (id: number, data: Partial<CreatePackagePayload>) => {
    const response = await api.put(`/question-packages/${id}`, data);
    return response.data;
  },

  // Delete package
  delete: async (id: number) => {
    const response = await api.delete(`/question-packages/${id}`);
    return response.data;
  },

  // Add questions to package
  addQuestions: async (id: number, questionIds: number[]) => {
    const response = await api.post(`/question-packages/${id}/questions`, {
      question_ids: questionIds,
    });
    return response.data;
  },

  // Remove question from package
  removeQuestion: async (packageId: number, questionId: number) => {
    const response = await api.delete(
      `/question-packages/${packageId}/questions/${questionId}`
    );
    return response.data;
  },

  // Reorder questions
  reorderQuestions: async (
    id: number,
    orders: Array<{ question_id: number; order: number }>
  ) => {
    const response = await api.put(`/question-packages/${id}/reorder`, {
      question_orders: orders,
    });
    return response.data;
  },

  // Duplicate package
  duplicate: async (id: number) => {
    const response = await api.post(`/question-packages/${id}/duplicate`);
    return response.data;
  },
};

export default questionPackageService;
