import api from '../api'

export interface DashboardSummary {
  total_tests?: number
  active_tests?: number
  total_attempts?: number
  completed_attempts?: number
  available_tests?: number
  average_score: number
  pass_rate: number
  passed_tests?: number
}

export interface TestStatistics {
  test: any
  statistics: {
    total_attempts: number
    completed_attempts: number
    in_progress_attempts: number
    average_score: number
    highest_score: number
    lowest_score: number
    passed_count: number
    failed_count: number
    pass_rate: number
  }
  score_distribution: {
    score_range: string
    count: number
  }[]
  question_analysis: {
    question_id: number
    question_text: string
    total_answers: number
    correct_answers: number
    correct_percentage: number
  }[]
  top_performers: any[]
}

export interface AttemptAnalysis {
  attempt: {
    id: number
    student: any
    test: any
    score: number
    is_passed: boolean
    duration_minutes: number
  }
  analysis: {
    question: {
      id: number
      text: string
      type: string
      points: number
    }
    user_answer: {
      option_id?: number
      answer_text?: string
      is_correct: boolean
      points_earned: number
    }
    correct_answer: any[]
    all_options: any[]
  }[]
}

const reportService = {
  // Teacher dashboard
  getTeacherDashboard: async () => {
    const response = await api.get('/dashboard/teacher')
    return response.data
  },

  // Student dashboard
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student')
    return response.data
  },

  // Test statistics
  getTestStatistics: async (testId: number) => {
    const response = await api.get(`/reports/test/${testId}/statistics`)
    return response.data as TestStatistics
  },

  // Attempt analysis
  getAttemptAnalysis: async (attemptId: number) => {
    const response = await api.get(`/reports/attempt/${attemptId}/analysis`)
    return response.data as AttemptAnalysis
  },

  // Export test results
  exportTestResults: async (testId: number) => {
    const response = await api.get(`/reports/test/${testId}/export`)
    return response.data
  },

  // Student comparison
  getStudentComparison: async (studentId?: number) => {
    const response = await api.get('/reports/student/comparison', {
      params: studentId ? { student_id: studentId } : undefined,
    })
    return response.data
  },
}

export default reportService
