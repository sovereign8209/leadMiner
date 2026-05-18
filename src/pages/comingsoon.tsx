import { Link } from 'react-router-dom'

export default function ComingSoon() {
  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.inner}>
        <Link to="/" style={s.logo}>
          <span>⛏</span>
          <span style={s.logoText}>LeadMiner</span>
        </Link>
        <div style={s.badge}>🚧 Under Development</div>
        <h1 style={s.title}>Coming Soon</h1>
        <p style={s.sub}>
          This page is still being built. The tool is live though —
          go ahead and start mining leads.
        </p>
        <div style={s.actions}>
          <Link to="/tool" style={s.btnPrimary}>⛏ Open the Tool →</Link>
          <Link to="/" style={s.btnSecondary}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    background: '#08080f',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c4c4d4',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(170,59,255,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  inner: {
    position: 'relative',
    maxWidth: '480px',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    fontSize: '20px',
    marginBottom: '8px',
  },
  logoText: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#fff',
    fontFamily: "'Syne', sans-serif",
  },
  badge: {
    background: 'rgba(170,59,255,0.08)',
    border: '1px solid rgba(170,59,255,0.2)',
    color: '#c084fc',
    fontSize: '12px',
    padding: '5px 14px',
    borderRadius: '100px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '42px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  sub: {
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: '1.75',
    fontWeight: '300',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    marginTop: '8px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
    color: '#fff',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 0 24px rgba(170,59,255,0.2)',
  },
  btnSecondary: {
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '14px',
    borderBottom: '1px solid #374151',
    paddingBottom: '2px',
  },
}