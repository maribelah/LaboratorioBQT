/**
 * Interfaz para Habilidades en Screenplay Pattern
 * 
 * Una Habilidad representa algo que un Actor puede hacer.
 * Encapsula herramientas y recursos (como Page de Playwright, cliente API, etc.)
 * 
 * Habilidades comunes:
 * - BrowseTheWeb: Interactuar con un navegador usando Playwright
 * - CallAnApi: Realizar solicitudes HTTP
 * - TakeScreenshots: Capturar capturas de pantalla
 * 
 * @example
 * ```typescript
 * export class BrowseTheWeb implements Ability {
 *   private constructor(public readonly page: Page) {}
 *   
 *   static using(page: Page): BrowseTheWeb {
 *     return new BrowseTheWeb(page);
 *   }
 * }
 * 
 * // Uso
 * const actor = Actor.named('User')
 *   .whoCan(BrowseTheWeb.using(page));
 * 
 * const page = actor.abilityTo(BrowseTheWeb).page;
 * ```
 */
export interface Ability {
  // Interfaz marcadora - las habilidades pueden tener cualquier estructura
  // Se identifican por su tipo de clase
}
