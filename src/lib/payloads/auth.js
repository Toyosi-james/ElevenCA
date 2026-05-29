/**
 * Demo login — any non-empty username, PIN, and password succeeds.
 */

import { persistUserSnapshotFromUsername } from '../session.js'

/**
 * @param {{ assetPin: string; username: string; password: string; signal?: AbortSignal }} credentials
 */
export async function signIn(credentials) {
  const username = credentials.username.trim()
  if (!username || !credentials.assetPin.trim() || !credentials.password) {
    throw new Error('All fields are required.')
  }
  persistUserSnapshotFromUsername(username)
  return { ok: true, user: { username } }
}
