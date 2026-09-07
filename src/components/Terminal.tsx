import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import portfolioData from '../data/portfolio.json'
import './Terminal.css'

type LineKind = 'default' | 'accent' | 'dim' | 'error' | 'success' | 'heading'

type Line = {
  text: string
  kind?: LineKind
  href?: string
}

type Entry = {
  id: number
  input: string | null
  lines: Line[]
}

const COMMANDS = [
  'help',
  'skills',
  'projects',
  'certs',
  'contact',
  'clear',
]

const BOOT_LINES: Line[] = [
  { text: 'booting neural interface...', kind: 'dim' },
  { text: 'mounting /dev/portfolio ......... OK', kind: 'success' },
  { text: 'establishing uplink ............ OK', kind: 'success' },
  { text: `identity confirmed: ${portfolioData.name}`, kind: 'accent' },
]

const WELCOME: Line[] = [
  { text: `${portfolioData.name} // ${portfolioData.title}`, kind: 'heading' },
  { text: '' },
  { text: "Type 'help' to see available commands.", kind: 'default' },
  { text: 'Commands are case insensitive.', kind: 'dim' },
]

function runCommand(raw: string): Line[] | 'CLEAR' {
  const cmd = raw.trim().toLowerCase()

  if (cmd === '') return []

  switch (cmd) {
    case 'help':
      return [
        { text: 'AVAILABLE COMMANDS', kind: 'heading' },
        { text: '' },
        { text: '  help        Show this message' },
        { text: '  skills      My tech stack' },
        { text: "  projects    What I've built" },
        { text: '  certs       Certifications & credentials' },
        { text: '  contact     Get in touch' },
        { text: '  clear       Wipe the terminal' },
        { text: '' },
        { text: 'Hint: ↑/↓ recalls history, Tab autocompletes.', kind: 'dim' },
      ]

    case 'skills': {
      const lines: Line[] = [
        { text: 'TECH STACK', kind: 'heading' },
        { text: '' },
      ]
      portfolioData.skills.forEach((group) => {
        lines.push({ text: `  ${group.category.toUpperCase()}`, kind: 'accent' })
        group.items.forEach((item) => {
          lines.push({ text: `    ▸ ${item}`, kind: 'success' })
        })
        lines.push({ text: '' })
      })
      return lines
    }

    case 'projects': {
      const lines: Line[] = [
        { text: 'PROJECTS', kind: 'heading' },
        { text: '' },
      ]
      portfolioData.projects.forEach((project) => {
        lines.push({ text: `  ${project.name}`, kind: 'accent' })
        lines.push({ text: `  status: ${project.status}`, kind: 'success' })
        lines.push({ text: `  ${project.description}` })
        lines.push({ text: `  [${project.tech.join('] [')}]`, kind: 'dim' })
        lines.push({ text: '' })
      })
      return lines
    }

    case 'certs': {
      const lines: Line[] = [
        { text: 'CERTIFICATIONS', kind: 'heading' },
        { text: '' },
      ]
      portfolioData.certifications.forEach((cert) => {
        lines.push({
          text: `  ${cert.icon || '◆'} ${cert.name}`,
          kind: 'accent',
        })
        lines.push({
          text: `     ${cert.issuer} · ${cert.year} · ${cert.credential}`,
          kind: 'success',
        })
        lines.push({ text: `     ${cert.url}`, kind: 'dim', href: cert.url })
        lines.push({ text: '' })
      })
      return lines
    }

    case 'contact': {
      const lines: Line[] = [
        { text: 'GET IN TOUCH', kind: 'heading' },
        { text: '' },
        {
          text: `  email    ${portfolioData.email}`,
          kind: 'accent',
          href: `mailto:${portfolioData.email}`,
        },
      ]
      portfolioData.social.forEach((link) => {
        lines.push({
          text: `  ${link.name.toLowerCase().padEnd(8)} ${link.url}`,
          kind: 'accent',
          href: link.url,
        })
      })
      return lines
    }

    case 'clear':
      return 'CLEAR'

    default:
      return [
        { text: `command not found: ${cmd}`, kind: 'error' },
        { text: "Type 'help' for the list of commands.", kind: 'dim' },
      ]
  }
}

