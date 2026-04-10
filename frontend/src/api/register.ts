import { getRegisterUrl } from '../config'
import { readApiErrorMessage } from './readError'

export type RegisterResponse = {
  id: number
  email: string
}

export async function registerUser(email: string, password: string): Promise<RegisterResponse> {
  const res = await fetch(getRegisterUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const message = await readApiErrorMessage(res)
    throw new Error(message)
  }

  return (await res.json()) as RegisterResponse
}
