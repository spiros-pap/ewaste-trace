import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESS } from '../contract'
import { EwasteRegistryABI } from '../abi/EwasteRegistry'

export function useRoles() {
  const { address } = useAccount()
  const pc = usePublicClient()
  const [roles, setRoles] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!address) { setRoles({}); return }
    (async () => {
      const [ADMIN, USER, GREEN, CARRIER, RECYCLER, INSPECTOR] = await Promise.all([
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'ADMIN_ROLE'}) as Promise<`0x${string}`>,
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'USER_ROLE'}) as Promise<`0x${string}`>,
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'GREEN_POINT_ROLE'}) as Promise<`0x${string}`>,
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'CARRIER_ROLE'}) as Promise<`0x${string}`>,
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'RECYCLER_ROLE'}) as Promise<`0x${string}`>,
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'INSPECTOR_ROLE'}) as Promise<`0x${string}`>,
      ])

      const [admin, user, green, carrier, recycler, inspector] = await Promise.all([
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'hasRole', args: [ADMIN, address]}),
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'hasRole', args: [USER, address]}),
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'hasRole', args: [GREEN, address]}),
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'hasRole', args: [CARRIER, address]}),
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'hasRole', args: [RECYCLER, address]}),
        pc.readContract({address: CONTRACT_ADDRESS, abi: EwasteRegistryABI, functionName: 'hasRole', args: [INSPECTOR, address]}),
      ]) as boolean[]

      setRoles({ admin, user, green, carrier, recycler, inspector })
    })()
  }, [address, pc])

  return roles
}
