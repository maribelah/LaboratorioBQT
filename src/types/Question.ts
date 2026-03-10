import { Actor } from '../actors/Actor';

/**
 * Interfaz para Preguntas en Screenplay Pattern
 * 
 * Una Pregunta representa una consulta sobre el estado de la aplicación.
 * Lee información pero no modifica el estado.
 * 
 * @template T - El tipo de la respuesta
 * 
 * @example
 * ```typescript
 * export class Text implements Question<string> {
 *   static of(target: Locator): Text {
 *     return new Text(target);
 *   }
 *   
 *   async answeredBy(actor: Actor): Promise<string> {
 *     const page = actor.abilityTo(BrowseTheWeb).page;
 *     return await this.target.textContent() || '';
 *   }
 *   
 *   toString(): string {
 *     return 'Text of element';
 *   }
 * }
 * 
 * // Uso
 * const text = await actor.asks(Text.of(heading));
 * expect(text).toBe('Welcome');
 * ```
 */
export interface Question<T> {
  /**
   * Responde la pregunta consultando el estado de la aplicación
   * @param actor - El actor que hace la pregunta
   * @returns La respuesta a la pregunta
   */
  answeredBy(actor: Actor): Promise<T>;
  
  /**
   * Retorna una descripción legible de la pregunta
   * Usado para logging y reportes
   */
  toString(): string;
}
