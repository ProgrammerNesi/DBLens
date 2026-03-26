import { useState, useEffect, useRef } from 'react'
import { useDBConnection } from '../hooks/useDBConnection'

const INITIAL_FORM = {
  host: "localhost",
  port: "3306",
  user: "",
  password: "",
  database: "",
  db_type: "mysql"
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Syne:wght@700;800&display=swap');

  .cf-page {
    --ink:      #0C0C0D;
    --ink-2:    #111113;
    --ink-3:    #1A1A1D;
    --ink-4:    #242428;
    --muted:    #6B6B72;
    --muted-2:  #3A3A3F;
    --amber:    #F5A623;
    --amber-dim:#7A5412;
    --green:    #2DCA72;
    --red:      #E8594A;
    --paper:    #F7F4EF;
    --rule:     rgba(255,255,255,0.05);

    font-family: 'IBM Plex Mono', monospace;
    min-height: 100vh;
    background: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  /* Grid background */
  .cf-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--rule) 1px, transparent 1px),
      linear-gradient(90deg, var(--rule) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  /* Amber glow origin */
  .cf-page::after {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
    pointer-events: none;
  }

  /* ── Shell ── */
  .cf-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* ── Masthead ── */
  .cf-masthead {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cf-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cf-logo-mark {
    width: 32px;
    height: 32px;
    border: 1px solid var(--amber-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  .cf-logo-mark::before {
    content: '';
    position: absolute;
    inset: 2px;
    background: rgba(245,166,35,0.05);
  }

  .cf-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--paper);
    line-height: 1;
  }
  .cf-logo-text em {
    color: var(--amber);
    font-style: normal;
  }

  .cf-tagline {
    font-size: 10px;
    color: var(--muted-2);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding-left: 42px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cf-tagline::before {
    content: '';
    display: block;
    width: 16px;
    height: 1px;
    background: var(--amber-dim);
    flex-shrink: 0;
  }

  /* ── Card ── */
  .cf-card {
    background: var(--ink-2);
    border: 1px solid var(--ink-4);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
  }

  /* Corner accents */
  .cf-card::before,
  .cf-card::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border-color: var(--amber-dim);
    border-style: solid;
  }
  .cf-card::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
  .cf-card::after  { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

  /* ── DB Type toggle ── */
  .cf-db-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid var(--ink-4);
    overflow: hidden;
  }

  .cf-db-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    padding: 8px 0;
    color: var(--muted-2);
    transition: color 0.12s, background 0.12s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    position: relative;
  }
  .cf-db-btn:first-child {
    border-right: 1px solid var(--ink-4);
  }
  .cf-db-btn:hover { color: var(--muted); background: rgba(255,255,255,0.02); }
  .cf-db-btn.active {
    color: var(--amber);
    background: rgba(245,166,35,0.06);
  }
  .cf-db-btn.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--amber);
  }

  /* ── Fields ── */
  .cf-fields { display: flex; flex-direction: column; gap: 14px; }

  .cf-row {
    display: grid;
    grid-template-columns: 1fr 80px;
    gap: 10px;
  }

  .cf-field { display: flex; flex-direction: column; gap: 5px; }

  .cf-label {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted-2);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cf-input-wrap { position: relative; }

  .cf-input {
    width: 100%;
    background: var(--ink);
    border: 1px solid var(--ink-4);
    color: var(--paper);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    padding: 8px 10px;
    outline: none;
    transition: border-color 0.14s, background 0.14s;
    letter-spacing: 0.02em;
    border-radius: 0;
    -webkit-appearance: none;
  }
  .cf-input::placeholder { color: var(--muted-2); font-style: italic; }
  .cf-input:focus {
    border-color: var(--amber-dim);
    background: #080808;
  }
  .cf-input:focus + .cf-input-rule { opacity: 1; }

  /* Bottom amber rule on focus */
  .cf-input-rule {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: var(--amber);
    opacity: 0;
    transition: opacity 0.14s;
    pointer-events: none;
  }

  /* ── Notice ── */
  .cf-notice {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 9px;
    color: var(--muted-2);
    letter-spacing: 0.08em;
    padding-top: 2px;
  }

  /* ── Error ── */
  .cf-error {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(232,89,74,0.06);
    border: 1px solid rgba(232,89,74,0.2);
    font-size: 11px;
    color: var(--red);
    line-height: 1.5;
  }
  .cf-error svg { flex-shrink: 0; margin-top: 1px; }

  /* ── Submit ── */
  .cf-submit {
    width: 100%;
    background: none;
    border: 1px solid var(--amber-dim);
    color: var(--amber);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 11px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    position: relative;
  }
  .cf-submit::before,
  .cf-submit::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-color: var(--amber-dim);
    border-style: solid;
    transition: border-color 0.12s;
  }
  .cf-submit::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
  .cf-submit::after  { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

  .cf-submit:hover:not(:disabled) {
    background: rgba(245,166,35,0.08);
    border-color: var(--amber);
  }
  .cf-submit:hover::before,
  .cf-submit:hover::after { border-color: var(--amber); }

  .cf-submit:active:not(:disabled) { background: rgba(245,166,35,0.12); }

  .cf-submit:disabled {
    border-color: var(--ink-4);
    color: var(--muted-2);
    cursor: not-allowed;
  }
  .cf-submit:disabled::before,
  .cf-submit:disabled::after { border-color: var(--ink-4); }

  @keyframes cf-spin { to { transform: rotate(360deg); } }
  .cf-spin { animation: cf-spin 0.8s linear infinite; }

  /* ── Footer ── */
  .cf-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9px;
    color: var(--muted-2);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .cf-footer-right {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--amber-dim);
  }
  .cf-footer-right::before {
    content: '◆';
    font-size: 5px;
  }
