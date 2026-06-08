# Studio JayJo — Plan 1: Foundation + Storefront

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation and a browseable, themed, responsive storefront for Studio JayJo — catalog, galleries, favorites (local only), about, work-with-us stub, and home page. No payments or accounts yet (those land in Plans 2 and 3).

**Architecture:** Vite + React 18 + TypeScript SPA. Tailwind CSS consuming CSS-variable design tokens for light/dark theming. React Router v6 with `React.lazy` per route. Catalog abstraction with files-in-repo adapter as v1 default. Framer Motion for editorial scroll-reveal. TanStack Query installed but mostly unused until later plans (we use Zustand for theme + favorites local state). All components and content validated by Zod at build time.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, React Router v6, Zustand, TanStack Query, Framer Motion, Radix UI, Sonner, Zod, Vitest, Playwright, fontsource (Cormorant Garamond + Inter), Lucide icons.

**Spec reference:** `docs/superpowers/specs/2026-06-08-studio-jayjo-design.md`

---

## File structure produced by this plan

```
jayjo/
├── .env.example
├── .gitignore
├── .nvmrc
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── prettier.config.cjs
├── playwright.config.ts
├── vitest.config.ts
├── index.html
│
├── public/
│   ├── favicon.svg
│   ├── og-default.jpg          (placeholder)
│   ├── robots.txt
│   └── art/<slug>/main.jpg     (placeholder images)
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   ├── tokens.css          (light + dark CSS vars)
│   │   ├── base.css            (reset + typography)
│   │   └── globals.css         (composes the above + Tailwind layers)
│   ├── lib/
│   │   ├── cn.ts               (clsx + tailwind-merge helper)
│   │   ├── currency.ts
│   │   ├── seo.ts              (helmet helpers)
│   │   └── env.ts              (typed VITE_* env access)
│   ├── store/
│   │   ├── theme.ts            (Zustand: theme persisted to localStorage)
│   │   └── favorites.ts        (Zustand: guest favorites persisted to localStorage)
│   ├── catalog/
│   │   ├── types.ts            (Artwork, Gallery, Variant)
│   │   ├── schemas.ts          (Zod schemas)
│   │   ├── index.ts            (adapter selector)
│   │   └── adapters/
│   │       ├── files.ts        (active)
│   │       ├── sanity.ts       (stub)
│   │       └── neon.ts         (stub)
│   ├── content/
│   │   ├── artworks/
│   │   │   ├── evening-fig.ts
│   │   │   ├── olive-grove.ts
│   │   │   ├── cognac-still.ts
│   │   │   └── parchment-bloom.ts
│   │   ├── galleries/
│   │   │   ├── warm-study.ts
│   │   │   └── dusk-arrangement.ts
│   │   └── pages/
│   │       ├── about.ts
│   │       └── work-with-us.ts
│   ├── components/
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── EyebrowHeading.tsx
│   │   │   ├── Price.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Sheet.tsx
│   │   │   └── Toaster.tsx
│   │   ├── motion/
│   │   │   ├── Reveal.tsx
│   │   │   ├── RevealStagger.tsx
│   │   │   ├── Parallax.tsx
│   │   │   ├── HoverLift.tsx
│   │   │   └── PageTransition.tsx
│   │   ├── layout/
│   │   │   ├── RootLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageSkeleton.tsx
│   │   ├── product/
│   │   │   ├── ImageWithBlur.tsx
│   │   │   ├── ArtworkCard.tsx
│   │   │   ├── ArtworkCardSkeleton.tsx
│   │   │   ├── ArtworkGrid.tsx
│   │   │   ├── ArtworkFilters.tsx
│   │   │   └── VariantPicker.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryCard.tsx
│   │   │   ├── GalleryCardSkeleton.tsx
│   │   │   ├── GalleryHero.tsx
│   │   │   └── GalleryPieceList.tsx
│   │   └── errors/
│   │       ├── ErrorBoundary.tsx
│   │       └── RouteError.tsx
│   └── routes/
│       ├── Home.tsx
│       ├── Shop.tsx
│       ├── ArtworkDetail.tsx
│       ├── Galleries.tsx
│       ├── GalleryDetail.tsx
│       ├── Favorites.tsx
│       ├── About.tsx
│       ├── WorkWithUs.tsx
│       └── NotFound.tsx
│
├── scripts/
│   └── catalog-validate.ts
│
└── tests/
    └── unit/
        ├── currency.test.ts
        ├── catalog-files.test.ts
        ├── theme-store.test.ts
        ├── favorites-store.test.ts
        ├── ArtworkCard.test.tsx
        └── tokens-contrast.test.ts
```

---

## Task 1: Project initialization

**Files:**
- Create: `/Users/gabrielmotta/jayjo/package.json`
- Create: `/Users/gabrielmotta/jayjo/.nvmrc`
- Create: `/Users/gabrielmotta/jayjo/.gitignore`
- Create: `/Users/gabrielmotta/jayjo/.env.example`
- Create: `/Users/gabrielmotta/jayjo/tsconfig.json`
- Create: `/Users/gabrielmotta/jayjo/tsconfig.node.json`
- Create: `/Users/gabrielmotta/jayjo/vite.config.ts`
- Create: `/Users/gabrielmotta/jayjo/index.html`

- [ ] **Step 1.1: Initialize git repository**

```bash
cd /Users/gabrielmotta/jayjo
git init
git branch -M main
```

- [ ] **Step 1.2: Create `.nvmrc`**

```
20
```

- [ ] **Step 1.3: Create `.gitignore`**

```
node_modules
dist
.env
.env.local
.env.*.local
.netlify
.vite
coverage
playwright-report
test-results
.DS_Store
*.log
/tmp/
/db/local.db
.vscode/
.idea/
dist-ssr/

# Design reference materials (kept locally only)
/Colour Palette.pdf
/Website_Concept_01.pdf
```

- [ ] **Step 1.4: Create `.env.example`** (placeholder names only — never values)

```bash
# Server-only (Functions) — DO NOT prefix with VITE_
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
JWT_SECRET=
APP_URL=http://localhost:8888
NOTIFY_EMAIL=hello@studiojayjo.com

# Client-safe (VITE_ prefix exposes to browser bundle)
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_APP_URL=http://localhost:5173
VITE_CATALOG_ADAPTER=files
VITE_PLAUSIBLE_DOMAIN=
```

- [ ] **Step 1.5: Create `package.json`**

```json
{
  "name": "studio-jayjo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 5173",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier -w .",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "catalog:validate": "tsx scripts/catalog-validate.ts"
  },
  "dependencies": {
    "@fontsource-variable/cormorant-garamond": "^5.0.0",
    "@fontsource-variable/inter": "^5.0.0",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-tooltip": "^1.1.6",
    "@radix-ui/react-visually-hidden": "^1.1.1",
    "@tanstack/react-query": "^5.62.0",
    "clsx": "^2.1.1",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-router-dom": "^6.28.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.10.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@typescript-eslint/eslint-plugin": "^8.18.0",
    "@typescript-eslint/parser": "^8.18.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.16.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.1.0",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vitest": "^3.2.6",
    "wcag-contrast": "^3.0.0"
  }
}
```

- [ ] **Step 1.6: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 1.7: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "playwright.config.ts", "scripts/**/*", "tailwind.config.ts", "postcss.config.js"]
}
```

- [ ] **Step 1.8: Create `vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
  },
  server: { port: 5173 },
});
```

- [ ] **Step 1.9: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#F2EBDC" />
    <script>
      (function () {
        try {
          var raw = localStorage.getItem("studio-jayjo-theme");
          var persisted = raw ? JSON.parse(raw) : null;
          var chosen = persisted && persisted.state && persisted.state.hasUserChoice ? persisted.state.theme : null;
          var theme = chosen || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
          document.documentElement.setAttribute("data-theme", theme);
        } catch (_) {
          document.documentElement.setAttribute("data-theme", "light");
        }
      })();
    </script>
    <title>Studio JayJo</title>
    <meta name="description" content="Studio JayJo — original art, prints, and curated wall galleries." />
    <meta property="og:title" content="Studio JayJo" />
    <meta property="og:description" content="Original art, prints, and curated wall galleries." />
    <meta property="og:image" content="/og-default.jpg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 1.10: Install dependencies**

Run: `npm install`
Expected: clean install, no peer-dep errors.

- [ ] **Step 1.10b: Verify no critical vulnerabilities**

Run: `npm audit --audit-level=critical`
Expected: no critical vulnerabilities.

- [ ] **Step 1.11: Verify TypeScript builds**

Run: `npm run typecheck`
Expected: PASS with no errors (no source files yet, so trivially passes once `src/main.tsx` is created in Task 2).

- [ ] **Step 1.12: Initial commit**

```bash
git add .gitignore .nvmrc .env.example package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts index.html docs/
git commit -m "chore: initialize project tooling and dependencies"
```

---

## Task 2: Tailwind, PostCSS, ESLint, Prettier configs

**Files:**
- Create: `/Users/gabrielmotta/jayjo/tailwind.config.ts`
- Create: `/Users/gabrielmotta/jayjo/postcss.config.js`
- Create: `/Users/gabrielmotta/jayjo/eslint.config.js`
- Create: `/Users/gabrielmotta/jayjo/prettier.config.cjs`

- [ ] **Step 2.1: Create `tailwind.config.ts`** — Tailwind reads CSS vars (defined in Task 3) via `theme.extend.colors`.

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        "bg-elevated": "var(--color-bg-elevated)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        fig: "var(--color-fig)",
        olive: "var(--color-olive)",
        mustard: "var(--color-mustard)",
        burnt: "var(--color-burnt)",
        border: "var(--color-border)",
      },
      fontFamily: {
        display: ['"Cormorant Garamond Variable"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "65ch",
        page: "80rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2.2: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 2.3: Create `eslint.config.js`** (flat config) — blocks `import.meta.env.<non-VITE_>` access in `src/`.

```js
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/**", "coverage/**", "playwright-report/**", "test-results/**", "*.tsbuildinfo"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        console: "readonly",
        navigator: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-restricted-syntax": [
        "error",
        {
          // Block import.meta.env.NON_VITE_FOO (dotted access).
          //
          // AST shape:
          //   - import.meta              -> MetaProperty { meta.name: 'import', property.name: 'meta' }
          //   - import.meta.env          -> MemberExpression wrapping the MetaProperty
          //   - import.meta.env.FOO      -> outer MemberExpression
          //
          // import.meta is a MetaProperty, NOT a chained MemberExpression — a naive
          // selector silently no-ops.
          selector:
            "MemberExpression[object.type='MemberExpression'][object.object.type='MetaProperty'][object.object.meta.name='import'][object.object.property.name='meta'][object.property.name='env'][property.name=/^(?!VITE_).+/]",
          message:
            "Only VITE_-prefixed env vars may be accessed from src/. Server keys live in netlify/functions/_lib/env.ts.",
        },
        {
          // Block import.meta.env["NON_VITE_FOO"] (bracket access — same leak path).
          selector:
            "MemberExpression[computed=true][object.type='MemberExpression'][object.object.type='MetaProperty'][object.object.meta.name='import'][object.object.property.name='meta'][object.property.name='env'][property.value=/^(?!VITE_).+/]",
          message:
            "Bracket access to import.meta.env still leaks server secrets. Use a VITE_-prefixed key, or go through netlify/functions/_lib/env.ts on the server.",
        },
        {
          // Block destructuring import.meta.env entirely. Distinguishing safe vs unsafe
          // destructure requires per-property regex which is brittle; ban the pattern.
          selector:
            "VariableDeclarator[init.type='MemberExpression'][init.object.type='MetaProperty'][init.object.meta.name='import'][init.object.property.name='meta'][init.property.name='env'] > ObjectPattern",
          message:
            "Destructuring import.meta.env defeats the VITE_ allowlist. Access individual VITE_-prefixed properties one at a time.",
        },
      ],
    },
    settings: { react: { version: "18.3" } },
  },
];
```

- [ ] **Step 2.4: Create `prettier.config.cjs`**

```js
module.exports = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
};
```

- [ ] **Step 2.5: Verify lint runs (no files yet → no errors)**

Run: `npm run lint`
Expected: PASS or "0 problems."

- [ ] **Step 2.6: Commit**

```bash
git add tailwind.config.ts postcss.config.js eslint.config.js prettier.config.cjs
git commit -m "chore: add tailwind, postcss, eslint, prettier configs"
```

---

## Task 3: Design tokens (CSS vars) + base styles

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/styles/tokens.css`
- Create: `/Users/gabrielmotta/jayjo/src/styles/base.css`
- Create: `/Users/gabrielmotta/jayjo/src/styles/globals.css`

- [ ] **Step 3.1: Create `src/styles/tokens.css`**

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

:root,
:root[data-theme="light"] {
  --color-bg:           #F2EBDC; /* Soft Parchment */
  --color-bg-elevated:  #E8E2D3; /* Bone */
  --color-text:         #2E1F12; /* Cocoa / Walnut */
  --color-text-muted:   #756751; /* Warm Greige — AA on bg (4.64:1) */
  --color-accent:       #A6541F; /* Cognac Leather */
  --color-accent-soft:  #B57C82; /* Faded Fig */
  --color-fig:          #63242B; /* Deep Fig — also used as danger/error tone */
  --color-olive:        #7E9268; /* Olive Moss */
  --color-mustard:      #C97B10; /* Spiced Mustard */
  --color-burnt:        #8D3A2B; /* Burnt Umber */
  --color-border:       rgba(46, 31, 18, 0.12);

  --color-shimmer:      rgba(46, 31, 18, 0.08);  /* warm shimmer over light bg */

  --shadow-card:        0 1px 2px rgba(46, 31, 18, 0.06), 0 8px 24px rgba(46, 31, 18, 0.08);
  --shadow-card-hover:  0 4px 8px rgba(46, 31, 18, 0.10), 0 16px 36px rgba(46, 31, 18, 0.14);

  color-scheme: light;
}

