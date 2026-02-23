import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Response interceptor – normalise errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll: () => api.get('/api/employees/'),
  getById: (id) => api.get(`/api/employees/${id}`),
  create: (data) => api.post('/api/employees/', data),
  delete: (id) => api.delete(`/api/employees/${id}`),
}

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  getAll: (date) => api.get('/api/attendance/', { params: date ? { date } : {} }),
  getByEmployee: (employeeId, date) =>
    api.get(`/api/attendance/employee/${employeeId}`, {
      params: date ? { date } : {},
    }),
  getSummary: (employeeId) => api.get(`/api/attendance/summary/${employeeId}`),
  mark: (data) => api.post('/api/attendance/', data),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/'),
}

export default api
