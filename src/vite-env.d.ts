/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_AUTH_LOGIN_PATH?: string
  readonly VITE_POST_LOGIN_REDIRECT?: string
  readonly VITE_PASSWORD_RESET_URL?: string
  readonly VITE_AUTH_ME_PATH?: string
  readonly VITE_BALANCE_PATH?: string
  readonly VITE_TRANSACTIONS_PATH?: string
  readonly VITE_MARKET_FLOW_PATH?: string
  readonly VITE_DEPOSIT_ADDRESS_PATH?: string
  readonly VITE_DEPOSIT_URL?: string
  readonly VITE_DEPOSIT_WALLET_ADDRESS?: string
  readonly VITE_STAKE_URL?: string
  readonly VITE_WITHDRAW_URL?: string
  readonly VITE_EXCHANGE_URL?: string
  readonly VITE_PROFILE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
