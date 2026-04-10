import { getLoginUrl } from '../config'
import { readApiErrorMessage } from './readError'

export type LoginResponse = {
  access_token: string
  token_type: string
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(getLoginUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const message = await readApiErrorMessage(res)
    throw new Error(message)
  }

  return (await res.json()) as LoginResponse
}
