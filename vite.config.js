/** Vite build config — React + Tailwind. API base URL is set in .env (VITE_API_BASE_URL). */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
],
})
