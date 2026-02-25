import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report', 
      open: 'on-failure',
      attachments: 'always' // Incluir siempre screenshots y traces en el reporte
    }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit-report.xml' }] // Para CI/CD
  ],
  use: {
    headless: process.env.HEADLESS === 'true',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 500,
    baseURL: process.env.BETA_URL || 'https://betabqc.ghtcorptest.com/', // Usar variable de entorno
    viewport: { width: 1280, height: 800 },
    actionTimeout: 60000,
    navigationTimeout: 60000,
    ignoreHTTPSErrors: true,
    screenshot: 'on', // always take screenshots
    trace: 'on',      // enable trace for deep debugging
    video: 'retain-on-failure', // Grabar video en caso de fallo
  },
  projects: [
    { 
      name: 'alpha', 
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.ALPHA_URL || 'https://betabqc.ghtcorptest.com/'
      } 
    },
    { 
      name: 'beta', 
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.BETA_URL || 'https://betabqc.ghtcorptest.com/'
      } 
    },
    { 
      name: 'prod', 
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.PROD_URL || 'https://betabqc.ghtcorptest.com/'
      } 
    }
  ]
});
