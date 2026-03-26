import useChat from "../hooks/useChat"
import QueryInput from "./QueryInput"
import { useState, useRef, useEffect } from "react"

// ─── Inline styles & CSS ────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Syne:wght@400;500;600;700;800&display=swap');

  :root {
    --ink:      #0C0C0D;
    --ink-2:    #1A1A1C;
    --ink-3:    #252527;
    --muted:    #6B6B72;
    --muted-2:  #3A3A3F;
    --amber:    #F5A623;
    --amber-dim:#7A5412;
    --green:    #2DCA72;
    --red:      #E8594A;
    --paper:    #F7F4EF;
    --rule:     rgba(255,255,255,0.06);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cw-root {
    font-family: 'IBM Plex Mono', monospace;
    background: var(--ink);
    color: var(--paper);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  /* Subtle grid overlay */
  .cw-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(var(--rule) 1px, transparent 1px),
      linear-gradient(90deg, var(--rule) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Scrollable area ── */
  .cw-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 1;
    scrollbar-width: thin;
    scrollbar-color: var(--ink-3) transparent;
  }
  .cw-scroll::-webkit-scrollbar { width: 4px; }
  .cw-scroll::-webkit-scrollbar-thumb { background: var(--ink-3); border-radius: 2px; }

  .cw-inner {
    max-width: 860px;
    margin: 0 auto;
    padding: 48px 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ── Empty state ── */
  .cw-empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    min-height: 70vh;
    padding-top: 8vh;
  }

  .cw-empty-eyebrow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--amber);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cw-empty-eyebrow::before {
    content: '';
    display: block;
    width: 24px;
    height: 1px;
    background: var(--amber);
  }

  .cw-empty-headline {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 5vw, 58px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--paper);
    margin-bottom: 20px;
  }

  .cw-empty-sub {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.8;
    max-width: 480px;
    margin-bottom: 40px;
  }

  .cw-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .cw-chip {
    background: var(--ink-2);
    border: 1px solid var(--ink-3);
    color: var(--muted);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    padding: 8px 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.02em;
  }
  .cw-chip:hover {
    border-color: var(--amber);
    color: var(--amber);
    background: rgba(245,166,35,0.06);
  }

  /* ── Message row ── */
  .cw-row {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--rule);
    padding: 28px 0;
    animation: rowIn 0.3s ease both;
  }
  @keyframes rowIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── User turn ── */
  .cw-user-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
  }
  .cw-user-label span.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--amber);
    flex-shrink: 0;
  }

  .cw-user-text {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--paper);
    line-height: 1.4;
    letter-spacing: -0.01em;
    padding-left: 16px;
    border-left: 2px solid var(--amber);
  }

  /* ── Assistant turn ── */
  .cw-ai-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
  }
  .cw-ai-label span.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    flex-shrink: 0;
  }

  .cw-ai-text {
    font-size: 13px;
    color: #BEBEC8;
    line-height: 1.8;
    letter-spacing: 0.01em;
    padding-left: 16px;
    border-left: 2px solid var(--ink-3);
    margin-bottom: 0;
  }

  /* ── SQL block ── */
  .cw-sql-wrap {
    margin-top: 20px;
    border: 1px solid var(--ink-3);
    border-radius: 2px;
    overflow: hidden;
  }

  .cw-sql-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--ink-2);
    border-bottom: 1px solid var(--ink-3);
  }

  .cw-sql-badge {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--amber);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cw-sql-badge::before {
    content: '◆';
    font-size: 6px;
  }

  .cw-copy-btn {
    background: none;
    border: 1px solid var(--ink-3);
    color: var(--muted);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.12s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .cw-copy-btn:hover {
    border-color: var(--amber);
    color: var(--amber);
  }

  .cw-sql-pre {
    padding: 16px;
    font-size: 12px;
    color: #E8D5A3;
    background: #080808;
    overflow-x: auto;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* ── Results table ── */
  .cw-table-wrap {
    margin-top: 20px;
    border: 1px solid var(--ink-3);
    border-radius: 2px;
    overflow: hidden;
  }

  .cw-table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--ink-2);
    border-bottom: 1px solid var(--ink-3);
  }

  .cw-table-badge {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--green);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cw-table-badge::before {
    content: '◆';
    font-size: 6px;
  }

  .cw-table-meta {
    font-size: 10px;
    color: var(--muted-2);
    margin-left: 12px;
  }

  .cw-table-scroll {
    overflow-x: auto;
    max-height: 380px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--ink-3) transparent;
  }

  table.cw-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    background: #080808;
  }

  table.cw-table thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  table.cw-table th {
    background: var(--ink-2);
    color: var(--muted);
    font-weight: 500;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 10px 16px;
    text-align: left;
    border-bottom: 1px solid var(--ink-3);
    white-space: nowrap;
  }

  table.cw-table td {
    padding: 9px 16px;
    color: #BEBEC8;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    cursor: pointer;
    transition: background 0.1s ease;
    font-variant-numeric: tabular-nums;
  }

  table.cw-table tr:hover td {
    background: rgba(245,166,35,0.03);
    color: var(--paper);
  }

  table.cw-table tr:last-child td {
    border-bottom: none;
  }

  .cw-null {
    color: var(--muted-2) !important;
    font-style: italic;
    font-size: 10px;
  }

  /* Row count footer */
  .cw-table-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--ink-2);
    border-top: 1px solid var(--ink-3);
  }

  .cw-table-footer-text {
    font-size: 9px;
    color: var(--muted-2);
    letter-spacing: 0.1em;
  }

  /* ── Empty results ── */
  .cw-empty-result {
    margin-top: 20px;
    padding: 14px 16px;
    background: var(--ink-2);
    border: 1px solid var(--ink-3);
    border-radius: 2px;
    font-size: 11px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── Loading ── */
  .cw-loading {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 28px 0;
    animation: rowIn 0.2s ease both;
  }

  .cw-loading-text {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.06em;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cw-dots {
    display: flex;
    gap: 4px;
  }
  .cw-dots span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--amber);
    animation: dotPulse 1.2s ease-in-out infinite;
    opacity: 0.3;
  }
  .cw-dots span:nth-child(1) { animation-delay: 0ms; }
  .cw-dots span:nth-child(2) { animation-delay: 200ms; }
  .cw-dots span:nth-child(3) { animation-delay: 400ms; }

  @keyframes dotPulse {
    0%, 80%, 100% { opacity: 0.2; transform: scale(1); }
    40%           { opacity: 1;   transform: scale(1.3); }
  }

  /* ── Error ── */
  .cw-error {
    padding: 12px 16px;
    background: rgba(232,89,74,0.07);
    border: 1px solid rgba(232,89,74,0.25);
    border-radius: 2px;
    font-size: 11px;
    color: var(--red);
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 16px 0;
  }
  .cw-error-icon { flex-shrink: 0; margin-top: 1px; }

  /* ── Input area ── */
  .cw-input-area {
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    border-top: 1px solid var(--rule);
    padding: 20px 32px 24px;
    background: linear-gradient(to top, var(--ink) 60%, transparent);
  }
  .cw-input-inner {
    max-width: 860px;
    margin: 0 auto;
  }

  /* ── Status bar at top ── */
  .cw-statusbar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 32px;
    border-bottom: 1px solid var(--rule);
    background: var(--ink);
  }

  .cw-statusbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .cw-logo {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--paper);
  }
  .cw-logo em {
    color: var(--amber);
    font-style: normal;
  }

  .cw-status-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--green);
    background: rgba(45,202,114,0.07);
    border: 1px solid rgba(45,202,114,0.15);
    padding: 3px 8px;
    border-radius: 2px;
  }
  .cw-status-pill::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--green);
    animation: statusBlink 2s ease-in-out infinite;
  }
  @keyframes statusBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .cw-statusbar-right {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted-2);
  }
