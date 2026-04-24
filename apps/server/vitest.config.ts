import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // better-sqlite3 is a native addon; forks keeps the node worker out of
    // vitest's default worker-thread pool, which can't load native bindings.
    pool: 'forks',
    include: ['tests/**/*.test.ts'],
  },
});
