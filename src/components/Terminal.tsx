import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import portfolioData from "../data/portfolio.json";
import { UI, type Lang } from "../i18n";
import "./Terminal.css";

type LineKind = "default" | "accent" | "dim" | "error" | "success" | "heading";

type Line = {
  text: string;
  kind?: LineKind;
  href?: string;
};

type Entry = {
  id: number;
  input: string | null;
  lines: Line[];
};

const COMMANDS = ["help", "skills", "projects", "certs", "contact", "clear"] as const;

type Strings = (typeof UI)[Lang]["term"];

const BOOT_COUNT = 4;

const bootLines = (t: Strings): Line[] => [
  { text: t.boot[0], kind: "dim" },
  { text: t.boot[1], kind: "success" },
  { text: t.boot[2], kind: "success" },
  { text: `${t.boot[3]} ${portfolioData.nickname}`, kind: "accent" },
];

const welcome = (t: Strings, lang: Lang): Line[] => [
  {
    text: `${portfolioData.nickname} // ${portfolioData.title[lang]}`,
    kind: "heading",
  },
  { text: "" },
  { text: t.welcome[0], kind: "default" },
  { text: t.welcome[1], kind: "dim" },
];

function runCommand(raw: string, lang: Lang): Line[] | "CLEAR" {
  const cmd = raw.trim().toLowerCase();
  const t = UI[lang].term;

  if (cmd === "") return [];

  switch (cmd) {
    case "help":
      return [
        { text: t.helpTitle, kind: "heading" },
        { text: "" },
        ...COMMANDS.map((name) => ({
          text: `  ${name.padEnd(12)}${t.help[name]}`,
        })),
        { text: "" },
        { text: t.hint, kind: "dim" },
      ];

    case "skills": {
      const lines: Line[] = [
        { text: t.skillsTitle, kind: "heading" },
        { text: "" },
      ];
      portfolioData.skills.forEach((group) => {
        lines.push({
          text: `  ${group.category[lang].toUpperCase()}`,
          kind: "accent",
        });
        group.items.forEach((item) => {
          lines.push({ text: `    ▸ ${item}`, kind: "success" });
        });
        lines.push({ text: "" });
      });
      return lines;
    }

    case "projects": {
      const lines: Line[] = [
        { text: t.projectsTitle, kind: "heading" },
        { text: "" },
      ];
      portfolioData.projects.forEach((project) => {
        lines.push({ text: `  ${project.name[lang]}`, kind: "accent" });
        lines.push({ text: `  status: ${project.status[lang]}`, kind: "success" });
        lines.push({ text: `  ${project.description[lang]}` });
        lines.push({ text: `  [${project.tech.join("] [")}]`, kind: "dim" });
        lines.push({ text: "" });
      });
      return lines;
    }

    case "certs": {
      const lines: Line[] = [
        { text: t.certsTitle, kind: "heading" },
        { text: "" },
      ];
      portfolioData.certifications.forEach((cert) => {
        lines.push({
          text: `  ${cert.icon || "◆"} ${cert.name}`,
          kind: "accent",
        });
        lines.push({
          text: `     ${cert.issuer} · ${cert.year} · ${cert.credential[lang]}`,
          kind: "success",
        });
        lines.push({ text: `     ${cert.url}`, kind: "dim", href: cert.url });
        lines.push({ text: "" });
      });
      return lines;
    }

    case "contact": {
      const lines: Line[] = [
        { text: t.contactTitle, kind: "heading" },
        { text: "" },
        {
          text: `  email    ${portfolioData.email}`,
          kind: "accent",
          href: `mailto:${portfolioData.email}`,
        },
      ];
      portfolioData.social.forEach((link) => {
        lines.push({
          text: `  ${link.name.toLowerCase().padEnd(8)} ${link.url}`,
          kind: "accent",
          href: link.url,
        });
      });
      return lines;
    }

    case "clear":
      return "CLEAR";

    default:
      return [
        { text: `${t.notFound} ${cmd}`, kind: "error" },
        { text: t.tryHelp, kind: "dim" },
      ];
  }
}

