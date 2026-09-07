import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import './ResumeSection.css'

// This portfolio's own repo. Public GitHub repos serve CORS-enabled raw
// content, so this fetches straight from the browser with no backend.
// RESUME.md is plain prose with single newlines between lines (job title,
// company, dates all on their own line, no blank line between) — remark
// treats a lone newline as a soft break by default, which would collapse
// those into one run-on paragraph. remarkBreaks turns it into a real <br>.
const REPO_OWNER = 'oljudi'
const REPO_NAME = 'portfolio'
const REPO_BRANCH = 'main'
const RESUME_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/RESUME.md`
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`

type Status = 'loading' | 'success' | 'error'

export function ResumeSection() {
  const [status, setStatus] = useState<Status>('loading')
  const [markdown, setMarkdown] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    fetch(RESUME_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        setMarkdown(text)
        setStatus('success')
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setStatus('error')
      })

    return () => controller.abort()
  }, [])

  return (
    <section className="resume-section" aria-label="Resume">
      <div className="resume-card">
        <div className="resume-titlebar">
          <span className="resume-dots">
            <i className="dot dot-red" />
            <i className="dot dot-yellow" />
            <i className="dot dot-green" />
          </span>
          <span className="resume-title">
            RESUME.md
          </span>
          <a
            className="resume-link"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            view repo →
          </a>
        </div>

        <div className="resume-body">
          {status === 'loading' && (
            <p className="resume-status">Fetching résumé from GitHub...</p>
          )}

          {status === 'error' && (
            <p className="resume-status resume-status-error">
              Couldn't load the résumé. The repo may still be private or not
              yet pushed to{' '}
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                {REPO_OWNER}/{REPO_NAME}
              </a>
              .
            </p>
          )}

          {status === 'success' && (
            <div className="resume-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {markdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