:root[data-theme="dark"] {
  --color-bg:           #1A140E;          /* deep warm brown — never true black */
  --color-bg-elevated:  #241A12;
  --color-text:         #F2EBDC;          /* Soft Parchment becomes text in dark */
  --color-text-muted:   #C9BFA8;          /* lifted from #A89A86 for AA on dark */
  --color-accent:       #C77A3E;          /* Cognac lifted for dark-bg contrast */
  --color-accent-soft:  #C68C92;          /* Faded Fig, slightly lifted */
  --color-fig:          #8C3A41;
  --color-olive:        #9DB387;
  --color-mustard:      #E08B1F;
  --color-burnt:        #B45844;
  --color-border:       rgba(242, 235, 220, 0.12);

  --color-shimmer:      rgba(242, 235, 220, 0.08);

  --shadow-card:        0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-card-hover:  0 4px 8px rgba(0, 0, 0, 0.5), 0 16px 36px rgba(0, 0, 0, 0.5);

  color-scheme: dark;
}
```

Note: theme-independent tokens (`--radius-*`, `--ease-out`) live in the base `:root` block so they survive in dark mode. Light theme is the implicit default via the `,` combinator — even if `<html>` has no `data-theme` attribute, styles still apply.

- [ ] **Step 3.2: Create `src/styles/base.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body {
  min-height: 100vh;
  transition: background 200ms var(--ease-out), color 200ms var(--ease-out);
}

h1, h2, h3, h4 {
  font-family: "Cormorant Garamond Variable", ui-serif, Georgia, serif;
  font-weight: 600;
  letter-spacing: -0.005em;
  margin: 0;
}

button {
  font-family: inherit;
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  padding: 12px 16px;
  z-index: 100;
  border-radius: var(--radius-sm);
}
.skip-link:focus { left: 12px; top: 12px; }
```

- [ ] **Step 3.3: Create `src/styles/globals.css`**

```css
@import "@fontsource-variable/cormorant-garamond";
@import "@fontsource-variable/inter";
@import "./tokens.css";
@import "./base.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .container-page {
    @apply mx-auto w-full max-w-page px-6 sm:px-8 lg:px-12;
  }
  .eyebrow {
    @apply text-xs uppercase tracking-[0.18em] font-medium text-text-muted;
  }
  .shimmer {
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      var(--color-shimmer) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s linear infinite;
  }
  @keyframes shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }
}
```

- [ ] **Step 3.4: Commit**

```bash
git add src/styles/
git commit -m "feat: add design tokens for light + dark themes with brand palette"
```

---

## Task 4: Theme store + provider + toggle

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/store/theme.ts`
- Create: `/Users/gabrielmotta/jayjo/src/components/theme/ThemeProvider.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/theme/ThemeToggle.tsx`
- Test: `/Users/gabrielmotta/jayjo/tests/unit/theme-store.test.ts`

- [ ] **Step 4.1: Write failing test for the theme store**

```ts
// tests/unit/theme-store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore, THEME_STORAGE_KEY } from "@/store/theme";

describe("theme store", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "light", hasUserChoice: false });
  });

  it("defaults to light", () => {
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("toggles to dark and records user choice", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
    expect(useThemeStore.getState().hasUserChoice).toBe(true);
  });

  it("persists to localStorage", () => {
    useThemeStore.getState().setTheme("dark");
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(raw).toContain('"theme":"dark"');
  });

  it("toggle() round-trips light→dark→light", () => {
    const { toggle } = useThemeStore.getState();
    toggle();
    expect(useThemeStore.getState().theme).toBe("dark");
    toggle();
    expect(useThemeStore.getState().theme).toBe("light");
    expect(useThemeStore.getState().hasUserChoice).toBe(true);
  });
});
```

- [ ] **Step 4.2: Run test, confirm FAIL**

Run: `npm test -- tests/unit/theme-store.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4.3: Implement `src/store/theme.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "studio-jayjo-theme";

interface ThemeState {
  theme: Theme;
  hasUserChoice: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      hasUserChoice: false,
      setTheme: (t) => set({ theme: t, hasUserChoice: true }),
      toggle: () =>
        set((s) => ({
          theme: s.theme === "light" ? "dark" : "light",
          hasUserChoice: true,
        })),
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
```

- [ ] **Step 4.4: Run test, confirm PASS**

Run: `npm test -- tests/unit/theme-store.test.ts`
Expected: PASS.

- [ ] **Step 4.5: Create `src/components/theme/ThemeProvider.tsx`** — applies `data-theme` to `<html>`; only consults `prefers-color-scheme` if user has not chosen.

```tsx
import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, hasUserChoice } = useThemeStore();

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const effective = hasUserChoice ? theme : mql.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", effective);
    };

    apply();

    if (!hasUserChoice) {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [theme, hasUserChoice]);

  return <>{children}</>;
}
```

- [ ] **Step 4.6: Create `src/components/theme/ThemeToggle.tsx`**

```tsx
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme";

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-elevated hover:text-text"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
```

- [ ] **Step 4.7: Commit**

```bash
git add src/store/theme.ts src/components/theme/ tests/unit/theme-store.test.ts
git commit -m "feat: add theme store, provider, and toggle"
```

---

## Task 5: Tokens-contrast WCAG test

**Files:**
- Create: `/Users/gabrielmotta/jayjo/tests/unit/tokens-contrast.test.ts`

- [ ] **Step 5.1: Write the test** — verifies token pairs meet WCAG AA.

```ts
import { describe, it, expect } from "vitest";
import { hex } from "wcag-contrast";

// Mirror of tokens.css. If you change tokens.css, change here too.
const LIGHT = {
  bg: "#F2EBDC",
  bgElevated: "#E8E2D3",
  text: "#2E1F12",
  textMuted: "#756751",
  accent: "#A6541F",
};
const DARK = {
  bg: "#1A140E",
  bgElevated: "#241A12",
  text: "#F2EBDC",
  textMuted: "#C9BFA8",
  accent: "#C77A3E",
};

describe("token contrast (WCAG 2.2 AA)", () => {
  it.each([
    ["light text on bg", LIGHT.text, LIGHT.bg, 4.5],
    ["light text on elevated", LIGHT.text, LIGHT.bgElevated, 4.5],
    ["dark text on bg", DARK.text, DARK.bg, 4.5],
    ["dark text on elevated", DARK.text, DARK.bgElevated, 4.5],
    ["light muted on bg", LIGHT.textMuted, LIGHT.bg, 4.5],
    ["dark muted on bg", DARK.textMuted, DARK.bg, 4.5],
  ])("%s meets %s:1", (_, fg, bg, min) => {
    expect(hex(fg, bg)).toBeGreaterThanOrEqual(min as number);
  });
});
```

- [ ] **Step 5.2: Run, confirm PASS** (palette is designed for compliance)

Run: `npm test -- tests/unit/tokens-contrast.test.ts`
Expected: PASS.

> **Note:** If a row fails, adjust the affected token in `src/styles/tokens.css` AND in this test file (they must stay in sync). Muted text is asserted at AA on both themes (it's used at 12px in `.eyebrow`); accent on backgrounds is informational and not asserted at AA here — it's for decorative use.

- [ ] **Step 5.3: Commit**

```bash
git add tests/unit/tokens-contrast.test.ts
git commit -m "test: enforce WCAG AA contrast on critical token pairs"
```

---

## Task 6: Currency utility

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/lib/currency.ts`
- Test: `/Users/gabrielmotta/jayjo/tests/unit/currency.test.ts`

- [ ] **Step 6.1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import { formatPrice, formatPriceRange } from "@/lib/currency";

describe("currency", () => {
  it("formats USD cents to '$85.00'", () => {
    expect(formatPrice(8500, "USD", "en-US")).toBe("$85.00");
  });

  it("formats range as 'from $85.00' when min only", () => {
    expect(formatPriceRange([8500], "USD", "en-US")).toBe("$85.00");
  });

  it("formats range as 'from $85.00' when min < max", () => {
    expect(formatPriceRange([8500, 14500, 24500], "USD", "en-US")).toBe("from $85.00");
  });
});
```

- [ ] **Step 6.2: Run, confirm FAIL**

Run: `npm test -- tests/unit/currency.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 6.3: Implement `src/lib/currency.ts`**

```ts
export function formatPrice(cents: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatPriceRange(centsList: number[], currency = "USD", locale = "en-US"): string {
  if (centsList.length === 0) return "";
  const min = Math.min(...centsList);
  const max = Math.max(...centsList);
  if (min === max) return formatPrice(min, currency, locale);
  return `from ${formatPrice(min, currency, locale)}`;
}
```

- [ ] **Step 6.4: Run, confirm PASS**

Run: `npm test -- tests/unit/currency.test.ts`
Expected: PASS.

- [ ] **Step 6.5: Commit**

```bash
git add src/lib/currency.ts tests/unit/currency.test.ts
git commit -m "feat: add currency formatting utilities"
```

