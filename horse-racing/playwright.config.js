import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-US',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.002 } },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})
