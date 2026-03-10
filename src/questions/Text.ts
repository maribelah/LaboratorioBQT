import { Locator } from '@playwright/test';
import { Actor } from '../actors/Actor';
import { Question } from '../types/Question';

/**
 * Text - Pregunta para obtener el contenido de texto de un elemento
 * 
 * @example
 * ```typescript
 * const headingText = await actor.asks(Text.of(heading));
 * expect(headingText).toBe('Welcome');
 * 
 * const errorMessage = await actor.asks(Text.of(errorAlert));
 * expect(errorMessage).toContain('Invalid credentials');
 * ```
 */
export class Text implements Question<string> {
  private constructor(private target: Locator) {}
  
  /**
   * Método de fábrica para crear una pregunta Text
   * @param target - El elemento del cual obtener el texto
   */
  static of(target: Locator): Text {
    return new Text(target);
  }
  
  async answeredBy(actor: Actor): Promise<string> {
    const text = await this.target.textContent();
    return text?.trim() || '';
  }
  
  toString(): string {
    return 'Text of element';
  }
}
