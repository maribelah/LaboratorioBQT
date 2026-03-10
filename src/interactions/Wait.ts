import { Locator } from '@playwright/test';
import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';

/**
 * Wait - Interacción para esperar cambios de estado de elementos
 * 
 * @example
 * ```typescript
 * await actor.attemptsTo(
 *   Wait.forElement(loader).toDisappear()
 * );
 * 
 * await actor.attemptsTo(
 *   Wait.forElement(successMessage).toBeVisible()
 * );
 * 
 * await actor.attemptsTo(
 *   Wait.forMilliseconds(1000)
 * );
 * ```
 */
export class Wait implements Task {
  private state?: 'visible' | 'hidden' | 'attached' | 'detached';
  private timeout: number = 30000;
  private milliseconds?: number;
  
  private constructor(private target?: Locator) {}
  
  /**
   * Método de fábrica para esperar un elemento
   * @param target - El elemento a esperar
   */
  static forElement(target: Locator): Wait {
    return new Wait(target);
  }
  
  /**
   * Método de fábrica para esperar una duración fija
   * @param ms - Milisegundos a esperar
   */
  static forMilliseconds(ms: number): Wait {
    const wait = new Wait();
    wait.milliseconds = ms;
    return wait;
  }
  
  /**
   * Esperar a que el elemento sea visible
   */
  toBeVisible(timeoutMs?: number): Wait {
    this.state = 'visible';
    if (timeoutMs) this.timeout = timeoutMs;
    return this;
  }
  
  /**
   * Esperar a que el elemento desaparezca
   */
  toDisappear(timeoutMs?: number): Wait {
    this.state = 'hidden';
    if (timeoutMs) this.timeout = timeoutMs;
    return this;
  }
  
  /**
   * Esperar a que el elemento esté adjunto al DOM
   */
  toBeAttached(timeoutMs?: number): Wait {
    this.state = 'attached';
    if (timeoutMs) this.timeout = timeoutMs;
    return this;
  }
  
  /**
   * Esperar a que el elemento esté separado del DOM
   */
  toBeDetached(timeoutMs?: number): Wait {
    this.state = 'detached';
    if (timeoutMs) this.timeout = timeoutMs;
    return this;
  }
  
  async performAs(actor: Actor): Promise<void> {
    if (this.milliseconds !== undefined) {
      // Fixed duration wait
      const BrowseTheWeb = require('../abilities/BrowseTheWeb').BrowseTheWeb;
      const page = actor.abilityTo<typeof BrowseTheWeb>(BrowseTheWeb).page;
      await page.waitForTimeout(this.milliseconds);
    } else if (this.target && this.state) {
      // Element state wait
      await this.target.waitFor({ state: this.state, timeout: this.timeout });
    } else {
      throw new Error('Wait interaction not properly configured');
    }
  }
  
  toString(): string {
    if (this.milliseconds !== undefined) {
      return `Wait for ${this.milliseconds}ms`;
    }
    return `Wait for element to be ${this.state} (timeout: ${this.timeout}ms)`;
  }
}
