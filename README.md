# Portfolio

Diego Olvera's personal portfolio — a single-page, terminal-driven site built
with a cyberpunk aesthetic. There is no backend: content is authored as local
data (`src/data/portfolio.json`, `RESUME.md`) and the résumé card fetches its
markdown live from this repo's own GitHub raw URL at runtime — the one
intentional exception to "local data only" (see [Content](#content) below).

Live layout: a 12-column grid. The left 2 columns hold an animated avatar and
an about card; the right 10 hold an interactive terminal. A résumé card
renders below, fetched from `RESUME.md` on GitHub. The whole page is
viewport-locked — nothing scrolls except the terminal body and the résumé
card, each independently.

## Stack

- **React 19 + TypeScript 6 + Vite 8** — ESM throughout (`type: "module"`)
- **oxlint**, not ESLint — config in [.oxlintrc.json](.oxlintrc.json)
- **react-markdown** + **remark-gfm** + **remark-breaks** — renders
  `RESUME.md`'s content (GFM autolinks, and real line breaks for a résumé's
  soft-wrapped lines instead of one run-on paragraph)
- Plain CSS — no Tailwind/CSS-in-JS. Design language mixes a cyberpunk neon
  palette (cyan/pink/green accents, glow effects) with bored.com's real
  shipped values: Nunito, a zinc neutral scale, a dot-grid background, and
  14px-rounded / pill-shaped ("9999px") cards — all read out of their
  production CSS rather than approximated
- The React Compiler is **not enabled** — memoize manually where it matters

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # tsc -b (type-check) then vite build
npm run lint     # oxlint
npm run preview  # serve the production build from dist/
```

No test runner is installed.

## Structure

```
src/
  main.tsx                        mounts <App /> into #root
  App.tsx / App.css               page shell: 12-col grid, avatar, about card, footer
  index.css                       theme tokens (colors, fonts, dot-grid background)
  data/
    portfolio.json                name, bio, skills (grouped), projects, certs, social
  components/
    Terminal.tsx / Terminal.css   the interactive terminal (see below)
    ResumeSection.tsx / .css      fetches & renders RESUME.md from GitHub
    SchemaMarkup.tsx              injects Person/CreativeWork/Credential JSON-LD
```

### Terminal

A command-line interface rendered as the hero's main panel. Boots with a
short animated sequence, then accepts typed commands (case-insensitive,
history via ↑/↓, Tab-completion, clickable hint chips for non-typists):

| Command | Output |
|---|---|
| `help` | Command list |
| `skills` | Grouped tech stack (Languages / Cloud & Infra / AI & LLMOps / Web & Frameworks) |
| `projects` | Each project with status, description, tech |
| `certs` | Certifications with issuer, year, and a link |
| `contact` | Email + social links |
| `clear` | Wipes the scrollback |

All content is pulled from `portfolio.json` — adding a project or skill there
is reflected in the terminal with no code change.

## Content

- **`src/data/portfolio.json`** — the single source of truth for identity,
  skills, projects, certifications, and social links. Consumed by both the
  sidebar about card and the terminal commands.
- **`RESUME.md`** — plain-text résumé, rendered by `ResumeSection` via a
  live `fetch()` to `raw.githubusercontent.com/oljudi/portfolio/main/RESUME.md`.
  This is a runtime network call, not local data — the only place in the app
  that reaches outside `src/`. It requires the repo to be public and pushed;
  until then the card shows an error state with a link to the repo.
- **`RESUME.md`'s markdown needs a space after list-marker dashes**
  (`- Skill`, not `-Skill`) — CommonMark won't parse the latter as a list
  item at all.

## Docker

Ships as a static bundle served by nginx — no Node process at runtime.

```bash
docker compose up -d --build   # build image + run, http://localhost:8080
PORT=3000 docker compose up -d # override the host port
docker compose down
```

[Dockerfile](Dockerfile) is two-stage: `node:24-alpine` runs `npm ci` +
`npm run build` (which type-checks — a type error fails the image build),
then `nginx:1.29-alpine` receives only `dist/`.
[docker/nginx.conf](docker/nginx.conf) handles SPA fallback and asset
caching.

## SEO

`index.html` carries meta tags (description, keywords, Open Graph, canonical)
and `SchemaMarkup.tsx` injects JSON-LD (`Person`, `CreativeWork` per project,
`EducationalOccupationalCredential` per certification) so crawlers and AI
indexers get structured data even though the terminal UI itself isn't
conventional markup. `public/robots.txt` and `public/sitemap.xml` complete
the setup — update the domain in both once deployed.
