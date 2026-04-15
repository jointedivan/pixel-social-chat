import { getRegisterUrl } from '../config'
import { readApiErrorMessage } from './readError'

export type RegisterResponse = {
  access_token: string
  token_type: string
}

export async function registerUser(
  email: string,
  username: string,
  avatarId: number,
  password: string
): Promise<RegisterResponse> {
  const res = await fetch(getRegisterUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, avatar_id: avatarId, password }),
  })

  if (!res.ok) {
    const message = await readApiErrorMessage(res)
    throw new Error(message)
  }

  return (await res.json()) as RegisterResponse
}
