import { useState } from 'react'
import { useAccount } from 'wagmi'
import Connect from './components/Connect'
import Inspector from './Inspector'
import AdminPanel from './components/AdminPanel'
import UserPanel from './components/UserPanel'
import GreenPointPanel from './components/GreenPointPanel'
import CarrierPanel from './components/CarrierPanel'
import RecyclerPanel from './components/RecyclerPanel'
import { useRoles } from './hooks/useRoles'

const TABS = ['Inspector', 'Admin', 'User', 'Green Point', 'Carrier', 'Recycler'] as const
type Tab = typeof TABS[number]

function Guard({ ok, hint }: { ok: boolean; hint: string; children: React.ReactNode }) {
  if (!ok) return <p style={{ marginTop: 8, padding: 12, border: '1px dashed #ddd', borderRadius: 8 }}>{hint}</p>
  return <>{children}</>
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Inspector')
  const { address } = useAccount()
  const roles = useRoles()

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">e‑Waste Traceability</h1>
        <Connect />
      </div>

      {!!address && (
        <p style={{ margin: '8px 0', fontSize: 12, color: '#6b7280' }}>
          Connected: <code>{address}</code>
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, margin: '16px 0 24px' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: tab === t ? '#111827' : '#f3f4f6',
              color: tab === t ? '#fff' : '#111827',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Inspector' && <Inspector />}

      {tab === 'Admin' && (
        <Guard ok={!!roles.admin} hint="Connect Admin (Hardhat Account #0) to access this panel.">
          <AdminPanel />
        </Guard>
      )}

      {tab === 'User' && (
        <Guard ok={!!roles.user} hint="Connect User (Hardhat Account #1) to register devices.">
          <UserPanel />
        </Guard>
      )}

      {tab === 'Green Point' && (
        <Guard ok={!!roles.green} hint="Connect Green Point (Hardhat Account #2) to confirm collections.">
          <GreenPointPanel />
        </Guard>
      )}

      {tab === 'Carrier' && (
        <Guard ok={!!roles.carrier} hint="Connect Carrier (Hardhat Account #3) to record transfers and deliveries.">
          <CarrierPanel />
        </Guard>
      )}

      {tab === 'Recycler' && (
        <Guard ok={!!roles.recycler} hint="Connect Recycler (Hardhat Account #4) to process devices.">
          <RecyclerPanel />
        </Guard>
      )}
    </div>
  )
}
