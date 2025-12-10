import api from '../api'

export interface TestAttempt {
  id: number
  test_id: number
  user_id: number
  started_at: string
  finished_at?: string
  status: 'in_progress' | 'completed'
  score?: number
  is_passed?: boolean
  test?: any
  user?: any
}

export interface SubmitAnswerPayload {
  question_id: number
  option_id?: number
  answer_text?: string
}

const attemptService = {
  // Start a test
  startTest: async (testId: number) => {
    const response = await api.post(`/tests/${testId}/start`)
    return response.data
  },

  // Submit answer
  submitAnswer: async (attemptId: number, data: SubmitAnswerPayload) => {
    const response = await api.post(`/attempts/${attemptId}/answer`, data)
    return response.data
  },

  // Finish test
  finishTest: async (attemptId: number) => {
    const response = await api.post(`/attempts/${attemptId}/finish`)
    return response.data
  },

  // Get my attempts
  getMyAttempts: async () => {
    const response = await api.get('/attempts')
    return response.data
  },

  // Get single attempt
  getAttempt: async (attemptId: number) => {
    const response = await api.get(`/attempts/${attemptId}`)
    return response.data
  },
}

export default attemptService
