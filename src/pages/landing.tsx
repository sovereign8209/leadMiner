import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: '🎯',
    title: 'Precision Targeting',
    desc: 'Filter leads by location, industry, review count, and rating. Get exactly who you need — no noise.',
  },
  {
    icon: '⚡',
    title: 'Instant Extraction',
    desc: 'Scrape hundreds of business leads in seconds. Name, phone, email, address, website — all in one shot.',
  },
  {
    icon: '📊',
    title: 'Excel Export',
    desc: 'Download your leads as a clean .xlsx file ready for outreach. Import directly into any CRM.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'Your data stays yours. No sharing, no selling. Every search is tied to your account only.',
  },
  {
    icon: '🌍',
    title: 'Global Coverage',
    desc: 'Mine leads from any city, any country. Local business data from across the world at your fingertips.',
  },
  {
    icon: '🔄',
    title: 'Always Fresh',
    desc: 'Real-time data pulled on demand. No stale databases — every export is live and current.',
  },
]

const STEPS = [
  { n: '01', title: 'Sign Up Free', desc: 'Create your account in 30 seconds. No credit card required.' },
  { n: '02', title: 'Set Your Target', desc: 'Enter business type and location. Add filters like review count.' },
  { n: '03', title: 'Mine & Export', desc: 'Hit search, watch leads populate, download your Excel file.' },
]

