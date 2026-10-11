import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '');

  return {
    plugins: [tsconfigPaths()],
    test: {
      globals: true,
      root: './',
      include: ['**/*.e2e-spec.ts'],
    },
  };
});
