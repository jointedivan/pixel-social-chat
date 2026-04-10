/** Текст ошибки из ответа FastAPI (`detail`: строка или массив). */
export async function readApiErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json()
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
            return JSON.stringify(item)
          })
          .join(' ')
      }
    }
  } catch {
    return 'Не удалось разобрать ответ сервера'
  }
  return `Ошибка ${res.status}`
}
