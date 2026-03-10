import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { OrderEntryElements } from '../ui/OrderEntryElements';

/**
 * SaveOrder - Tarea para guardar la orden haciendo clic en el botón Save
 * 
 * Maneja:
 * - Hacer clic en el botón Save
 * - Esperar a que aparezca y desaparezca el loader
 * - Esperar a que la orden se guarde
 * 
 * @example
 * ```typescript
 * await actor.attemptsTo(
 *   FillOrderForm.withData(orderData),
 *   SaveOrder()
 * );
 * ```
 */
export class SaveOrder implements Task {
  private constructor() {}
  
  /**
   * Método de fábrica para crear la tarea
   */
  static now(): SaveOrder {
    return new SaveOrder();
  }
  
  async performAs(actor: Actor): Promise<void> {
    const page = actor.abilityTo<BrowseTheWeb>(BrowseTheWeb).page;
    const centerFrame = OrderEntryElements.centerFrame(page);
    
    console.log('💾 Guardando orden...');
    
    // Hacer clic en botón Save
    const saveButton = OrderEntryElements.saveButton(centerFrame);
    await saveButton.waitFor({ state: 'visible', timeout: 10000 });
    await saveButton.click();
    
    console.log('  ⏳ Esperando que se procese la orden...');
    
    // Esperar a que aparezca y desaparezca el loader
    const loader = OrderEntryElements.loader(centerFrame);
    
    try {
      // Esperar a que aparezca el loader (indica que empezó el proceso)
      await loader.waitFor({ state: 'visible', timeout: 5000 });
      console.log('  🔄 Loader detectado...');
      
      // Esperar a que desaparezca (indica que terminó el proceso)
      await loader.waitFor({ state: 'hidden', timeout: 30000 });
      console.log('  ✅ Loader desapareció');
    } catch (e) {
      console.log('  ⚠️  Loader no detectado, continuando...');
    }
    
    // Espera adicional para que se actualice el DOM con el número de orden
    await page.waitForTimeout(2000);
    
    console.log('✅ Orden guardada');
  }
  
  toString(): string {
    return 'Save order';
  }
}
