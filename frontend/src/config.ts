/** Базовый URL API без завершающего слэша. В dev через Vite proxy используется относительный путь `/api`. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined
  if (raw?.trim()) {
    return raw.replace(/\/$/, '')
  }
  return '/api'
}

export function getRegisterUrl(): string {
  return `${getApiBaseUrl()}/register`
}

export function getLoginUrl(): string {
  return `${getApiBaseUrl()}/login`
}
