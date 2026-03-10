import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';

/**
 * Navigate - Interacción para navegar a una URL
 * 
 * @example
 * ```typescript
 * // Ruta relativa (usa baseURL desde config)
 * await actor.attemptsTo(
 *   Navigate.to('/login')
 * );
 * 
 * // URL absoluta
 * await actor.attemptsTo(
 *   Navigate.to('https://example.com/page')
 * );
 * ```
 */
export class Navigate implements Task {
  private waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'load';
  
  private constructor(private url: string) {}
  
  /**
   * Método de fábrica para crear una interacción Navigate
   * @param url - URL a la que navegar (relativa o absoluta)
   */
  static to(url: string): Navigate {
    return new Navigate(url);
  }
  
  /**
   * Esperar hasta que la red esté inactiva antes de continuar
   */
  andWaitForNetworkIdle(): Navigate {
    this.waitUntil = 'networkidle';
    return this;
  }
  
  /**
   * Esperar solo a que se cargue el contenido del DOM
   */
  andWaitForDOM(): Navigate {
    this.waitUntil = 'domcontentloaded';
    return this;
  }
  
  async performAs(actor: Actor): Promise<void> {
    const page = actor.abilityTo<BrowseTheWeb>(BrowseTheWeb).page;
    await page.goto(this.url, { waitUntil: this.waitUntil });
  }
  
  toString(): string {
    return `Navigate to "${this.url}"`;
  }
}
