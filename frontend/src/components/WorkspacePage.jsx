import { useState, useContext } from "react"
import { DBContext } from "../context/DBContext"
import SchemaTree from "./SchemaTree"
import ChatWindow from "./ChatWindow"

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    height: 100%;
    overflow: hidden;
    background: #0C0C0D;
  }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #28282C; }
  ::-webkit-scrollbar-corner { background: transparent; }

  /* ── Workspace shell ── */
  .ws-root {
    --ink:      #0C0C0D;
    --ink-2:    #141416;
    --ink-3:    #1E1E21;
    --ink-4:    #28282C;
    --muted:    #6B6B72;
    --muted-2:  #3A3A3F;
    --amber:    #F5A623;
    --amber-dim:#7A5412;
    --green:    #2DCA72;
    --red:      #E8594A;
    --paper:    #F7F4EF;
    --rule:     rgba(255,255,255,0.05);
    --header-h: 48px;

    font-family: 'IBM Plex Mono', monospace;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: var(--ink);
    color: var(--paper);
  }

  /* ── Header ── */
  .ws-header {
    height: var(--header-h);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: var(--ink-2);
    border-bottom: 1px solid var(--rule);
    z-index: 40;
    position: relative;
  }

  .ws-header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  /* Logo */
  .ws-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .ws-logo-mark {
    width: 28px;
    height: 28px;
    border: 1px solid var(--amber-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  .ws-logo-mark::before {
    content: '';
    position: absolute;
    inset: 2px;
    background: rgba(245,166,35,0.06);
  }

  .ws-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--paper);
  }
  .ws-logo-text em {
    color: var(--amber);
    font-style: normal;
  }

  /* Header divider */
  .ws-header-rule {
    width: 1px;
    height: 16px;
    background: var(--ink-4);
  }

  /* Connection pill */
  .ws-conn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border: 1px solid rgba(45,202,114,0.15);
    background: rgba(45,202,114,0.05);
  }

  .ws-conn-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--green);
    flex-shrink: 0;
    animation: connPulse 2.4s ease-in-out infinite;
  }
  @keyframes connPulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(45,202,114,0.4); }
    50%       { opacity: 0.7; box-shadow: 0 0 0 4px rgba(45,202,114,0); }
  }

  .ws-conn-text {
    font-size: 10px;
    letter-spacing: 0.04em;
    color: var(--muted);
    white-space: nowrap;
  }
  .ws-conn-text b  { color: var(--paper); font-weight: 500; }
  .ws-conn-text em { color: var(--muted-2); font-style: normal; margin: 0 4px; }

  /* Mobile menu button */
  .ws-menu-btn {
    display: none;
    background: none;
    border: 1px solid var(--ink-4);
    color: var(--muted);
    padding: 5px 7px;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s;
  }
  .ws-menu-btn:hover { border-color: var(--amber-dim); color: var(--amber); }

  @media (max-width: 1023px) {
    .ws-menu-btn { display: flex; align-items: center; justify-content: center; }
    .ws-conn      { display: none; }
  }

  /* Disconnect */
  .ws-disconnect {
    display: flex;
    align-items: center;
    gap: 7px;
    background: none;
    border: 1px solid var(--ink-4);
    color: var(--muted);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 12px;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
  }
  .ws-disconnect:hover {
    border-color: rgba(232,89,74,0.4);
    color: var(--red);
    background: rgba(232,89,74,0.05);
  }
  .ws-disconnect svg { transition: transform 0.15s ease; }
  .ws-disconnect:hover svg { transform: translateX(2px); }

  @media (max-width: 640px) {
    .ws-disconnect-label { display: none; }
  }

  /* ── Body ── */
  .ws-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* Mobile overlay */
  .ws-overlay {
    display: none;
    position: fixed;
    inset: 0;
    top: var(--header-h);
    background: rgba(0,0,0,0.75);
    z-index: 20;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @media (max-width: 1023px) {
    .ws-overlay.visible { display: block; }
  }

  /* ── Sidebar ── */
  .ws-sidebar {
    position: fixed;
    top: var(--header-h);
    left: 0;
    z-index: 30;
    width: 260px;
    height: calc(100vh - var(--header-h));
    display: flex;
    flex-direction: column;
    background: var(--ink-2);
    border-right: 1px solid var(--rule);
    transform: translateX(-100%);
    transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  @media (min-width: 1024px) {
    .ws-sidebar {
      position: relative;
      top: 0;
      height: 100%;
      transform: translateX(0) !important;
      flex-shrink: 0;
    }
  }

  .ws-sidebar.open { transform: translateX(0); }

  /* ── Main ── */
  .ws-main {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--ink);
  }

  /* ── Breadcrumb ticker at bottom of header (optional decoration) ── */
  .ws-header-ticker {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      var(--amber-dim) 30%,
      var(--amber) 50%,
      var(--amber-dim) 70%,
      transparent 100%
    );
    opacity: 0.4;
  }
`

export default function WorkspacePage() {
  const { connection, setConnection, setSchema } = useContext(DBContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleDisconnect() {
    setConnection(null)
    setSchema(null)
  }

  return (
    <>
      <style>{CSS}</style>

      <div className="ws-root">

        {/* ── Header ── */}
        <header className="ws-header">

          <div className="ws-header-left">
            {/* Mobile menu toggle */}
            <button
              className="ws-menu-btn"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle schema sidebar"
            >
              {sidebarOpen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6"  x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>

            {/* Logo */}
            <div className="ws-logo">
              <div className="ws-logo-mark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                     stroke="var(--amber)" strokeWidth="1.8">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
              </div>
              <span className="ws-logo-text">DB<em>·</em>Lens</span>
            </div>

            <div className="ws-header-rule" />

            {/* Connection status */}
            {connection && (
              <div className="ws-conn">
                <span className="ws-conn-dot" />
                <span className="ws-conn-text">
                  <b>{connection?.database}</b>
                  <em>@</em>
                  {connection?.host}
                </span>
              </div>
            )}
          </div>

          {/* Disconnect */}
          <button className="ws-disconnect" onClick={handleDisconnect}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="ws-disconnect-label">Disconnect</span>
          </button>

          {/* Amber underline accent */}
          <div className="ws-header-ticker" />
        </header>

        {/* ── Body ── */}
        <div className="ws-body">

          {/* Mobile overlay */}
          <div
            className={`ws-overlay${sidebarOpen ? " visible" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside className={`ws-sidebar${sidebarOpen ? " open" : ""}`}>
            <SchemaTree />
          </aside>

          {/* Chat */}
          <main className="ws-main">
            <ChatWindow />
          </main>

        </div>
      </div>
    </>
  )
}
