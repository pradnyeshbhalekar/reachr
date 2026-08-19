import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, LogIn, Menu, X } from 'lucide-react'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < breakpoint
  )
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return isMobile
}

const ADMIN_EMAIL = 'pradnyeshbhalekar78@gmail.com'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

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
  const { isAuthenticated, user, login, logout } = useAuth()
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMenuOpen(false) }, [pathname])
  useEffect(() => { if (!isMobile) setMenuOpen(false) }, [isMobile])

  const links = [
    ['/', 'Home'],
    ['/outreach', 'Outreach'],
    ...(user?.email === ADMIN_EMAIL ? [['/admin', 'Admin']] : []),
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: theme === 'light' ? 'rgba(255,255,255,0.88)' : 'rgba(10,10,10,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 1rem' : '0 2rem',
        gap: '0.5rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
          <ReachrMark />
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            reachr
          </span>
        </Link>

        {/* Nav + toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.85rem' : '1.5rem' }}>
        {!isMobile && links.map(([path, label]) => (
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
              whiteSpace: 'nowrap',
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
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
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

        {isAuthenticated ? (
          <button
            onClick={logout}
            title={user?.email}
            aria-label="Sign out"
            style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              border: 'none',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary, #fff)',
              fontSize: '0.7rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {initials(user?.name)}
          </button>
        ) : (
          <button
            onClick={login}
            aria-label="Sign in"
            title="Sign in"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
              padding: isMobile ? '0.4rem' : '0.4rem 0.75rem',
              borderRadius: isMobile ? '50%' : 7,
              width: isMobile ? 28 : 'auto',
              height: isMobile ? 28 : 'auto',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem', fontWeight: 500,
              cursor: 'pointer', transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <LogIn size={13} />
            {!isMobile && 'Sign in'}
          </button>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '0.5rem 1rem 0.75rem',
        }}>
          {links.map(([path, label]) => (
            <Link
              key={path}
              to={path}
              style={{
                fontSize: '0.9rem',
                fontWeight: pathname === path ? 600 : 400,
                color: pathname === path ? 'var(--text-primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                padding: '0.65rem 0.25rem',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
