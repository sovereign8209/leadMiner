import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.grid} />
        <div style={{ ...styles.card, textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
          <h2 style={{ color: '#fff', marginBottom: '12px' }}>Check your email</h2>
          <p style={{ color: '#6b6375', fontSize: '14px' }}>
            We sent a confirmation link to <strong style={{ color: '#aa3bff' }}>{email}</strong>.
            Confirm it then sign in.
          </p>
          <p style={{ color: '#6b6375', fontSize: '13px', marginTop: '16px' }}>
            Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.grid} />

      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⛏</span>
          <span style={styles.logoText}>LeadMiner</span>
        </div>

        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Start mining business leads today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              style={styles.input}
              onFocus={e => (e.target.style.borderColor = '#aa3bff')}
              onBlur={e => (e.target.style.borderColor = '#2e2e3a')}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
              onFocus={e => (e.target.style.borderColor = '#aa3bff')}
              onBlur={e => (e.target.style.borderColor = '#2e2e3a')}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              style={styles.input}
              onFocus={e => (e.target.style.borderColor = '#aa3bff')}
              onBlur={e => (e.target.style.borderColor = '#2e2e3a')}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
              style={styles.input}
              onFocus={e => (e.target.style.borderColor = '#aa3bff')}
              onBlur={e => (e.target.style.borderColor = '#2e2e3a')}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(170,59,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(170,59,255,0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  card: {
    background: '#12121a',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    boxShadow: '0 0 60px rgba(170,59,255,0.08)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '32px',
  },
  logoIcon: { fontSize: '24px' },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b6375',
    margin: '0 0 32px',
  },
  error: {
    background: 'rgba(255,80,80,0.1)',
    border: '1px solid rgba(255,80,80,0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ff5050',
    fontSize: '14px',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  input: {
    background: '#0a0a0f',
    border: '1px solid #2e2e3a',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    marginTop: '8px',
    transition: 'opacity 0.2s',
    letterSpacing: '0.02em',
  },
  footer: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b6375',
    marginTop: '28px',
  },
  link: {
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: '600',
  },
}