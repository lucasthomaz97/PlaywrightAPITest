import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/api/tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
   reporter: [
    ['html'],
    ['list']
  ],
  globalTeardown: './tests/api/helpers/teardown_helper.ts'
});