import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

export default function GreenPointPanel(){
  const { writeContractAsync } = useWriteContract()
  const [uid,setUid]=useState('DEV-2000')
  const [site,setSite]=useState('GreenPoint-A')
  const [msg,setMsg]=useState('')

  async function onCollect(){
    try{
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: 'confirmCollection',
        args: [uid, site],
      })
      setMsg(`Tx: ${hash}`)
    }catch(e:any){ setMsg(e?.shortMessage||e?.message||String(e)) }
  }

  return (
    <div>
      <h3>Green Point — confirmCollection</h3>
      <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:8, maxWidth:720 }}>
        <div>UID</div><input value={uid} onChange={e=>setUid(e.target.value)} />
        <div>Site</div><input value={site} onChange={e=>setSite(e.target.value)} />
      </div>
      <button onClick={onCollect} style={{ marginTop:12, padding:'8px 16px', borderRadius:8 }}>Confirm</button>
      {!!msg && <p style={{ marginTop:8 }}>{msg}</p>}
    </div>
  )
}
