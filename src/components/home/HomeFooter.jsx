/** Shared page footer (legal links) — no API. */

import React from 'react'

export default function HomeFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto w-full border-t border-white/6 bg-ink/80">
      <div className="flex w-full flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-10 xl:px-14">
        <p className="text-[12px] font-light tracking-wide text-mist/75">
          © {year} · Services subject to eligibility and local rules.
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-medium uppercase tracking-[0.14em] text-mist">
          <a href="#" className="transition hover:text-aurum">
            Privacy
          </a>
          <a href="#" className="transition hover:text-aurum">
            Terms
          </a>
        </nav>
      </div>
    </footer>
  )
}
