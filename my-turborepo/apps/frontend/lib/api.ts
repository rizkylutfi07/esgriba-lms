const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Materi
  async getMateri(params?: { teacherId?: string; classId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/materi${query ? `?${query}` : ''}`);
  }

  async getMateriById(id: string) {
    return this.get(`/materi/${id}`);
  }

  async createMateri(data: any) {
    return this.post('/materi', data);
  }

  async updateMateri(id: string, data: any) {
    return this.patch(`/materi/${id}`, data);
  }

  async deleteMateri(id: string) {
    return this.delete(`/materi/${id}`);
  }

  // Tugas
  async getTugas(params?: { teacherId?: string; classId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/tugas${query ? `?${query}` : ''}`);
  }

  async getTugasById(id: string) {
    return this.get(`/tugas/${id}`);
  }

  async createTugas(data: any) {
    return this.post('/tugas', data);
  }

  async updateTugas(id: string, data: any) {
    return this.patch(`/tugas/${id}`, data);
  }

  async deleteTugas(id: string) {
    return this.delete(`/tugas/${id}`);
  }

  // Pengumpulan Tugas
  async getPengumpulanTugas(params?: { tugasId?: string; siswaId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/pengumpulan-tugas${query ? `?${query}` : ''}`);
  }

  async createPengumpulanTugas(data: any) {
    return this.post('/pengumpulan-tugas', data);
  }

  async updatePengumpulanTugas(id: string, data: any) {
    return this.patch(`/pengumpulan-tugas/${id}`, data);
  }

  // Nilai
  async getNilai(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/nilai${query ? `?${query}` : ''}`);
  }

  async createNilai(data: any) {
    return this.post('/nilai', data);
  }

  async updateNilai(id: string, data: any) {
    return this.patch(`/nilai/${id}`, data);
  }

  async deleteNilai(id: string) {
    return this.delete(`/nilai/${id}`);
  }

  // Absensi
  async getAbsensi(params?: { siswaId?: string; classId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/absensi${query ? `?${query}` : ''}`);
  }

  async createAbsensi(data: any) {
    return this.post('/absensi', data);
  }

  async updateAbsensi(id: string, data: any) {
    return this.patch(`/absensi/${id}`, data);
  }

  // Kelas
  async getKelas() {
    return this.get('/kelas');
  }

  // Mapel
  async getMapel() {
    return this.get('/mapel');
  }

  // Guru
  async getGuru(params?: { userId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/guru${query ? `?${query}` : ''}`);
  }

  // Siswa
  async getSiswa(params?: { classId?: string; userId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/siswa${query ? `?${query}` : ''}`);
  }

  // ============================================
  // CBT (Computer-Based Test) Methods
  // ============================================

  // Question Bank
  async getQuestionBank(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/cbt/question-bank${query ? `?${query}` : ''}`);
  }

  async getQuestionBankById(id: string) {
    return this.get(`/cbt/question-bank/${id}`);
  }

  async createQuestionBank(data: any) {
    return this.post('/cbt/question-bank', data);
  }

  async updateQuestionBank(id: string, data: any) {
    return this.patch(`/cbt/question-bank/${id}`, data);
  }

  async deleteQuestionBank(id: string) {
    return this.delete(`/cbt/question-bank/${id}`);
  }

  async duplicateQuestionBank(id: string) {
    return this.post(`/cbt/question-bank/${id}/duplicate`, {});
  }

  async bulkAddToTest(data: { questionIds: string[]; testId: string }) {
    return this.post('/cbt/question-bank/bulk-add-to-test', data);
  }

  async getQuestionCategories(subjectId?: string) {
    return this.get(`/cbt/question-bank/categories${subjectId ? `?subjectId=${subjectId}` : ''}`);
  }

  // Tests
  async getTests(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/cbt/tests${query ? `?${query}` : ''}`);
  }

  async getTestById(id: string) {
    return this.get(`/cbt/tests/${id}`);
  }

  async createTest(data: any) {
    return this.post('/cbt/tests', data);
  }

  async updateTest(id: string, data: any) {
    return this.patch(`/cbt/tests/${id}`, data);
  }

  async deleteTest(id: string) {
    return this.delete(`/cbt/tests/${id}`);
  }

  async togglePublishTest(id: string) {
    return this.post(`/cbt/tests/${id}/toggle-publish`, {});
  }

  async duplicateTest(id: string) {
    return this.post(`/cbt/tests/${id}/duplicate`, {});
  }

  async addQuestionToTest(testId: string, data: any) {
    return this.post(`/cbt/tests/${testId}/questions`, data);
  }

  async updateTestQuestion(testId: string, questionId: string, data: any) {
    return this.patch(`/cbt/tests/${testId}/questions/${questionId}`, data);
  }

  async deleteTestQuestion(testId: string, questionId: string) {
    return this.delete(`/cbt/tests/${testId}/questions/${questionId}`);
  }

  async assignStudentsToTest(testId: string, studentIds: string[]) {
    return this.post(`/cbt/tests/${testId}/assign-students`, { studentIds });
  }

  // Test Attempts (Student)
  async startTest(testId: string) {
    return this.post('/cbt/test-attempts/start', { testId });
  }

  async getMyAttempts(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/cbt/test-attempts/my-attempts${query ? `?${query}` : ''}`);
  }

  async getAttempt(attemptId: string) {
    return this.get(`/cbt/test-attempts/${attemptId}`);
  }

  async submitAnswer(attemptId: string, data: { questionId: string; answerText?: string }) {
    return this.post(`/cbt/test-attempts/${attemptId}/submit-answer`, data);
  }

  async finishTest(attemptId: string) {
    return this.post(`/cbt/test-attempts/${attemptId}/finish`, {});
  }

  async recordCheatEvent(attemptId: string, data: { eventType: string; description?: string; metadata?: any }) {
    return this.post(`/cbt/test-attempts/${attemptId}/record-event`, data);
  }

  async getAttemptResult(attemptId: string) {
    return this.get(`/cbt/test-attempts/${attemptId}/result`);
  }

  // Test Attempts (Teacher)
  async getTestAttempts(testId: string, params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/cbt/test-attempts/test/${testId}/attempts${query ? `?${query}` : ''}`);
  }
}

export const api = new ApiClient();
