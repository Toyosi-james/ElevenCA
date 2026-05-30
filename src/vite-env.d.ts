/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POST_LOGIN_REDIRECT?: string
  readonly VITE_DEPOSIT_WALLET_ADDRESS?: string
  readonly VITE_PASSWORD_RESET_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