---

## Task 7: Catalog types + Zod schemas

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/catalog/types.ts`
- Create: `/Users/gabrielmotta/jayjo/src/catalog/schemas.ts`

- [ ] **Step 7.1: Create `src/catalog/types.ts`**

```ts
export interface ArtworkVariant {
  id: string;
  label: string;
  priceCents: number;
  stripePriceId: string;
  stock?: number;
}

export interface ArtworkImage {
  src: string;
  alt: string;
  aspect: number; // width / height
}

export type ArtworkKind = "original" | "print";
export type ShippingGroup = "print" | "original-oversized";

export interface Artwork {
  slug: string;
  title: string;
  year: number;
  kind: ArtworkKind;
  medium: string;
  description: string;
  story?: string;
  colorTags: string[];
  sizeTags: string[];
  images: ArtworkImage[];
  variants: ArtworkVariant[];
  shippingGroup: ShippingGroup;
  published: boolean;
  publishedAt: string;
}

export interface GalleryBundle {
  stripePriceId: string;
  bundlePriceCents: number;
}

export interface Gallery {
  slug: string;
  title: string;
  description: string;
  story?: string;
  heroImage: ArtworkImage;
  artworkSlugs: string[];
  bundle?: GalleryBundle;
  published: boolean;
  publishedAt: string;
}

export interface ArtworkFilter {
  colorTags?: string[];
  sizeTags?: string[];
  kind?: ArtworkKind;
  query?: string;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
}

export interface CatalogRepository {
  listArtworks(filter?: ArtworkFilter): Promise<Artwork[]>;
  getArtwork(slug: string): Promise<Artwork | null>;
  listGalleries(): Promise<Gallery[]>;
  getGallery(slug: string): Promise<Gallery | null>;
}
```

- [ ] **Step 7.2: Create `src/catalog/schemas.ts`**

```ts
import { z } from "zod";

export const ArtworkImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1, "alt is required (a11y)"),
  aspect: z.number().positive(),
});

export const ArtworkVariantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  priceCents: z.number().int().positive(),
  stripePriceId: z.string().min(1),
  stock: z.number().int().nonnegative().optional(),
});

