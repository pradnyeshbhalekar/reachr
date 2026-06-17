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
      background: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(10,10,10,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '0 2.5rem',
      height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <ReachrMark />
        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
          Reachr
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {[['/', 'Home'], ['/outreach', 'Outreach']].map(([path, label]) => (
          <Link
            key={path}
            to={path}
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: pathname === path ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.4rem 0.9rem',
              borderRadius: 8,
              background: 'transparent',
              transition: 'color 0.15s ease, background 0.15s ease',
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              position: 'relative',
            }}
            onMouseEnter={e => { if (pathname !== path) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-secondary)' } }}
            onMouseLeave={e => { e.currentTarget.style.color = pathname === path ? 'var(--text-primary)' : 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            {label}
            {pathname === path && (
              <span style={{
                position: 'absolute', bottom: 2, left: '50%',
                transform: 'translateX(-50%)',
                width: 4, height: 4, borderRadius: '50%',
                background: 'var(--text-primary)',
              }} />
            )}
          </Link>
        ))}

        <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 0.4rem' }} />

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </nav>
  )
}
