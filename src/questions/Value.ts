import { Locator } from '@playwright/test';
import { Actor } from '../actors/Actor';
import { Question } from '../types/Question';

/**
 * Value - Pregunta para obtener el valor de un campo de entrada
 * 
 * @example
 * ```typescript
 * const email = await actor.asks(Value.of(emailInput));
 * expect(email).toBe('user@test.com');
 * 
 * const isEmpty = await actor.asks(Value.of(passwordInput));
 * expect(isEmpty).toBe('');
 * ```
 */
export class Value implements Question<string> {
  private constructor(private target: Locator) {}
  
  /**
   * Método de fábrica para crear una pregunta Value
   * @param target - El elemento de entrada del cual obtener el valor
   */
  static of(target: Locator): Value {
    return new Value(target);
  }
  
  async answeredBy(actor: Actor): Promise<string> {
    return await this.target.inputValue();
  }
  
  toString(): string {
    return 'Value of input field';
  }
}
