# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project intent

Personal portfolio / presentation site for Diego Olvera: resume, projects, and an
about/contact presentation. **Frontend only** — there is no backend, API layer, or
database, and content should be sourced from local data/assets rather than fetched
at runtime.

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # tsc -b (project references, type-check only) then vite build
npm run lint     # oxlint
npm run preview  # serve the production build from dist/
```

No test runner is installed. If tests are needed, propose the setup before adding
one; do not assume Vitest/Jest is available.

## Stack and toolchain notes

- **React 19 + TypeScript 6 + Vite 8.** `type: "module"`, so all config is ESM.
- **oxlint, not ESLint.** Config lives in [.oxlintrc.json](.oxlintrc.json) with the
  `react`/`typescript`/`oxc` plugins. Type-aware rules are *off*; enabling them
  requires installing `oxlint-tsgolint` and setting `options.typeAware` (see
  [README.md](README.md)).
- **The React Compiler is deliberately not enabled** — memoize manually where it
  matters.
- **Strict compiler settings that commonly bite** (see [tsconfig.app.json](tsconfig.app.json)):
  `noUnusedLocals` / `noUnusedParameters` (unused imports fail `npm run build`),
  `verbatimModuleSyntax` (type-only imports must use `import type`),
  `erasableSyntaxOnly` (no enums, no parameter properties), and
  `allowImportingTsExtensions` — hence `import App from './App.tsx'` with the
  extension in [src/main.tsx](src/main.tsx).
- Two-project tsconfig split: [tsconfig.app.json](tsconfig.app.json) covers `src/`
  (DOM libs), [tsconfig.node.json](tsconfig.node.json) covers the Vite config.
  Node-only code belongs in the latter's scope.

## Docker

The app ships as a static bundle served by nginx — there is no Node process at
runtime.

```bash
docker compose up -d --build   # build image + run, http://localhost:8080
PORT=3000 docker compose up -d # override the host port
docker compose down
```

- [Dockerfile](Dockerfile) is two-stage: `node:24-alpine` runs `npm ci` +
  `npm run build`, then `nginx:1.29-alpine` receives only `dist/`. Note that
  `npm run build` type-checks, so **a type error fails the image build**.
- [docker/nginx.conf](docker/nginx.conf) handles the SPA fallback
  (`try_files ... /index.html`, so client-side routes survive a refresh),
  caches `/assets/*` immutably (safe — Vite content-hashes them) and marks
  `index.html` `no-cache`. Use exactly one `Cache-Control` source per location:
  `expires` and `add_header Cache-Control` together emit two competing headers.
- Dependency changes invalidate the `npm ci` layer; source-only changes reuse it.
  Keep [.dockerignore](.dockerignore) in sync so host `node_modules`/`dist` never
  enter the build context.

## Structure and conventions

- [src/main.tsx](src/main.tsx) mounts `<App />` in `StrictMode` into `#root` from
  [index.html](index.html). Global styles are imported here (`index.css`).
- Assets in `src/assets/` are imported as modules (hashed by Vite); files in
  `public/` are served verbatim at the root — e.g. the SVG sprite referenced as
  `<use href="/icons.svg#...">`, which is the established pattern for icons.
- [src/App.tsx](src/App.tsx) and [src/App.css](src/App.css) are still the untouched
  Vite starter template (counter + Vite/React links). Expect to replace, not extend,
  them when building real portfolio sections, and delete the leftover
  `react.svg`/`vite.svg`/`hero.png` assets once unused.

## Undecided (ask before assuming)

Routing (react-router vs. single-page scroll), styling approach (plain CSS is all
that exists today — no Tailwind/CSS-in-JS installed), and deployment target are not
yet chosen. Adding any of these is a new dependency decision, not an implementation
detail.
