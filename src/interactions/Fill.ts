import { Locator } from '@playwright/test';
import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';

/**
 * Fill - Interacción para llenar un campo de formulario
 * 
 * @example
 * ```typescript
 * await actor.attemptsTo(
 *   Fill.field(emailInput).with('user@test.com')
 * );
 * 
 * // Con escritura lenta
 * await actor.attemptsTo(
 *   Fill.field(searchInput).with('roses').slowly()
 * );
 * ```
 */
export class Fill implements Task {
  private value: string = '';
  private delay: number = 0;
  
  private constructor(private target: Locator) {}
  
  /**
   * Método de fábrica para crear una interacción Fill
   * @param target - El campo de entrada a llenar
   */
  static field(target: Locator): Fill {
    return new Fill(target);
  }
  
  /**
   * Establece el valor a llenar
   * @param value - El texto a ingresar
   */
  with(value: string): Fill {
    this.value = value;
    return this;
  }
  
  /**
   * Escribe lentamente (útil para campos de autocompletar)
   * @param delayMs - Retraso entre pulsaciones de teclas en milisegundos (predeterminado: 100)
   */
  slowly(delayMs: number = 100): Fill {
    this.delay = delayMs;
    return this;
  }
  
  async performAs(actor: Actor): Promise<void> {
    if (this.delay > 0) {
      // Escribir carácter por carácter
      await this.target.clear();
      await this.target.type(this.value, { delay: this.delay });
    } else {
      // Llenar instantáneamente
      await this.target.fill(this.value);
    }
  }
  
  toString(): string {
    return `Fill field with "${this.value}"${this.delay > 0 ? ' (slowly)' : ''}`;
  }
}