`

// ─── Component ──────────────────────────────────────────────────────────────
export default function ChatWindow() {
  const { state, sendMessage, bottomRef } = useChat()
  const [expandedRows, setExpandedRows] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const styleRef = useRef(null)

  // Inject global CSS once
  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style")
      el.textContent = GLOBAL_CSS
      document.head.appendChild(el)
      styleRef.current = el
    }
    return () => { if (styleRef.current) { styleRef.current.remove(); styleRef.current = null } }
  }, [])

  const toggleRow = (msgId, rowIndex) =>
    setExpandedRows(prev => ({ ...prev, [`${msgId}-${rowIndex}`]: !prev[`${msgId}-${rowIndex}`] }))

  const copySQL = (id, sql) => {
    navigator.clipboard.writeText(sql)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1600)
  }

  const exportCSV = (results) => {
    const csv = [
      results.columns.join(","),
      ...results.rows.map(row =>
        results.columns.map(col => JSON.stringify(row[col] ?? "")).join(",")
      )
    ].join("\n")
    navigator.clipboard.writeText(csv)
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()

  return (
    <div className="cw-root">
      {/* ── Scroll area ── */}
      <div className="cw-scroll">
        <div className="cw-inner">

          {/* ── Empty state ── */}
          {state.messages.length === 0 && !state.isLoading && (
            <div className="cw-empty">
              <div className="cw-empty-eyebrow">Natural language queries</div>
              <h1 className="cw-empty-headline">
                Ask your<br />database anything.
              </h1>
              <p className="cw-empty-sub">
                Type a plain-English question and get back generated SQL,<br />
                executed results, and an explanation — instantly.
              </p>
              <div className="cw-chips">
                {[
                  "Show all users",
                  "Top 5 products by revenue",
                  "Orders from last month",
                  "Database size",
                  "List tables",
                ].map(action => (
                  <button key={action} className="cw-chip" onClick={() => sendMessage(action)}>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          {state.messages.map((msg) => (
            <div key={msg.id} className="cw-row">

              {/* User */}
              {msg.role === "user" && (
                <>
                  <div className="cw-user-label">
                    <span className="dot" />
                    You
                  </div>
                  <p className="cw-user-text">{msg.content}</p>
                </>
              )}

              {/* Assistant */}
              {msg.role === "assistant" && (
                <>
                  <div className="cw-ai-label">
                    <span className="dot" />
                    Assistant
                  </div>

                  {msg.content && (
                    <p className="cw-ai-text">{msg.content}</p>
                  )}

                  {/* SQL */}
                  {msg.sql && (
                    <div className="cw-sql-wrap">
                      <div className="cw-sql-header">
                        <span className="cw-sql-badge">SQL Query</span>
                        <button
                          className="cw-copy-btn"
                          onClick={() => copySQL(msg.id, msg.sql)}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="1" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="cw-sql-pre">{msg.sql}</pre>
                    </div>
                  )}

                  {/* Results — has rows */}
                  {msg.results && msg.results.rows?.length > 0 && (
                    <div className="cw-table-wrap">
                      <div className="cw-table-header">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span className="cw-table-badge">Results</span>
                          <span className="cw-table-meta">
                            {msg.results.rows.length} {msg.results.rows.length === 1 ? "row" : "rows"}
                            {" · "}{msg.results.columns.length} cols
                          </span>
                        </div>
                        <button
                          className="cw-copy-btn"
                          onClick={() => exportCSV(msg.results)}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Export CSV
                        </button>
                      </div>

                      <div className="cw-table-scroll">
                        <table className="cw-table">
                          <thead>
                            <tr>
                              {msg.results.columns.map(col => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.results.rows.map((row, i) => {
                              const isExpanded = expandedRows[`${msg.id}-${i}`]
                              return (
                                <tr key={i} onClick={() => toggleRow(msg.id, i)}>
                                  {msg.results.columns.map(col => {
                                    const value = row[col]
                                    const isNull = value === null
                                    const isLong = typeof value === "string" && value.length > 50
                                    return (
                                      <td key={col}>
                                        {isNull ? (
                                          <span className="cw-null">null</span>
                                        ) : isLong && !isExpanded ? (
                                          <span style={{ color: "inherit" }}>
                                            {String(value).slice(0, 32)}
                                            <span style={{ color: "var(--muted-2)" }}>…</span>
                                          </span>
                                        ) : (
                                          <span style={{ wordBreak: "break-all" }}>{String(value)}</span>
                                        )}
                                      </td>
                                    )
                                  })}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="cw-table-footer">
                        <span className="cw-table-footer-text">
                          {msg.results.rows.length} rows returned
                        </span>
                        <span className="cw-table-footer-text">
                          Click row to expand long values
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Results — empty */}
                  {msg.results && msg.results.rows?.length === 0 && (
                    <div className="cw-empty-result">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Query executed — 0 rows returned
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* ── Loading ── */}
          {state.isLoading && (
            <div className="cw-loading">
              <span className="cw-loading-text">
                Generating
                <span className="cw-dots">
                  <span /><span /><span />
                </span>
              </span>
            </div>
          )}

          {/* ── Error ── */}
          {state.error && (
            <div className="cw-error">
              <svg className="cw-error-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {state.error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="cw-input-area">
        <div className="cw-input-inner">
          <QueryInput onSend={sendMessage} isLoading={state.isLoading} />
        </div>
      </div>
    </div>
  )
}
