import { useState, useRef, useEffect } from 'react'

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
  const [logs, setLogs] = useState<string[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll terminal to bottom on new log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  async function handleScrape() {
    if (!category.trim() || !location.trim()) {
      setError('Please enter both a category and location.')
      return
    }

    setStatus('loading')
    setError('')
    setLeads([])
    setLogs(['⛏ Initializing leadMiner...'])

    try {
      const res = await fetch(`${BACKEND_URL}/scrape/stream`, {
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

      if (!res.ok || !res.body) throw new Error('Stream failed to start')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'log') {
              setLogs(prev => [...prev, data.message])
            } else if (data.type === 'done') {
              setLeads(data.leads)
              setStatus('done')
              setLogs(prev => [...prev, `🎯 Done! ${data.count} leads found.`])
            } else if (data.type === 'error') {
              setError(data.message)
              setStatus('error')
            }
          } catch {
            continue
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStatus('error')
    }
  }

  async function handleExport() {
    try {
        const res = await fetch(`${BACKEND_URL}/export`, {
            method: 'GET',   // ← GET not POST, no body needed
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
            <div style={s.field}>
              <label style={s.label}>Business Category</label>
              <input style={s.input} placeholder="e.g. dentist, gym, restaurant" value={category}
                onChange={e => setCategory(e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Location / City</label>
              <input style={s.input} placeholder="e.g. Mumbai, Delhi, Pune" value={location}
                onChange={e => setLocation(e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Min Reviews</label>
              <input style={s.input} type="number" value={minReviews}
                onChange={e => setMinReviews(Number(e.target.value))}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Max Reviews</label>
              <input style={s.input} type="number" value={maxReviews}
                onChange={e => setMaxReviews(Number(e.target.value))}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Max Results</label>
              <input style={s.input} type="number" value={maxResults}
                onChange={e => setMaxResults(Number(e.target.value))}
                onFocus={e => (e.target.style.borderColor = '#aa3bff')}
                onBlur={e => (e.target.style.borderColor = '#1e1e2e')} />
            </div>
          </div>

          {error && <p style={s.errorMsg}>⚠️ {error}</p>}

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

        {/* ⚠️ WARNING BANNER — do not refresh */}
        {status === 'loading' && (
          <div style={s.warningBanner}>
            <span style={s.warningIcon}>⚠️</span>
            <div>
              <p style={s.warningTitle}>Do not refresh or close this page</p>
              <p style={s.warningText}>
                Scraping is in progress — this may take a few minutes depending on the number of results.
                We're actively working on improving speed and reducing wait times. Thanks for your patience!
              </p>
            </div>
          </div>
        )}

        {/* LIVE TERMINAL */}
        {(status === 'loading' || (status === 'done' && logs.length > 0)) && (
          <div style={s.terminal}>
            <div style={s.terminalHeader}>
              <div style={s.dots}>
                <span style={{ ...s.dot, background: '#ff5f57' }} />
                <span style={{ ...s.dot, background: '#febc2e' }} />
                <span style={{ ...s.dot, background: '#28c840' }} />
              </div>
              <span style={s.terminalTitle}>leadMiner — live output</span>
              {status === 'loading' && <span style={s.liveBadge}>● LIVE</span>}
            </div>
            <div style={s.terminalBody}>
              {logs.map((log, i) => (
                <div key={i} style={s.logLine}>
                  <span style={s.prompt}>›</span>
                  <span style={getLogStyle(log)}>{log}</span>
                </div>
              ))}
              {status === 'loading' && <div style={s.cursor}>▋</div>}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* RESULTS TABLE */}
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
                    <tr key={i} style={s.tr}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0f0f1a')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={s.tdName}>
                        <a href={lead.url} target="_blank" rel="noreferrer" style={s.nameLink}>
                          {lead.name}
                        </a>
                      </td>
                      <td style={s.td}>{lead.rating ? <span style={s.ratingBadge}>⭐ {lead.rating}</span> : '—'}</td>
                      <td style={s.td}>{lead.reviews ?? '—'}</td>
                      <td style={s.td}>{lead.phone ?? '—'}</td>
                      <td style={s.td}>
                        {lead.website
                          ? <a href={lead.website} target="_blank" rel="noreferrer" style={s.websiteLink}>Visit →</a>
                          : '—'}
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

function getLogStyle(log: string): React.CSSProperties {
  if (log.includes('✅') || log.includes('Saved')) return { color: '#4ade80' }
  if (log.includes('❌') || log.includes('Skipped')) return { color: '#f87171' }
  if (log.includes('⚠️')) return { color: '#fbbf24' }
  if (log.includes('🎯') || log.includes('Done')) return { color: '#aa3bff', fontWeight: '600' }
  if (log.includes('🚀') || log.includes('Pipeline')) return { color: '#60a5fa' }
  if (log.includes('📍')) return { color: '#c4c4d4' }
  return { color: '#6b7280' }
}

const s: Record<string, React.CSSProperties> = {
  page: {
    background: '#08080f',
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c4c4d4',
    overflowX: 'hidden',
  },
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
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoIcon: { fontSize: '20px' },
  logoText: { fontSize: '17px', fontWeight: '700', color: '#fff', fontFamily: "'Syne', sans-serif" },
  navBadge: {
    background: 'rgba(170,59,255,0.1)',
    border: '1px solid rgba(170,59,255,0.25)',
    color: '#c084fc', fontSize: '12px', fontWeight: '500',
    padding: '4px 12px', borderRadius: '100px',
  },
  header: {
    textAlign: 'center', padding: '120px 24px 48px',
    position: 'relative', overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(170,59,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  eyebrow: {
    fontSize: '11px', fontWeight: '600', color: '#aa3bff',
    textTransform: 'uppercase' as const, letterSpacing: '0.12em',
    marginBottom: '14px', position: 'relative',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '700',
    color: '#fff', lineHeight: '1.15', letterSpacing: '-0.5px',
    margin: '0 0 16px', position: 'relative',
  },
  accent: {
    background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  sub: {
    fontSize: '15px', color: '#6b7280', maxWidth: '480px',
    margin: '0 auto', lineHeight: '1.75', fontWeight: '300', position: 'relative',
  },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  formCard: {
    maxWidth: '860px', margin: '0 auto 32px',
    padding: '32px', background: '#0f0f1a',
    border: '1px solid #1e1e2e', borderRadius: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px', marginBottom: '24px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontSize: '12px', fontWeight: '500', color: '#9ca3af',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  },
  input: {
    background: '#08080f', border: '1px solid #1e1e2e',
    borderRadius: '8px', padding: '10px 14px',
    fontSize: '14px', color: '#fff', outline: 'none',
    transition: 'border-color 0.2s', fontFamily: "'DM Sans', sans-serif",
  },
  errorMsg: {
    color: '#f87171', fontSize: '13px', marginBottom: '16px',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: '8px', padding: '10px 14px',
  },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap' as const },
  btnPrimary: {
    background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
    color: '#fff', border: 'none', padding: '12px 28px',
    borderRadius: '10px', fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 0 24px rgba(170,59,255,0.2)',
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  btnSecondary: {
    background: 'transparent', color: '#c4c4d4',
    border: '1px solid #1e1e2e', padding: '12px 24px',
    borderRadius: '10px', fontSize: '14px', fontWeight: '400',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },

  // WARNING BANNER
  warningBanner: {
    maxWidth: '860px', margin: '0 auto 20px',
    padding: '14px 20px',
    background: 'rgba(251,191,36,0.06)',
    border: '1px solid rgba(251,191,36,0.2)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'flex-start', gap: '12px',
  },
  warningIcon: { fontSize: '18px', flexShrink: 0, marginTop: '2px' },
  warningTitle: {
    fontSize: '13px', fontWeight: '600', color: '#fbbf24', margin: '0 0 4px',
  },
  warningText: {
    fontSize: '12px', color: '#6b7280', margin: 0,
    lineHeight: '1.6', fontWeight: '300',
  },

  // TERMINAL
  terminal: {
    maxWidth: '860px', margin: '0 auto 32px',
    background: '#0a0a14', border: '1px solid #1e1e2e',
    borderRadius: '12px', overflow: 'hidden',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  terminalHeader: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 16px', background: '#0f0f1a',
    borderBottom: '1px solid #1e1e2e',
  },
  dots: { display: 'flex', gap: '6px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', display: 'block' },
  terminalTitle: { fontSize: '12px', color: '#4b5563', flex: 1 },
  liveBadge: { fontSize: '11px', color: '#4ade80', fontWeight: '600' },
  terminalBody: {
    padding: '16px', maxHeight: '320px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  logLine: {
    display: 'flex', gap: '10px', fontSize: '12px',
    lineHeight: '1.6', alignItems: 'flex-start',
  },
  prompt: { color: '#aa3bff', flexShrink: 0, marginTop: '1px' },
  cursor: { color: '#aa3bff', fontSize: '14px' },

  // RESULTS
  resultsSection: { padding: '0 0 80px' },
  resultsHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '20px',
    flexWrap: 'wrap' as const, gap: '12px',
  },
  resultsTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: '20px',
    fontWeight: '700', color: '#fff', margin: 0,
  },
  tableWrap: { overflowX: 'auto', border: '1px solid #1e1e2e', borderRadius: '12px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' },
  th: {
    padding: '12px 16px', textAlign: 'left' as const,
    fontSize: '11px', fontWeight: '600', color: '#6b7280',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    borderBottom: '1px solid #1e1e2e', background: '#0f0f1a',
    whiteSpace: 'nowrap' as const,
  },
  tr: { borderBottom: '1px solid #1e1e2e', transition: 'background 0.15s' },
  td: { padding: '12px 16px', color: '#9ca3af', verticalAlign: 'top' as const },
  tdName: { padding: '12px 16px', verticalAlign: 'top' as const, minWidth: '180px' },
  tdAddress: { maxWidth: '200px', fontSize: '12px' },
  nameLink: { color: '#fff', textDecoration: 'none', fontWeight: '500', fontSize: '13px' },
  websiteLink: { color: '#aa3bff', textDecoration: 'none', fontSize: '12px' },
  ratingBadge: { fontSize: '12px', color: '#fbbf24' },
  emptyBox: { textAlign: 'center', padding: '64px 24px' },
  emptyIcon: { fontSize: '32px', margin: '0 0 12px' },
  emptyText: { fontSize: '16px', color: '#c4c4d4', margin: '0 0 8px' },
  emptyHint: { fontSize: '13px', color: '#4b5563', fontWeight: '300', margin: 0 },
}