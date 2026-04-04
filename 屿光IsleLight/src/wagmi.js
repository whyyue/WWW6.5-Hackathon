// src/wagmi.js
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { avalancheFuji } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'IsleLight',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '21fef4886a0f62625843647d5f98e74b',
  chains: [avalancheFuji],
  ssr: true,
})