import { Ability } from '../types/Ability';
import { test } from '@playwright/test';

/**
 * TakeScreenshots - Habilidad para capturar capturas de pantalla y adjuntar a reportes de Playwright
 * 
 * Esta habilidad maneja la captura de capturas de pantalla con adjunto automático a reportes de prueba.
 * 
 * @example
 * ```typescript
 * const actor = Actor.named('User')
 *   .whoCan(BrowseTheWeb.using(page))
 *   .whoCan(TakeScreenshots.withPrefix('login-test'));
 * 
 * await actor.attemptsTo(
 *   TakeScreenshot.named('after-login')
 * );
 * ```
 */
export class TakeScreenshots implements Ability {
  /**
   * Constructor privado - usa TakeScreenshots.withPrefix()
   * @param prefix - Prefijo para nombres de archivo de capturas de pantalla
   */
  private constructor(public readonly prefix: string = '') {}
  
  /**
   * Método de fábrica para crear la habilidad TakeScreenshots
   * @param prefix - Prefijo opcional para nombres de archivo de capturas de pantalla
   * @returns Una nueva habilidad TakeScreenshots
   */
  static withPrefix(prefix: string = ''): TakeScreenshots {
    return new TakeScreenshots(prefix);
  }
  
  /**
   * Genera un nombre de archivo con prefijo y timestamp
   * @param name - Nombre de la captura de pantalla
   */
  generateFilename(name: string): string {
    const timestamp = Date.now();
    const parts = [this.prefix, name, timestamp].filter(p => p);
    return parts.join('-');
  }
  
  /**
   * Adjunta captura de pantalla al reporte de prueba de Playwright
   * @param name - Nombre de la captura de pantalla
   * @param screenshot - Buffer de la captura de pantalla
   */
  async attach(name: string, screenshot: Buffer): Promise<void> {
    await test.info().attach(this.generateFilename(name), {
      body: screenshot,
      contentType: 'image/png'
    });
  }
}
