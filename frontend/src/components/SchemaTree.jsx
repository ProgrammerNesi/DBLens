import { useSchema } from '../hooks/useSchema'
import { useState, useEffect, useRef } from 'react'

// ─── Inline styles ────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Syne:wght@700;800&display=swap');

  .st-root {
    --ink:      #0C0C0D;
    --ink-2:    #141416;
    --ink-3:    #1E1E21;
    --ink-4:    #28282C;
    --muted:    #6B6B72;
    --muted-2:  #3A3A3F;
    --amber:    #F5A623;
    --amber-dim:#7A5412;
    --green:    #2DCA72;
    --paper:    #F7F4EF;
    --rule:     rgba(255,255,255,0.05);

    font-family: 'IBM Plex Mono', monospace;
    background: var(--ink-2);
    color: var(--paper);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid var(--rule);
  }

  /* ── Header ── */
  .st-header {
    padding: 20px 16px 14px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--rule);
  }

  .st-eyebrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .st-title {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .st-title::before {
    content: '';
    display: block;
    width: 12px;
    height: 1px;
    background: var(--amber);
    flex-shrink: 0;
  }

  .st-count-badge {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.08em;
    color: var(--amber-dim);
    background: rgba(245,166,35,0.07);
    border: 1px solid rgba(245,166,35,0.15);
    padding: 2px 7px;
    border-radius: 2px;
  }

  /* ── Search ── */
  .st-search-wrap {
    position: relative;
  }
  .st-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted-2);
    pointer-events: none;
    transition: color 0.15s;
  }
  .st-search-wrap:focus-within .st-search-icon {
    color: var(--amber);
  }
  .st-search {
    width: 100%;
    background: var(--ink);
    border: 1px solid var(--ink-4);
    color: var(--paper);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    padding: 8px 10px 8px 30px;
    border-radius: 2px;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
    letter-spacing: 0.02em;
  }
  .st-search::placeholder { color: var(--muted-2); }
  .st-search:focus {
    border-color: var(--amber-dim);
    background: #0A0A0B;
  }

  /* ── Scroll list ── */
  .st-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 0;
    scrollbar-width: thin;
    scrollbar-color: var(--ink-4) transparent;
  }
  .st-list::-webkit-scrollbar { width: 3px; }
  .st-list::-webkit-scrollbar-thumb { background: var(--ink-4); }

  /* ── Table row ── */
  .st-table-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    border-left: 2px solid transparent;
    transition: background 0.12s, border-color 0.12s;
    animation: fadeUp 0.2s ease both;
  }
  .st-table-btn:hover {
    background: rgba(245,166,35,0.04);
    border-left-color: var(--amber-dim);
  }
  .st-table-btn.open {
    border-left-color: var(--amber);
    background: rgba(245,166,35,0.05);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .st-chevron {
    color: var(--muted-2);
    flex-shrink: 0;
    transition: transform 0.18s ease, color 0.12s;
  }
  .st-table-btn:hover .st-chevron,
  .st-table-btn.open .st-chevron { color: var(--amber); }
  .st-table-btn.open .st-chevron { transform: rotate(90deg); }

  .st-table-icon {
    color: var(--muted-2);
    flex-shrink: 0;
    transition: color 0.12s;
  }
  .st-table-btn:hover .st-table-icon,
  .st-table-btn.open .st-table-icon { color: var(--amber); }

  .st-table-name {
    font-size: 11px;
    color: var(--muted);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.12s;
    letter-spacing: 0.02em;
  }
  .st-table-btn:hover .st-table-name,
  .st-table-btn.open .st-table-name { color: var(--paper); }

  .st-col-count {
    font-size: 9px;
    color: var(--muted-2);
    flex-shrink: 0;
    min-width: 16px;
    text-align: right;
    transition: color 0.12s;
  }
  .st-table-btn:hover .st-col-count,
  .st-table-btn.open .st-col-count { color: var(--amber-dim); }

  /* ── Columns panel ── */
  .st-columns {
    border-left: 1px solid var(--ink-4);
    margin: 2px 16px 6px 28px;
    overflow: hidden;
    animation: expandDown 0.18s ease;
  }
  @keyframes expandDown {
    from { opacity: 0; max-height: 0; }
    to   { opacity: 1; max-height: 600px; }
  }

  .st-col-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    transition: background 0.1s;
    border-radius: 0 2px 2px 0;
    cursor: default;
  }
  .st-col-row:hover { background: rgba(255,255,255,0.03); }

  .st-pk-badge {
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--amber);
    background: rgba(245,166,35,0.1);
    border: 1px solid rgba(245,166,35,0.25);
    padding: 1px 5px;
    border-radius: 2px;
    flex-shrink: 0;
    text-transform: uppercase;
  }

  .st-col-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--ink-4);
    flex-shrink: 0;
    margin-left: 2px;
  }

  .st-col-name {
    font-size: 10px;
    color: var(--muted);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.1s;
    letter-spacing: 0.01em;
  }
  .st-col-row:hover .st-col-name { color: #BEBEC8; }

  .st-col-type {
    font-size: 9px;
    color: var(--muted-2);
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: color 0.1s;
  }
  .st-col-row:hover .st-col-type { color: var(--muted); }

  /* ── Empty ── */
  .st-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    gap: 10px;
  }
  .st-empty-text {
    font-size: 10px;
    color: var(--muted-2);
    letter-spacing: 0.06em;
    text-align: center;
  }

  /* ── Footer ── */
  .st-footer {
    flex-shrink: 0;
    border-top: 1px solid var(--rule);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .st-footer-stat {
    font-size: 9px;
    color: var(--muted-2);
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .st-footer-stat b {
    color: var(--muted);
    font-weight: 500;
  }

  .st-footer-divider {
    width: 1px;
    height: 10px;
    background: var(--ink-4);
  }
`

export default function SchemaTree() {
  const { filteredTables, searchTerm, setSearchTerm } = useSchema()
  const [openTables, setOpenTables] = useState(new Set())
  const styleRef = useRef(null)

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement('style')
      el.textContent = CSS
      document.head.appendChild(el)
      styleRef.current = el
    }
    return () => { if (styleRef.current) { styleRef.current.remove(); styleRef.current = null } }
  }, [])

  function toggleTable(name) {
    setOpenTables(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const totalCols = filteredTables.reduce((acc, t) => acc + t.columns.length, 0)

  return (
    <div className="st-root">

      {/* ── Header ── */}
      <div className="st-header">
        <div className="st-eyebrow">
          <span className="st-title">Schema</span>
          <span className="st-count-badge">{filteredTables.length} tables</span>
        </div>

        <div className="st-search-wrap">
          <svg className="st-search-icon" width="11" height="11" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="st-search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="filter tables…"
            spellCheck={false}
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="st-list">

        {filteredTables.length === 0 && (
          <div className="st-empty">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="var(--muted-2)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
            <span className="st-empty-text">no tables match</span>
          </div>
        )}

        {filteredTables.map(table => (
          <div key={table.name}>
            <button
              className={`st-table-btn${openTables.has(table.name) ? ' open' : ''}`}
              onClick={() => toggleTable(table.name)}
            >
              {/* Chevron */}
              <svg className="st-chevron" width="9" height="9" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>

              {/* Table icon */}
              <svg className="st-table-icon" width="12" height="12" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="1"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>

              <span className="st-table-name">{table.name}</span>
              <span className="st-col-count">{table.columns.length}</span>
            </button>

            {openTables.has(table.name) && (
              <div className="st-columns">
                {table.columns.map(col => (
                  <div key={col.name} className="st-col-row">
                    {col.key === 'PRI'
                      ? <span className="st-pk-badge">PK</span>
                      : <span className="st-col-dot" />
                    }
                    <span className="st-col-name">{col.name}</span>
                    <span className="st-col-type">{col.type.split('(')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="st-footer">
        <span className="st-footer-stat">
          <b>{filteredTables.length}</b> tables
        </span>
        <span className="st-footer-divider" />
        <span className="st-footer-stat">
          <b>{totalCols}</b> columns
        </span>
      </div>
    </div>
  )
}