export function Terminal() {
  const [bootIndex, setBootIndex] = useState(0)
  const [booted, setBooted] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [caret, setCaret] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    BOOT_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setBootIndex(i + 1), 260 * (i + 1)))
    })
    timers.push(
      setTimeout(() => setBooted(true), 260 * (BOOT_LINES.length + 1)),
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (booted) inputRef.current?.focus()
  }, [booted])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [entries, bootIndex, booted])

  // Keeps the block caret glued to the real input's cursor position.
  const syncCaret = () => setCaret(inputRef.current?.selectionStart ?? 0)

  const setLine = (value: string) => {
    setInput(value)
    setCaret(value.length)
    // Move the native cursor to the end too, so the next keystroke lands there.
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(value.length, value.length)
    })
  }

  const submit = (value: string) => {
    const result = runCommand(value)
    setLine('')
    setHistoryIndex(-1)

    if (value.trim() !== '') {
      setHistory((prev) => [...prev, value.trim()])
    }

    if (result === 'CLEAR') {
      setEntries([])
      return
    }

    setEntries((prev) => [
      ...prev,
      { id: nextId.current++, input: value, lines: result },
    ])
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      submit(input)
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      const partial = input.trim().toLowerCase()
      if (!partial) return
      const match = COMMANDS.find((cmd) => cmd.startsWith(partial))
      if (match) setLine(match)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (history.length === 0) return
      const index =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1)
      setHistoryIndex(index)
      setLine(history[index])
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex === -1) return
      const index = historyIndex + 1
      if (index >= history.length) {
        setHistoryIndex(-1)
        setLine('')
      } else {
        setHistoryIndex(index)
        setLine(history[index])
      }
      return
    }

    // Left/Right/Home/End move the native cursor; re-read it after the browser
    // has applied the move so the block caret lands in the same spot.
    requestAnimationFrame(syncCaret)
  }

  const renderLine = (line: Line, key: number) => {
    const className = `term-line term-${line.kind ?? 'default'}`

    if (line.href) {
      return (
        <a
          key={key}
          className={className}
          href={line.href}
          target={line.href.startsWith('mailto:') ? undefined : '_blank'}
          rel="noopener noreferrer"
        >
          {line.text}
        </a>
      )
    }

    return (
      <div key={key} className={className}>
        {line.text || ' '}
      </div>
    )
  }

  return (
    <div className="terminal-window" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-titlebar">
        <span className="terminal-dots">
          <i className="dot dot-red" />
          <i className="dot dot-yellow" />
          <i className="dot dot-green" />
        </span>
        <span className="terminal-title">
          {portfolioData.name.toLowerCase()}@portfolio — bash
        </span>
        <span className="terminal-version">v{new Date().getFullYear()}.01</span>
      </div>

      <div className="terminal-body" ref={bodyRef}>
        {BOOT_LINES.slice(0, bootIndex).map((line, i) => renderLine(line, i))}

        {booted && (
          <>
            <div className="term-divider" />
            {WELCOME.map((line, i) => renderLine(line, i))}

            {entries.map((entry) => (
              <div key={entry.id} className="term-entry">
                <div className="term-echo">
                  <span className="term-prompt">
                    {portfolioData.name.toLowerCase()}@portfolio:~$
                  </span>{' '}
                  <span className="term-echo-cmd">{entry.input}</span>
                </div>
                {entry.lines.map((line, i) => renderLine(line, i))}
              </div>
            ))}

            <div className="term-inputline">
              <label className="term-prompt" htmlFor="terminal-input">
                {portfolioData.name.toLowerCase()}@portfolio:~$
              </label>

              <div className="term-inputwrap">
                {/* Mirror of the typed text, with the block caret spliced in
                    at the cursor offset. */}
                <span className="term-mirror" aria-hidden="true">
                  <span className="term-typed">{input.slice(0, caret)}</span>
                  <span className="term-caret" />
                  <span className="term-typed">{input.slice(caret)}</span>
                </span>

                <input
                  id="terminal-input"
                  ref={inputRef}
                  className="term-input"
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value)
                    setCaret(event.target.selectionStart ?? 0)
                  }}
                  onKeyDown={handleKeyDown}
                  onSelect={syncCaret}
                  onClick={syncCaret}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Terminal command input"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {booted && (
        <div className="terminal-hints">
          <span className="hints-label">try:</span>
          {COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              className="hint-chip"
              onClick={() => submit(cmd)}
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
