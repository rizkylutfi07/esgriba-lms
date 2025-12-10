import api from "../api";

export interface RemedialStudent {
  id: number;
  name: string;
  email?: string;
  nisn?: string | null;
  class_id?: number | null;
}

export interface RemedialListResponse {
  test_id: number;
  allowed_students: RemedialStudent[];
}

const remedialService = {
  async list(testId: number): Promise<RemedialListResponse> {
    const res = await api.get(`/tests/${testId}/students`);
    return res.data;
  },
  async eligible(
    testId: number
  ): Promise<{ test_id: number; students: RemedialStudent[] }> {
    const res = await api.get(`/tests/${testId}/students/eligible`);
    return res.data;
  },
  async replace(
    testId: number,
    studentIds: number[]
  ): Promise<{ message: string; count: number }> {
    const res = await api.post(`/tests/${testId}/students`, {
      student_ids: studentIds,
    });
    return res.data;
  },
  async add(
    testId: number,
    studentIds: number[]
  ): Promise<{ message: string; count: number }> {
    const res = await api.patch(`/tests/${testId}/students/add`, {
      student_ids: studentIds,
    });
    return res.data;
  },
  async remove(
    testId: number,
    studentIds: number[]
  ): Promise<{ message: string; remaining_count: number }> {
    const res = await api.patch(`/tests/${testId}/students/remove`, {
      student_ids: studentIds,
    });
    return res.data;
  },
  async clear(testId: number): Promise<{ message: string }> {
    const res = await api.delete(`/tests/${testId}/students`);
    return res.data;
  },
  async exportCsv(testId: number): Promise<Blob> {
    const res = await api.get(`/tests/${testId}/students/export`, {
      responseType: "blob",
    });
    return res.data as Blob;
  },
};

export default remedialService;
