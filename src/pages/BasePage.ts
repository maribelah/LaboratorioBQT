import { Page } from '@playwright/test';
import { test } from '@playwright/test';

/**
 * Clase base para todos los Page Objects
 * Contiene métodos comunes reutilizables
 */
export class BasePage {
  /**
   * Constructor
   * @param page - Instancia de Page de Playwright
   */
  constructor(protected page: Page) {}
  
  /**
   * Navega a una ruta específica usando la baseURL configurada
   * @param path - Ruta relativa (ej. '/login', '/products')
   */
  async navigate(path: string) {
    await this.page.goto(path);
  }
  
  /**
   * Toma una captura de pantalla con nombre personalizado y la adjunta al reporte
   * @param name - Nombre descriptivo para la captura
   * @param fullPage - Si debe capturar página completa (default: true)
   */
  async screenshot(name: string, fullPage: boolean = true) {
    const timestamp = Date.now();
    const screenshotPath = `screenshots/${name}-${timestamp}.png`;
    
    // Tomar la captura
    const screenshot = await this.page.screenshot({ 
      path: screenshotPath,
      fullPage 
    });
    
    // Adjuntar al reporte de Playwright (para que aparezca en el HTML report)
    await test.info().attach(name, {
      body: screenshot,
      contentType: 'image/png'
    });
    
    return screenshotPath;
  }
  
  /**
   * Espera a que la red esté inactiva (sin requests pendientes)
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Espera a que el DOM esté completamente cargado
   */
  async waitForDOMReady() {
    await this.page.waitForLoadState('domcontentloaded');
  }
  
  /**
   * Obtiene el título de la página actual
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
  
  /**
   * Obtiene la URL actual
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }
  
  /**
   * Espera un tiempo específico (usar solo cuando sea absolutamente necesario)
   * @param ms - Milisegundos a esperar
   * @deprecated Preferir esperas basadas en eventos (waitForSelector, etc.)
   */
  async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }
  
  /**
   * Hace clic en un elemento con reintentos si no es clickable
   * @param locator - Locator del elemento (puede ser Locator o elemento dentro de FrameLocator)
   * @param maxRetries - Número máximo de reintentos (default: 2)
   */
  async clickWithRetry(locator: any, maxRetries: number = 2) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Esperar a que el elemento esté visible
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        
        // Scroll al elemento si es necesario
        await locator.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
        
        // Click
        await locator.click({ timeout: 5000 });
        
        // Pequeña pausa para asegurar que el click se procesó
        await this.wait(300);
        
        return; // Éxito
      } catch (error) {
        lastError = error as Error;
        console.log(`⚠️ Intento ${attempt + 1}/${maxRetries + 1} fallido para click. Reintentando...`);
        
        if (attempt < maxRetries) {
          await this.wait(1500); // Esperar más entre reintentos
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    throw new Error(`Click falló después de ${maxRetries + 1} intentos: ${lastError?.message}`);
  }

  /**
   * Espera a que todos los loaders (Working..., Loading..., spinners) desaparezcan
   * Útil para esperar después de operaciones que muestran indicadores de carga
   * @param frame - FrameLocator opcional donde buscar loaders. Si no se proporciona, busca en page principal
   */
  protected async waitForLoadingComplete(frame?: any) {
    const context = frame || this.page;
    
    const loaders = [
      context.getByText('Working...'),
      context.getByText('Loading...'),
      context.locator('.spinner, .loading, [class*="working"]')
    ];

    for (const loader of loaders) {
      try {
        await loader.waitFor({ state: 'hidden', timeout: 30000 });
      } catch {
        // Loader no presente o ya desapareció
      }
    }
  }
}
