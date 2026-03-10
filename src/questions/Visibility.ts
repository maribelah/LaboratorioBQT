import { Locator } from '@playwright/test';
import { Actor } from '../actors/Actor';
import { Question } from '../types/Question';

/**
 * Visibility - Pregunta para verificar si un elemento es visible
 * 
 * @example
 * ```typescript
 * const isVisible = await actor.asks(Visibility.of(modal));
 * expect(isVisible).toBe(true);
 * 
 * const isHidden = await actor.asks(Visibility.of(loader));
 * expect(isHidden).toBe(false);
 * ```
 */
export class Visibility implements Question<boolean> {
  private constructor(private target: Locator) {}
  
  /**
   * Método de fábrica para crear una pregunta Visibility
   * @param target - El elemento para verificar visibilidad
   */
  static of(target: Locator): Visibility {
    return new Visibility(target);
  }
  
  async answeredBy(actor: Actor): Promise<boolean> {
    try {
      return await this.target.isVisible();
    } catch (error) {
      // Elemento no adjunto al DOM
      return false;
    }
  }
  
  toString(): string {
    return 'Visibility of element';
  }
}