const FAQS = [
  {
    q: 'What kind of businesses can I find?',
    a: "Any business listed on Google Maps — restaurants, dentists, law firms, gyms, repair shops, agencies, and more. If it's on the map, LeadMiner can find it.",
  },
  {
    q: 'What data does LeadMiner extract?',
    a: 'Business name, phone number, email address, website, physical address, Google rating, and review count.',
  },
  {
    q: 'Is LeadMiner free to use?',
    a: 'Yes, during our beta period LeadMiner is completely free. Sign up now and lock in early access before pricing launches.',
  },
  {
    q: 'Can I use the leads for cold outreach?',
    a: 'Absolutely. The Excel export is formatted for direct import into tools like Apollo, HubSpot, Mailchimp, or your own outreach workflow.',
  },
  {
    q: 'How is this different from buying a lead list?',
    a: 'Bought lists are stale, expensive, and generic. LeadMiner gives you fresh, targeted data pulled in real-time — exactly matching your niche and location.',
  },
]

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = heroRef.current?.querySelectorAll('[data-animate]')
    els?.forEach((el, i) => {
      const element = el as HTMLElement
      element.style.opacity = '0'
      element.style.transform = 'translateY(20px)'
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
        element.style.opacity = '1'
        element.style.transform = 'translateY(0)'
      }, i * 130)
    })
  }, [])

  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={s.logoIcon}>⛏</span>
            <span style={s.logoText}>LeadMiner</span>
          </div>
          <div style={s.navLinks}>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#how" style={s.navLink}>How it works</a>
            <a href="#faq" style={s.navLink}>FAQ</a>
            <Link to="/login" style={s.navLinkSecondary}>Sign in</Link>
            <Link to="/signup" style={s.navCta}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero} ref={heroRef}>
        <div style={s.heroBg} />
        <div style={s.heroGlow} />
        <div style={s.grid} />

        <div style={s.heroInner}>
          <div data-animate style={s.badge}>
            <span style={s.badgeDot} />
            Beta — Free access, no credit card
          </div>

          <h1 data-animate style={s.heroTitle}>
            Mine Targeted<br />
            <span style={s.heroAccent}>Business Leads</span><br />
            In Seconds
          </h1>

          <p data-animate style={s.heroSub}>
            Stop wasting hours building lead lists manually. LeadMiner scrapes
            Google Maps for any business type, any city — and exports it all
            to Excel, ready for outreach.
          </p>

          <div data-animate style={s.heroCtas}>
            <Link to="/signup" style={s.ctaPrimary}>
              Start Mining Free →
            </Link>
            <a href="#how" style={s.ctaSecondary}>
              See how it works
            </a>
          </div>

          <div data-animate style={s.heroStats}>
            {[
              { n: '10K+', l: 'Leads Generated' },
              { n: '50+', l: 'Countries Covered' },
              { n: '<60s', l: 'To First Export' },
            ].map(stat => (
              <div key={stat.l} style={s.stat}>
                <span style={s.statN}>{stat.n}</span>
                <span style={s.statL}>{stat.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.eyebrow}>Why LeadMiner</p>
          <h2 style={s.sectionTitle}>Everything you need to build a targeted list</h2>
          <p style={s.sectionSub}>
            Built for sales teams, freelancers, agencies, and anyone who needs
            fresh, accurate business data — without the spreadsheet headache.
          </p>

          <div style={s.featGrid}>
            {FEATURES.map(f => (
              <div
                key={f.title}
                style={s.featCard}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#aa3bff'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                <span style={s.featIcon}>{f.icon}</span>
                <h3 style={s.featTitle}>{f.title}</h3>
                <p style={s.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ ...s.section, background: '#0d0d14' }}>
        <div style={s.sectionInner}>
          <p style={s.eyebrow}>How It Works</p>
          <h2 style={s.sectionTitle}>Three steps to your perfect lead list</h2>

          <div style={s.stepsRow}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={s.stepCard}>
                <span style={s.stepN}>{step.n}</span>
                {i < STEPS.length - 1 && <div style={s.stepLine} />}
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.eyebrow}>Use Cases</p>
          <h2 style={s.sectionTitle}>Who uses LeadMiner?</h2>

          <div style={s.useCaseGrid}>
            {[
              { title: 'Freelancers', desc: 'Find local businesses that need your services — web design, SEO, copywriting, photography.' },
              { title: 'Sales Teams', desc: 'Build hyper-targeted prospect lists by industry and region in minutes, not days.' },
              { title: 'Marketing Agencies', desc: 'Generate leads for clients or find new clients for your agency. Export and import into any tool.' },
              { title: 'Recruiters', desc: 'Identify companies hiring in specific niches and geographies for targeted outreach.' },
            ].map(u => (
              <div key={u.title} style={s.useCaseCard}>
                <h3 style={s.useCaseTitle}>{u.title}</h3>
                <p style={s.useCaseDesc}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ ...s.section, background: '#0d0d14' }}>
        <div style={s.sectionInner}>
          <p style={s.eyebrow}>FAQ</p>
          <h2 style={s.sectionTitle}>Common questions</h2>

          <div style={s.faqList}>
            {FAQS.map(f => (
              <div key={f.q} style={s.faqItem}>
                <h3 style={s.faqQ}>{f.q}</h3>
                <p style={s.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={s.ctaBanner}>
        <div style={s.ctaBannerGlow} />
        <div style={s.sectionInner}>
          <h2 style={s.ctaBannerTitle}>Ready to start mining leads?</h2>
          <p style={s.ctaBannerSub}>
            Join early users getting targeted business leads for free.
            No credit card. No setup fees. Just leads.
          </p>
          <Link to="/signup" style={s.ctaPrimary}>
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.logo}>
            <span style={s.logoIcon}>⛏</span>
            <span style={s.logoText}>LeadMiner</span>
          </div>
          <p style={s.footerText}>
            © {new Date().getFullYear()} LeadMiner. Mine smarter, outreach faster.
          </p>
          <div style={s.footerLinks}>
            <Link to="/login" style={s.footerLink}>Login</Link>
            <Link to="/signup" style={s.footerLink}>Sign Up</Link>
          </div>
        </div>
      </footer>
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
    top: 0,
    left: 0,
    right: 0,
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
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '20px' },
  logoText: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#fff',
    fontFamily: "'Syne', sans-serif",
    letterSpacing: '0px',
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: '28px' },
  navLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '400',
  },
  navLinkSecondary: {
    color: '#c4c4d4',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '400',
  },
  navCta: {
    background: '#aa3bff',
    color: '#fff',
    textDecoration: 'none',
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },

  // HERO
  hero: {
    position: 'relative',
    paddingTop: '160px',
    paddingBottom: '120px',
    textAlign: 'center',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(170,59,255,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(170,59,255,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(170,59,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(170,59,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  heroInner: {
    position: 'relative',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(170,59,255,0.08)',
    border: '1px solid rgba(170,59,255,0.25)',
    borderRadius: '100px',
    padding: '6px 16px',
    fontSize: '13px',
    color: '#c084fc',
    marginBottom: '32px',
    fontWeight: '400',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#aa3bff',
    display: 'inline-block',
    boxShadow: '0 0 6px #aa3bff',
  },
  heroTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(36px, 6vw, 64px)',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.15',
    letterSpacing: '-0.5px',
    margin: '0 0 24px',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '17px',
    lineHeight: '1.75',
    color: '#9ca3af',
    maxWidth: '560px',
    margin: '0 auto 40px',
    fontWeight: '300',
  },
  heroCtas: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '64px',
  },
  ctaPrimary: {
    background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
    color: '#fff',
    textDecoration: 'none',
    padding: '13px 26px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    display: 'inline-block',
    boxShadow: '0 0 32px rgba(170,59,255,0.25)',
  },
  ctaSecondary: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '400',
    borderBottom: '1px solid #374151',
    paddingBottom: '2px',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '56px',
    flexWrap: 'wrap',
  },
  stat: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statN: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0px',
  },
  statL: { fontSize: '12px', color: '#6b7280', fontWeight: '400', letterSpacing: '0.02em' },

  // SECTIONS
  section: {
    padding: '100px 24px',
    background: '#08080f',
  },
  sectionInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    textAlign: 'center',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#aa3bff',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '14px',
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(26px, 3.5vw, 40px)',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.3px',
    lineHeight: '1.2',
    margin: '0 0 16px',
  },
  sectionSub: {
    fontSize: '15px',
    color: '#6b7280',
    maxWidth: '520px',
    margin: '0 auto 64px',
    lineHeight: '1.75',
    fontWeight: '300',
  },

  // FEATURES
  featGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    textAlign: 'left',
  },
  featCard: {
    background: '#0f0f1a',
    border: '1px solid #1e1e2e',
    borderRadius: '14px',
    padding: '28px',
    transition: 'border-color 0.2s, transform 0.2s',
  },
  featIcon: { fontSize: '26px', display: 'block', marginBottom: '14px' },
  featTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 8px',
    letterSpacing: '0px',
  },
  featDesc: { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0, fontWeight: '300' },

  // HOW IT WORKS
  stepsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    position: 'relative',
    marginTop: '56px',
  },
  stepCard: {
    background: '#0f0f1a',
    border: '1px solid #1e1e2e',
    borderRadius: '14px',
    padding: '32px 28px',
    textAlign: 'left',
    position: 'relative',
  },
  stepN: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '40px',
    fontWeight: '700',
    color: 'rgba(170,59,255,0.18)',
    display: 'block',
    marginBottom: '16px',
    lineHeight: 1,
    letterSpacing: '0px',
  },
  stepLine: {
    position: 'absolute',
    top: '48px',
    right: '-12px',
    width: '24px',
    height: '1px',
    background: 'linear-gradient(90deg, #aa3bff, transparent)',
  },
  stepTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '17px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 8px',
    letterSpacing: '0px',
  },
  stepDesc: { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0, fontWeight: '300' },

  // USE CASES
  useCaseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginTop: '48px',
    textAlign: 'left',
  },
  useCaseCard: {
    background: '#0f0f1a',
    border: '1px solid #1e1e2e',
    borderRadius: '14px',
    padding: '24px',
  },
  useCaseTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '15px',
    fontWeight: '600',
    color: '#aa3bff',
    margin: '0 0 8px',
    letterSpacing: '0px',
  },
  useCaseDesc: { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0, fontWeight: '300' },

  // FAQ
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '680px',
    margin: '48px auto 0',
    textAlign: 'left',
  },
  faqItem: {
    background: '#0f0f1a',
    border: '1px solid #1e1e2e',
    borderRadius: '12px',
    padding: '22px 24px',
  },
  faqQ: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 8px',
    letterSpacing: '0px',
  },
  faqA: { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0, fontWeight: '300' },

  // CTA BANNER
  ctaBanner: {
    padding: '100px 24px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: '#08080f',
    borderTop: '1px solid #1e1e2e',
  },
  ctaBannerGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(170,59,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaBannerTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(26px, 3.5vw, 42px)',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.3px',
    margin: '0 0 16px',
    position: 'relative',
    lineHeight: '1.2',
  },
  ctaBannerSub: {
    fontSize: '15px',
    color: '#6b7280',
    maxWidth: '440px',
    margin: '0 auto 40px',
    lineHeight: '1.75',
    position: 'relative',
    fontWeight: '300',
  },

  // FOOTER
  footer: {
    borderTop: '1px solid #1e1e2e',
    padding: '36px 24px',
    background: '#08080f',
  },
  footerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  footerText: { fontSize: '13px', color: '#4b5563', margin: 0, fontWeight: '300' },
  footerLinks: { display: 'flex', gap: '24px' },
  footerLink: { fontSize: '13px', color: '#6b7280', textDecoration: 'none' },
}