`

export default function CredentialsForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const { status, error, connectToDB } = useDBConnection()
  const styleRef = useRef(null)

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style")
      el.textContent = CSS
      document.head.appendChild(el)
      styleRef.current = el
    }
    return () => { if (styleRef.current) { styleRef.current.remove(); styleRef.current = null } }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("saved_credentials")
    if (saved) {
      try { setForm(prev => ({ ...prev, ...JSON.parse(saved) })) } catch {}
    }
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e?.preventDefault()
    if (isDisabled) return
    connectToDB({ ...form, port: parseInt(form.port) })
  }

  const isConnecting = status === "connecting"
  const isDisabled = isConnecting || !form.user || !form.database

  return (
    <div className="cf-page">
      <div className="cf-shell">

        {/* Masthead */}
        <div className="cf-masthead">
          <div className="cf-logo">
            <div className="cf-logo-mark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="var(--amber)" strokeWidth="1.8">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <span className="cf-logo-text">DB<em>·</em>Lens</span>
          </div>
          <span className="cf-tagline">Natural language SQL interface</span>
        </div>

        {/* Card */}
        <div className="cf-card">

          {/* DB type toggle */}
          <div className="cf-db-toggle">
            {[
              { value: "mysql",      label: "MySQL",      port: "3306" },
              { value: "postgresql", label: "PostgreSQL", port: "5432" },
            ].map(db => (
              <button
                key={db.value}
                type="button"
                className={`cf-db-btn${form.db_type === db.value ? " active" : ""}`}
                onClick={() => setForm(p => ({ ...p, db_type: db.value, port: db.port }))}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="1.8">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
                {db.label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="cf-fields">
            <div className="cf-row">
              <Field label="Host"     name="host"     value={form.host}     onChange={handleChange} placeholder="localhost" />
              <Field label="Port"     name="port"     value={form.port}     onChange={handleChange} placeholder="3306" />
            </div>
            <Field label="Username"  name="user"     value={form.user}     onChange={handleChange} placeholder="root" />
            <Field label="Password"  name="password" value={form.password} onChange={handleChange} placeholder="••••••••" type="password" />
            <Field label="Database"  name="database" value={form.database} onChange={handleChange} placeholder="my_database" />
          </div>

          {/* Notice */}
          <div className="cf-notice">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Credentials stored locally — never transmitted
          </div>

          {/* Error */}
          {error && (
            <div className="cf-error">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            className="cf-submit"
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            {isConnecting ? (
              <>
                <svg className="cf-spin" width="13" height="13" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Connecting
              </>
            ) : (
              <>
                Connect
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <line x1="5"  y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="cf-footer">
          <span>MySQL · PostgreSQL</span>
          <span className="cf-footer-right">Schema-aware</span>
        </div>

      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="cf-field">
      <label className="cf-label">{label}</label>
      <div className="cf-input-wrap">
        <input
          className="cf-input"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="cf-input-rule" />
      </div>
    </div>
  )
}
