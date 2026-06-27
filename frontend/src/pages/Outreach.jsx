import { useState, useRef } from 'react'
import {
  Search, Loader2, Building2, ExternalLink,
  ChevronDown, AlertCircle, CheckCircle2, Circle,
  SkipForward, ArrowRight, Copy, Check, Sparkles
} from 'lucide-react'

const EXAMPLES = ['stripe.com', 'notion.so', 'linear.app', 'vercel.com']

const GOALS = [
  { value: 'job',         label: 'Job opportunity' },
  { value: 'sales',       label: 'Sales / product pitch' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'investment',  label: 'Investment' },
  { value: 'other',       label: 'General outreach' },
]

const STEP_ICON = {
  running: <Loader2    size={13} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--text-muted)', flexShrink: 0 }} />,
  done:    <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />,
  skip:    <SkipForward  size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />,
}

export default function Outreach() {
  // Intent — persisted to localStorage
  const [userName, setUserName] = useState(() => localStorage.getItem('reachr_userName') || '')
  const [userBio,  setUserBio]  = useState(() => localStorage.getItem('reachr_userBio')  || '')
  const [goal,     setGoal]     = useState(() => localStorage.getItem('reachr_goal')     || 'job')
  const [intentDone, setIntentDone] = useState(() => !!localStorage.getItem('reachr_userName'))

  // Pipeline
  const [domain, setDomain]     = useState('')
  const [phase,  setPhase]      = useState('idle')
  const [steps,  setSteps]      = useState([])
  const [results, setResults]   = useState(null)
  const [showSteps, setShowSteps] = useState(false)
  const [error,  setError]      = useState(null)

  // Per-card messages
  const [messages,  setMessages]  = useState({})   // { [i]: { linkedin, cold } }
  const [generating, setGenerating] = useState({}) // { [i]: bool }
  const [copied,    setCopied]    = useState({})   // { [key]: bool }

  const stepsEndRef = useRef(null)

  function addStep(message, status) {
    setSteps(prev => {
      const updated = prev.map(s => s.status === 'running' ? { ...s, status: 'done' } : s)
      return [...updated, { message, status }]
    })
    setTimeout(() => stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!domain.trim()) return

    setPhase('discovering')
    setSteps([])
    setResults(null)
    setMessages({})
    setError(null)
    setShowSteps(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/pipeline/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Request failed')
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split('\n\n')
        buffer = blocks.pop()

        for (const block of blocks) {
          const eventLine = block.split('\n').find(l => l.startsWith('event:'))
          const dataLine  = block.split('\n').find(l => l.startsWith('data:'))
          if (!eventLine || !dataLine) continue
          const event = eventLine.replace('event:', '').trim()
          const data  = JSON.parse(dataLine.replace('data:', '').trim())

          if (event === 'progress') {
            addStep(data.message, data.status)
          } else if (event === 'complete') {
            addStep('Discovery complete.', 'done')
            setResults(data)
            setShowSteps(false)
            setPhase('done')
          } else if (event === 'error') {
            throw new Error(data.message)
          }
        }
      }
    } catch (err) {
      setError(err.message)
      setPhase('idle')
    }
  }

  async function generateMessage(i, r) {
    setGenerating(prev => ({ ...prev, [i]: true }))
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/generate-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: r.contact,
          company: r.domain,
          userName,
          userBio,
          goal,
        }),
      })
      const data = await res.json()
      setMessages(prev => ({ ...prev, [i]: data }))
    } catch {
      setMessages(prev => ({ ...prev, [i]: { error: 'Failed to generate. Try again.' } }))
    } finally {
      setGenerating(prev => ({ ...prev, [i]: false }))
    }
  }

  function copyText(key, text) {
    navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  const busy = phase === 'discovering'
  const contactCount = results?.results.filter(r => r.contact).length ?? 0

  // ── Intent form ──────────────────────────────────────────────
  if (!intentDone) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 58px)',
        background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div className="animate-fadeUp" style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <svg width="22" height="11" viewBox="0 0 28 14" fill="none">
              <circle cx="3" cy="7" r="2.5" fill="var(--text-primary)" />
              <line x1="6" y1="7" x2="20" y2="7" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
              <polyline points="15,2.5 21,7 15,11.5" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Reachr
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 4, padding: '0.15rem 0.5rem', fontWeight: 500 }}>
              Step 1 of 2
            </span>
          </div>

          {/* Form body */}
          <div style={{ padding: '1.75rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              Tell us about yourself
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.75rem', letterSpacing: '-0.01em' }}>
              We'll personalise your outreach messages using this.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Your name</label>
                <input
                  type="text" placeholder="e.g. Joe Mama"
                  value={userName} onChange={e => setUserName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* Goal */}
              <div>
                <label style={labelStyle}>What's your goal?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {GOALS.map(g => (
                    <button key={g.value} onClick={() => setGoal(g.value)} style={{
                      padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.78rem',
                      fontWeight: goal === g.value ? 600 : 400,
                      border: `1px solid ${goal === g.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: goal === g.value ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: goal === g.value ? 'var(--accent-fg)' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'var(--transition-fast)',
                    }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>One line about you</label>
                <input
                  type="text"
                  placeholder={
                    goal === 'job'         ? 'e.g. Frontend engineer with 3 years of React experience' :
                    goal === 'sales'       ? 'e.g. We help SaaS teams reduce churn by 30%' :
                    goal === 'partnership' ? 'e.g. We run a design agency focused on fintech products' :
                    goal === 'investment'  ? 'e.g. Early-stage investor focused on B2B SaaS' :
                    'e.g. Building tools for developers'
                  }
                  value={userBio} onChange={e => setUserBio(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <button
              onClick={() => {
                  localStorage.setItem('reachr_userName', userName)
                  localStorage.setItem('reachr_userBio',  userBio)
                  localStorage.setItem('reachr_goal',     goal)
                  setIntentDone(true)
                }}
              disabled={!userName.trim() || !userBio.trim()}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: (!userName.trim() || !userBio.trim()) ? 'var(--bg-tertiary)' : 'var(--accent)',
                color: (!userName.trim() || !userBio.trim()) ? 'var(--text-muted)' : 'var(--accent-fg)',
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '0.7rem',
                fontSize: '0.875rem', fontWeight: 600,
                cursor: (!userName.trim() || !userBio.trim()) ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)', letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (userName.trim() && userBio.trim()) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Pipeline page ─────────────────────────────────────────────
  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 1.5rem' }}>

      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.04em' }}>
              Outreach Pipeline
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
              Goal: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{GOALS.find(g => g.value === goal)?.label}</span>
              <span style={{ margin: '0 0.4rem', color: 'var(--border-strong)' }}>·</span>
              {userName}
            </p>
          </div>
          <button onClick={() => setIntentDone(false)} style={{
            fontSize: '0.75rem', color: 'var(--text-muted)',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '0.3rem 0.7rem', cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Input */}
      <form className="animate-fadeUp stagger-1" onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="e.g. stripe.com"
            value={domain} onChange={e => setDomain(e.target.value)}
            disabled={busy}
            style={{ ...inputStyle, paddingLeft: 38, height: 42, fontFamily: "'Geist Mono', monospace", opacity: busy ? 0.6 : 1 }}
            onFocus={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <button type="submit" disabled={busy} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: busy ? 'var(--bg-tertiary)' : 'var(--accent)',
          color: busy ? 'var(--text-muted)' : 'var(--accent-fg)',
          border: busy ? '1px solid var(--border)' : '1px solid transparent',
          padding: '0 1.25rem', borderRadius: 8,
          fontSize: '0.85rem', fontWeight: 600,
          cursor: busy ? 'not-allowed' : 'pointer',
          transition: 'var(--transition)', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { if (!busy) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)' } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          {busy ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
          {busy ? 'Running…' : 'Run'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="animate-scaleIn" style={{
          display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, padding: '0.85rem 1rem',
          color: '#dc2626', fontSize: '0.85rem', marginBottom: '1.5rem',
        }}>
          <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Idle */}
      {phase === 'idle' && !error && (
        <div className="animate-fadeIn">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Try:</span>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => setDomain(ex)} style={{
                fontSize: '0.78rem', fontFamily: "'Geist Mono', monospace",
                color: 'var(--text-secondary)', background: 'var(--bg-secondary)',
                border: '1px solid var(--border)', borderRadius: 6,
                padding: '0.25rem 0.65rem', cursor: 'pointer', transition: 'var(--transition-fast)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {ex}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <ArrowRight size={13} />
            <span style={{ fontSize: '0.78rem' }}>Results stream live — takes ~30 seconds.</span>
          </div>
        </div>
      )}

      {/* Progress */}
      {steps.length > 0 && (
        <div className="animate-fadeIn" style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 10, marginBottom: '1.5rem', overflow: 'hidden',
        }}>
          <button onClick={() => setShowSteps(s => !s)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', background: 'transparent', border: 'none',
            cursor: 'pointer', transition: 'var(--transition-fast)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {busy
                ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--text-muted)' }} />
                : <CheckCircle2 size={13} style={{ color: '#16a34a' }} />}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {busy ? 'Running…' : `Done · ${steps.length} steps`}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', transition: 'transform 0.22s', transform: showSteps ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ChevronDown size={14} />
            </div>
          </button>
          {showSteps && (
            <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {steps.map((s, i) => (
                <div key={i} className="animate-fadeUp" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  {STEP_ICON[s.status] || <Circle size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                  <span style={{ fontSize: '0.82rem', color: s.status === 'done' ? 'var(--text-primary)' : 'var(--text-muted)', letterSpacing: '-0.01em' }}>
                    {s.message}
                  </span>
                </div>
              ))}
              <div ref={stepsEndRef} />
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && phase === 'done' && (
        <div className="animate-fadeIn">
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Stat label="Domain"    value={results.inputDomain} mono />
            <Stat label="Companies" value={results.totalCompanies} />
            <Stat label="Contacts"  value={contactCount} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.results.map((r, i) => (
              <div key={i} className="animate-fadeUp" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}>
                <div style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 12, overflow: 'hidden', transition: 'var(--transition)',
                }}>
                  {r.contact ? (
                    <div style={{ padding: '1.1rem 1.25rem' }}>
                      {/* Company */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                          }}>
                            <FavIcon domain={r.domain} />
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '-0.02em', fontFamily: "'Geist Mono', monospace", color: 'var(--text-primary)' }}>
                            {r.domain}
                          </span>
                        </div>
                        <a href={`https://${r.domain}`} target="_blank" rel="noreferrer"
                          style={{ color: 'var(--text-muted)', transition: 'var(--transition-fast)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>

                      <div style={{ height: 1, background: 'var(--border)', marginBottom: '1rem' }} />

                      {/* Contact */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: messages[i] ? '1rem' : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0,
                          }}>
                            {initials(r.contact.name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                              {r.contact.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
                              {r.contact.title}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                          {/* Generate message button */}
                          <button
                            onClick={() => generateMessage(i, r)}
                            disabled={generating[i]}
                            title="Generate personalised message"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.35rem',
                              padding: '0.4rem 0.8rem', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600,
                              border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)', cursor: generating[i] ? 'not-allowed' : 'pointer',
                              transition: 'var(--transition-fast)',
                            }}
                            onMouseEnter={e => { if (!generating[i]) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                          >
                            {generating[i]
                              ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                              : <Sparkles size={12} />}
                            {generating[i] ? 'Writing…' : messages[i] ? 'Regenerate' : 'Write message'}
                          </button>

                          {/* LinkedIn */}
                          {r.contact.linkedin && (
                            <a href={r.contact.linkedin} target="_blank" rel="noreferrer" style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                              background: 'var(--accent)', color: 'var(--accent-fg)',
                              padding: '0.4rem 0.8rem', borderRadius: 7,
                              fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                              transition: 'var(--transition-fast)',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
                            >
                              <ExternalLink size={12} /> Connect
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Generated messages */}
                      {messages[i] && !messages[i].error && (
                        <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <MessageBox
                            label="LinkedIn note"
                            text={messages[i].linkedin}
                            copyKey={`${i}-li`}
                            copied={copied[`${i}-li`]}
                            onCopy={() => copyText(`${i}-li`, messages[i].linkedin)}
                            charLimit={160}
                          />
                          <MessageBox
                            label="Cold message"
                            text={messages[i].cold}
                            copyKey={`${i}-cold`}
                            copied={copied[`${i}-cold`]}
                            onCopy={() => copyText(`${i}-cold`, messages[i].cold)}
                          />
                        </div>
                      )}

                      {messages[i]?.error && (
                        <p style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '0.5rem' }}>{messages[i].error}</p>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <FavIcon domain={r.domain} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '-0.02em', fontFamily: "'Geist Mono', monospace", color: 'var(--text-secondary)' }}>
                          {r.domain}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.15rem 0.55rem', borderRadius: 4, border: '1px solid var(--border)' }}>
                        no contact
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Try another domain above to run again.
          </p>

          <div style={{
            marginTop: '1rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0.75rem 1rem',
          }}>
            <AlertCircle size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, letterSpacing: '-0.01em', margin: 0 }}>
              Showing <strong style={{ color: 'var(--text-secondary)' }}>1 company per run</strong> to stay within free API limits. Upgrade to a paid plan to process more at once.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────

function MessageBox({ label, text, onCopy, copied, charLimit }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.75rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {label}
          </span>
          {charLimit && (
            <span style={{ fontSize: '0.65rem', color: text.length > charLimit ? '#dc2626' : 'var(--text-muted)' }}>
              {text.length}/{charLimit}
            </span>
          )}
        </div>
        <button onClick={onCopy} style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.7rem', fontWeight: 500,
          color: copied ? '#16a34a' : 'var(--text-muted)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          transition: 'var(--transition-fast)',
        }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p style={{ padding: '0.75rem', margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.65, letterSpacing: '-0.01em' }}>
        {text}
      </p>
    </div>
  )
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function FavIcon({ domain }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <Building2 size={13} color="var(--text-muted)" />
  return (
    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt="" width={16} height={16} style={{ borderRadius: 2 }}
      onError={() => setFailed(true)} />
  )
}

function Stat({ label, value, mono }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.55rem 0.9rem', minWidth: 80 }}>
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: '0.2rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: mono ? '-0.02em' : '-0.01em', fontFamily: mono ? "'Geist Mono', monospace" : 'inherit' }}>{value}</div>
    </div>
  )
}

// Shared styles
const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '-0.01em',
}

const inputStyle = {
  width: '100%', height: 42, padding: '0 0.875rem',
  borderRadius: 8, background: 'var(--bg)',
  border: '1px solid var(--border)', color: 'var(--text-primary)',
  fontSize: '0.875rem', outline: 'none',
  transition: 'var(--transition)', letterSpacing: '-0.01em',
  boxShadow: 'var(--shadow-sm)',
}
