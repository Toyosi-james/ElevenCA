/**
 * Profile detail API (account screen fields).
 *
 * API: GET `{base}{VITE_PROFILE_DETAIL_PATH}` (defaults to same as /auth/me)
 * Screen: Profile.jsx
 * Empty fields can be filled from PROFILE_MOCK_DATA for demos.
 */

import { getProfileDetailPath, getProfileUseMockOnly } from '../config.js'
import { getUserSnapshot } from '../session.js'
import { apiGet } from './client.js'

/**
 * Canonical mock profile for development / offline fallback.
 * Backend values override these when present (see `fetchProfileDetail`).
 *
 * @type {{
 *   firstName: string
 *   lastName: string
 *   email: string
 *   gender: string
 *   age: number
 *   country: string
 *   residentialAddress: string
 * }}
 */
export const PROFILE_MOCK_DATA = {
  firstName: 'Alexandra',
  lastName: 'Chen',
  email: 'alexandra.chen@vault.example',
  gender: 'Female',
  age: 34,
  country: 'United States',
  residentialAddress: '120 Park Avenue, Suite 1800, New York, NY 10017',
}

/** @param {unknown} json */
function unwrapData(json) {
  if (!json || typeof json !== 'object') return {}
  const o = /** @type {Record<string, unknown>} */ (json)
  return /** @type {Record<string, unknown>} */ (
    (o.data && typeof o.data === 'object' && o.data) ||
      (o.user && typeof o.user === 'object' && o.user) ||
      (o.profile && typeof o.profile === 'object' && o.profile) ||
      o
  )
}

/** @param {unknown} v */
function str(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return ''
}

function isEmptyAge(age) {
  return age === '' || age == null
}

/**
 * @param {Record<string, unknown>} d
 * @returns {{
 *   firstName: string
 *   lastName: string
 *   email: string
 *   gender: string
 *   age: string | number
 *   country: string
 *   residentialAddress: string
 * }}
 */
function normalizeProfileDetail(d) {
  const firstName = str(d.firstName ?? d.first_name ?? d.givenName ?? d.given_name)
  const lastName = str(d.lastName ?? d.last_name ?? d.familyName ?? d.family_name ?? d.surname)
  const email = str(d.email ?? d.emailAddress)
  const gender = str(d.gender ?? d.sex)
  const rawAge = d.age
  const age =
    typeof rawAge === 'number' && Number.isFinite(rawAge)
      ? rawAge
      : rawAge != null && rawAge !== ''
        ? str(rawAge)
        : ''
  const country = str(d.country ?? d.countryName ?? d.nationality)
  const residentialAddress = str(
    d.residentialAddress ??
      d.residential_address ??
      d.address ??
      d.residence ??
      d.streetAddress ??
      d.line1,
  )
  return { firstName, lastName, email, gender, age, country, residentialAddress }
}

/** @param {string} displayName */
function splitDisplayName(displayName) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

/**
 * Session/API merged shape before display formatting.
 * @typedef {{
 *   firstName: string
 *   lastName: string
 *   email: string
 *   gender: string
 *   age: string | number
 *   country: string
 *   residentialAddress: string
 * }} ProfileMerged
 */

/**
 * Fill only empty fields from `PROFILE_MOCK_DATA` so real API data always wins.
 * @param {ProfileMerged} merged
 * @returns {ProfileMerged}
 */
export function mergeProfileWithMockDefaults(merged) {
  const m = PROFILE_MOCK_DATA
  return {
    firstName: merged.firstName || m.firstName,
    lastName: merged.lastName || m.lastName,
    email: merged.email || m.email,
    gender: merged.gender || m.gender,
    age: isEmptyAge(merged.age) ? m.age : merged.age,
    country: merged.country || m.country,
    residentialAddress: merged.residentialAddress || m.residentialAddress,
  }
}

/**
 * After a successful GET, empty fields are padded from `PROFILE_MOCK_DATA` unless you set
 * `VITE_PROFILE_FILL_EMPTY_WITH_MOCK=false` (strict: show only API + session, remainder `—`).
 */
function shouldFillEmptyWithMockAfterApi() {
  return String(import.meta.env.VITE_PROFILE_FILL_EMPTY_WITH_MOCK ?? '').toLowerCase() !== 'false'
}

/**
 * @param {ProfileMerged} p
 */
function formatProfileForDisplay(p) {
  const ageStr = isEmptyAge(p.age) ? '' : String(p.age)
  return {
    firstName: p.firstName || '—',
    lastName: p.lastName || '—',
    email: p.email || '—',
    gender: p.gender || '—',
    age: ageStr || '—',
    country: p.country || '—',
    residentialAddress: p.residentialAddress || '—',
  }
}

/** @returns {ProfileMerged} */
function baseFromSnapshot() {
  const snap = getUserSnapshot()
  /** @type {ProfileMerged} */
  const merged = {
    firstName: '',
    lastName: '',
    email: typeof snap?.email === 'string' ? snap.email.trim() : '',
    gender: '',
    age: '',
    country: '',
    residentialAddress: '',
  }
  if (snap?.displayName) {
    const sp = splitDisplayName(snap.displayName)
    merged.firstName = sp.firstName
    merged.lastName = sp.lastName
  }
  return merged
}

/**
 * Loads profile fields for the account screen.
 *
 * - **Backend:** `GET` `getProfileDetailPath()` (defaults to `/auth/me`). Response can nest under `data`, `user`, or `profile`.
 * - **Mock:** Empty fields are filled from `PROFILE_MOCK_DATA`. Set `VITE_PROFILE_USE_MOCK=true` to skip GET entirely.
 * - **Priority per field:** API → session snapshot → mock defaults → em dash in UI if still empty.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ profile: ReturnType<typeof formatProfileForDisplay>; source: 'api' | 'fallback' | 'mock' }>}
 */
export async function fetchProfileDetail(signal) {
  let merged = baseFromSnapshot()

  if (getProfileUseMockOnly()) {
    merged = mergeProfileWithMockDefaults(merged)
    return { profile: formatProfileForDisplay(merged), source: 'mock' }
  }

  try {
    // HTTP: GET profile detail (default /auth/me, path from getProfileDetailPath)
    const json = await apiGet(getProfileDetailPath(), { signal })
    const n = normalizeProfileDetail(unwrapData(json))
    merged = {
      firstName: n.firstName || merged.firstName,
      lastName: n.lastName || merged.lastName,
      email: n.email || merged.email,
      gender: n.gender || merged.gender,
      age: !isEmptyAge(n.age) ? n.age : merged.age,
      country: n.country || merged.country,
      residentialAddress: n.residentialAddress || merged.residentialAddress,
    }
    if (shouldFillEmptyWithMockAfterApi()) merged = mergeProfileWithMockDefaults(merged)
    return { profile: formatProfileForDisplay(merged), source: 'api' }
  } catch {
    merged = mergeProfileWithMockDefaults(merged)
    return { profile: formatProfileForDisplay(merged), source: 'fallback' }
  }
}

/**
 * @param {ReturnType<typeof formatProfileForDisplay>} profile
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
