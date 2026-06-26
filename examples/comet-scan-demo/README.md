# Comet Scan Vue Demo

This is a small Vue 3 frontend for testing `/comet-scan` on a page-oriented app.

It includes:

- Vue Router routes for dashboard, project detail, and settings pages.
- Shared UI components imported by multiple pages.
- A store module used by pages and components.
- A composable that owns filter state and derived lists.
- A frontend optimization request in `docs/optimization-request.md`.

## Run

Static structure tests do not need dependency installation:

```bash
npm test
```

To run the actual app:

```bash
npm install
npm run dev
```

## Suggested Comet Test

1. Run `comet init` in this directory.
2. Run `/comet-scan`.
3. Check whether CodeGraph context captures:
   - route definitions in `src/router/index.js`
   - page components under `src/views/`
   - shared component imports under `src/components/`
   - store and composable references
   - the `ProjectDetailView -> ProjectTaskList -> TaskFilterTabs` component chain
4. Ask Comet to handle `docs/optimization-request.md`.
