import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../ThemeContext'

function ReachrMark() {
  return (
    <svg width="22" height="14" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Origin dot */}
      <circle cx="3" cy="7" r="2.5" fill="var(--text-primary)" />
      {/* Shaft */}
      <line x1="6" y1="7" x2="20" y2="7" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
      {/* Arrowhead */}
      <polyline points="15,2.5 21,7 15,11.5" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
      height: '60px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      padding: '0 2rem',
    }}>
      {/* Left — Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', justifySelf: 'start' }}>
        <ReachrMark />
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
          Reachr
        </span>
      </Link>

      {/* Center — Nav links */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '3px',
        gap: '2px',
      }}>
        {[['/', 'Home'], ['/outreach', 'Outreach']].map(([path, label]) => (
          <Link
            key={path}
            to={path}
            style={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color: pathname === path ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.3rem 0.9rem',
              borderRadius: 7,
              background: pathname === path ? 'var(--bg)' : 'transparent',
              boxShadow: pathname === path ? 'var(--shadow-sm)' : 'none',
              transition: 'color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
              letterSpacing: '-0.01em',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { if (pathname !== path) e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { if (pathname !== path) e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right — Theme toggle */}
      <div style={{ justifySelf: 'end' }}>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </nav>
  )
}
