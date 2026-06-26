# Static hosting, vendored libraries, native ES modules

The new project keeps the existing constraint: pure static files served from
GitHub Pages, **no backend and no build step**. To grow from one tool to four —
including an Equation tool that needs symbolic algebra — we make two evolutions:

1. Split the single `app.js` into **native ES modules** (`<script type="module">`),
   loaded directly by the browser, so the four tools live in separate files
   without a bundler.
2. Allow **vendored client-side libraries** (committed under `assets/vendor/`,
   e.g. a small CAS for the Equation tool) loaded as static scripts.

## Considered options

- **Vite/bundler build** — rejected: adds npm + CI tooling the project
  deliberately avoids; the no-build property is a core value here.
- **100% hand-rolled, no math library** — rejected: writing a robust symbolic
  equivalence checker from scratch is high-effort and error-prone; a vetted
  vendored CAS is a better trade-off.

## Consequences

- No `package.json` runtime dependency; vendored libs are committed verbatim and
  pinned by file.
- ES modules require serving over HTTP(S) (already true — `fetch()` is used), so
  `file://` previews remain unsupported.
