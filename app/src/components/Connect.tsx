import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from '@wagmi/connectors'

export default function Connect() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  return isConnected ? (
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <code>{address}</code>
      <button onClick={()=>disconnect()} style={{padding:'6px 10px',borderRadius:8}}>Disconnect</button>
    </div>
  ) : (
    <button onClick={()=>connect({ connector: injected() })} disabled={isPending} style={{padding:'6px 10px',borderRadius:8}}>
      {isPending ? 'Connecting…' : 'Connect Wallet'}
    </button>
  )
}
