import axios from 'axios'

const REFRESH_KEY = 'darouna_refresh_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: { 'Content-Type': 'application/json' },
})

// Request: attach access token from window.__darounaAccessToken
api.interceptors.request.use((config) => {
  const token = (window as any).__darounaAccessToken as string | undefined
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response: on 401 try refresh once, then redirect to /
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (!refreshToken) {
        isRefreshing = false
        window.location.href = '/'
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
          { refreshToken }
        )
        const newToken = data.data.accessToken as string
        ;(window as any).__darounaAccessToken = newToken
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem(REFRESH_KEY)
        window.location.href = '/'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
