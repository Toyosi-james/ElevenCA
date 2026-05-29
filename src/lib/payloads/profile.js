/**
 * Profile fields for the account screen.
 */

/** @type {{
 *   firstName: string
 *   lastName: string
 *   email: string
 *   gender: string
 *   age: number
 *   country: string
 *   residentialAddress: string
 * }} */
export const PROFILE_DETAIL = {
  firstName: 'Alexandra',
  lastName: 'Chen',
  email: 'alexandra.chen@vault.example',
  gender: 'Female',
  age: 34,
  country: 'United States',
  residentialAddress: '120 Park Avenue, Suite 1800, New York, NY 10017',
}

/** Display shape used by Profile.jsx */
function formatForDisplay(p) {
  return {
    firstName: p.firstName || '—',
    lastName: p.lastName || '—',
    email: p.email || '—',
    gender: p.gender || '—',
    age: p.age != null && p.age !== '' ? String(p.age) : '—',
    country: p.country || '—',
    residentialAddress: p.residentialAddress || '—',
  }
}

/** @param {AbortSignal} [_signal] */
export async function loadProfileDetail(_signal) {
  return { profile: formatForDisplay(PROFILE_DETAIL) }
}

/**
 * @param {ReturnType<typeof formatForDisplay>} profile
 * @param {string} [displayNameFallback]
 */
export function profileInitialLetter(profile, displayNameFallback) {
  const fn = profile.firstName
  if (fn && fn !== '—') return fn.charAt(0).toUpperCase()
  const firstWord = displayNameFallback?.trim().split(/\s+/).filter(Boolean)[0]
  if (firstWord) return firstWord.charAt(0).toUpperCase()
  const em = profile.email
  if (em && em !== '—') return em.charAt(0).toUpperCase()
  return '•'
}
