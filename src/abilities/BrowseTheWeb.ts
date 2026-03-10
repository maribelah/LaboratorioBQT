import { Page } from '@playwright/test';
import { Ability } from '../types/Ability';

/**
 * BrowseTheWeb - Habilidad para interactuar con navegadores web usando Playwright
 * 
 * Esta es la habilidad principal para pruebas de UI. Envuelve el objeto Page de Playwright
 * y proporciona acceso a todas las capacidades de interacción con el navegador.
 * 
 * @example
 * ```typescript
 * const actor = Actor.named('User')
 *   .whoCan(BrowseTheWeb.using(page));
 * 
 * // En interactions/tasks:
 * const page = actor.abilityTo(BrowseTheWeb).page;
 * await page.goto('/login');
 * ```
 */
export class BrowseTheWeb implements Ability {
  /**
   * Constructor privado - usa BrowseTheWeb.using() para crear instancias
   * @param page - Instancia de Page de Playwright
   */
  private constructor(public readonly page: Page) {}
  
  /**
   * Método de fábrica para crear la habilidad BrowseTheWeb
   * @param page - Instancia de Page de Playwright desde el test
   * @returns Una nueva habilidad BrowseTheWeb
   */
  static using(page: Page): BrowseTheWeb {
    return new BrowseTheWeb(page);
  }
  
  /**
   * Obtiene la URL actual
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
  
  /**
   * Obtiene el título de la página
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
  
  /**
   * Toma una captura de pantalla
   * @param name - Nombre para el archivo de captura de pantalla
   * @param options - Opciones de captura de pantalla
   */
  async takeScreenshot(name: string, options?: { fullPage?: boolean }): Promise<Buffer> {
    return await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: options?.fullPage ?? true
    });
  }
}
