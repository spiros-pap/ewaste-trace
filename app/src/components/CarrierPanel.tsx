import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

export default function CarrierPanel(){
  const { writeContractAsync } = useWriteContract()
  const [uid,setUid]=useState('DEV-2000')
  const [fromSite,setFrom]=useState('GreenPoint-A')
  const [toSite,setTo]=useState('Hub-1')
  const [notes,setNotes]=useState('Leg 1')
  const [recyclerSite,setRecyclerSite]=useState('Recycler-X')
  const [msg,setMsg]=useState('')

  async function onTransfer(){
    try{
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: 'recordTransfer',
        args: [uid, fromSite, toSite, notes],
      })
      setMsg(`Transfer tx: ${hash}`)
    }catch(e:any){ setMsg(e?.shortMessage||e?.message||String(e)) }
  }
  async function onDeliver(){
    try{
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: 'deliverToRecycler',
        args: [uid, recyclerSite],
      })
      setMsg(`Deliver tx: ${hash}`)
    }catch(e:any){ setMsg(e?.shortMessage||e?.message||String(e)) }
  }

  return (
    <div>
      <h3>Carrier — recordTransfer / deliverToRecycler</h3>
      <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:8, maxWidth:720 }}>
        <div>UID</div><input value={uid} onChange={e=>setUid(e.target.value)} />
        <div>From</div><input value={fromSite} onChange={e=>setFrom(e.target.value)} />
        <div>To</div><input value={toSite} onChange={e=>setTo(e.target.value)} />
        <div>Notes</div><input value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>
      <button onClick={onTransfer} style={{ marginTop:12, padding:'8px 16px', borderRadius:8 }}>Record Transfer</button>

      <div style={{ height:12 }} />
      <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:8, maxWidth:720 }}>
        <div>Recycler Site</div><input value={recyclerSite} onChange={e=>setRecyclerSite(e.target.value)} />
      </div>
      <button onClick={onDeliver} style={{ marginTop:12, padding:'8px 16px', borderRadius:8 }}>Deliver to Recycler</button>
      {!!msg && <p style={{ marginTop:8 }}>{msg}</p>}
    </div>
  )
}
