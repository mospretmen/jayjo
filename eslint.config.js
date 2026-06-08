import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/**", "coverage/**", "playwright-report/**", "test-results/**", "*.tsbuildinfo"] },
  js.configs.recommended,
  {
    files: ["vite.config.js", "vitest.config.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },
  {
    files: ["tests/**/*.{js,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        localStorage: "readonly",
        sessionStorage: "readonly",
        console: "readonly",
      },
    },
  },
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
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        React: "readonly",
        JSX: "readonly",
        FormData: "readonly",
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLSelectElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLAnchorElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLFormElement: "readonly",
        HTMLImageElement: "readonly",
        HTMLSpanElement: "readonly",
        HTMLParagraphElement: "readonly",
        HTMLHeadingElement: "readonly",
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
