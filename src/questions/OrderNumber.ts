import { Actor } from '../actors/Actor';
import { Question } from '../types/Question';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { OrderEntryElements } from '../ui/OrderEntryElements';

/**
 * OrderNumber - Pregunta para obtener el número de orden generado
 * 
 * Extrae el número de orden del label después de guardar.
 * 
 * @example
 * ```typescript
 * const orderNumber = await actor.asks(OrderNumber.generated());
 * expect(orderNumber).toMatch(/^\d+$/);
 * console.log(`Order created: ${orderNumber}`);
 * ```
 */
export class OrderNumber implements Question<string> {
  private constructor() {}
  
  /**
   * Método de fábrica para obtener el número de orden generado
   */
  static generated(): OrderNumber {
    return new OrderNumber();
  }
  
  async answeredBy(actor: Actor): Promise<string> {
    const page = actor.abilityTo<BrowseTheWeb>(BrowseTheWeb).page;
    const centerFrame = OrderEntryElements.centerFrame(page);
    
    const orderNumberLabel = OrderEntryElements.orderNumberLabel(centerFrame);
    
    try {
      await orderNumberLabel.waitFor({ state: 'visible', timeout: 10000 });
      const text = await orderNumberLabel.textContent();
      return text?.trim() || '';
    } catch (e) {
      console.warn('⚠️  No se pudo obtener el número de orden del label');
      return '';
    }
  }
  
  toString(): string {
    return 'Generated order number';
  }
}
