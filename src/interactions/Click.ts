import { Locator } from '@playwright/test';
import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';

/**
 * Click - Interacción para hacer clic en un elemento
 * 
 * @example
 * ```typescript
 * await actor.attemptsTo(
 *   Click.on(submitButton)
 * );
 * 
 * // Con opciones
 * await actor.attemptsTo(
 *   Click.on(menuItem).withForce()
 * );
 * ```
 */
export class Click implements Task {
  private force: boolean = false;
  private clickCount: number = 1;
  private button: 'left' | 'right' | 'middle' = 'left';
  
  private constructor(private target: Locator) {}
  
  /**
   * Método de fábrica para crear una interacción Click
   * @param target - El localizador en el que hacer clic
   */
  static on(target: Locator): Click {
    return new Click(target);
  }
  
  /**
   * Forzar el clic (omitir verificaciones de accionabilidad)
   */
  withForce(): Click {
    this.force = true;
    return this;
  }
  
  /**
   * Doble clic
   */
  twice(): Click {
    this.clickCount = 2;
    return this;
  }
  
  /**
   * Clic derecho
   */
  withRightButton(): Click {
    this.button = 'right';
    return this;
  }
  
  async performAs(actor: Actor): Promise<void> {
    await this.target.click({
      force: this.force,
      clickCount: this.clickCount,
      button: this.button
    });
  }
  
  toString(): string {
    return `Click on element${this.force ? ' (forced)' : ''}`;
  }
}
