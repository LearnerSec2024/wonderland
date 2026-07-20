import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Context modules intentionally export their provider together with hooks and
      // related helpers. Vite can still refresh the provider components correctly.
      'react-refresh/only-export-components': 'off',
      // These effects kick off asynchronous API synchronisation on mount/token
      // changes; state updates happen after the request settles, not in the effect.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
