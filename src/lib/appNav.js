/**
 * Shared header navigation links (frontend routes, not API paths).
 * Import the constant that matches your page so the header shows a back link.
 */

/** Single link back to the home dashboard — use on any shell page header. */
export const OVERVIEW_NAV_LINKS = [{ to: '/home', label: 'Overview' }]

export const DEPOSIT_HEADER_NAV_LINKS = OVERVIEW_NAV_LINKS
export const EXCHANGE_HEADER_NAV_LINKS = OVERVIEW_NAV_LINKS
