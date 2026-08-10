import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, CheckCircle2, Circle } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function Admin() {
  const { isAuthenticated, token, login } = useAuth()
  const [signups, setSignups] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    fetch(`${import.meta.env.VITE_API_URL}/admin/beta-signups`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(res.status === 403 ? 'Not authorized to view this page.' : (data.error || 'Failed to load'))
        }
        return res.json()
      })
      .then(data => setSignups(data.signups))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAuthenticated, token])

  if (!isAuthenticated) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Sign in to view the beta list.
        </p>
        <button onClick={login} style={{
          padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        }}>
          Sign in with Google
        </button>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.03em' }}>
        Beta signups
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Everyone who's requested access, their approval status, and whether they've signed in yet.
      </p>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading…
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, padding: '0.85rem 1rem', color: '#dc2626', fontSize: '0.85rem',
        }}>
          <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
          {error}
        </div>
      )}

      {signups && (
        signups.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No signups yet.</p>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Email', 'Status', 'Signed in', 'Requested'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.9rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signups.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.65rem 0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '0.65rem 0.9rem', color: 'var(--text-secondary)', fontFamily: "'Geist Mono', monospace" }}>{s.email}</td>
                    <td style={{ padding: '0.65rem 0.9rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: 4,
                        fontSize: '0.7rem', fontWeight: 600,
                        background: s.status === 'approved' ? '#f0fdf4' : 'var(--bg-tertiary)',
                        color: s.status === 'approved' ? '#16a34a' : 'var(--text-muted)',
                        border: `1px solid ${s.status === 'approved' ? '#bbf7d0' : 'var(--border)'}`,
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.9rem' }}>
                      {s.signed_in
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a' }}><CheckCircle2 size={13} /> Yes</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}><Circle size={13} /> Not yet</span>}
                    </td>
                    <td style={{ padding: '0.65rem 0.9rem', color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </main>
  )
}
