import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
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
          selector:
            "MemberExpression[object.type='MemberExpression'][object.object.type='MetaProperty'][object.object.meta.name='import'][object.object.property.name='meta'][object.property.name='env'][property.name=/^(?!VITE_).+/]",
          message:
            "Only VITE_-prefixed env vars may be accessed from src/. Server keys live in netlify/functions/_lib/env.ts.",
        },
      ],
    },
    settings: { react: { version: "18.3" } },
  },
];
