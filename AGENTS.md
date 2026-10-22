# AGENTS.md

Studio One: React 19 + TypeScript + Vite app for managing musical compositions. Google-only Firebase Auth and a welcome screen exist today; the compositions module is next.

## Environment & commands

- Everything runs in Docker. There is no usable host `node_modules`; run app commands in the `frontend` container.
- `.env` at the repo root is the single source of environment config (copy `.env.example`). Compose injects it; `frontend/.env` is not used by Docker.
- Dev server is the container's main process. Do **not** run `pnpm dev` again inside it (port 80 is taken).

```bash
docker compose up -d                              # dev at http://localhost
docker compose logs -f frontend                   # dev server output
docker compose exec frontend pnpm typecheck       # tsc -b
docker compose exec frontend pnpm lint            # eslint
docker compose exec frontend pnpm build           # typecheck + vite build
docker compose --profile prod up -d --build       # prod at http://localhost:8080
```

- No test runner or test suite exists. Verify changes with typecheck/lint and by loading the affected routes.
- After changing `.env` (container env is fixed at creation) or `package.json` (deps live in an anonymous volume), recreate the image: `docker compose up -d --build frontend`.

## Architecture

- App code is in `frontend/`; `@/` resolves to `frontend/src`.
- Domain modules live in `src/modules/<module>/{api,hooks,pages,routes,stores,interfaces}` and are imported through `@/`.
- Routing is React Router v8 with lazy module patching. Register new top-level modules in `lazyModuleRouters` in `src/routes/app.router.tsx`; nested routes live in `modules/<module>/routes/`.
- `/` redirects to `/welcome`; unknown paths render `src/shared/pages/NotFoundPage.tsx`.
- Auth guards are in `src/routes/protected.router.tsx` and read `authStatus` from the Zustand auth store (`checking | authenticated | not-authenticated`). `AuthProvider` in `App.tsx` blocks rendering until the Firebase session check finishes.
- `IS_FIREBASE_CONFIGURED` intentionally disables the Google button and shows a warning when env values are missing. Do not remove this guard.
- Mockable mode (`VITE_ENVIRONMENT=mockable`) only swaps API calls under `src/**/api` for JSON in `frontend/public/api`; Firebase auth is never mocked.

## Styling & UI

- Tailwind v4 is CSS-first: design tokens live in `frontend/src/index.css` (`@theme inline`, `:root`, `.dark`). `tailwind.config.ts` is only a tooling compatibility stub — do not add theme values there.
- Use semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`), not raw palette classes.
- shadcn/ui uses style `base-nova` on **Base UI** (`@base-ui/react`), not Radix: custom triggers use the `render` prop, not `asChild`. Primitives live in `src/shared/shadcn/ui/`; add more with `docker compose exec frontend pnpm dlx shadcn@latest add <component>`.
- Dark mode is the `.dark` class on `<html>`. The initial theme is applied by an inline script in `frontend/index.html` to avoid a flash; `ThemeContext` keeps the `theme-color` meta in sync. Keep `<Toaster />` inside `ThemeContextProvider` because Sonner reads the theme from it.
- Mobile baseline is already applied (`100dvh`, safe-area `env()` padding, `viewport-fit=cover`); don't revert to `100vh` for app shells.
- UI copy and code comments are in English; `README.md` is in Spanish.

## Skills

- 14 project skills live in `.agents/skills/` and are pinned by `skills-lock.json`; both are versioned. Update from the repo root with `npx skills update` and commit the lockfile. Don't delete `.agents/skills/` as if it were generated output.

## Deploy notes

- Production image uses `frontend/nginx.conf` (SPA history fallback, immutable asset caching, no-cache `index.html`). Vite build args come from root `.env`.
- `frontend/public/netlify.toml` is copied into `dist`; it is not at the Netlify-detected location. Verify deployment config before relying on it.