export const ArtworkSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case ascii"),
  title: z.string().min(1),
  year: z.number().int().gte(1900).lte(2100),
  kind: z.enum(["original", "print"]),
  medium: z.string().min(1),
  description: z.string().min(1),
  story: z.string().optional(),
  colorTags: z.array(z.string()).min(1),
  sizeTags: z.array(z.string()).min(1),
  images: z.array(ArtworkImageSchema).min(1),
  variants: z.array(ArtworkVariantSchema).min(1),
  shippingGroup: z.enum(["print", "original-oversized"]),
  published: z.boolean(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GalleryBundleSchema = z.object({
  stripePriceId: z.string().min(1),
  bundlePriceCents: z.number().int().positive(),
});

export const GallerySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  story: z.string().optional(),
  heroImage: ArtworkImageSchema,
  artworkSlugs: z.array(z.string()).min(1),
  bundle: GalleryBundleSchema.optional(),
  published: z.boolean(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
```

- [ ] **Step 7.3: Commit**

```bash
git add src/catalog/types.ts src/catalog/schemas.ts
git commit -m "feat: add catalog types and Zod schemas"
```

---

## Task 8: Files adapter + adapter selector + stubs

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/catalog/adapters/files.ts`
- Create: `/Users/gabrielmotta/jayjo/src/catalog/adapters/sanity.ts`
- Create: `/Users/gabrielmotta/jayjo/src/catalog/adapters/neon.ts`
- Create: `/Users/gabrielmotta/jayjo/src/catalog/index.ts`
- Create: `/Users/gabrielmotta/jayjo/src/lib/env.ts`
- Test: `/Users/gabrielmotta/jayjo/tests/unit/catalog-files.test.ts`

- [ ] **Step 8.1: Create `src/lib/env.ts`** (typed client env access)

```ts
export const env = {
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined,
  APP_URL: (import.meta.env.VITE_APP_URL as string) ?? "http://localhost:5173",
  CATALOG_ADAPTER:
    (import.meta.env.VITE_CATALOG_ADAPTER as "files" | "sanity" | "neon") ?? "files",
  PLAUSIBLE_DOMAIN: import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined,
};
```

- [ ] **Step 8.2: Create `src/catalog/adapters/files.ts`** — uses `import.meta.glob` so adding a content file auto-includes it.

```ts
import type { Artwork, ArtworkFilter, CatalogRepository, Gallery } from "@/catalog/types";

const artworkModules = import.meta.glob<{ artwork: Artwork }>("/src/content/artworks/*.ts", {
  eager: true,
});
const galleryModules = import.meta.glob<{ gallery: Gallery }>("/src/content/galleries/*.ts", {
  eager: true,
});

const allArtworks: Artwork[] = Object.values(artworkModules)
  .map((m) => m.artwork)
  .filter((a) => a.published)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const allGalleries: Gallery[] = Object.values(galleryModules)
  .map((m) => m.gallery)
  .filter((g) => g.published)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

function matches(a: Artwork, f: ArtworkFilter): boolean {
  if (f.kind && a.kind !== f.kind) return false;
  if (f.colorTags?.length && !f.colorTags.some((t) => a.colorTags.includes(t))) return false;
  if (f.sizeTags?.length && !f.sizeTags.some((t) => a.sizeTags.includes(t))) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    if (!a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
  }
  if (f.inStock) {
    const inStock = a.variants.some((v) => v.stock === undefined || v.stock > 0);
    if (!inStock) return false;
  }
  if (f.priceMin !== undefined && Math.min(...a.variants.map((v) => v.priceCents)) < f.priceMin)
    return false;
  if (f.priceMax !== undefined && Math.min(...a.variants.map((v) => v.priceCents)) > f.priceMax)
    return false;
  return true;
}

export const filesAdapter: CatalogRepository = {
  async listArtworks(filter) {
    if (!filter) return allArtworks;
    return allArtworks.filter((a) => matches(a, filter));
  },
  async getArtwork(slug) {
    return allArtworks.find((a) => a.slug === slug) ?? null;
  },
  async listGalleries() {
    return allGalleries;
  },
  async getGallery(slug) {
    return allGalleries.find((g) => g.slug === slug) ?? null;
  },
};
```

- [ ] **Step 8.3: Create `src/catalog/adapters/sanity.ts`** — stubbed, documented swap.

```ts
import type { CatalogRepository } from "@/catalog/types";

/**
 * Sanity adapter — stubbed.
 *
 * To activate:
 *   1. Install: npm i @sanity/client
 *   2. Set VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET in your env.
 *   3. Replace each method below with GROQ queries that return the same shapes.
 *   4. Set VITE_CATALOG_ADAPTER=sanity and redeploy.
 *
 * The CatalogRepository interface is the contract; nothing else in the app
 * changes when you swap adapters.
 */
export const sanityAdapter: CatalogRepository = {
  async listArtworks() {
    throw new Error("Sanity adapter not configured. Set VITE_CATALOG_ADAPTER=files or wire up Sanity.");
  },
  async getArtwork() {
    throw new Error("Sanity adapter not configured.");
  },
  async listGalleries() {
    throw new Error("Sanity adapter not configured.");
  },
  async getGallery() {
    throw new Error("Sanity adapter not configured.");
  },
};
```

- [ ] **Step 8.4: Create `src/catalog/adapters/neon.ts`** — stub.

```ts
import type { CatalogRepository } from "@/catalog/types";

/**
 * Neon adapter — stubbed.
 *
 * To activate: implement these methods against Postgres tables `artworks`,
 * `artwork_variants`, `galleries`, `gallery_items`. Run via Netlify Functions
 * proxy so the client never touches DB credentials. Set VITE_CATALOG_ADAPTER=neon.
 */
export const neonAdapter: CatalogRepository = {
  async listArtworks() {
    throw new Error("Neon adapter not configured.");
  },
  async getArtwork() {
    throw new Error("Neon adapter not configured.");
  },
  async listGalleries() {
    throw new Error("Neon adapter not configured.");
  },
  async getGallery() {
    throw new Error("Neon adapter not configured.");
  },
};
```

- [ ] **Step 8.5: Create `src/catalog/index.ts`** — selector.

```ts
import { env } from "@/lib/env";
import type { CatalogRepository } from "@/catalog/types";
import { filesAdapter } from "@/catalog/adapters/files";
import { sanityAdapter } from "@/catalog/adapters/sanity";
import { neonAdapter } from "@/catalog/adapters/neon";

let cached: CatalogRepository | null = null;

export function getCatalog(): CatalogRepository {
  if (cached) return cached;
  switch (env.CATALOG_ADAPTER) {
    case "sanity":
      cached = sanityAdapter;
      break;
    case "neon":
      cached = neonAdapter;
      break;
    case "files":
    default:
      cached = filesAdapter;
  }
  return cached;
}
```

- [ ] **Step 8.6: Write test for the files adapter** — uses an in-memory mock since the adapter reads from `import.meta.glob` at module load.

```ts
// tests/unit/catalog-files.test.ts
import { describe, it, expect } from "vitest";

// Smoke check: the files adapter module loads without throwing,
// and once content files exist (Task 9), listArtworks returns a non-empty array.
describe("files catalog adapter", () => {
  it("module imports without throwing", async () => {
    const { filesAdapter } = await import("@/catalog/adapters/files");
    expect(filesAdapter).toBeDefined();
    expect(typeof filesAdapter.listArtworks).toBe("function");
  });
});
```

- [ ] **Step 8.7: Run, confirm PASS**

Run: `npm test -- tests/unit/catalog-files.test.ts`
Expected: PASS.

- [ ] **Step 8.8: Commit**

```bash
git add src/catalog/ src/lib/env.ts tests/unit/catalog-files.test.ts
git commit -m "feat: add catalog repository with files adapter and pluggable Sanity/Neon stubs"
```

---

## Task 9: Sample content (artworks, galleries, pages) + placeholder images

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/content/artworks/evening-fig.ts`
- Create: `/Users/gabrielmotta/jayjo/src/content/artworks/olive-grove.ts`
- Create: `/Users/gabrielmotta/jayjo/src/content/artworks/cognac-still.ts`
- Create: `/Users/gabrielmotta/jayjo/src/content/artworks/parchment-bloom.ts`
- Create: `/Users/gabrielmotta/jayjo/src/content/galleries/warm-study.ts`
- Create: `/Users/gabrielmotta/jayjo/src/content/galleries/dusk-arrangement.ts`
- Create: `/Users/gabrielmotta/jayjo/src/content/pages/about.ts`
- Create: `/Users/gabrielmotta/jayjo/src/content/pages/work-with-us.ts`
- Create: `/Users/gabrielmotta/jayjo/public/art/<slug>/main.jpg` (8 placeholder images)
- Create: `/Users/gabrielmotta/jayjo/public/galleries/<slug>/hero.jpg` (2 hero images)

- [ ] **Step 9.1: Generate placeholder images** — for v1 dev, use solid-color JPGs sized 1200×1500 (4:5) that respect the palette. You can replace with real art later.

Run:
```bash
mkdir -p public/art/evening-fig public/art/olive-grove public/art/cognac-still public/art/parchment-bloom
mkdir -p public/galleries/warm-study public/galleries/dusk-arrangement
```

Drop placeholder JPGs into each folder named `main.jpg` (1200×1500). If you want quick programmatic placeholders, use a 1-line ImageMagick command per slug:
```bash
magick -size 1200x1500 xc:"#63242B" public/art/evening-fig/main.jpg
magick -size 1200x1500 xc:"#7E9268" public/art/olive-grove/main.jpg
magick -size 1200x1500 xc:"#A6541F" public/art/cognac-still/main.jpg
magick -size 1200x1500 xc:"#E8E2D3" public/art/parchment-bloom/main.jpg
magick -size 1600x1067 xc:"#8D3A2B" public/galleries/warm-study/hero.jpg
magick -size 1600x1067 xc:"#241A12" public/galleries/dusk-arrangement/hero.jpg
```

(If you don't have ImageMagick, any 1200×1500 JPG works. Real artwork drops in later.)

- [ ] **Step 9.2: Create `src/content/artworks/evening-fig.ts`**

```ts
import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "evening-fig",
  title: "Evening Fig",
  year: 2024,
  kind: "print",
  medium: "Giclée on cotton rag",
  description:
    "A dusky still-life in deep fig and cognac — quiet enough for a bedroom, rich enough to hold a corner.",
  story:
    "Painted at the close of a long summer. The fig sat on a parchment-coloured cloth for a week before I touched a brush.",
  colorTags: ["deep-fig", "cognac"],
  sizeTags: ["small", "medium", "large"],
  images: [{ src: "/art/evening-fig/main.jpg", alt: "Evening Fig — fig and cognac still-life", aspect: 4 / 5 }],
  variants: [
    { id: "a4", label: "A4 (8×11 in)", priceCents: 8500, stripePriceId: "price_placeholder_ef_a4" },
    { id: "a3", label: "A3 (11×16 in)", priceCents: 14500, stripePriceId: "price_placeholder_ef_a3" },
    { id: "a2", label: "A2 (16×23 in)", priceCents: 24500, stripePriceId: "price_placeholder_ef_a2" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2024-11-01",
};
```

- [ ] **Step 9.3: Create `src/content/artworks/olive-grove.ts`**

```ts
import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "olive-grove",
  title: "Olive Grove",
  year: 2024,
  kind: "original",
  medium: "Oil on linen, 24×36 in",
  description:
    "A late-afternoon olive grove rendered in moss and warm greige. A single, framed original.",
  colorTags: ["olive-moss", "warm-greige"],
  sizeTags: ["large"],
  images: [{ src: "/art/olive-grove/main.jpg", alt: "Olive Grove — olive trees in afternoon light", aspect: 4 / 5 }],
  variants: [
    {
      id: "original",
      label: "Original — 24×36 in (framed)",
      priceCents: 380000,
      stripePriceId: "price_placeholder_og_original",
      stock: 1,
    },
  ],
  shippingGroup: "original-oversized",
  published: true,
  publishedAt: "2024-10-15",
};
```

- [ ] **Step 9.4: Create `src/content/artworks/cognac-still.ts`**

```ts
import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "cognac-still",
  title: "Cognac Still",
  year: 2024,
  kind: "print",
  medium: "Giclée on cotton rag",
  description: "Warm cognac leather, walnut shadows, and a single bone-coloured bowl.",
  colorTags: ["cognac", "walnut"],
  sizeTags: ["small", "medium"],
  images: [{ src: "/art/cognac-still/main.jpg", alt: "Cognac Still — warm leather still-life", aspect: 4 / 5 }],
  variants: [
    { id: "a4", label: "A4 (8×11 in)", priceCents: 8500, stripePriceId: "price_placeholder_cs_a4" },
    { id: "a3", label: "A3 (11×16 in)", priceCents: 14500, stripePriceId: "price_placeholder_cs_a3" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2024-09-20",
};
```

- [ ] **Step 9.5: Create `src/content/artworks/parchment-bloom.ts`**

```ts
import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "parchment-bloom",
  title: "Parchment Bloom",
  year: 2023,
  kind: "print",
  medium: "Giclée on cotton rag",
  description: "Soft botanical study on a parchment ground. Designed to brighten a quiet corner.",
  colorTags: ["soft-parchment", "olive-moss"],
  sizeTags: ["small", "medium", "large"],
  images: [{ src: "/art/parchment-bloom/main.jpg", alt: "Parchment Bloom — botanical study on warm ivory", aspect: 4 / 5 }],
  variants: [
    { id: "a4", label: "A4 (8×11 in)", priceCents: 7500, stripePriceId: "price_placeholder_pb_a4" },
    { id: "a3", label: "A3 (11×16 in)", priceCents: 12500, stripePriceId: "price_placeholder_pb_a3" },
    { id: "a2", label: "A2 (16×23 in)", priceCents: 22500, stripePriceId: "price_placeholder_pb_a2" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2023-12-10",
};
```

- [ ] **Step 9.6: Create `src/content/galleries/warm-study.ts`**

```ts
import type { Gallery } from "@/catalog/types";

export const gallery: Gallery = {
  slug: "warm-study",
  title: "The Warm Study",
  description:
    "Three pieces in deep fig and cognac for a den or reading nook. Pairs with walnut and brass.",
  heroImage: {
    src: "/galleries/warm-study/hero.jpg",
    alt: "The Warm Study — three pieces arranged on a walnut wall",
    aspect: 3 / 2,
  },
  artworkSlugs: ["evening-fig", "cognac-still", "parchment-bloom"],
  bundle: { stripePriceId: "price_placeholder_warm_study_bundle", bundlePriceCents: 38500 },
  published: true,
  publishedAt: "2024-11-05",
};
```

- [ ] **Step 9.7: Create `src/content/galleries/dusk-arrangement.ts`**

```ts
import type { Gallery } from "@/catalog/types";

export const gallery: Gallery = {
  slug: "dusk-arrangement",
  title: "Dusk Arrangement",
  description:
    "A larger statement — an original anchored by two complementary prints. Built around olive and moss.",
  heroImage: {
    src: "/galleries/dusk-arrangement/hero.jpg",
    alt: "Dusk Arrangement — original olive grove flanked by two prints",
    aspect: 3 / 2,
  },
  artworkSlugs: ["olive-grove", "parchment-bloom", "evening-fig"],
  published: true,
  publishedAt: "2024-10-25",
};
```

- [ ] **Step 9.8: Create `src/content/pages/about.ts`**

```ts
export const aboutPage = {
  title: "About Studio JayJo",
  eyebrow: "The Studio",
  body: [
    "Studio JayJo is a one-painter studio working in warm pigments and quiet compositions.",
    "Every original is one-of-one. Prints are made on cotton rag in small editions.",
    "Wall Galleries are arrangements I'd hang in my own home — sold together, or as starting points for a custom curation.",
  ],
} as const;
```

- [ ] **Step 9.9: Create `src/content/pages/work-with-us.ts`**

```ts
export const workWithUsPage = {
  title: "Work with Studio JayJo",
  eyebrow: "Collaborations",
  body: [
    "I work with collectors, interior designers, and hospitality clients on custom curation.",
    "Tell me about your project — size, palette, timeline — and I'll come back with a starting point.",
  ],
  projectTypes: [
    { id: "collector", label: "Private collector" },
    { id: "designer", label: "Interior designer" },
    { id: "hospitality", label: "Hospitality" },
    { id: "other", label: "Other" },
  ],
} as const;
```

- [ ] **Step 9.10: Commit**

```bash
git add src/content/ public/art/ public/galleries/
git commit -m "feat: add sample artworks, galleries, and page copy"
```

---

## Task 10: catalog-validate build script

**Files:**
- Create: `/Users/gabrielmotta/jayjo/scripts/catalog-validate.ts`

- [ ] **Step 10.1: Create `scripts/catalog-validate.ts`**

```ts
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ArtworkSchema, GallerySchema } from "../src/catalog/schemas";

const ROOT = resolve(process.cwd());
const ART_DIR = join(ROOT, "src/content/artworks");
const GAL_DIR = join(ROOT, "src/content/galleries");

function walk(dir: string): string[] {
  return readdirSync(dir)
    .map((f) => join(dir, f))
    .filter((p) => statSync(p).isFile() && p.endsWith(".ts"));
}

async function loadAndValidate<T>(
  files: string[],
  exportName: string,
  schema: { parse: (x: unknown) => T },
  kind: string,
): Promise<number> {
  let ok = 0;
  for (const f of files) {
    const mod: Record<string, unknown> = await import(pathToFileURL(f).href);
    const data = mod[exportName];
    if (!data) {
      console.error(`✗ ${kind} ${f}: missing export "${exportName}"`);
      process.exitCode = 1;
      continue;
    }
    try {
      schema.parse(data);
      ok++;
      console.log(`✓ ${kind}: ${f.replace(ROOT + "/", "")}`);
    } catch (e) {
      console.error(`✗ ${kind} ${f}:`, e);
      process.exitCode = 1;
    }
  }
  return ok;
}

(async () => {
  const arts = await loadAndValidate(walk(ART_DIR), "artwork", ArtworkSchema, "artwork");
  const gals = await loadAndValidate(walk(GAL_DIR), "gallery", GallerySchema, "gallery");
  console.log(`\nValidated ${arts} artworks and ${gals} galleries.`);
  if (process.exitCode) {
    console.error("Catalog validation FAILED.");
  } else {
    console.log("Catalog validation OK.");
  }
})();
```

- [ ] **Step 10.2: Run the validator**

Run: `npm run catalog:validate`
Expected: prints `✓` for all artwork and gallery files, ends with `Catalog validation OK.`

- [ ] **Step 10.3: Verify it fails on bad data** (temporary smoke check)

Manually edit `src/content/artworks/evening-fig.ts` to set `year: 1800` (out of range). Re-run.
Expected: prints `✗ artwork ... year ...`, exits non-zero. Revert the edit.

- [ ] **Step 10.4: Commit**

```bash
git add scripts/catalog-validate.ts
git commit -m "feat: add catalog-validate script for build-time content checks"
```

---

## Task 11: UI primitives (Button, IconButton, Input, Select, Checkbox, Skeleton, Section, EyebrowHeading, Price)

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/lib/cn.ts`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/Button.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/IconButton.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/Input.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/Select.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/Checkbox.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/Skeleton.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/Section.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/EyebrowHeading.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/Price.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/ui/Toaster.tsx`

- [ ] **Step 11.1: Create `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 11.2: Create `src/components/ui/Button.tsx`**

```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center font-medium transition rounded-md focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-bg hover:bg-burnt shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
  ghost: "bg-transparent text-text hover:bg-bg-elevated",
  link: "text-text underline-offset-4 hover:underline",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", fullWidth, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
});
```

- [ ] **Step 11.3: Create `src/components/ui/IconButton.tsx`**

```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-elevated hover:text-text focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
```

- [ ] **Step 11.4: Create `src/components/ui/Input.tsx`**

```tsx
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className={cn(
          "block w-full rounded-md border bg-bg-elevated px-3 py-2.5 text-text outline-none transition focus:border-accent",
          error ? "border-fig" : "border-border",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-fig">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});
```

- [ ] **Step 11.5: Create `src/components/ui/Select.tsx`** (native; we'll add Radix Select later if needed)

```tsx
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, children, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm text-text">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          "block w-full appearance-none rounded-md border bg-bg-elevated px-3 py-2.5 text-text outline-none focus:border-accent",
          error ? "border-fig" : "border-border",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-fig">{error}</p>}
    </div>
  );
});
```

- [ ] **Step 11.6: Create `src/components/ui/Checkbox.tsx`**

```tsx
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className="inline-flex cursor-pointer items-center gap-2">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-border text-accent focus:ring-accent",
          className,
        )}
        {...props}
      />
      <span className="text-sm text-text">{label}</span>
    </label>
  );
});
```

- [ ] **Step 11.7: Create `src/components/ui/Skeleton.tsx`** — 200ms delay built in.

```tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  delayMs = 200,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { delayMs?: number }) {
  const [show, setShow] = useState(delayMs === 0);
  useEffect(() => {
    if (delayMs === 0) return;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  if (!show) return null;
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-bg-elevated shimmer",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 11.8: Create `src/components/ui/Section.tsx`**

```tsx
import { cn } from "@/lib/cn";

export function Section({
  className,
  children,
  as: Tag = "section",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: keyof JSX.IntrinsicElements }) {
  return (
    <Tag className={cn("container-page py-16 md:py-24", className)} {...props}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 11.9: Create `src/components/ui/EyebrowHeading.tsx`**

```tsx
import { cn } from "@/lib/cn";

interface EyebrowHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  level?: 1 | 2 | 3;
  className?: string;
}

export function EyebrowHeading({
  eyebrow,
  title,
  description,
  level = 2,
  className,
}: EyebrowHeadingProps) {
  const Heading = (`h${level}` as keyof JSX.IntrinsicElements);
  return (
    <div className={cn("max-w-prose space-y-3", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading className="font-display text-3xl text-text md:text-4xl lg:text-5xl">{title}</Heading>
      {description && <p className="text-text-muted">{description}</p>}
    </div>
  );
}
```

- [ ] **Step 11.10: Create `src/components/ui/Price.tsx`**

```tsx
import { formatPrice, formatPriceRange } from "@/lib/currency";
import { cn } from "@/lib/cn";

interface PriceProps {
  cents: number | number[];
  currency?: string;
  className?: string;
}

export function Price({ cents, currency = "USD", className }: PriceProps) {
  const text = Array.isArray(cents) ? formatPriceRange(cents, currency) : formatPrice(cents, currency);
  return <span className={cn("font-sans tabular-nums text-text", className)}>{text}</span>;
}
```

- [ ] **Step 11.11: Create `src/components/ui/Toaster.tsx`**

```tsx
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      theme="light"
      toastOptions={{
        className: "rounded-md border border-border bg-bg-elevated text-text",
      }}
    />
  );
}
```

- [ ] **Step 11.12: Commit**

```bash
git add src/lib/cn.ts src/components/ui/
git commit -m "feat: add UI primitives (Button, Input, Select, Checkbox, Skeleton, Section, Eyebrow, Price, Toaster)"
```

---

## Task 12: Motion primitives (Framer Motion)

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/components/motion/Reveal.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/motion/RevealStagger.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/motion/Parallax.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/motion/HoverLift.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/motion/PageTransition.tsx`

- [ ] **Step 12.1: Create `Reveal.tsx`**

```tsx
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 12.2: Create `RevealStagger.tsx`**

```tsx
import { motion, useReducedMotion } from "framer-motion";

interface RevealStaggerProps {
  children: React.ReactNode;
  staggerMs?: number;
  className?: string;
}

export function RevealStagger({ children, staggerMs = 80, className }: RevealStaggerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerMs / 1000 } },
      }}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={
                reduce
                  ? {}
                  : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }
              }
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
```

- [ ] **Step 12.3: Create `Parallax.tsx`**

```tsx
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ParallaxProps {
  children: React.ReactNode;
  intensity?: "subtle" | "medium";
  className?: string;
}

export function Parallax({ children, intensity = "subtle", className }: ParallaxProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const range = intensity === "subtle" ? [-8, 8] : [-20, 20];
  const y = useTransform(scrollYProgress, [0, 1], range);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
```

- [ ] **Step 12.4: Create `HoverLift.tsx`**

```tsx
import { motion, useReducedMotion } from "framer-motion";

export function HoverLift({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 12.5: Create `PageTransition.tsx`**

```tsx
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 12.6: Commit**

```bash
git add src/components/motion/
git commit -m "feat: add Framer Motion primitives (Reveal, RevealStagger, Parallax, HoverLift, PageTransition)"
```

---

## Task 13: Error boundary + RouteError + PageSkeleton

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/components/errors/ErrorBoundary.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/errors/RouteError.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/layout/PageSkeleton.tsx`

- [ ] **Step 13.1: Create `ErrorBoundary.tsx`**

```tsx
import { Component } from "react";

interface State { error: Error | null }
interface Props {
  children: React.ReactNode;
  fallback: (error: Error, reset: () => void) => React.ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset);
    return this.props.children;
  }
}
```

- [ ] **Step 13.2: Create `RouteError.tsx`**

```tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

interface RouteErrorProps {
  error: Error;
  reset: () => void;
}

export function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <h2 className="font-display text-3xl text-text">Something didn't load.</h2>
      <p className="max-w-prose text-text-muted">
        {error.message || "We hit a snag rendering this page. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
        <Button asChild variant="ghost" onClick={() => (window.location.href = "/")}>
          Go home
        </Button>
        <a
          href="mailto:hello@studiojayjo.com"
          className="inline-flex h-11 items-center text-sm text-text underline-offset-4 hover:underline"
        >
          Contact us
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 13.3: Create `PageSkeleton.tsx`**

```tsx
import { Skeleton } from "@/components/ui/Skeleton";

export function PageSkeleton() {
  return (
    <div className="container-page py-16 md:py-24">
      <Skeleton className="mb-4 h-8 w-40" />
      <Skeleton className="mb-10 h-12 w-2/3" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 13.4: Commit**

```bash
git add src/components/errors/ src/components/layout/PageSkeleton.tsx
git commit -m "feat: add error boundary, route error fallback, and page skeleton"
```

---

## Task 14: Favorites store (local, guest-only for now)

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/store/favorites.ts`
- Test: `/Users/gabrielmotta/jayjo/tests/unit/favorites-store.test.ts`

- [ ] **Step 14.1: Write failing test**

```ts
// tests/unit/favorites-store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useFavorites } from "@/store/favorites";

describe("favorites store", () => {
  beforeEach(() => {
    localStorage.clear();
    useFavorites.setState({ slugs: [] });
  });

  it("toggles a slug on and off", () => {
    const { toggle, isFavorite } = useFavorites.getState();
    toggle("evening-fig");
    expect(isFavorite("evening-fig")).toBe(true);
    toggle("evening-fig");
    expect(isFavorite("evening-fig")).toBe(false);
  });

  it("doesn't duplicate when toggling on twice via mergeSlugs", () => {
    useFavorites.getState().mergeSlugs(["a", "a", "b"]);
    expect(useFavorites.getState().slugs.sort()).toEqual(["a", "b"]);
  });
});
```

- [ ] **Step 14.2: Run, confirm FAIL**

Run: `npm test -- tests/unit/favorites-store.test.ts`

- [ ] **Step 14.3: Implement `src/store/favorites.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  slugs: string[];
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  mergeSlugs: (incoming: string[]) => void;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) =>
          s.slugs.includes(slug)
            ? { slugs: s.slugs.filter((x) => x !== slug) }
            : { slugs: [...s.slugs, slug] },
        ),
      isFavorite: (slug) => get().slugs.includes(slug),
      mergeSlugs: (incoming) =>
        set((s) => ({ slugs: Array.from(new Set([...s.slugs, ...incoming])) })),
      clear: () => set({ slugs: [] }),
    }),
    { name: "studio-jayjo-favorites" },
  ),
);
```

- [ ] **Step 14.4: Run, confirm PASS**

Run: `npm test -- tests/unit/favorites-store.test.ts`

- [ ] **Step 14.5: Commit**

```bash
git add src/store/favorites.ts tests/unit/favorites-store.test.ts
git commit -m "feat: add favorites store with localStorage persistence"
```

---

## Task 15: ImageWithBlur + ArtworkCard + ArtworkCardSkeleton

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/components/product/ImageWithBlur.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/product/ArtworkCard.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/product/ArtworkCardSkeleton.tsx`
- Test: `/Users/gabrielmotta/jayjo/tests/unit/ArtworkCard.test.tsx`

- [ ] **Step 15.1: Create `ImageWithBlur.tsx`** — v1: native lazy + fade-in; AVIF/WebP/LQIP pipeline added in Plan 4.

```tsx
import { useState } from "react";
import { cn } from "@/lib/cn";

interface ImageWithBlurProps {
  src: string;
  alt: string;
  aspect?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function ImageWithBlur({
  src,
  alt,
  aspect = 4 / 5,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: ImageWithBlurProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-bg-elevated", className)} style={{ aspectRatio: aspect }}>
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
```

- [ ] **Step 15.2: Create `ArtworkCardSkeleton.tsx`**

```tsx
import { Skeleton } from "@/components/ui/Skeleton";

export function ArtworkCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full" delayMs={0} />
      <Skeleton className="h-5 w-2/3" delayMs={0} />
      <Skeleton className="h-4 w-1/3" delayMs={0} />
    </div>
  );
}
```

- [ ] **Step 15.3: Write failing test for ArtworkCard**

```tsx
// tests/unit/ArtworkCard.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ArtworkCard } from "@/components/product/ArtworkCard";
import { useFavorites } from "@/store/favorites";
import type { Artwork } from "@/catalog/types";

const sample: Artwork = {
  slug: "evening-fig",
  title: "Evening Fig",
  year: 2024,
  kind: "print",
  medium: "Giclée",
  description: "...",
  colorTags: ["deep-fig"],
  sizeTags: ["small"],
  images: [{ src: "/art/evening-fig/main.jpg", alt: "alt", aspect: 4 / 5 }],
  variants: [{ id: "a4", label: "A4", priceCents: 8500, stripePriceId: "x" }],
  shippingGroup: "print",
  published: true,
  publishedAt: "2024-11-01",
};

describe("ArtworkCard", () => {
  beforeEach(() => useFavorites.setState({ slugs: [] }));

  it("renders title and price", () => {
    render(
      <MemoryRouter>
        <ArtworkCard artwork={sample} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Evening Fig")).toBeInTheDocument();
    expect(screen.getByText("$85.00")).toBeInTheDocument();
  });

  it("toggles favorite on heart click", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ArtworkCard artwork={sample} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: /favorite/i }));
    expect(useFavorites.getState().isFavorite("evening-fig")).toBe(true);
  });
});
```

- [ ] **Step 15.4: Run, confirm FAIL**

Run: `npm test -- tests/unit/ArtworkCard.test.tsx`

- [ ] **Step 15.5: Implement `ArtworkCard.tsx`**

```tsx
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Artwork } from "@/catalog/types";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { Price } from "@/components/ui/Price";
import { HoverLift } from "@/components/motion/HoverLift";
import { useFavorites } from "@/store/favorites";
import { cn } from "@/lib/cn";

export function ArtworkCard({ artwork, priority = false }: { artwork: Artwork; priority?: boolean }) {
  const isFav = useFavorites((s) => s.slugs.includes(artwork.slug));
  const toggle = useFavorites((s) => s.toggle);
  const main = artwork.images[0];
  const prices = artwork.variants.map((v) => v.priceCents);
  return (
    <HoverLift className="group">
      <article className="relative">
        <Link to={`/shop/${artwork.slug}`} className="block">
          <ImageWithBlur src={main.src} alt={main.alt} aspect={main.aspect} priority={priority} />
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(artwork.slug);
          }}
          aria-label={isFav ? `Remove ${artwork.title} from favorites` : `Favorite ${artwork.title}`}
          aria-pressed={isFav}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-bg/80 backdrop-blur transition hover:bg-bg"
        >
          <Heart
            size={16}
            className={cn("transition", isFav ? "fill-fig text-fig" : "text-text-muted")}
          />
        </button>
        <div className="mt-3 space-y-1">
          <Link to={`/shop/${artwork.slug}`}>
            <h3 className="font-display text-lg text-text transition group-hover:text-accent">
              {artwork.title}
            </h3>
          </Link>
          <Price cents={prices} className="text-sm text-text-muted" />
        </div>
      </article>
    </HoverLift>
  );
}
```

- [ ] **Step 15.6: Run, confirm PASS**

Run: `npm test -- tests/unit/ArtworkCard.test.tsx`

- [ ] **Step 15.7: Commit**

```bash
git add src/components/product/ tests/unit/ArtworkCard.test.tsx
git commit -m "feat: add ArtworkCard, ArtworkCardSkeleton, ImageWithBlur"
```

---

## Task 16: ArtworkGrid + ArtworkFilters + VariantPicker

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/components/product/ArtworkGrid.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/product/ArtworkFilters.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/product/VariantPicker.tsx`

