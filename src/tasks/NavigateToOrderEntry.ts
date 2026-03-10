import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { Click } from '../interactions/Click';
import { Wait } from '../interactions/Wait';
import { OrderEntryElements } from '../ui/OrderEntryElements';

/**
 * NavigateToOrderEntry - Tarea para navegar al formulario Order Entry
 * 
 * Navega a través del menú: Sales > New > Order Entry
 * 
 * @example
 * ```typescript
 * await actor.attemptsTo(
 *   PerformCompleteLogin.asUser('beta'),
 *   NavigateToOrderEntry()
 * );
 * ```
 */
export class NavigateToOrderEntry implements Task {
  private constructor() {}
  
  /**
   * Método de fábrica para crear la tarea de navegación
   */
  static toForm(): NavigateToOrderEntry {
    return new NavigateToOrderEntry();
  }
  
  async performAs(actor: Actor): Promise<void> {
    const page = actor.abilityTo<BrowseTheWeb>(BrowseTheWeb).page;
    const leftFrame = OrderEntryElements.leftFrame(page);
    
    console.log('🧭 Navegando: Sales -> New -> Order Entry');
    
    // Esperar a que el frame lateral esté disponible
    const salesMenu = OrderEntryElements.salesMenuItem(leftFrame);
    await salesMenu.waitFor({ state: 'visible', timeout: 20000 });
    
    // Paso 1: Click en Sales con reintentos (helper genérico)
    console.log('  ▶️  Click en Sales...');
    await this.clickWithRetry(salesMenu, page, 3);
    
    // Paso 2: Click en New (esperar visible)
    console.log('  ▶️  Click en New...');
    const newMenu = OrderEntryElements.newMenuItem(leftFrame);
    await newMenu.waitFor({ state: 'visible', timeout: 10000 });
    await this.clickWithRetry(newMenu, page, 3);
    
    // Paso 3: Click en Order Entry (esperar visible)
    console.log('  ▶️  Click en Order Entry...');
    const orderEntryMenu = OrderEntryElements.orderEntryMenuItem(leftFrame);
    await orderEntryMenu.waitFor({ state: 'visible', timeout: 10000 });
    await this.clickWithRetry(orderEntryMenu, page, 3);
    
    // Esperar a que el formulario se cargue
    const centerFrame = OrderEntryElements.centerFrame(page);
    const customerInput = OrderEntryElements.customerInput(centerFrame);
    await customerInput.waitFor({ state: 'visible', timeout: 20000 });
    await customerInput.waitFor({ state: 'attached', timeout: 10000 });
    
    console.log('  ✅ Formulario Order Entry cargado');
  }
  
  /**
   * Helper para hacer clic con reintentos (similar a BasePage.clickWithRetry)
   */
  private async clickWithRetry(locator: any, page: any, maxRetries: number = 2): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Scroll al elemento si es necesario
        await locator.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
        
        // Click
        await locator.click({ timeout: 8000 });
        return; // Éxito
      } catch (error) {
        lastError = error as Error;
        console.log(`  ⚠️  Click fallido (intento ${attempt + 1}/${maxRetries + 1}), reintentando...`);
        await page.waitForTimeout(500);
      }
    }
    
    throw lastError;
  }
  
  toString(): string {
    return 'Navigate to Order Entry (Sales > New > Order Entry)';
  }
}
