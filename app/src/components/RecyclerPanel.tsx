import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

export default function RecyclerPanel(){
  const { writeContractAsync } = useWriteContract()
  const [uid,setUid]=useState('DEV-2000')
  const [kind,setKind]=useState(0) // 0 Recycle, 1 Destroy
  const [msg,setMsg]=useState('')

  async function onProcess(){
    try{
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: 'processDevice',
        args: [uid, BigInt(kind)],
      })
      setMsg(`Tx: ${hash}`)
    }catch(e:any){ setMsg(e?.shortMessage||e?.message||String(e)) }
  }

  return (
    <div>
      <h3>Recycler — processDevice</h3>
      <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:8, maxWidth:720 }}>
        <div>UID</div><input value={uid} onChange={e=>setUid(e.target.value)} />
        <div>Kind</div>
        <select value={kind} onChange={e=>setKind(Number(e.target.value))}>
          <option value={0}>Recycle</option>
          <option value={1}>Destroy</option>
        </select>
      </div>
      <button onClick={onProcess} style={{ marginTop:12, padding:'8px 16px', borderRadius:8 }}>Process</button>
      {!!msg && <p style={{ marginTop:8 }}>{msg}</p>}
    </div>
  )
}
