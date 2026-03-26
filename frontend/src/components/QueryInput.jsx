import { useState, useRef, useEffect } from "react"

const CSS = `
  .qi-wrap {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    position: relative;
  }

  /* ── Textarea shell ── */
  .qi-field {
    flex: 1;
    position: relative;
    display: flex;
    align-items: stretch;
  }

  /* Left amber rule — appears on focus */
  .qi-field::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--amber, #F5A623);
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 1;
  }
  .qi-field.focused::before { opacity: 1; }

  .qi-textarea {
    width: 100%;
    background: #080808;
    border: 1px solid #1E1E21;
    border-left: none;
    color: #F7F4EF;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    line-height: 1.7;
    letter-spacing: 0.02em;
    padding: 12px 52px 12px 14px;
    resize: none;
    outline: none;
    min-height: 48px;
    max-height: 140px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #28282C transparent;
    transition: border-color 0.15s, background 0.15s;
    display: block;
  }
  .qi-textarea::placeholder {
    color: #3A3A3F;
    font-style: italic;
  }
  .qi-textarea:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .qi-field.focused .qi-textarea {
    border-color: #3A3A3F;
    background: #0A0A0B;
  }

  /* Char count */
  .qi-charcount {
    position: absolute;
    right: 10px;
    bottom: 10px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: #3A3A3F;
    letter-spacing: 0.06em;
    pointer-events: none;
    transition: color 0.12s;
  }
  .qi-field.focused .qi-charcount { color: #6B6B72; }

  /* ── Send button ── */
  .qi-send {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: none;
    border: 1px solid #1E1E21;
    color: #3A3A3F;
    cursor: not-allowed;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
    position: relative;
    overflow: hidden;
  }

  .qi-send.active {
    border-color: #7A5412;
    color: #F5A623;
    cursor: pointer;
    background: rgba(245,166,35,0.05);
  }
  .qi-send.active:hover {
    border-color: #F5A623;
    background: rgba(245,166,35,0.1);
    color: #F7F4EF;
  }
  .qi-send.active:active {
    background: rgba(245,166,35,0.15);
    transform: scale(0.96);
  }

  /* Corner marks on active button */
  .qi-send.active::before,
  .qi-send.active::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-color: #F5A623;
    border-style: solid;
    opacity: 0.4;
  }
  .qi-send.active::before {
    top: 3px; left: 3px;
    border-width: 1px 0 0 1px;
  }
  .qi-send.active::after {
    bottom: 3px; right: 3px;
    border-width: 0 1px 1px 0;
  }

  /* Spin animation for loading */
  @keyframes qi-spin {
    to { transform: rotate(360deg); }
  }
  .qi-spinner { animation: qi-spin 0.8s linear infinite; }

  /* ── Hint line below ── */
  .qi-hint {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
    padding-left: 2px;
  }
  .qi-hint-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: #28282C;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: color 0.12s;
  }
  .qi-hint-item kbd {
    font-family: inherit;
    font-size: 8px;
    background: #1E1E21;
    border: 1px solid #28282C;
    color: #3A3A3F;
    padding: 1px 5px;
    letter-spacing: 0.06em;
  }
  .qi-wrap:focus-within .qi-hint-item { color: #3A3A3F; }
  .qi-wrap:focus-within .qi-hint-item kbd { color: #6B6B72; border-color: #3A3A3F; }
`

export default function QueryInput({ onSend, isLoading }) {
  const [input, setInput] = useState("")
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)
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
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px"
  }, [input])

  function handleSubmit() {
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "48px"
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = input.trim() !== "" && !isLoading

  return (
    <div>
      <div className="qi-wrap">
        {/* Textarea */}
        <div className={`qi-field${focused ? " focused" : ""}`}>
          <textarea
            ref={textareaRef}
            className="qi-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={isLoading}
            placeholder="Ask anything about your database…"
            rows={1}
          />
          {input.length > 0 && (
            <span className="qi-charcount">{input.length}</span>
          )}
        </div>

        {/* Send button */}
        <button
          className={`qi-send${canSend ? " active" : ""}`}
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send query"
        >
          {isLoading ? (
            <svg className="qi-spinner" width="14" height="14" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="qi-hint">
        <span className="qi-hint-item">
          <kbd>↵ Enter</kbd> send
        </span>
        <span className="qi-hint-item">
          <kbd>⇧ Shift ↵</kbd> new line
        </span>
      </div>
    </div>
  )
}
