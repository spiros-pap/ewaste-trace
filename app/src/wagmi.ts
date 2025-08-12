import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from '@wagmi/connectors'

export const hardhat = defineChain({
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_RPC_URL] } },
})

export const config = createConfig({
  autoConnect: true,
  chains: [hardhat],
  connectors: [injected()],
  transports: { [hardhat.id]: http(import.meta.env.VITE_RPC_URL) },
})
