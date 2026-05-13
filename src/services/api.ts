import type {
  LoginPayload,
  LoginResponse,
  ValidationResponse,
  ListResponse,
  SaveResponse,
  DeleteResponse,
  Achievement,
} from './types'

const APPSCRIPT_URL =
  import.meta.env.VITE_APPSCRIPT_URL ||
  'https://script.google.com/macros/d/AKfycbw5dXYC-3KORzjCRSExnpgTA9TkIHju8U8Ed7khoNGt4e0tgd36yjN3UEUWyvdCgvg/exec'

const TOKEN_KEY = 'ssk_user_token'
const EMAIL_KEY = 'ssk_user_email'
const DEPT_KEY = 'ssk_user_dept'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY * (retryCount + 1))
      return fetchWithRetry(url, options, retryCount + 1)
    }
    throw error
  }
}

export const api = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    if (!payload.password || !payload.dept) {
      throw new Error('Department and password are required')
    }

    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data: LoginResponse = await response.json()
    if (!data.success || !data.token) {
      throw new Error(data.message || 'Login failed')
    }

    // Store auth data
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(EMAIL_KEY, data.email || '')
    localStorage.setItem(DEPT_KEY, data.dept || '')

    return data
  },

  async validateToken(): Promise<ValidationResponse> {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      return { success: false, valid: false }
    }

    try {
      const response = await fetchWithRetry(
        `${APPSCRIPT_URL}?action=validateToken&token=${encodeURIComponent(token)}`,
        { method: 'GET' }
      )

      const data: ValidationResponse = await response.json()
      if (!data.success || !data.valid) {
        api.clearAuth()
        return { success: false, valid: false }
      }

      return data
    } catch (error) {
      console.warn('Token validation failed:', error)
      api.clearAuth()
      return { success: false, valid: false }
    }
  },

  async getAchievements(token?: string): Promise<Achievement[]> {
    const tokenQuery = token ? `&token=${encodeURIComponent(token)}` : ''
    try {
      const response = await fetchWithRetry(
        `${APPSCRIPT_URL}?action=list${tokenQuery}`,
        { method: 'GET' }
      )

      const data: ListResponse = await response.json()
      return data.success && Array.isArray(data.data) ? data.data : []
    } catch (error) {
      console.warn('Failed to load achievements:', error)
      return []
    }
  },

  async saveAchievement(
    achievement: Achievement,
    token: string
  ): Promise<SaveResponse> {
    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=saveRecord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...achievement, token }),
    })

    const data: SaveResponse = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to save achievement')
    }

    return data
  },

  async updateAchievement(
    achievement: Achievement,
    token: string
  ): Promise<SaveResponse> {
    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=updateRecord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...achievement, token }),
    })

    const data: SaveResponse = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to update achievement')
    }

    return data
  },

  async deleteAchievement(id: string, token: string): Promise<DeleteResponse> {
    const response = await fetchWithRetry(
      `${APPSCRIPT_URL}?action=deleteRecord&id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`,
      { method: 'GET' }
    )

    const data: DeleteResponse = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete achievement')
    }

    return data
  },

  async uploadFile(
    file: File,
    token: string
  ): Promise<{ url: string; name: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('token', token)

    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=uploadFile`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (!data.success || !data.url) {
      throw new Error(data.message || 'Failed to upload file')
    }

    return { url: data.url, name: data.name || file.name }
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getStoredEmail(): string | null {
    return localStorage.getItem(EMAIL_KEY)
  },

  getStoredDept(): string | null {
    return localStorage.getItem(DEPT_KEY)
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(DEPT_KEY)
  },
}

export { APPSCRIPT_URL }