- [ ] **Step 16.1: Create `ArtworkGrid.tsx`**

```tsx
import type { Artwork } from "@/catalog/types";
import { ArtworkCard } from "./ArtworkCard";
import { ArtworkCardSkeleton } from "./ArtworkCardSkeleton";
import { RevealStagger } from "@/components/motion/RevealStagger";

export function ArtworkGrid({
  artworks,
  loading,
  emptyState,
}: {
  artworks: Artwork[];
  loading?: boolean;
  emptyState?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArtworkCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (artworks.length === 0) {
    return (
      <div className="rounded-md border border-border bg-bg-elevated p-10 text-center text-text-muted">
        {emptyState ?? "Nothing matches these filters."}
      </div>
    );
  }
  return (
    <RevealStagger
      staggerMs={80}
      className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
    >
      {artworks.map((a, i) => (
        <ArtworkCard key={a.slug} artwork={a} priority={i < 3} />
      ))}
    </RevealStagger>
  );
}
```

- [ ] **Step 16.2: Create `ArtworkFilters.tsx`**

```tsx
import type { ArtworkFilter } from "@/catalog/types";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

interface FiltersProps {
  value: ArtworkFilter;
  onChange: (next: ArtworkFilter) => void;
}

const COLORS = [
  { id: "deep-fig", label: "Deep Fig" },
  { id: "olive-moss", label: "Olive Moss" },
  { id: "cognac", label: "Cognac" },
  { id: "warm-greige", label: "Warm Greige" },
  { id: "soft-parchment", label: "Soft Parchment" },
];
const SIZES = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

export function ArtworkFilters({ value, onChange }: FiltersProps) {
  const toggle = (key: "colorTags" | "sizeTags", id: string) => {
    const list = value[key] ?? [];
    onChange({
      ...value,
      [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    });
  };
  return (
    <aside className="space-y-8">
      <Input
        label="Search"
        placeholder="Search by title"
        value={value.query ?? ""}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
      />
      <div>
        <p className="eyebrow mb-3">Kind</p>
        <div className="space-y-2">
          {(["original", "print"] as const).map((k) => (
            <Checkbox
              key={k}
              label={k === "original" ? "Originals" : "Prints"}
              checked={value.kind === k}
              onChange={(e) => onChange({ ...value, kind: e.target.checked ? k : undefined })}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-3">Color</p>
        <div className="space-y-2">
          {COLORS.map((c) => (
            <Checkbox
              key={c.id}
              label={c.label}
              checked={value.colorTags?.includes(c.id) ?? false}
              onChange={() => toggle("colorTags", c.id)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-3">Size</p>
        <div className="space-y-2">
          {SIZES.map((s) => (
            <Checkbox
              key={s.id}
              label={s.label}
              checked={value.sizeTags?.includes(s.id) ?? false}
              onChange={() => toggle("sizeTags", s.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 16.3: Create `VariantPicker.tsx`**

```tsx
import { useState } from "react";
import type { Artwork, ArtworkVariant } from "@/catalog/types";
import { Select } from "@/components/ui/Select";
import { Price } from "@/components/ui/Price";

