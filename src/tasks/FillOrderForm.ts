import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { OrderEntryElements } from '../ui/OrderEntryElements';
import { expect } from '@playwright/test';

/**
 * FillOrderForm - Tarea para llenar el formulario Order Entry
 * 
 * Llena todos los campos incluyendo:
 * - Customer (autocompletar)
 * - Shipping Date
 * - P.O. Number
 * - Order Behavior
 * - Integration Codes (1 & 2)
 * - Grid Items (Boxes & FOB Price)
 * 
 * @example
 * ```typescript
 * import orderData from '../data/order-entry.data.json';
 * 
 * await actor.attemptsTo(
 *   FillOrderForm.withData(orderData.orderBasico)
 * );
 * ```
 */
export class FillOrderForm implements Task {
  private constructor(private orderData: any) {}
  
  /**
   * Método de fábrica para crear la tarea
   * @param orderData - Objeto de datos de orden desde JSON
   */
  static withData(orderData: any): FillOrderForm {
    return new FillOrderForm(orderData);
  }
  
  async performAs(actor: Actor): Promise<void> {
    const page = actor.abilityTo<BrowseTheWeb>(BrowseTheWeb).page;
    const centerFrame = OrderEntryElements.centerFrame(page);
    
    console.log('📋 Llenando formulario Order Entry...');
    console.log(`   • Customer: ${this.orderData.customerCode} (${this.orderData.customerName})`);
    console.log(`   • Shipping Date: +${this.orderData.shippingDays} días`);
    console.log(`   • P.O. Number: ${this.orderData.poNumber}`);
    console.log(`   • Order Behavior: ${this.orderData.orderBehavior}`);
    console.log(`   • Integration Code 1: ${this.orderData.integrationCode1}`);
    console.log(`   • Integration Code 2: ${this.orderData.integrationCode2}`);
    
    // Customer (autocomplete con tipeo secuencial)
    console.log('  👤 Ingresando Customer...');
    const customerInput = OrderEntryElements.customerInput(centerFrame);
    await customerInput.waitFor({ state: 'visible', timeout: 10000 });
    await customerInput.fill(''); // Limpiar campo
    
    // Escribir carácter por carácter para activar autocomplete
    console.log(`     ⌨️  Escribiendo "${this.orderData.customerCode}" carácter por carácter...`);
    for (const ch of this.orderData.customerCode) {
      await customerInput.type(ch, { delay: 100 });
    }
    console.log(`     ✓ Código digitado: ${this.orderData.customerCode}`);
    
    // Esperar respuesta del autocomplete
    await page.waitForTimeout(2000); 
    
    // Esperar a que aparezca la opción específica en el dropdown y hacer click
    console.log('     ⏳ Esperando lista de opciones del autocomplete...');
    const customerOption = OrderEntryElements.customerOptionWalmart(centerFrame);
    try {
      await customerOption.waitFor({ state: 'visible', timeout: 10000 });
      await customerOption.click();
      console.log(`  ✅ Customer seleccionado: ${this.orderData.customerName}`);
    } catch (e) {
      console.log('  ⚠️  Opción específica no encontrada, usando selección genérica');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
      console.log('  ⚠️  Customer seleccionado (método fallback)');
    }
    
    // Esperar a que el valor del campo se actualice
    await customerInput.waitFor({ state: 'attached', timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Shipping Date (calcular fecha futura y manejar label +input)
    console.log('  📅 Configurando Shipping Date...');
    const shippingDate = new Date();
    shippingDate.setDate(shippingDate.getDate() + this.orderData.shippingDays);
    const dateString = `${(shippingDate.getMonth() + 1).toString().padStart(2, '0')}/${shippingDate.getDate().toString().padStart(2, '0')}/${shippingDate.getFullYear()}`;
    
    // Click en label para activar el campo
    const shippingDateLabel = OrderEntryElements.shippingDateInput(centerFrame);
    await shippingDateLabel.waitFor({ state: 'visible', timeout: 10000 });
    await shippingDateLabel.click();
    
    // Buscar el input asociado (sibling del label)
    const shippingDateActualInput = centerFrame
      .locator('#lblDueDate')
      .locator('xpath=following-sibling::*//input')
      .first();
    await shippingDateActualInput.fill(dateString);
    
    // Hacer clic en área neutral para cerrar cualquier selector
    const bodyLocator = centerFrame.locator('body');
    await bodyLocator.click({ position: { x: 100, y: 100 } });
    console.log(`  ✅ Fecha configurada: ${dateString}`);
    
    // P.O. Number
    console.log('  📝 Ingresando P.O. Number...');
    const poNumberInput = OrderEntryElements.poNumberInput(centerFrame);
    await poNumberInput.waitFor({ state: 'visible', timeout: 10000 });
    await poNumberInput.fill(this.orderData.poNumber);
    await page.waitForTimeout(500);
    
    // Order Behavior (dropdown/select con opción específica)
    console.log(`  ⚙️  Configurando Order Behavior: ${this.orderData.orderBehavior}...`);
    const orderBehaviorSelect = OrderEntryElements.orderBehaviorSelect(centerFrame);
    await orderBehaviorSelect.waitFor({ state: 'visible', timeout: 10000 });
    
    try {
      // Intentar como dropdown/select directo
      await orderBehaviorSelect.selectOption({ label: this.orderData.orderBehavior });
      console.log(`  ✅ Order Behavior seleccionado: ${this.orderData.orderBehavior}`);
    } catch (e) {
      // Si falla, intentar con click + búsqueda de opción en lista
      console.log('  ⚠️  selectOption falló, intentando con click...');
      await orderBehaviorSelect.click();
      
      const option = centerFrame.locator(`xpath=//li[contains(text(), '${this.orderData.orderBehavior}')]`).first();
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
      console.log(`  ✅ Order Behavior seleccionado (método fallback): ${this.orderData.orderBehavior}`);
    }
    
    await page.waitForTimeout(500);
    
    // Integration Code 1 (autocomplete con tipeo secuencial)
    console.log('  🔑 Ingresando Integration Code 1...');
    const integrationCode1Input = OrderEntryElements.integrationCode1Input(centerFrame);
    await integrationCode1Input.waitFor({ state: 'visible', timeout: 10000 });
    await integrationCode1Input.fill('');
    
    for (const ch of this.orderData.integrationCode1) {
      await integrationCode1Input.type(ch, { delay: 100 });
    }
    console.log('     ⏳ Esperando opciones del autocomplete...');
    await page.waitForTimeout(2000);
    
    // Click explícito en la opción del autocomplete
    try {
      const option = OrderEntryElements.productAutocompleteOption(centerFrame, this.orderData.integrationCode1);
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
      console.log('  ✅ Integration Code 1 seleccionado');
    } catch (e) {
      console.log('  ⚠️  Opción específica no encontrada, usando método de teclado');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
    }
    
    // Esperar que desaparezcan overlays de carga después de Integration Code 1
    console.log('  ⏳ Esperando carga de Integration Code 1...');
    const loadingOverlay = centerFrame.locator('.loading-overlay, .spinner, [data-loading="true"], md-progress-linear, .lds-ring');
    try {
      await expect(loadingOverlay).not.toBeVisible({ timeout: 15000 });
      console.log('  ✅ Carga completada');
    } catch (error) {
      console.log('  ℹ️  No se detectó overlay - Continuando...');
    }
    await page.waitForTimeout(2000); // Espera adicional para estabilidad (aumentado a 2s)
    console.log('  🔄 Preparando Integration Code 2...'); // Forzar recompilación
    
    // Integration Code 2 (autocomplete con tipeo secuencial)
    console.log('  🔑 Ingresando Integration Code 2...');
    const integrationCode2Input = OrderEntryElements.integrationCode2Input(centerFrame);
    await integrationCode2Input.waitFor({ state: 'visible', timeout: 30000 });
    await integrationCode2Input.fill('');
    
    for (const ch of this.orderData.integrationCode2) {
      await integrationCode2Input.type(ch, { delay: 100 });
    }
    console.log('     ⏳ Esperando opciones del autocomplete...');
    await page.waitForTimeout(2000);
    
    // Click explícito en la opción del autocomplete
    try {
      const option = OrderEntryElements.productAutocompleteOption(centerFrame, this.orderData.integrationCode2);
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
      console.log('  ✅ Integration Code 2 seleccionado');
    } catch (e) {
      console.log('  ⚠️  Opción específica no encontrada, usando método de teclado');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
    }
    
    // CRÍTICO: Esperar que desaparezcan overlays de carga después de Integration Code 2
    console.log('  ⏳ Esperando carga de Integration Code 2...');
    try {
      await expect(loadingOverlay).not.toBeVisible({ timeout: 15000 });
      console.log('  ✅ Carga completada');
    } catch (error) {
      console.log('  ℹ️  No se detectó overlay - Continuando...');
    }
    await page.waitForTimeout(2000); // Espera adicional para estabilidad
    console.log('  ✅ Integration Codes procesados completamente');
    
    // Grid Items (si existen en los datos)
    if (this.orderData.items && this.orderData.items.length > 0) {
      console.log('  📦 Llenando Grid Items...');
      
      for (const item of this.orderData.items) {
        console.log(`     - Fila ${item.row}: Boxes ${item.boxes}, Price ${item.fobPrice}`);
        
        if (item.row === 1) {
          const boxesInput = OrderEntryElements.boxesInputRow1(centerFrame);
          const priceInput = OrderEntryElements.fobPriceInputRow1(centerFrame);
          
          // Llenar Boxes
          await boxesInput.waitFor({ state: 'visible', timeout: 10000 });
          await boxesInput.fill(item.boxes);
          
          // Llenar FOB Price - CRÍTICO: Press Enter EN EL CAMPO (no global)
          await priceInput.click(); // Asegurar foco en el campo
          await priceInput.fill(item.fobPrice);
          console.log(`     ⏳ Esperando que el precio se procese...`);
          await priceInput.press('Enter'); // ⭐ CRÍTICO: Enter en el campo específico
          await page.waitForTimeout(500);
          
          // Click en el grid viewport para confirmar salida del campo (patrón de Codegen)
          await centerFrame.locator('.ag-body-viewport').click();
          await page.waitForTimeout(500);
          
        } else if (item.row === 2) {
          const boxesInput = OrderEntryElements.boxesInputRow2(centerFrame);
          const priceInput = OrderEntryElements.fobPriceInputRow2(centerFrame);
          
          // Llenar Boxes
          await boxesInput.waitFor({ state: 'visible', timeout: 10000 });
          await boxesInput.fill(item.boxes);
          
          // Llenar FOB Price - CRÍTICO: Press Enter EN EL CAMPO (no global)
          await priceInput.click(); // Asegurar foco en el campo
          await priceInput.fill(item.fobPrice);
          console.log(`     ⏳ Esperando que el precio se procese...`);
          await priceInput.press('Enter'); // ⭐ CRÍTICO: Enter en el campo específico
          await page.waitForTimeout(500);
          
          // Click en el grid viewport para confirmar salida del campo (patrón de Codegen)
          await centerFrame.locator('.ag-body-viewport').click();
          await page.waitForTimeout(500);
        }
      }
      
      console.log('  ✅ Grid Items completados');
    }
    
    console.log('✅ Formulario completado');
  }
  
  toString(): string {
    return `Fill Order Entry form for Customer ${this.orderData.customerCode}`;
  }
}
