# Studio One

`Studio One` es un proyecto enfocado en la administración de las composiciones musicales de los usuarios. Por ahora la aplicación se encuentra en su primera etapa: **inicio de sesión con Google (Firebase Authentication)** y una **pantalla de bienvenida**.

## Aspectos técnicos

El proyecto está construido con `React` + `TypeScript` + `Vite` sobre `Tailwind CSS v4` y `shadcn/ui`. Todo el entorno de trabajo (instalación de dependencias, dev server y build) se ejecuta dentro de contenedores `Docker`, por lo que en la máquina de desarrollo solo se necesita `Docker Desktop`.

---

### Docker

El uso local está configurado con `Compose` mediante el archivo `compose.yaml` en la raíz del repositorio.

#### Servicios de docker compose

1. **studio-one-frontend** (servicio por defecto)
   - Imagen de desarrollo: `docker/development/frontend.dockerfile`
   - Vite dev server con hot reload
   - Volumen de código: `./frontend:/app`
   - Volumen anónimo: `/app/node_modules` (conserva las dependencias instaladas en la imagen de Linux)
   - Binding port: `80:80`

2. **studio-one-frontend-prod** (perfil `prod`)
   - Imagen de producción: `docker/prod/frontend.dockerfile` (build de Vite + `nginx:alpine`)
   - Archivos estáticos con *history fallback* de SPA
   - Binding port: `8080:80`

---

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose v2)
- Una cuenta de Google para el acceso al proyecto de Firebase

---

### Configuración

1. Copiar el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Completar los valores de Firebase en `.env` (raíz del repositorio). Es el archivo que usa `Docker Compose` tanto para el dev server como para el build de producción:

   ```bash
   VITE_ENVIRONMENT=development
   VITE_API_URL=http://localhost/api
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   Si se requiere trabajar sin credenciales reales, `VITE_FIREBASE_AUTH_EMULATOR_URL` permite apuntar al emulador de Firebase Authentication.

3. Levantar la aplicación:

   ```bash
   # Desarrollo (http://localhost)
   docker compose up -d

   # Producción (http://localhost:8080)
   docker compose --profile prod up -d --build
   ```

---

### Configuración en Firebase

Para que el inicio de sesión con Google funcione:

1. En la consola de Firebase, **Authentication → Sign-in method → Google → Habilitar**.
2. En **Authentication → Settings → Authorized domains**, registrar `localhost` (y el dominio de producción cuando exista).
3. Obtener la configuración del *web app* (**Project settings → General → Your apps**) y copiarla en el `.env` de la raíz.

> La configuración web de Firebase es pública por diseño (viaja al navegador). Protégela restringiendo la API key y los dominios autorizados desde la consola.

---

### Estructura del proyecto

```
studio-one/
├── compose.yaml                      # Servicios de Docker (dev y prod)
├── .env.example                      # Plantilla de variables de entorno
├── docker/
│   ├── development/                  # Imagen de desarrollo (Vite + HMR)
│   └── prod/                         # Imagen de producción (build + nginx)
└── frontend/                         # Aplicación React
    ├── index.html
    ├── vite.config.ts                # Alias @ → ./src, dev server en el puerto 80
    ├── components.json               # Configuración de shadcn/ui
    ├── nginx.conf                    # Servidor de estáticos para la imagen prod
    ├── public/
    │   ├── api/                      # Payloads JSON para el modo "mockable"
    │   ├── favicon.svg · icons.svg
    │   └── netlify.toml              # Configuración de despliegue en Netlify
    └── src/
        ├── main.tsx                  # Punto de entrada
        ├── App.tsx                   # Providers: Query → Theme → Toaster → Loader → Tooltip → Auth → Router
        ├── index.css                 # Tokens y tema (Tailwind v4)
        ├── api/client.ts             # Axios + interceptor 401
        ├── routes/                   # Router raíz, guards y layout raíz
        ├── context/                  # ThemeContext, LoaderContext
        ├── stores/                   # LoaderStore (Zustand)
        ├── hooks/
        ├── lib/                      # query-client, constantes, extensiones, helpers
        ├── interfaces/
        ├── shared/                   # Componentes reutilizables y primitivas shadcn/ui
        └── modules/                  # Módulos de dominio (auth, welcome, ...)
```

#### Módulos de dominio

Cada módulo es autónomo y sigue la misma convención:

```
src/modules/<módulo>/
├── routes/<módulo>.router.tsx
├── layouts/<Módulo>Layout.tsx
├── api/                             # Una función async por endpoint
├── hooks/                           # Hooks de TanStack Query
├── pages/
├── components/
├── interfaces/                      # Tipos locales del módulo
└── stores/                          # Estado global del módulo (Zustand)
```

El módulo `auth` es el responsable del inicio de sesión con Firebase: `stores/auth.store.ts` mantiene el `authStatus` (`checking` / `authenticated` / `not-authenticated`) y las acciones `signInWithGoogle()` y `logout()`.

---

### Modo "mockable"

Cuando `VITE_ENVIRONMENT=mockable`, las funciones de `src/**/api/` responden con los JSON estáticos de `frontend/public/api/` en lugar de llamar al backend real. La documentación de la convención está en `frontend/public/api/README.md`.

La autenticación **no** se mockea: siempre la resuelve Firebase Authentication.

---

### Comandos

Los comandos se ejecutan dentro del contenedor:

```bash
docker compose logs -f frontend                  # dev server (HMR)
docker compose exec frontend pnpm run build      # typecheck + build
docker compose exec frontend pnpm run lint       # eslint
docker compose exec frontend pnpm run typecheck  # tsc -b
```

---

### Skills del agente

El repositorio versiona 14 skills a nivel de proyecto en `.agents/skills/`, fijadas en `skills-lock.json`. Cubren Firebase, shadcn/ui, rendimiento en React, testing web, Docker, Netlify y criterio de diseño y animación.

```bash
npx skills list      # skills instaladas
npx skills update    # actualizar a las últimas versiones
```

`.agents/skills/` y `skills-lock.json` deben permanecer versionados; las skills se comparten entre los agentes compatibles (OpenCode, GitHub Copilot, Warp).

---

### Despliegue

- **Netlify**: `frontend/public/netlify.toml` define el build (`npm run build`), el directorio de publicación (`dist`) y el *rewrite* de SPA.
- **Docker**: `docker compose --profile prod build` genera la imagen con el build estático servido por `nginx`.