interface VariantPickerProps {
  artwork: Artwork;
  onChange?: (variant: ArtworkVariant) => void;
}

export function VariantPicker({ artwork, onChange }: VariantPickerProps) {
  const [selected, setSelected] = useState(artwork.variants[0]);
  const isOriginal = artwork.variants.length === 1 && artwork.kind === "original";
  return (
    <div className="space-y-3">
      {!isOriginal ? (
        <Select
          label="Size"
          value={selected.id}
          onChange={(e) => {
            const v = artwork.variants.find((v) => v.id === e.target.value);
            if (v) {
              setSelected(v);
              onChange?.(v);
            }
          }}
        >
          {artwork.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </Select>
      ) : (
        <p className="text-sm text-text-muted">{selected.label}</p>
      )}
      <Price cents={selected.priceCents} className="font-display text-2xl" />
      {selected.stock !== undefined && selected.stock <= 0 && (
        <p className="text-sm text-fig">Sold</p>
      )}
    </div>
  );
}
```

- [ ] **Step 16.4: Commit**

```bash
git add src/components/product/ArtworkGrid.tsx src/components/product/ArtworkFilters.tsx src/components/product/VariantPicker.tsx
git commit -m "feat: add ArtworkGrid, ArtworkFilters, and VariantPicker"
```

---

## Task 17: Gallery components (GalleryCard + skeleton + GalleryHero + GalleryPieceList)

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/components/gallery/GalleryCard.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/gallery/GalleryCardSkeleton.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/gallery/GalleryHero.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/gallery/GalleryPieceList.tsx`

- [ ] **Step 17.1: Create `GalleryCard.tsx`**

```tsx
import { Link } from "react-router-dom";
import type { Gallery } from "@/catalog/types";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { HoverLift } from "@/components/motion/HoverLift";

export function GalleryCard({ gallery }: { gallery: Gallery }) {
  return (
    <HoverLift className="group">
      <Link to={`/galleries/${gallery.slug}`} className="block">
        <ImageWithBlur src={gallery.heroImage.src} alt={gallery.heroImage.alt} aspect={gallery.heroImage.aspect} />
        <div className="mt-4 space-y-1">
          <p className="eyebrow">Wall Gallery</p>
          <h3 className="font-display text-2xl text-text transition group-hover:text-accent">
            {gallery.title}
          </h3>
          <p className="text-text-muted">{gallery.description}</p>
        </div>
      </Link>
    </HoverLift>
  );
}
```

- [ ] **Step 17.2: Create `GalleryCardSkeleton.tsx`**

```tsx
import { Skeleton } from "@/components/ui/Skeleton";

export function GalleryCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/2] w-full" delayMs={0} />
      <Skeleton className="h-4 w-24" delayMs={0} />
      <Skeleton className="h-7 w-2/3" delayMs={0} />
      <Skeleton className="h-4 w-full" delayMs={0} />
    </div>
  );
}
```

- [ ] **Step 17.3: Create `GalleryHero.tsx`**

```tsx
import type { Gallery } from "@/catalog/types";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { Parallax } from "@/components/motion/Parallax";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";

export function GalleryHero({ gallery }: { gallery: Gallery }) {
  return (
    <section className="container-page py-12">
      <Parallax intensity="subtle">
        <ImageWithBlur
          src={gallery.heroImage.src}
          alt={gallery.heroImage.alt}
          aspect={gallery.heroImage.aspect}
          priority
          className="rounded-lg"
        />
      </Parallax>
      <div className="mt-10 max-w-prose">
        <EyebrowHeading eyebrow="Wall Gallery" title={gallery.title} description={gallery.description} level={1} />
      </div>
    </section>
  );
}
```

- [ ] **Step 17.4: Create `GalleryPieceList.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { Artwork, Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";

export function GalleryPieceList({ gallery }: { gallery: Gallery }) {
  const [pieces, setPieces] = useState<Artwork[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const catalog = getCatalog();
      const all = await Promise.all(gallery.artworkSlugs.map((s) => catalog.getArtwork(s)));
      if (cancelled) return;
      setPieces(all.filter((a): a is Artwork => !!a));
    })();
    return () => {
      cancelled = true;
    };
  }, [gallery.artworkSlugs]);

  return <ArtworkGrid artworks={pieces ?? []} loading={pieces === null} />;
}
```

- [ ] **Step 17.5: Commit**

```bash
git add src/components/gallery/
git commit -m "feat: add gallery components (Card, Skeleton, Hero, PieceList)"
```

---

## Task 18: Header + Footer + RootLayout

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/components/layout/Header.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/layout/Footer.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/layout/RootLayout.tsx`

- [ ] **Step 18.1: Create `Header.tsx`**

```tsx
import { Link, NavLink } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useFavorites } from "@/store/favorites";
import { cn } from "@/lib/cn";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/galleries", label: "Wall Galleries" },
  { to: "/about", label: "About" },
  { to: "/work-with-us", label: "Work With Us" },
];

export function Header() {
  const favCount = useFavorites((s) => s.slugs.length);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="font-display text-xl tracking-tight text-text">
          Studio JayJo
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "text-sm text-text-muted transition hover:text-text",
                  isActive && "text-text",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            to="/favorites"
            aria-label={`Favorites${favCount ? ` (${favCount})` : ""}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated hover:text-text"
          >
            <Heart size={18} />
            {favCount > 0 && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-fig px-1 text-xs text-bg"
              >
                {favCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated hover:text-text"
          >
            <ShoppingBag size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 18.2: Create `Footer.tsx`**

```tsx
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-bg-elevated">
      <div className="container-page grid grid-cols-1 gap-12 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="font-display text-2xl text-text">Studio JayJo</p>
          <p className="max-w-prose text-text-muted">
            Original art, prints, and curated wall galleries — made in warm pigments and quiet
            compositions.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const email = String(data.get("email") ?? "");
              if (!email) return;
              // Newsletter backend wires in Plan 4 — Task: newsletter form
              toast.success("Thanks for joining. We'll be in touch.");
              (e.currentTarget as HTMLFormElement).reset();
            }}
            className="flex max-w-sm gap-2"
          >
            <Input name="email" type="email" required placeholder="you@studio.com" aria-label="Email" />
            <Button type="submit" variant="primary" size="md">
              Join
            </Button>
          </form>
        </div>
        <nav aria-label="Shop">
          <p className="eyebrow mb-3">Shop</p>
          <ul className="space-y-2 text-text-muted">
            <li><Link to="/shop" className="hover:text-text">All</Link></li>
            <li><Link to="/shop?kind=original" className="hover:text-text">Originals</Link></li>
            <li><Link to="/shop?kind=print" className="hover:text-text">Prints</Link></li>
            <li><Link to="/galleries" className="hover:text-text">Wall Galleries</Link></li>
          </ul>
        </nav>
        <nav aria-label="Studio">
          <p className="eyebrow mb-3">Studio</p>
          <ul className="space-y-2 text-text-muted">
            <li><Link to="/about" className="hover:text-text">About</Link></li>
            <li><Link to="/work-with-us" className="hover:text-text">Work With Us</Link></li>
            <li><a href="mailto:hello@studiojayjo.com" className="hover:text-text">hello@studiojayjo.com</a></li>
          </ul>
        </nav>
        <nav aria-label="Follow">
          <p className="eyebrow mb-3">Follow</p>
          <ul className="space-y-2 text-text-muted">
            <li>
              <a href="https://instagram.com/studiojayjo" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-text">
                <Instagram size={16} /> Instagram
              </a>
            </li>
            <li>
              <a href="https://pinterest.com/studiojayjo" target="_blank" rel="noreferrer" className="hover:text-text">
                Pinterest
              </a>
            </li>
            <li>
              <a href="https://tiktok.com/@studiojayjo" target="_blank" rel="noreferrer" className="hover:text-text">
                TikTok
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-text-muted md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Studio JayJo</p>
          <p>Made with warm pigments.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 18.3: Create `RootLayout.tsx`**

