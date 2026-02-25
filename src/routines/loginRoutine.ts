import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { getCredentials } from '../helpers/auth';
import { setupPerformanceMonitoring } from '../helpers/metrics';

/**
 * Performs login using the LoginPage Page Object and environment credentials
 * Handles optional MFA by prompting the user on the console
 */
export async function performLogin(page: Page, opts: { projectName?: string, screenshotPrefix?: string } = {}) {
  const project = opts.projectName || process.env.PROJECT_NAME || 'beta';
  const creds = getCredentials(project);
  const loginPage = new LoginPage(page);

  const metrics = setupPerformanceMonitoring(page, { slowThreshold: 2000 });

  // Usar la URL específica del ambiente desde las variables de entorno
  await loginPage.navigate(creds.baseUrl);
  if (opts.screenshotPrefix) await loginPage.screenshot(`${opts.screenshotPrefix}-01-login-page`);

  await loginPage.login(creds.email, creds.password);
  if (opts.screenshotPrefix) await loginPage.screenshot(`${opts.screenshotPrefix}-02-credentials-entered`);

  // Esperas específicas: primero buscar inputs de MFA; si no, esperar indicador de éxito o desaparición de loaders
  try {
    const mfaSelectorCandidates = ['input[name="otp"]', 'input[name="mfa"]', '#otp', 'input[id*=mfa]'];
    for (const sel of mfaSelectorCandidates) {
      const el = await page.locator(sel).elementHandle({ timeout: 1500 }).catch(() => null);
      if (el) {
        const code = await askFromConsole('MFA code required. Please enter the verification code: ');
        await page.fill(sel, code);
        await Promise.all([
          page.waitForLoadState('domcontentloaded').catch(() => {}),
          page.keyboard.press('Enter').catch(() => {})
        ]);
        break;
      }
    }
  } catch (e) {
    // Ignorar errores de detección MFA
  }

  // Esperar a un indicador de éxito de login o a que los loaders desaparezcan
  try {
    // Preferir un método semántico de LoginPage
    await Promise.race([
      loginPage.expectLoginSuccess(),
      (async () => { await loginPage.waitForDOMReady(); await loginPage.waitForLoadingComplete(); })()
    ]);
  } catch (e) {
    // Si falla la espera semántica, dar más tiempo y comprobar URL
    try {
      await page.waitForTimeout(5000);
      const url = await loginPage.getCurrentURL();
      if (url.includes('/login')) {
        console.warn('⚠️ Después de esperar, la URL sigue en /login');
      }
    } catch {}
  }

  if (opts.screenshotPrefix) await loginPage.screenshot(`${opts.screenshotPrefix}-03-after-login`);

  metrics.printSummary();
  return { loginPage, metrics };
}

function askFromConsole(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
