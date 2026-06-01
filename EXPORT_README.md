# ELKARION — Código fuente exportado

App de inteligencia botánica con estética premium verde/negro: mentor IA **ELKAR**, diagnóstico por foto, PestScan, consejos de cultivo y formulario de beta privada.

## 1. Stack

- **TanStack Start v1** (React 19 + Vite 7, SSR en Cloudflare Workers)
- **Tailwind CSS v4** (tokens en `src/styles.css`)
- **shadcn/ui** + Radix + lucide-react
- **Supabase** (base de datos `usuarios_beta`, auth, RLS)
- **Lovable AI Gateway** (Gemini 2.5 Flash) para ELKAR, PestScan y Diagnose
- **Bun** como gestor de paquetes (también funciona con npm/pnpm)

## 2. Estructura de carpetas

```
elkarion/
├─ src/
│  ├─ routes/                  # Rutas TanStack file-based
│  │  ├─ __root.tsx            # Layout raíz (html/head/body, meta SEO)
│  │  ├─ index.tsx             # Landing ELKARION (Hero + secciones)
│  │  └─ chat.tsx              # Chat con el mentor ELKAR
│  ├─ components/
│  │  ├─ plantiq/              # Componentes propios de la marca
│  │  │  ├─ Nav.tsx            # Navegación superior
│  │  │  ├─ Hero.tsx           # Hero principal
│  │  │  ├─ WowDemo.tsx        # Demo "wow" animada
│  │  │  ├─ WhyElkarion.tsx    # Bloques de propuesta de valor
│  │  │  ├─ Diagnose.tsx       # Diagnóstico por foto (IA)
│  │  │  ├─ PestScan.tsx       # Detección de plagas
│  │  │  ├─ LiveActivity.tsx   # Feed live
│  │  │  ├─ Elkar.tsx          # Promo del mentor ELKAR
│  │  │  ├─ Features.tsx       # Lista de features
│  │  │  ├─ Pricing.tsx        # Planes
│  │  │  ├─ Newsletter.tsx     # Formulario beta privada → Supabase
│  │  │  └─ Footer.tsx
│  │  └─ ui/                   # shadcn/ui (button, dialog, input, etc.)
│  ├─ utils/                   # Server functions (createServerFn)
│  │  ├─ elkar-chat.functions.ts   # Chat IA con ELKAR
│  │  ├─ pestscan.functions.ts     # Análisis de plagas con IA
│  │  └─ diagnose.functions.ts     # Diagnóstico botánico con IA
│  ├─ integrations/supabase/   # Clientes Supabase (NO editar)
│  │  ├─ client.ts             # Cliente navegador (anon key)
│  │  ├─ client.server.ts      # Cliente admin (service role)
│  │  ├─ auth-middleware.ts    # Middleware de auth para server fns
│  │  ├─ auth-attacher.ts      # Adjunta token al llamar server fns
│  │  └─ types.ts              # Tipos generados de la DB
│  ├─ hooks/                   # Hooks React (use-mobile, etc.)
│  ├─ lib/utils.ts             # cn() helper para Tailwind
│  ├─ assets/                  # Logo ELKARION e imágenes
│  ├─ styles.css               # Tokens de diseño + Tailwind v4
│  └─ router.tsx               # Configuración del router
├─ supabase/
│  ├─ config.toml              # ID del proyecto Supabase
│  └─ migrations/              # Migraciones SQL (tabla usuarios_beta)
├─ public/                     # Estáticos servidos tal cual
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ wrangler.jsonc              # Config Cloudflare Workers
├─ .env.example                # Plantilla de variables de entorno
└─ components.json             # Config shadcn/ui
```

## 3. Instalación local

Requisitos: **Node.js 20+** y **Bun** (`curl -fsSL https://bun.sh/install | bash`).

```bash
# 1. Descomprimir el zip
unzip elkarion-source.zip -d elkarion && cd elkarion

# 2. Instalar dependencias
bun install
# o:  npm install

# 3. Crear .env desde la plantilla
cp .env.example .env
# Edita .env con tus claves reales (ver sección 5)

# 4. Arrancar en local
bun run dev
# Abre http://localhost:8080
```

## 4. Comandos

| Comando | Qué hace |
|---|---|
| `bun run dev` | Servidor de desarrollo con HMR |
| `bun run build` | Build de producción (Cloudflare Workers) |
| `bun run start` | Sirve el build de producción |
| `bun run lint` | Linter ESLint |

## 5. Dónde van las claves (.env)

Todas las claves se cargan desde `.env` (no se sube a git). Plantilla en `.env.example`.

### Supabase
1. Crea un proyecto en https://supabase.com
2. Project Settings → API → copia:
   - `Project URL` → `VITE_SUPABASE_URL` y `SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_PUBLISHABLE_KEY`
   - `service_role` (SECRETA, solo servidor) → `SUPABASE_SERVICE_ROLE_KEY`
3. Ejecuta las migraciones de `supabase/migrations/` para crear la tabla `usuarios_beta`:
   ```bash
   bunx supabase link --project-ref TU-PROJECT-ID
   bunx supabase db push
   ```

### IA (mentor ELKAR, PestScan, Diagnose)
- En Lovable: ya viene `LOVABLE_API_KEY` configurada automáticamente.
- Fuera de Lovable: sustituye las llamadas a `https://ai.gateway.lovable.dev/v1/chat/completions` en `src/utils/*.functions.ts` por OpenAI (`https://api.openai.com/v1/chat/completions`) o Google Gemini, y guarda tu API key en `.env` como `OPENAI_API_KEY`.

## 6. Backend / DB / formularios / IA — archivos clave

- **Formulario beta privada** → `src/components/plantiq/Newsletter.tsx` inserta en la tabla `usuarios_beta` (Supabase).
- **Migraciones SQL** → `supabase/migrations/` (creación de `usuarios_beta` con RLS).
- **Chat ELKAR (IA)** → `src/utils/elkar-chat.functions.ts` + UI en `src/routes/chat.tsx`.
- **Diagnóstico por foto (IA)** → `src/utils/diagnose.functions.ts` + `src/components/plantiq/Diagnose.tsx`.
- **PestScan (IA)** → `src/utils/pestscan.functions.ts` + `src/components/plantiq/PestScan.tsx`.
- **Tipos DB autogenerados** → `src/integrations/supabase/types.ts`.

## 7. Notas

- `src/routeTree.gen.ts` NO se incluye: se regenera solo al ejecutar `bun run dev`.
- `node_modules/` tampoco: se reinstala con `bun install`.
- Los archivos en `src/integrations/supabase/` están autogenerados por Lovable; si exportas fuera, mantén la misma estructura.
- Estética verde/negro definida en `src/styles.css` (tokens `--primary`, `--background`, etc.).