/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_AUTH_CSRF_URL?: string
  readonly VITE_AUTH_LOGIN_URL?: string
  readonly VITE_AUTH_REFRESH_URL?: string
  readonly VITE_CSRF_COOKIE_NAME?: string
  readonly VITE_CSRF_HEADER_NAME?: string
  readonly VITE_JWT_STORAGE_KEY?: string
  readonly VITE_JWT_RESPONSE_FIELD?: string
  readonly VITE_POST_LOGIN_REDIRECT?: string
  readonly VITE_DEPOSIT_WALLET_ADDRESS?: string
  readonly VITE_PASSWORD_RESET_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
