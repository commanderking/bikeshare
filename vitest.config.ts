import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    // Mirror tsconfig's "@/*" -> "./src/*" so imports resolve like in the app.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // tsconfig sets jsx: "preserve" for Next to compile, which would leave JSX in
  // place for Node to choke on — tests reach .tsx modules transitively (e.g. the
  // race highlights' authored content).
  esbuild: { jsx: 'automatic' },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Pure-function unit tests run in Node. To add React Testing Library later:
    //   1. npm i -D jsdom @testing-library/react @testing-library/jest-dom \
    //        @testing-library/user-event @vitejs/plugin-react
    //   2. `plugins: [react()]` here, and set `environment: 'jsdom'`
    //   3. `setupFiles: ['./vitest.setup.ts']` importing '@testing-library/jest-dom/vitest'
    environment: 'node',
  },
})
