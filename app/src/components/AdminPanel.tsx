import { useState } from 'react'
import { usePublicClient, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

const ROLE_KEYS = ['ADMIN_ROLE','USER_ROLE','GREEN_POINT_ROLE','CARRIER_ROLE','RECYCLER_ROLE','INSPECTOR_ROLE'] as const
type RoleKey = typeof ROLE_KEYS[number]

export default function AdminPanel() {
  const pc = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [target, setTarget] = useState('')
  const [roleKey, setRoleKey] = useState<RoleKey>('USER_ROLE')
  const [msg, setMsg] = useState<string>('')

  async function onRegister() {
    try {
      setMsg('Fetching role hash…')
      const role = await pc!.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: roleKey,
      }) as `0x${string}`

      setMsg('Sending tx…')
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'registerUser',
        args: [target as `0x${string}`, role],
      })
      setMsg(`Tx sent: ${hash}`)
    } catch (e:any) {
      setMsg(e?.shortMessage || e?.message || String(e))
    }
  }

  return (
    <div>
      <h3>Admin — registerUser</h3>
      <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:8, maxWidth:720 }}>
        <div>Address</div>
        <input value={target} onChange={(e)=>setTarget(e.target.value)} placeholder="0x..." />
        <div>Role</div>
        <select value={roleKey} onChange={(e)=>setRoleKey(e.target.value as RoleKey)}>
          {ROLE_KEYS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <button onClick={onRegister} style={{ marginTop:12, padding:'8px 16px', borderRadius:8 }}>Grant Role</button>
      {!!msg && <p style={{ marginTop:8 }}>{msg}</p>}
    </div>
  )
}