```tsx
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/Toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageTransition } from "@/components/motion/PageTransition";

export function RootLayout() {
  return (
    <ThemeProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <Toaster />
    </ThemeProvider>
  );
}
```

- [ ] **Step 18.4: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/Footer.tsx src/components/layout/RootLayout.tsx
git commit -m "feat: add Header, Footer, and RootLayout with theme provider and page transitions"
```

---

## Task 19: Routes — Home, Shop, ArtworkDetail, Galleries, GalleryDetail, Favorites, About, WorkWithUs, NotFound

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/routes/Home.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/Shop.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/ArtworkDetail.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/Galleries.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/GalleryDetail.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/Favorites.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/About.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/WorkWithUs.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/NotFound.tsx`

- [ ] **Step 19.1: Create `Home.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Artwork, Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { GalleryCardSkeleton } from "@/components/gallery/GalleryCardSkeleton";
import { Reveal } from "@/components/motion/Reveal";

export default function Home() {
  const [art, setArt] = useState<Artwork[] | null>(null);
  const [galleries, setGalleries] = useState<Gallery[] | null>(null);
  useEffect(() => {
    const c = getCatalog();
    c.listArtworks().then((a) => setArt(a.slice(0, 6)));
    c.listGalleries().then((g) => setGalleries(g.slice(0, 2)));
  }, []);

  return (
    <>
      <Section className="pt-12 md:pt-20">
        <div className="grid items-end gap-12 md:grid-cols-2">
          <Reveal>
            <EyebrowHeading
              eyebrow="Studio JayJo"
              title="Original art and curated wall galleries."
              description="Made in warm pigments and quiet compositions. Originals are one-of-one. Prints are made on cotton rag in small editions."
              level={1}
            />
            <div className="mt-8 flex gap-3">
              <Button asChild>
                <Link to="/shop">Shop the studio</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/galleries">Wall Galleries</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="aspect-[4/5] rounded-lg bg-burnt/15" />
          </Reveal>
        </div>
      </Section>

      <Section>
        <EyebrowHeading eyebrow="Shop By" title="Find something quiet for your wall." />
        <div className="mt-10">
          <ArtworkGrid artworks={art ?? []} loading={art === null} />
        </div>
        <div className="mt-10 flex justify-center">
          <Button variant="ghost" asChild><Link to="/shop">See everything</Link></Button>
        </div>
      </Section>

      <Section>
        <EyebrowHeading eyebrow="Wall Galleries" title="Shop the arrangements." />
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {galleries
            ? galleries.map((g) => <GalleryCard key={g.slug} gallery={g} />)
            : Array.from({ length: 2 }).map((_, i) => <GalleryCardSkeleton key={i} />)}
        </div>
      </Section>

      <section className="mt-20 bg-fig text-bg">
        <div className="container-page grid gap-8 py-20 md:grid-cols-[2fr_1fr] md:items-center">
          <Reveal>
            <p className="eyebrow text-bg/70">Work with Studio JayJo</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Collaborations with collectors, designers, and hospitality clients.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <Button variant="primary" size="lg" asChild>
              <Link to="/work-with-us">Tell us about your project</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 19.2: Create `Shop.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Artwork, ArtworkFilter } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { ArtworkFilters } from "@/components/product/ArtworkFilters";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";

export default function Shop() {
  const [params] = useSearchParams();
  const initialKind = params.get("kind") as Artwork["kind"] | null;
  const [filter, setFilter] = useState<ArtworkFilter>({ kind: initialKind ?? undefined });
  const [results, setResults] = useState<Artwork[] | null>(null);

  useEffect(() => {
    setResults(null);
    getCatalog()
      .listArtworks(filter)
      .then(setResults);
  }, [filter]);

  return (
    <Section>
      <EyebrowHeading eyebrow="Shop" title="The full studio." description="Originals and prints, sorted by latest." />
      <div className="mt-12 grid gap-12 lg:grid-cols-[16rem_1fr]">
        <ArtworkFilters value={filter} onChange={setFilter} />
        <ArtworkGrid artworks={results ?? []} loading={results === null} />
      </div>
    </Section>
  );
}
```

- [ ] **Step 19.3: Create `ArtworkDetail.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Artwork } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { VariantPicker } from "@/components/product/VariantPicker";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { Heart } from "lucide-react";
import { useFavorites } from "@/store/favorites";
import { Reveal } from "@/components/motion/Reveal";

