/**
 * Demo user shown in the header after login.
 * Edit this file to change the default display name, email, or avatar.
 */

import { getUserSnapshot, persistUserSnapshot } from '../session.js'

/** @type {{ displayName: string; email?: string; avatarUrl?: string }} */
export const SESSION_USER = {
  displayName: 'Alexandra Chen',
  email: 'alexandra.chen@vault.example',
}

/** @param {AbortSignal} [_signal] */
export async function loadSessionUser(_signal) {
  const snap = getUserSnapshot()
  const user = snap ? { ...SESSION_USER, ...snap } : { ...SESSION_USER }
  persistUserSnapshot(user)
  return user
}