export function Terminal({ lang }: { lang: Lang }) {
  const t = UI[lang].term;
  const BOOT_LINES = bootLines(t);
  const [bootIndex, setBootIndex] = useState(0);
  const [booted, setBooted] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [caret, setCaret] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 1; i <= BOOT_COUNT; i++) {
      timers.push(setTimeout(() => setBootIndex(i), 260 * i));
    }
    timers.push(setTimeout(() => setBooted(true), 260 * (BOOT_COUNT + 1)));

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries, bootIndex, booted]);

  // Keeps the block caret glued to the real input's cursor position.
  const syncCaret = () => setCaret(inputRef.current?.selectionStart ?? 0);

  const setLine = (value: string) => {
    setInput(value);
    setCaret(value.length);
    // Move the native cursor to the end too, so the next keystroke lands there.
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(value.length, value.length);
    });
  };

  const submit = (value: string) => {
    const result = runCommand(value, lang);
    setLine("");
    setHistoryIndex(-1);

    if (value.trim() !== "") {
      setHistory((prev) => [...prev, value.trim()]);
    }

    if (result === "CLEAR") {
      setEntries([]);
      return;
    }

    setEntries((prev) => [
      ...prev,
      { id: nextId.current++, input: value, lines: result },
    ]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      submit(input);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const partial = input.trim().toLowerCase();
      if (!partial) return;
      const match = COMMANDS.find((cmd) => cmd.startsWith(partial));
      if (match) setLine(match);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const index =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setLine(history[index]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === -1) return;
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(-1);
        setLine("");
      } else {
        setHistoryIndex(index);
        setLine(history[index]);
      }
      return;
    }

    // Left/Right/Home/End move the native cursor; re-read it after the browser
    // has applied the move so the block caret lands in the same spot.
    requestAnimationFrame(syncCaret);
  };

  const renderLine = (line: Line, key: number) => {
    const className = `term-line term-${line.kind ?? "default"}`;

    if (line.href) {
      return (
        <a
          key={key}
          className={className}
          href={line.href}
          target={line.href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
        >
          {line.text}
        </a>
      );
    }

    return (
      <div key={key} className={className}>
        {line.text || " "}
      </div>
    );
  };

  return (
    <div className="terminal-window" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-titlebar">
        <span className="terminal-dots">
          <i className="dot dot-red" />
          <i className="dot dot-yellow" />
          <i className="dot dot-green" />
        </span>
        <span className="terminal-title">
          {portfolioData.nickname.toLowerCase()}@portfolio — bash
        </span>
        <span className="terminal-version">v{new Date().getFullYear()}.01</span>
      </div>

      <div className="terminal-body" ref={bodyRef}>
        {BOOT_LINES.slice(0, bootIndex).map((line, i) => renderLine(line, i))}

        {booted && (
          <>
            <div className="term-divider" />
            {welcome(t, lang).map((line, i) => renderLine(line, i))}

            {entries.map((entry) => (
              <div key={entry.id} className="term-entry">
                <div className="term-echo">
                  <span className="term-prompt">
                    {portfolioData.nickname.toLowerCase()}@portfolio:~$
                  </span>{" "}
                  <span className="term-echo-cmd">{entry.input}</span>
                </div>
                {entry.lines.map((line, i) => renderLine(line, i))}
              </div>
            ))}

            <div className="term-inputline">
              <label className="term-prompt" htmlFor="terminal-input">
                {portfolioData.nickname.toLowerCase()}@portfolio:~$
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
                    setInput(event.target.value);
                    setCaret(event.target.selectionStart ?? 0);
                  }}
                  onKeyDown={handleKeyDown}
                  onSelect={syncCaret}
                  onClick={syncCaret}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={t.inputLabel}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {booted && (
        <div className="terminal-hints">
          <span className="hints-label">{t.tryLabel}</span>
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
  );
}
