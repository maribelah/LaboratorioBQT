import { Page, FrameLocator, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para el modal QuickFill de Webflowers
 * Permite llenar información de Customer, Boxes y Cost para múltiples productos
 */
export class QuickFillModal extends BasePage {
  private centerFrame: FrameLocator;

  // Locators del modal QuickFill
  readonly customerInput: Locator;
  readonly boxesInput: Locator;
  readonly costInput: Locator;
  readonly checkAllCheckbox: Locator;
  readonly applyButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Estructura REAL: iframe[2] es center_page (hijo directo de page)
    this.centerFrame = this.page.frameLocator('iframe').nth(2);
    
    // Locators con IDs REALES proporcionados
    this.customerInput = this.centerFrame.locator('#cmbCustomerQuickFill');
    this.boxesInput = this.centerFrame.locator('#txtBoxesQuickFill');
    this.costInput = this.centerFrame.locator('#txtCostUnitQuickFill');
    this.checkAllCheckbox = this.centerFrame.locator('#checkAll');
    this.applyButton = this.centerFrame.locator('button:has-text("Apply")'); // Texto genérico
  }

  /**
   * Llena el formulario QuickFill con Customer, Boxes y Cost
   * @param customer - Nombre del cliente (ej: "COSTCO WHOLESALE")
   * @param boxes - Cantidad de cajas (ej: "10")
   * @param cost - Costo por unidad (ej: "12")
   */
  async fillQuickFillForm(customer: string, boxes: string, cost: string) {
    console.log('  📦 Llenando formulario QuickFill...');
    
    // Esperar a que el modal esté visible
    await this.wait(1500);
    await this.waitForLoadingComplete(this.centerFrame);
    
    // Ingresar Customer y esperar sugerencias
    console.log(`  👤 Seleccionando Customer: "${customer}"...`);
    await this.customerInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.customerInput.fill(customer);
    await this.wait(1000); // Esperar autocomplete
    
    // Intentar seleccionar de la lista de sugerencias (si aparece)
    try {
      const suggestionItem = this.centerFrame.locator(`text="${customer}"`).first();
      await suggestionItem.click({ timeout: 3000 });
      console.log('  ✅ Customer seleccionado de lista');
    } catch (e) {
      console.log('  ⚠️  No se encontró lista de sugerencias, continuando...');
    }
    
    // Ingresar Boxes
    console.log(`  📦 Ingresando Boxes: "${boxes}"...`);
    await this.boxesInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.boxesInput.fill(boxes);
    await this.wait(500);
    
    // Ingresar Cost
    console.log(`  💰 Ingresando Cost: "${cost}"...`);
    await this.costInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.costInput.fill(cost);
    await this.wait(500);
    
    // Marcar "Check All"
    console.log('  ☑️  Marcando Check All...');
    await this.checkAllCheckbox.waitFor({ state: 'visible', timeout: 10000 });
    await this.checkAllCheckbox.check();
    await this.wait(500);
    
    console.log('  ✅ Formulario QuickFill completado');
  }

  /**
   * Hace clic en el botón Apply para aplicar los cambios
   */
  async applyQuickFill() {
    console.log('  🚀 Aplicando QuickFill...');
    await this.applyButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.applyButton.click();
    await this.wait(2000);
    await this.waitForLoadingComplete(this.centerFrame);
    console.log('  ✅ QuickFill aplicado');
  }
}
