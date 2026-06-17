import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Mail, ArrowRight } from 'lucide-react'

const INTRO_MS = 1100   // how long the intro plays before content appears
const OVERLAY_MS = 1300 // how long before overlay fully disappears

const features = [
  {
    icon: Search,
    step: '01',
    title: 'Discover Companies',
    desc: 'Find similar companies in your target market using intelligent lookalike search.',
  },
  {
    icon: Users,
    step: '02',
    title: 'Find Decision Makers',
    desc: 'Locate the CEO or founder of each company automatically.',
  },
  {
    icon: Mail,
    step: '03',
    title: 'Automated Outreach',
    desc: 'Send personalised emails to the right people at the right companies.',
  },
]

export default function Home() {
  const [introPlaying, setIntroPlaying] = useState(true)
  const [showContent, setShowContent]   = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), INTRO_MS)
    const t2 = setTimeout(() => setIntroPlaying(false), OVERLAY_MS)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <>
      {/* ── Intro overlay ── */}
      {introPlaying && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: `introOverlayOut ${OVERLAY_MS}ms cubic-bezier(0.4,0,0.2,1) forwards`,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          {/* Arrow that shoots toward top-right */}
          <svg
            width="84" height="42" viewBox="0 0 28 14" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              animation: `arrowShoot ${OVERLAY_MS}ms cubic-bezier(0.4,0,0.1,1) forwards`,
              transformOrigin: 'center center',
            }}
          >
            <circle cx="3" cy="7" r="2.5" fill="var(--text-primary)" />
            <line x1="6" y1="7" x2="20" y2="7" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
            <polyline points="15,2.5 21,7 15,11.5" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>

          {/* Trail that streaks left-to-right behind the arrow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            height: '1px',
            background: 'linear-gradient(to right, transparent, var(--text-primary) 40%, transparent)',
            transformOrigin: 'left center',
            transform: 'translateY(-50%)',
            animation: `trailDraw ${OVERLAY_MS * 0.85}ms ${OVERLAY_MS * 0.15}ms cubic-bezier(0.4,0,0.2,1) forwards`,
            width: 0,
            opacity: 0,
          }} />
        </div>
      )}

      {/* ── Page content ── */}
      <main style={{
        maxWidth: '800px', margin: '0 auto', padding: '6rem 1.5rem 6rem',
        opacity: showContent ? 1 : 0,
        animation: showContent ? `contentReveal 0.6s cubic-bezier(0.4,0,0.2,1) forwards` : 'none',
      }}>

        {/* Hero */}
        <div style={{ marginBottom: '6rem' }}>
          <p style={{
            fontSize: '0.78rem', fontWeight: 600,
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            Outreach, automated
          </p>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            fontWeight: 800, lineHeight: 1.06,
            letterSpacing: '-0.05em',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem', maxWidth: 620,
          }}>
            Turn a domain into a warm lead.
          </h1>

          <p style={{
            fontSize: '1.05rem', color: 'var(--text-secondary)',
            maxWidth: '480px', lineHeight: 1.7,
            letterSpacing: '-0.01em', marginBottom: '2.5rem',
          }}>
            Enter a company domain. Reachr finds similar companies, locates their decision makers, and sends personalised emails — all in under a minute.
          </p>

          <Link
            to="/outreach"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--accent)', color: 'var(--accent-fg)',
              padding: '0.8rem 1.6rem', borderRadius: '8px',
              fontSize: '0.9rem', fontWeight: 600,
              transition: 'var(--transition)', letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Run a pipeline <ArrowRight size={16} />
          </Link>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            How it works
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {features.map((f, idx) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '1.6rem',
                  transition: 'var(--transition)',
                  animationDelay: `${idx * 0.08}s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-primary)',
                  }}>
                    <Icon size={17} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                    {f.step}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '0.45rem', letterSpacing: '-0.025em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65, letterSpacing: '-0.01em' }}>
                  {f.desc}
                </p>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
