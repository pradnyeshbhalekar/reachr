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
      borderBottom: '1px solid var(--border)',
      background: theme === 'light' ? 'rgba(255,255,255,0.82)' : 'rgba(10,10,10,0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '0 2rem',
      height: '58px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'background 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Logo */}
      <Link
        to="/"
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
        onMouseEnter={e => e.currentTarget.querySelector('svg').style.transform = 'translate(2px, -2px)'}
        onMouseLeave={e => e.currentTarget.querySelector('svg').style.transform = 'translate(0, 0)'}
      >
        <span style={{ display: 'flex', transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
          <ReachrMark />
        </span>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Reachr
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {[['/', 'Home'], ['/outreach', 'Outreach']].map(([path, label]) => (
          <Link
            key={path}
            to={path}
            style={{
              fontSize: '0.85rem',
              fontWeight: pathname === path ? 500 : 400,
              color: pathname === path ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: 6,
              background: pathname === path ? 'var(--bg-tertiary)' : 'transparent',
              transition: 'var(--transition-fast)',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              if (pathname !== path) {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = pathname === path ? 'var(--text-primary)' : 'var(--text-muted)'
              e.currentTarget.style.background = pathname === path ? 'var(--bg-tertiary)' : 'transparent'
            }}
          >
            {label}
          </Link>
        ))}

        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 0.25rem' }} />

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            width: 34, height: 34, borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'var(--transition)', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <span style={{ display: 'flex', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)', transform: theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </span>
        </button>
      </div>
    </nav>
  )
}
