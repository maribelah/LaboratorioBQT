import { Actor } from '../actors/Actor';
import { Question } from '../types/Question';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';

/**
 * CurrentUrl - Pregunta para obtener la URL actual de la página
 * 
 * @example
 * ```typescript
 * const url = await actor.asks(CurrentUrl.value());
 * expect(url).toContain('/dashboard');
 * 
 * const urlMatches = await actor.asks(CurrentUrl.matches(/\/products\/\d+/));
 * expect(urlMatches).toBe(true);
 * ```
 */
export class CurrentUrl implements Question<string> {
  private constructor() {}
  
  /**
   * Método de fábrica para obtener la URL actual como string
   */
  static value(): CurrentUrl {
    return new CurrentUrl();
  }
  
  async answeredBy(actor: Actor): Promise<string> {
    const page = actor.abilityTo<BrowseTheWeb>(BrowseTheWeb).page;
    return page.url();
  }
  
  toString(): string {
    return 'Current URL';
  }
}

/**
 * CurrentUrlMatches - Pregunta para verificar si la URL coincide con un patrón
 */
export class CurrentUrlMatches implements Question<boolean> {
  private constructor(private pattern: RegExp) {}
  
  /**
   * Método de fábrica para verificar si la URL coincide con un patrón
   * @param pattern - Patrón RegExp a coincidir
   */
  static pattern(pattern: RegExp): CurrentUrlMatches {
    return new CurrentUrlMatches(pattern);
  }
  
  async answeredBy(actor: Actor): Promise<boolean> {
    const page = actor.abilityTo<BrowseTheWeb>(BrowseTheWeb).page;
    return this.pattern.test(page.url());
  }
  
  toString(): string {
    return `Current URL matches pattern ${this.pattern}`;
  }
}