export default function ArtworkDetail() {
  const { slug = "" } = useParams();
  const [artwork, setArtwork] = useState<Artwork | null | undefined>(undefined);
  const isFav = useFavorites((s) => s.slugs.includes(slug));
  const toggle = useFavorites((s) => s.toggle);

  useEffect(() => {
    setArtwork(undefined);
    getCatalog().getArtwork(slug).then((a) => setArtwork(a));
  }, [slug]);

  if (artwork === undefined) {
    return (
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full" delayMs={0} />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" delayMs={0} />
            <Skeleton className="h-5 w-1/3" delayMs={0} />
            <Skeleton className="h-32 w-full" delayMs={0} />
          </div>
        </div>
      </Section>
    );
  }

  if (artwork === null) {
    return (
      <Section>
        <h1 className="font-display text-3xl">We couldn't find that piece.</h1>
        <p className="mt-2 text-text-muted">It may have been moved or sold.</p>
        <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
      </Section>
    );
  }

  const main = artwork.images[0];

  return (
    <Section>
      <div className="grid gap-12 md:grid-cols-2">
        <Reveal>
          <ImageWithBlur src={main.src} alt={main.alt} aspect={main.aspect} priority className="rounded-lg" />
          {artwork.images.slice(1).length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {artwork.images.slice(1).map((img, i) => (
                <ImageWithBlur key={i} src={img.src} alt={img.alt} aspect={img.aspect} className="rounded" />
              ))}
            </div>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow">{artwork.kind === "original" ? "Original" : "Print"}</p>
          <h1 className="mt-2 font-display text-4xl text-text md:text-5xl">{artwork.title}</h1>
          <p className="mt-2 text-text-muted">{artwork.medium}</p>
          <div className="mt-8 max-w-prose space-y-4 text-text">
            <p>{artwork.description}</p>
            {artwork.story && <p className="text-text-muted">{artwork.story}</p>}
          </div>
          <div className="mt-10 space-y-4">
            <VariantPicker artwork={artwork} />
            <div className="flex gap-3">
              <Button size="lg" /* checkout wired in Plan 2 */>Add to cart</Button>
              <button
                type="button"
                onClick={() => toggle(artwork.slug)}
                aria-pressed={isFav}
                aria-label={isFav ? "Remove from favorites" : "Favorite this piece"}
                className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border text-text-muted transition hover:text-text"
              >
                <Heart size={18} className={isFav ? "fill-fig text-fig" : ""} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
```

- [ ] **Step 19.4: Create `Galleries.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { GalleryCardSkeleton } from "@/components/gallery/GalleryCardSkeleton";

export default function Galleries() {
  const [galleries, setGalleries] = useState<Gallery[] | null>(null);
  useEffect(() => {
    getCatalog().listGalleries().then(setGalleries);
  }, []);
  return (
    <Section>
      <EyebrowHeading eyebrow="Wall Galleries" title="Curated arrangements." description="Browse the lookbooks, or shop the bundle." />
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {galleries
          ? galleries.map((g) => <GalleryCard key={g.slug} gallery={g} />)
          : Array.from({ length: 2 }).map((_, i) => <GalleryCardSkeleton key={i} />)}
      </div>
    </Section>
  );
}
```

- [ ] **Step 19.5: Create `GalleryDetail.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { GalleryPieceList } from "@/components/gallery/GalleryPieceList";
import { Price } from "@/components/ui/Price";
import { PageSkeleton } from "@/components/layout/PageSkeleton";

export default function GalleryDetail() {
  const { slug = "" } = useParams();
  const [gallery, setGallery] = useState<Gallery | null | undefined>(undefined);

  useEffect(() => {
    setGallery(undefined);
    getCatalog().getGallery(slug).then(setGallery);
  }, [slug]);

  if (gallery === undefined) return <PageSkeleton />;
  if (gallery === null) {
    return (
      <Section>
        <h1 className="font-display text-3xl">Gallery not found.</h1>
        <Button asChild className="mt-6"><Link to="/galleries">All galleries</Link></Button>
      </Section>
    );
  }

  return (
    <>
      <GalleryHero gallery={gallery} />
      <Section as="section">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <p className="eyebrow">Pieces in this gallery</p>
          {gallery.bundle && (
            <div className="flex items-center gap-4">
              <Price cents={gallery.bundle.bundlePriceCents} className="font-display text-2xl" />
              <Button>Buy the whole gallery</Button>
            </div>
          )}
        </div>
        <GalleryPieceList gallery={gallery} />
      </Section>
      <section className="bg-bg-elevated">
        <div className="container-page grid items-center gap-6 py-16 md:grid-cols-[2fr_1fr]">
          <div>
            <p className="eyebrow">Want something custom?</p>
            <h2 className="mt-3 font-display text-3xl">Let's curate a Wall Gallery for your space.</h2>
          </div>
          <Button asChild size="lg"><Link to="/work-with-us">Start a project</Link></Button>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 19.6: Create `Favorites.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Artwork } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { Button } from "@/components/ui/Button";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";
import { useFavorites } from "@/store/favorites";

export default function Favorites() {
  const slugs = useFavorites((s) => s.slugs);
  const [items, setItems] = useState<Artwork[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = getCatalog();
      const list = await Promise.all(slugs.map((s) => c.getArtwork(s)));
      if (!cancelled) setItems(list.filter((a): a is Artwork => !!a));
    })();
    return () => {
      cancelled = true;
    };
  }, [slugs]);
  return (
    <Section>
      <EyebrowHeading eyebrow="Favorites" title="Your saved pieces." description="Saved locally on this device. Sign in (coming soon) to sync across devices." />
      <div className="mt-12">
        {slugs.length === 0 ? (
          <div className="rounded-md border border-border bg-bg-elevated p-10 text-center text-text-muted">
            You haven't saved anything yet. <Button asChild className="ml-2"><Link to="/shop">Browse the studio</Link></Button>
          </div>
        ) : (
          <ArtworkGrid artworks={items ?? []} loading={items === null} />
        )}
      </div>
    </Section>
  );
}
```

- [ ] **Step 19.7: Create `About.tsx`**

```tsx
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { aboutPage } from "@/content/pages/about";
import { Reveal } from "@/components/motion/Reveal";

export default function About() {
  return (
    <Section>
      <Reveal>
        <EyebrowHeading eyebrow={aboutPage.eyebrow} title={aboutPage.title} level={1} />
      </Reveal>
      <div className="mt-10 max-w-prose space-y-6 text-text">
        {aboutPage.body.map((p, i) => (
          <Reveal key={i} delay={0.06 * i}>
            <p>{p}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 19.8: Create `WorkWithUs.tsx`** — form UI only; submission stub. Backend wired in Plan 4.

```tsx
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { workWithUsPage } from "@/content/pages/work-with-us";
import { toast } from "sonner";

export default function WorkWithUs() {
  return (
    <Section>
      <EyebrowHeading eyebrow={workWithUsPage.eyebrow} title={workWithUsPage.title} level={1} />
      <div className="mt-6 max-w-prose space-y-4 text-text">
        {workWithUsPage.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Wired to /api/forms-contact in Plan 4
          toast.success("Thanks — we'll be in touch soon.");
          (e.currentTarget as HTMLFormElement).reset();
        }}
        className="mt-12 grid max-w-2xl gap-5"
      >
        <Input name="name" label="Your name" required />
        <Input name="email" label="Email" type="email" required />
        <Input name="company" label="Company (optional)" />
        <Select name="project_type" label="Project type" required defaultValue="">
          <option value="" disabled>Select…</option>
          {workWithUsPage.projectTypes.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </Select>
        <Input name="budget" label="Budget (optional)" placeholder="e.g. $2k–$8k" />
        <Input name="timeline" label="Timeline (optional)" placeholder="e.g. installing in March" />
        <div className="space-y-1.5">
          <label htmlFor="message" className="block text-sm text-text">Tell us about the project</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="block w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-text outline-none focus:border-accent"
          />
        </div>
        <div>
          <Button type="submit" size="lg">Send</Button>
        </div>
      </form>
    </Section>
  );
}
```

- [ ] **Step 19.9: Create `NotFound.tsx`**

```tsx
import { Link } from "react-router-dom";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Section className="text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-5xl text-text">We can't find that page.</h1>
      <p className="mt-4 text-text-muted">It may have moved or never existed.</p>
      <Button asChild className="mt-8"><Link to="/">Back to the studio</Link></Button>
    </Section>
  );
}
```

- [ ] **Step 19.10: Commit**

```bash
git add src/routes/
git commit -m "feat: add all storefront routes (home, shop, artwork detail, galleries, favorites, about, work-with-us, 404)"
```

---

## Task 20: Router + App entry

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/App.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/main.tsx`

- [ ] **Step 20.1: Create `App.tsx`**

```tsx
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { RouteError } from "@/components/errors/RouteError";
import { PageSkeleton } from "@/components/layout/PageSkeleton";

const Home = lazy(() => import("@/routes/Home"));
const Shop = lazy(() => import("@/routes/Shop"));
const ArtworkDetail = lazy(() => import("@/routes/ArtworkDetail"));
const Galleries = lazy(() => import("@/routes/Galleries"));
const GalleryDetail = lazy(() => import("@/routes/GalleryDetail"));
const Favorites = lazy(() => import("@/routes/Favorites"));
const About = lazy(() => import("@/routes/About"));
const WorkWithUs = lazy(() => import("@/routes/WorkWithUs"));
const NotFound = lazy(() => import("@/routes/NotFound"));

function wrap(Component: React.ComponentType) {
  return (
    <ErrorBoundary fallback={(err, reset) => <RouteError error={err} reset={reset} />}>
      <Suspense fallback={<PageSkeleton />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: wrap(Home) },
      { path: "/shop", element: wrap(Shop) },
      { path: "/shop/:slug", element: wrap(ArtworkDetail) },
      { path: "/galleries", element: wrap(Galleries) },
      { path: "/galleries/:slug", element: wrap(GalleryDetail) },
      { path: "/favorites", element: wrap(Favorites) },
      { path: "/about", element: wrap(About) },
      { path: "/work-with-us", element: wrap(WorkWithUs) },
      { path: "/cart", element: wrap(NotFound) /* wired in Plan 2 */ },
      { path: "*", element: wrap(NotFound) },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 20.2: Create `main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 20.3: Run dev server and smoke test**

Run: `npm run dev`
Expected: server at `http://localhost:5173/`. Manually verify:
- `/` renders hero, "Shop By" grid (6 cards), gallery teaser (2), terracotta CTA
- `/shop` renders sidebar + grid with 4 placeholders
- `/shop/evening-fig` renders detail with variant picker
- `/galleries` renders 2 gallery cards
- `/galleries/warm-study` renders hero + piece list + bundle button
- `/favorites` renders empty state; heart on a card adds to favorites; refresh persists
- `/about`, `/work-with-us` render copy
- Theme toggle in header flips light↔dark; refresh persists choice
- 404 fallback works

- [ ] **Step 20.4: Run typecheck + lint + tests**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all PASS.

- [ ] **Step 20.5: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: wire router with lazy routes, error boundaries, and Suspense fallbacks"
```

---

## Task 21: README + CONTRIBUTING + Vitest config

**Files:**
- Create: `/Users/gabrielmotta/jayjo/README.md`
- Create: `/Users/gabrielmotta/jayjo/CONTRIBUTING.md`
- Create: `/Users/gabrielmotta/jayjo/vitest.config.ts`
- Create: `/Users/gabrielmotta/jayjo/public/robots.txt`
- Create: `/Users/gabrielmotta/jayjo/public/favicon.svg`

- [ ] **Step 21.1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: true,
  },
});
```

- [ ] **Step 21.2: Create `tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 21.3: Re-run tests to confirm jest-dom matchers load**

Run: `npm test`
Expected: PASS.

- [ ] **Step 21.4: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://studiojayjo.com/sitemap.xml
```

- [ ] **Step 21.5: Create `public/favicon.svg`** — a minimal wordmark glyph.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#F2EBDC"/>
  <text x="50%" y="58%" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="#2E1F12">J</text>
</svg>
```

- [ ] **Step 21.6: Create `README.md`**

````markdown
# Studio JayJo

A boutique ecommerce site for original art, prints, and curated wall galleries.

> v1: Plan 1 (Foundation + Storefront) — browseable site with theming, catalog, galleries, favorites (local). Cart, checkout, accounts and forms land in Plans 2–4.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + Framer Motion
- **State:** Zustand (UI) + TanStack Query (server, used heavily in later plans)
- **Theming:** CSS variables, light + dark (default light)
- **Catalog:** files-in-repo adapter (Sanity / Neon adapters stubbed; swap via `VITE_CATALOG_ADAPTER`)
- **Backend (Plan 2+):** Netlify Functions + Neon Postgres + Stripe + Resend

## Quick start

```bash
nvm use            # Node 20
npm install
cp .env.example .env.local   # fill VITE_ vars only for Plan 1
npm run dev
```

Open http://localhost:5173

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview the built bundle
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run typecheck` — TS only
- `npm test` — Vitest unit tests
- `npm run catalog:validate` — Zod-validate content files

## Adding an artwork

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Project structure

`src/catalog/` — catalog abstraction + adapters
`src/content/` — file-based catalog (artworks, galleries, page copy)
`src/components/` — UI, motion, layout, product, gallery
`src/routes/` — page components
`src/styles/` — tokens + base + globals
`scripts/` — build-time helpers
````

- [ ] **Step 21.7: Create `CONTRIBUTING.md`**

````markdown
# Contributing to Studio JayJo

## Adding an artwork

1. Drop main image into `public/art/<slug>/main.jpg` (4:5 ratio recommended, ≥1200×1500)
2. Create `src/content/artworks/<slug>.ts`:

```ts
import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "your-slug",
  title: "Your Title",
  year: 2026,
  kind: "print",                 // or "original"
  medium: "Giclée on cotton rag",
  description: "...",
  colorTags: ["deep-fig"],       // see existing files for the set
  sizeTags: ["small", "medium"],
  images: [{ src: "/art/your-slug/main.jpg", alt: "describe the work", aspect: 4 / 5 }],
  variants: [
    { id: "a3", label: "A3 (11×16 in)", priceCents: 14500, stripePriceId: "price_xxx" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2026-01-01",
};
```

3. Run `npm run catalog:validate` — fixes any schema issues before commit
4. Commit and push — Netlify previews the change

## Adding a wall gallery

Same pattern under `src/content/galleries/<slug>.ts` referencing artwork slugs.

## Theming

All colors come from `src/styles/tokens.css`. Both themes use the same variable names; only values differ. Components use Tailwind classes like `bg-bg`, `text-text`, `bg-accent` — these read the variables.

## Tests

Run `npm test` before committing. New components → write a Vitest test in `tests/unit/`.
````

- [ ] **Step 21.8: Commit**

```bash
git add README.md CONTRIBUTING.md vitest.config.ts tests/setup.ts public/robots.txt public/favicon.svg
git commit -m "docs: add README, CONTRIBUTING, vitest config, robots, favicon"
```

---

## Task 22: Final verification + GitHub remote

**Files:** (none new)

- [ ] **Step 22.1: Run full check**

Run: `npm run lint && npm run typecheck && npm test && npm run catalog:validate && npm run build`
Expected: all PASS, `dist/` produced.

- [ ] **Step 22.2: Preview the production build**

Run: `npm run preview`
Expected: site renders at `http://localhost:5173/` identical to `npm run dev`.

- [ ] **Step 22.3: Create GitHub repo (private)**

Manually in GitHub (or via `gh repo create mospretmen/jayjo --private --source . --remote origin --push`).
Verify: `git remote -v` shows the remote.

- [ ] **Step 22.4: Push**

```bash
git push -u origin main
```

- [ ] **Step 22.5: Tag the Plan 1 milestone**

```bash
git tag -a v0.1.0 -m "Plan 1 — Foundation + storefront"
git push --tags
```

---

## Self-review

Pass against the spec sections:

| Spec section | Covered by tasks |
|---|---|
| §3 Architecture (frontend SPA, theming, motion, catalog adapter) | 1, 2, 4, 8, 12, 20 |
| §4 Frontend routes + components + theming | 18–20 |
| §6 Data model — file-based catalog schema | 7, 9, 10 |
| §8 Skeletons, lazy loading, code split, responsive, motion | 11 (Skeleton), 12 (motion), 15 (ImageWithBlur), 20 (lazy) |
| §9 Accessibility — focus rings, labels, contrast, reduced motion | 3 (base.css), 5 (contrast test), 11, 12, 18 |
| §10 Error handling — boundaries, fallbacks | 13, 20 |
| §11 Secrets — VITE_ discipline | 1 (.env.example), 2 (ESLint rule), 8 (env.ts) |
| §13 Project structure | 1–22 in aggregate |
| §16 "Easy to expand" — artwork add workflow | 21 (CONTRIBUTING) |
| §17 Scope: cart/checkout/auth/forms/AI excluded from Plan 1 | acknowledged in plan goal |

Plan 1 produces a working, testable, browseable site. Plans 2–4 layer commerce, identity, and polish on top — no refactors required.

Spec coverage: ✅ for Plan-1-scoped items. Cart/checkout/auth/forms intentionally deferred.
Placeholder scan: ✅ no TBD/TODO/handwave in steps.
Type consistency: ✅ `CatalogRepository`, `Artwork`, `ArtworkVariant`, `Gallery` names are stable across tasks 7, 8, 9, 15, 16, 17, 19, 20.
