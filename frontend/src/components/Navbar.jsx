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
      background: theme === 'light' ? 'rgba(255,255,255,0.88)' : 'rgba(10,10,10,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <ReachrMark />
        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
          reachr
        </span>
      </Link>

      {/* Nav + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {[['/', 'Home'], ['/outreach', 'Outreach']].map(([path, label]) => (
          <Link
            key={path}
            to={path}
            style={{
              fontSize: '0.875rem',
              fontWeight: pathname === path ? 500 : 400,
              color: pathname === path ? 'var(--text-primary)' : 'var(--text-muted)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              transition: 'color 0.15s ease',
              paddingBottom: '2px',
              borderBottom: pathname === path ? '1.5px solid var(--text-primary)' : '1.5px solid transparent',
            }}
            onMouseEnter={e => { if (pathname !== path) e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { if (pathname !== path) e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            {label}
          </Link>
        ))}

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            width: 30, height: 30, borderRadius: 7,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </nav>
  )
}
