import { useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

interface Lead {
  name: string
  rating: number | null
  reviews: number | null
  phone: string | null
  website: string | null
  address: string | null
  category: string
  location: string
  url: string
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function Tool() {
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [minReviews, setMinReviews] = useState(50)
  const [maxReviews, setMaxReviews] = useState(300)
  const [maxResults, setMaxResults] = useState(50)
  const [leads, setLeads] = useState<Lead[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleScrape() {
    if (!category.trim() || !location.trim()) {
      setError('Please enter both a category and location.')
      return
    }

    setStatus('loading')
    setError('')
    setLeads([])

    try {
      const res = await fetch(`${BACKEND_URL}/scrape/json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.trim(),
          location: location.trim(),
          min_reviews: minReviews,
          max_reviews: maxReviews,
          max_results: maxResults,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Scrape failed')
      }

      const data = await res.json()
      setLeads(data.leads)
      setStatus('done')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStatus('error')
    }
  }

  async function handleExport() {
    if (!category.trim() || !location.trim()) return

    try {
      const res = await fetch(`${BACKEND_URL}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.trim(),
          location: location.trim(),
          min_reviews: minReviews,
          max_reviews: maxReviews,
          max_results: maxResults,
        }),
      })

      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${category}_${location}_leads.xlsx`.replace(/\s+/g, '_')
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Export failed')
    }
  }

  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <a href="/" style={s.logo}>
            <span style={s.logoIcon}>⛏</span>
            <span style={s.logoText}>LeadMiner</span>
          </a>
          <div style={s.navBadge}>Beta Tool</div>
        </div>
      </nav>

      {/* MAIN */}
      <main style={s.main}>

        {/* HEADER */}
        <div style={s.header}>
          <div style={s.heroBg} />
          <p style={s.eyebrow}>Lead Mining Tool</p>
          <h1 style={s.title}>
            Find <span style={s.accent}>targeted leads</span> instantly
          </h1>
          <p style={s.sub}>
            Enter a business category and city — LeadMiner scrapes Google Maps
            and returns a filtered, export-ready lead list.
          </p>
        </div>

        {/* FORM */}
        <div style={s.formCard}>
          <div style={s.formGrid}>

            {/* Category */}
            <div style={s.field}>
              <label style={s.label}>Business Category</label>
              <input
                style={s.input}
                placeholder="e.g. dentist, gym, restaurant"
                value={category}
                onChange={e => setCategory(e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')}
              />
            </div>

            {/* Location */}
            <div style={s.field}>
              <label style={s.label}>Location / City</label>
              <input
                style={s.input}
                placeholder="e.g. Mumbai, Delhi, Pune"
                value={location}
                onChange={e => setLocation(e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')}
              />
            </div>

            {/* Min reviews */}
            <div style={s.field}>
              <label style={s.label}>Min Reviews</label>
              <input
                style={s.input}
                type="number"
                value={minReviews}
                onChange={e => setMinReviews(Number(e.target.value))}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')}
              />
            </div>

            {/* Max reviews */}
            <div style={s.field}>
              <label style={s.label}>Max Reviews</label>
              <input
                style={s.input}
                type="number"
                value={maxReviews}
                onChange={e => setMaxReviews(Number(e.target.value))}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')}
              />
            </div>

            {/* Max results */}
            <div style={s.field}>
              <label style={s.label}>Max Results</label>
              <input
                style={s.input}
                type="number"
                value={maxResults}
                onChange={e => setMaxResults(Number(e.target.value))}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')}
              />
            </div>

          </div>

          {error && <p style={s.errorMsg}>⚠️ {error}</p>}

          {/* ACTIONS */}
          <div style={s.actions}>
            <button
              style={status === 'loading' ? { ...s.btnPrimary, ...s.btnDisabled } : s.btnPrimary}
              onClick={handleScrape}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? '⛏ Mining leads...' : '⛏ Start Mining'}
            </button>

            {leads.length > 0 && (
              <button style={s.btnSecondary} onClick={handleExport}>
                📊 Export to Excel
              </button>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {status === 'loading' && (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Scraping Google Maps — this may take a few minutes...</p>
            <p style={s.loadingHint}>Browser is running in the background collecting leads.</p>
          </div>
        )}

        {/* RESULTS */}
        {status === 'done' && leads.length > 0 && (
          <div style={s.resultsSection}>
            <div style={s.resultsHeader}>
              <h2 style={s.resultsTitle}>
                <span style={s.accent}>{leads.length}</span> leads found
              </h2>
              <button style={s.btnSecondary} onClick={handleExport}>
                📊 Export to Excel
              </button>
            </div>

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Business', 'Rating', 'Reviews', 'Phone', 'Website', 'Address'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr
                      key={i}
                      style={s.tr}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0f0f1a')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={s.tdName}>
                        <a href={lead.url} target="_blank" rel="noreferrer" style={s.nameLink}>
                          {lead.name}
                        </a>
                      </td>
                      <td style={s.td}>
                        {lead.rating ? (
                          <span style={s.ratingBadge}>⭐ {lead.rating}</span>
                        ) : '—'}
                      </td>
                      <td style={s.td}>{lead.reviews ?? '—'}</td>
                      <td style={s.td}>{lead.phone ?? '—'}</td>
                      <td style={s.td}>
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noreferrer" style={s.websiteLink}>
                            Visit →
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{ ...s.td, ...s.tdAddress }}>{lead.address ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {status === 'done' && leads.length === 0 && (
          <div style={s.emptyBox}>
            <p style={s.emptyIcon}>🔍</p>
            <p style={s.emptyText}>No leads found matching your filters.</p>
            <p style={s.emptyHint}>Try adjusting the review range or a broader category.</p>
          </div>
        )}

      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    background: '#08080f',
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c4c4d4',
    overflowX: 'hidden',
  },

  // NAV
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(8,8,15,0.85)',
    backdropFilter: 'blur(12px)',
  },
  navInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: { fontSize: '20px' },
  logoText: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#fff',
    fontFamily: "'Syne', sans-serif",
  },
  navBadge: {
    background: 'rgba(170,59,255,0.1)',
    border: '1px solid rgba(170,59,255,0.25)',
    color: '#c084fc',
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 12px',
    borderRadius: '100px',
  },

  // HEADER
  header: {
    textAlign: 'center',
    padding: '120px 24px 48px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(170,59,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#aa3bff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    marginBottom: '14px',
    position: 'relative',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.15',
    letterSpacing: '-0.5px',
    margin: '0 0 16px',
    position: 'relative',
  },
  accent: {
    background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  sub: {
    fontSize: '15px',
    color: '#6b7280',
    maxWidth: '480px',
    margin: '0 auto',
    lineHeight: '1.75',
    fontWeight: '300',
    position: 'relative',
  },

  // FORM
  formCard: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '32px',
    background: '#0f0f1a',
    border: '1px solid #1e1e2e',
    borderRadius: '16px',
    marginTop: '32px',
    marginBottom: '32px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  input: {
    background: '#08080f',
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  },
  errorMsg: {
    color: '#f87171',
    fontSize: '13px',
    marginBottom: '16px',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 0 24px rgba(170,59,255,0.2)',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#c4c4d4',
    border: '1px solid #1e1e2e',
    padding: '12px 24px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '400',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },

  // LOADING
  loadingBox: {
    textAlign: 'center',
    padding: '48px 24px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #1e1e2e',
    borderTop: '3px solid #aa3bff',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '15px',
    color: '#c4c4d4',
    margin: '0 0 8px',
  },
  loadingHint: {
    fontSize: '13px',
    color: '#4b5563',
    margin: 0,
    fontWeight: '300',
  },

  // RESULTS
  resultsSection: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 24px 80px',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  resultsTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  tableWrap: {
    overflowX: 'auto',
    border: '1px solid #1e1e2e',
    borderRadius: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    borderBottom: '1px solid #1e1e2e',
    background: '#0f0f1a',
    whiteSpace: 'nowrap' as const,
  },
  tr: {
    borderBottom: '1px solid #1e1e2e',
    transition: 'background 0.15s',
  },
  td: {
    padding: '12px 16px',
    color: '#9ca3af',
    verticalAlign: 'top' as const,
  },
  tdName: {
    padding: '12px 16px',
    verticalAlign: 'top' as const,
    minWidth: '180px',
  },
  tdAddress: {
    maxWidth: '200px',
    fontSize: '12px',
  },
  nameLink: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '13px',
  },
  websiteLink: {
    color: '#aa3bff',
    textDecoration: 'none',
    fontSize: '12px',
  },
  ratingBadge: {
    fontSize: '12px',
    color: '#fbbf24',
  },

  // EMPTY
  emptyBox: {
    textAlign: 'center',
    padding: '64px 24px',
  },
  emptyIcon: { fontSize: '32px', margin: '0 0 12px' },
  emptyText: { fontSize: '16px', color: '#c4c4d4', margin: '0 0 8px' },
  emptyHint: { fontSize: '13px', color: '#4b5563', fontWeight: '300', margin: 0 },

  // MAIN
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 24px',
  },
}