import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
    environment: 'node',
    // No test files are committed yet — this only scaffolds the runner.
    // Exit 0 instead of failing CI / the pre-push hook until tests are added.
    passWithNoTests: true,
  },
});
