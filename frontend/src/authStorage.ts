const ACCESS_TOKEN_KEY = 'pixel_social_access_token'

export function saveAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

// Парсим JWT payload без проверки подписи (для проверки срока)
function parseJwt(token: string): { exp?: number; sub?: string } | null {
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

// Проверяем, не истёк ли токен (с запасом в 60 секунд)
export function isTokenValid(token: string | null): boolean {
  if (!token) return false
  const payload = parseJwt(token)
  if (!payload?.exp) return false
  // Проверяем с запасом в 60 секунд
  return payload.exp * 1000 > Date.now() + 60000
}

// Проверяем, авторизован ли пользователь (токен есть и не истёк)
export function isAuthenticated(): boolean {
  const token = getAccessToken()
  return isTokenValid(token)
}
