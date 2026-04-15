/** Текст ошибки из ответа FastAPI (`detail`: строка или массив). */
export async function readApiErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') || ''
  
  // Логируем для отладки
  console.error('[API Error]', res.status, res.statusText, contentType)

  // Если ответ не JSON, возвращаем статус и часть текста
  if (!contentType.includes('application/json')) {
    try {
      const text = await res.text()
      console.error('[API Error Body]', text.slice(0, 500))
      return `Ошибка ${res.status}: ${text.slice(0, 100) || res.statusText}`
    } catch {
      return `Ошибка ${res.status}: ${res.statusText}`
    }
  }

  try {
    const data: unknown = await res.json()
    console.error('[API Error Body]', data)
    
    if (data && typeof data === 'object' && 'detail' in data) {
      const detail = (data as { detail: unknown }).detail
      if (typeof detail === 'string') {
        return detail
      }
      if (Array.isArray(detail)) {
        return detail
          .map((item) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              return String((item as { msg: unknown }).msg)
            }
            if (item && typeof item === 'object' && 'loc' in item) {
              const loc = (item as { loc: string[] }).loc.join('.')
              const msg = (item as { msg: string }).msg
              return `${loc}: ${msg}`
            }
            return JSON.stringify(item)
          })
          .join('; ')
      }
    }
    // Если нет detail, но есть message
    if (data && typeof data === 'object' && 'message' in data) {
      return String((data as { message: unknown }).message)
    }
  } catch (err) {
    console.error('[API Error Parse Failed]', err)
    return `Ошибка ${res.status}: не удалось разобрать ответ`
  }
  return `Ошибка ${res.status}`
}
