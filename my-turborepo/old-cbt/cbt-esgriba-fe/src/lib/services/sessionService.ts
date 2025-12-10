import api from "../api";

export interface ExamSession {
  id: number;
  number?: number | null;
  label: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_minutes?: number | null;
  is_active: boolean;
}

export interface CreateSessionPayload {
  number?: number | null;
  label: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_minutes?: number | null;
  is_active?: boolean;
}

const sessionService = {
  list: async (): Promise<ExamSession[]> => {
    const res = await api.get("/sessions");
    return res.data;
  },
  create: async (data: CreateSessionPayload) => {
    const res = await api.post("/sessions", data);
    return res.data;
  },
  update: async (id: number, data: Partial<CreateSessionPayload>) => {
    const res = await api.put(`/sessions/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/sessions/${id}`);
    return res.data;
  },
};

export default sessionService;
