import { useState } from 'react'
import { usePublicClient } from 'wagmi'
import { EwasteRegistryABI } from './abi/EwasteRegistry'
import { Card, Button, Input, Badge } from './ui'

type Ewaste = { uid:string; category:string; hazard:bigint; state:bigint; owner:`0x${string}`; phase:bigint; exists:boolean }
type Hop = { timestamp:bigint; from:`0x${string}`; to:`0x${string}`; fromSite:string; toSite:string; notes:string }
const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`

const phaseLabel = (p: bigint) => ['Registered','Collected','InTransit','DeliveredToRecycler','Processed'][Number(p)] ?? String(p)
const hazardLabel = (h: bigint) => ['Low','Medium','High'][Number(h)] ?? String(h)
const hazardColor = (h: bigint) => [ 'green','amber','red' ][Number(h)] as any
const stateLabel  = (s: bigint) => ['Functional','Damaged','Hazardous'][Number(s)] ?? String(s)

export default function Inspector(){
  const pc = usePublicClient()
  const [uid, setUid] = useState('DEV-1000')
  const [device, setDevice] = useState<Ewaste | null>(null)
  const [history, setHistory] = useState<Hop[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function search() {
    setLoading(true); setError(null)
    try {
      const d = await pc.readContract({ address: CONTRACT, abi: EwasteRegistryABI, functionName: 'getDevice', args: [uid] }) as any
      const h = await pc.readContract({ address: CONTRACT, abi: EwasteRegistryABI, functionName: 'getHistory', args: [uid] }) as any
      setDevice(d); setHistory(h)
    } catch (e:any) { setError(e?.shortMessage||e?.message||String(e)); setDevice(null); setHistory(null) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Inspector — Search</h2>

      <div className="flex gap-2">
        <Input value={uid} onChange={(e)=>setUid(e.target.value)} placeholder="UID (e.g., DEV-1000)" />
        <Button onClick={search} disabled={loading}>{loading ? 'Searching…' : 'Search'}</Button>
      </div>

      {error && <Card className="p-4 border-red-200 bg-red-50 text-red-800">{error}</Card>}

      {device && (
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Device</h3>
            <div className="flex gap-2">
              <Badge color={hazardColor(device.hazard)}>Hazard: {hazardLabel(device.hazard)}</Badge>
              <Badge color="blue">Phase: {phaseLabel(device.phase)}</Badge>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[160px_1fr] gap-2">
            <div>UID</div><div className="font-medium">{device.uid}</div>
            <div>Category</div><div>{device.category}</div>
            <div>State</div><div>{stateLabel(device.state)}</div>
            <div>Owner</div><div className="truncate">{device.owner}</div>
            <div>Exists</div><div>{String(device.exists)}</div>
          </div>
        </Card>
      )}

      {history && (
        <Card className="p-5">
          <h3 className="text-lg font-semibold mb-3">Timeline</h3>
          {history.length === 0 && <p>No hops recorded.</p>}

          <ol className="relative border-s pl-6 space-y-5">
            {history.map((hop, i) => (
              <li key={i} className="ms-4">
                <span className="absolute -start-[7px] mt-1 h-3 w-3 rounded-full bg-gray-900"></span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">#{i+1}</span>
                  <span>ts: {Number(hop.timestamp)}</span>
                </div>
                <div className="mt-1 text-sm">
                  <div><span className="font-medium">From:</span> {hop.fromSite} <span className="text-gray-500">({hop.from})</span></div>
                  <div><span className="font-medium">To:</span> {hop.toSite} <span className="text-gray-500">({hop.to})</span></div>
                  <div className="text-gray-700">{hop.notes}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  )
}
