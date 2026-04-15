import { getApiBaseUrl } from '../config'
import { getAccessToken, clearAccessToken } from '../authStorage'

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  /** Если true, не добавляем Authorization заголовок */
  skipAuth?: boolean
}

export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options

  const url = `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Добавляем Authorization заголовок если есть токен
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    // Если 401 — токен истёк или невалиден
    if (res.status === 401) {
      clearAccessToken()
      // Можно добавить редирект на логин или событие
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }

    let errorMessage = `HTTP ${res.status}`
    try {
      const data = await res.json()
      errorMessage = data.detail || data.message || errorMessage
    } catch {
      // ignore parse error
    }
    throw new ApiError(errorMessage, res.status)
  }

  // Если нет тела ответа (204 No Content)
  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

// Удобные методы
export const api = {
  get: <T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}
