import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'
import { Card, Input, Select, Button } from '../ui'
import { toast } from 'sonner'

export default function UserPanel() {
  const { writeContractAsync } = useWriteContract()
  const [uid, setUid] = useState('DEV-2000')
  const [category, setCategory] = useState('laptop')
  const [hazard, setHazard] = useState(0)
  const [state, setState] = useState(0)
  const [msg, setMsg] = useState('')

  async function onRegisterDevice() {
    try {
      setMsg('Sending tx…')
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'registerDevice',
        args: [uid, category, BigInt(hazard), BigInt(state)],
      })
      setMsg(`Tx: ${hash}`)
      toast.success('Device registered', { description: hash })
    } catch (e: any) {
      const m = e?.shortMessage || e?.message || String(e)
      setMsg(m)
      toast.error('Transaction failed', { description: m })
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-lg font-semibold">User — Register Device</h3>

      <div className="grid grid-cols-[160px_1fr] gap-3 max-w-3xl">
        <div className="py-2">UID</div>
        <Input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="e.g., DEV-2000" />

        <div className="py-2">Category</div>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="laptop / tablet / phone" />

        <div className="py-2">Hazard</div>
        <Select value={hazard} onChange={(e) => setHazard(Number(e.target.value))}>
          <option value={0}>Low</option>
          <option value={1}>Medium</option>
          <option value={2}>High</option>
        </Select>

        <div className="py-2">State</div>
        <Select value={state} onChange={(e) => setState(Number(e.target.value))}>
          <option value={0}>Functional</option>
          <option value={1}>Damaged</option>
          <option value={2}>Hazardous</option>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={onRegisterDevice}>Register</Button>
        {msg && <span className="text-sm text-gray-600 self-center">{msg}</span>}
      </div>
    </Card>
  )
}
