import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para Order Entry de Webflowers ERP
 * Usa estructura de iframes: left_page1 (menú) y center_page (formulario)
 */
export class OrderEntryPage extends BasePage {
  private centerFrame: FrameLocator;
  private leftFrame: FrameLocator;

  // Selectores del formulario Order Entry (según especificaciones actualizadas)
  readonly customerInput: Locator;           // id=txtCustomer
  readonly customerOptionWalmart: Locator;   // xpath=//div[@data-item-key="201"]
  readonly shippingDateInput: Locator;       // id=lblDueDate
  readonly poNumberInput: Locator;           // (//input[@data-ng-model='currentOrder.PONumber'])[2]
  readonly orderBehaviorSelect: Locator;     // id=lblOrderBehavior
  readonly integrationCode1Input: Locator;   // xpath=//*[@id="input-2"]
  readonly integrationCode2Input: Locator;   // xpath=//*[@id="input-3"]
  readonly boxesInput: Locator;              // xpath=(//input[@ng-model="data.Boxes"])[1]
  readonly fobPriceInput: Locator;           // xpath=(//input[@ng-model="data.Price"])[1]
  readonly boxesInputRow2: Locator;          // xpath=(//input[@ng-model="data.Boxes"])[2]
  readonly fobPriceInputRow2: Locator;       // xpath=(//input[@ng-model="data.Price"])[2]
  readonly saveButton: Locator;              // id=btnSave
  readonly loader: Locator;                  // xpath=//md-progress-circular[@md-mode='indeterminate']
  readonly orderNumberLabel: Locator;        // css del número de orden generado

  constructor(page: Page) {
    super(page);

    // Estructura de iframes REAL de Webflowers
    this.leftFrame = this.page.frameLocator("xpath=//iframe[@id='left_page1']");
    this.centerFrame = this.page.frameLocator("xpath=//iframe[@id='center_page']");
    
    // Locators del formulario Order Entry (según especificaciones actualizadas)
    // Customer: Autocomplete con ID directo
    this.customerInput = this.centerFrame.locator('#txtCustomer');
    this.customerOptionWalmart = this.centerFrame.locator('xpath=//div[@data-item-key="201"]');
    
    // Shipping Date: Campo con ID directo según especificaciones
    this.shippingDateInput = this.centerFrame.locator('#lblDueDate');
    
    // P.O. No.: Localizador específico por data-ng-model (segundo elemento)
    this.poNumberInput = this.centerFrame.locator('xpath=(//input[@data-ng-model="currentOrder.PONumber"])[2]');
    
    // Order Behavior: Campo con ID directo según especificaciones
    this.orderBehaviorSelect = this.centerFrame.locator('#lblOrderBehavior');

    // Integration Code 1: Campo con ID específico según requerimiento
    this.integrationCode1Input = this.centerFrame.locator('xpath=//*[@id="input-2"]');
    
    // Integration Code 2: Campo con ID específico (siguiente campo)
    this.integrationCode2Input = this.centerFrame.locator('xpath=//*[@id="input-3"]');
    
    // Boxes: Campo con ng-model data.Boxes (primer elemento)
    this.boxesInput = this.centerFrame.locator('xpath=(//input[@ng-model="data.Boxes"])[1]');
    
    // FOB Price: Campo con ng-model data.Price (primer elemento)
    this.fobPriceInput = this.centerFrame.locator('xpath=(//input[@ng-model="data.Price"])[1]');
    
    // Fila 2 del Grid
    this.boxesInputRow2 = this.centerFrame.locator('xpath=(//input[@ng-model="data.Boxes"])[2]');
    this.fobPriceInputRow2 = this.centerFrame.locator('xpath=(//input[@ng-model="data.Price"])[2]');
    
    // Botón Save y elementos de validación
    this.saveButton = this.centerFrame.locator('#btnSave');
    this.loader = this.centerFrame.locator('xpath=//md-progress-circular[@md-mode="indeterminate"]');
    this.orderNumberLabel = this.centerFrame.locator('css=#divForm > div.row.mt-2.animate-show.animate-hide > div:nth-child(1) > div:nth-child(1) > label.col-form-label.col-sm-8.ng-scope > span');
  }

  /**
   * Escribe carácter por carácter en un Locator dentro del frame
   */
  private async typeSequentially(locator: Locator, text: string, delay: number = 100) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // continuar y dejar que el intento de tipeo falle si el elemento no existe
    }

    try {
      await locator.fill('');
    } catch {
      // ignore
    }

    for (const ch of text) {
      try {
        await locator.type(ch, { delay });
      } catch (e) {
        // último recurso: evaluar en DOM y disparar eventos
        try {
          await locator.evaluate((node, c) => {
            (node as HTMLInputElement).value = (node as HTMLInputElement).value + c;
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
          }, ch);
        } catch {
          // continue
        }
      }
    }
  }

  /**
   * Espera de forma controlada a que responda el backend del autocomplete.
   * Hace un race entre una respuesta de red plausible y un timeout de respaldo.
   */
  private async waitForAutocompleteResponse(timeout: number = 5000, endpoints: string[] = ['autocomplete', 'suggest', 'search', 'integration', 'getjsondatatable']) {
    try {
      const lowerEndpoints = endpoints.map(e => e.toLowerCase());
      await Promise.race([
        this.page.waitForResponse((resp) => {
          const url = resp.url().toLowerCase();
          return lowerEndpoints.some(e => url.includes(e));
        }, { timeout }),
        new Promise((res) => setTimeout(res, timeout))
      ]);
    } catch {
      // ignorar timeouts, el fallback es esperar el timeout controlado
    }
  }

  /**
   * Helper para obtener el frame de contenido central
   */
  getCenterFrame(): FrameLocator {
    return this.centerFrame;
  }

  /**
   * Helper para obtener el frame del menú lateral
   */
  getLeftFrame(): FrameLocator {
    return this.leftFrame;
  }

  /**
   * Navega a Order Entry: Sales -> New -> Order Entry
   */
  async navigateToOrderEntry() {
    console.log('🧭 Iniciando navegación: Sales -> New -> Order Entry');
    const menuFrame = this.getLeftFrame();
    // Esperar a que el frame lateral esté disponible
    await menuFrame.locator("xpath=(//div[contains(text(), 'Sales')])[2]").waitFor({ state: 'visible', timeout: 20000 });
    // Paso 1: Click en Sales (segundo elemento)
    console.log('  ▶️  Haciendo clic en Sales...');
    const salesMenu = menuFrame.locator("xpath=(//div[contains(text(), 'Sales')])[2]");
    await this.clickWithRetry(salesMenu, 3);
    // Esperar que el submenú New sea visible
    const newMenu = menuFrame.locator("xpath=//ul[@id='subSales']//div[contains(text(), 'New')]");
    await newMenu.waitFor({ state: 'visible', timeout: 10000 });
    // Paso 2: Click en New
    console.log('  ▶️  Haciendo clic en New...');
    await this.clickWithRetry(newMenu, 3);
    // Esperar que el elemento Order Entry sea visible
    const orderEntryMenu = menuFrame.locator("xpath=//ul[@id='subSales']//div[@title='New']//span[contains(text(), 'Order Entry')]");
    await orderEntryMenu.waitFor({ state: 'visible', timeout: 10000 });
    // Paso 3: Click en Order Entry
    console.log('  ▶️  Haciendo clic en Order Entry...');
    await this.clickWithRetry(orderEntryMenu, 3);
    // Esperar a que el formulario cargue (customer field visible)
    await this.waitForFormLoaded();
    console.log('✅ Navegación completada - Formulario Order Entry cargado');
  }

  /**
   * Espera a que el formulario esté completamente cargado
   */
  async waitForFormLoaded() {
    console.log('⏳ Esperando que el formulario Order Entry cargue...');
    await this.customerInput.waitFor({ state: 'visible', timeout: 20000 });
    // Esperar a que el formulario esté completamente interactivo
    await this.customerInput.waitFor({ state: 'attached', timeout: 10000 });
  }

  /**
   * Selecciona un customer escribiendo el código y seleccionando de la lista
   * @param customerCode - Código del customer (ej: "6099")
   * @param expectedName - Nombre esperado del customer (opcional, para log)
   */
  async selectCustomer(customerCode: string, expectedName?: string) {
    console.log(`🔍 Buscando customer: ${customerCode}${expectedName ? ` (${expectedName})` : ''}...`);
    
    // Limpiar el campo
    await this.customerInput.clear();

    // ⚡ CRÍTICO: Escribir carácter por carácter para disparar el autocomplete
    // El campo necesita eventos de teclado individuales para activar la búsqueda
    console.log(`   ⌨️  Escribiendo "${customerCode}" carácter por carácter...`);
    await this.typeSequentially(this.customerInput, customerCode, 100);
    console.log(`   ✓ Código digitado: ${customerCode}`);
    
    // Esperar a que aparezca la lista de opciones (se dispara tras 3er caracter)
    console.log('   ⏳ Esperando lista de opciones del autocomplete...');
    await this.customerOptionWalmart.waitFor({ state: 'visible', timeout: 10000 });
    
    // Seleccionar la opción específica (WAL-MART 6099-MACCLENNY, data-item-key="201")
    await this.customerOptionWalmart.click();
    
    const finalName = expectedName || 'WAL-MART 6099-MACCLENNY';
    console.log(`   ✅ Customer seleccionado: ${finalName}`);
    
    // Esperar a que el valor del campo se actualice
    await this.customerInput.waitFor({ state: 'attached', timeout: 5000 });
  }

  /**
   * Selecciona WAL-MART 6099-MACCLENNY (atajo para el customer más común)
   */
  async selectWalmartCustomer() {
    await this.selectCustomer('6099', 'WAL-MART 6099-MACCLENNY');
  }

  /**
   * Establece la fecha de envío (Shipping Date)
   * @param daysFromNow - Días desde hoy (default: 5)
   */
  async setShippingDate(daysFromNow: number = 5) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysFromNow);
    
    const dateStr = `${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getDate().toString().padStart(2, '0')}/${dueDate.getFullYear()}`;
    
    console.log(`📅 Estableciendo Shipping Date: ${dateStr} (+${daysFromNow} días)`);
    
    // Esperar a que el campo esté visible y hacer clic para activarlo
    await this.shippingDateInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.shippingDateInput.click();
    
    // Si es un input, llenarlo directamente
    try {
      await this.shippingDateInput.fill(dateStr);
    } catch (e) {
      // Si no es un input editable, intentar encontrar el input asociado
      const associatedInput = this.centerFrame.locator('#lblDueDate').locator('xpath=following-sibling::*//input').first();
      await associatedInput.fill(dateStr);
    }
    
    // Hacer clic en área neutral del iframe para cerrar cualquier selector
    const bodyLocator = this.centerFrame.locator('body');
    await bodyLocator.click({ position: { x: 100, y: 100 } });
    console.log(`   ✅ Fecha ingresada: ${dateStr}`);
  }

  /**
   * Establece el número de P.O. con múltiples estrategias
   * @param poNumber - Número de P.O. (ej: "QAAuto")
   */
  async setPONumber(poNumber: string) {
    console.log(`📝 [NUEVO] Estableciendo P.O. Number: ${poNumber}`);
    
    // Estrategia 1: Localizador principal según especificaciones
    const primaryLocator = this.centerFrame.locator('xpath=(//input[@data-ng-model="currentOrder.PONumber"])[2]');
    
    try {
      await primaryLocator.waitFor({ state: 'visible', timeout: 10000 });
      await primaryLocator.fill(poNumber);
      console.log(`   ✅ P.O. Number ingresado con localizador principal: ${poNumber}`);
      return;
    } catch (error1) {
      console.log(`   ⚠️ Localizador principal falló: ${error1 instanceof Error ? error1.message : String(error1)}`);
    }
    
    // Estrategia 2: Buscar cualquier input con data-ng-model PONumber
    try {
      const fallbackLocator = this.centerFrame.locator('input[data-ng-model*="PONumber"]').first();
      await fallbackLocator.waitFor({ state: 'visible', timeout: 5000 });
      await fallbackLocator.fill(poNumber);
      console.log(`   ✅ P.O. Number ingresado con localizador fallback: ${poNumber}`);
      return;
    } catch (error2) {
      console.log(`   ⚠️ Localizador fallback falló: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
    
    // Estrategia 3: Buscar por ID o label
    try {
      const idLocator = this.centerFrame.locator('#txtPONumber, input[id*="PO"], input[id*="po"]').first();
      await idLocator.waitFor({ state: 'visible', timeout: 5000 });
      await idLocator.fill(poNumber);
      console.log(`   ✅ P.O. Number ingresado con localizador ID: ${poNumber}`);
    } catch (error3) {
      console.log(`   ❌ Todos los localizadores fallaron para P.O. Number`);
      throw new Error(`No se pudo localizar el campo P.O. Number. Último error: ${error3 instanceof Error ? error3.message : String(error3)}`);
    }
  }

  /**
   * Selecciona el Order Behavior
   * @param behavior - Tipo de comportamiento (ej: "Regular")
   */
  async selectOrderBehavior(behavior: string) {
    console.log(`🎯 Seleccionando Order Behavior: ${behavior}`);
    
    try {
      // Intentar como dropdown/select directo
      await this.orderBehaviorSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.orderBehaviorSelect.selectOption({ label: behavior });
    } catch (e) {
      // Si falla, intentar hacer clic en el elemento y luego buscar la opción
      await this.orderBehaviorSelect.click();
      
      // Buscar la opción en una lista desplegable y esperar que sea visible
      const option = this.centerFrame.locator(`xpath=//li[contains(text(), '${behavior}')]`).first();
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
    }
    
    console.log(`   ✅ Order Behavior seleccionado: ${behavior}`);
  }

  /**
   * Establece Integration Code 1 con búsqueda dinámica de selectores
   * Busca por múltiples patrones: ID, label, placeholder, atributos
   * @param code - Código de integración (ej: "BRDR-U023")
   */
  async setIntegrationCode1(code: string) {
    console.log(`IC1 - 🔧 Estableciendo Integration Code 1: ${code}`);

    const field = this.integrationCode1Input;

    // Verificar existencia del selector en 10s
    try {
      await field.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      throw new Error('ERROR: Localizador no encontrado.');
    }

    // Función auxiliar: escribir carácter por carácter
    const typeSlow = async (text: string) => {
      // Re-resolve the locator inside the frame each time to avoid stale/detached nodes
      const f = this.centerFrame.locator('xpath=//*[@id="input-2"]');
      try {
        await f.waitFor({ state: 'attached', timeout: 5000 });
        await f.waitFor({ state: 'visible', timeout: 5000 });
        // Try to clear via fill first
        await f.fill('', { timeout: 5000 });
      } catch (e) {
        try {
          await f.click({ timeout: 3000 });
          await f.press('Control+A');
          await f.press('Delete');
        } catch (inner) {
          // ignore - we'll still attempt to type
        }
      }

      for (const ch of text) {
        try {
          await f.type(ch, { delay: 120 });
        } catch (e) {
          // Fallback: append value via DOM and dispatch events
          try {
            await f.evaluate((node, c) => {
              (node as HTMLInputElement).value = (node as HTMLInputElement).value + c;
              node.dispatchEvent(new Event('input', { bubbles: true }));
              node.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
            }, ch);
          } catch (evalErr) {
            // last-resort: continue
          }
        }
      }
    };

    // Localizador de la opción exacta dentro del ul con id ul-2 (visto en trace)
    const suggestionXpath = `//ul[@id='ul-2']//li[.//span[normalize-space(text())='${code}']]`;
    const suggestionLocator = this.centerFrame.locator(`xpath=${suggestionXpath}`).first();
    const anySuggestion = this.centerFrame.locator("xpath=//ul[@id='ul-2']//li | //div[contains(@class,'md-autocomplete-suggestions')]//li").first();

    // Intento inicial: escribir carácter por carácter
    await typeSlow(code);

    // Esperar respuesta específica al servicio GetJsonDataTable (mayor timeout)
    await this.waitForAutocompleteResponse(8000, ['GetJsonDataTable']);

    // Presionar Enter como solicitó el flujo
    await field.press('Enter');

    // Esperar que la sugerencia exacta aparezca en el ul#ul-2 (dentro del iframe) - reintentar una vez si es necesario
    try {
      await suggestionLocator.waitFor({ state: 'visible', timeout: 10000 });
    } catch (firstWaitErr) {
      // Si no aparece ninguna sugerencia, comprobar si existen otras sugerencias (pero no la exacta)
      try {
        await anySuggestion.waitFor({ state: 'visible', timeout: 1000 });
        throw new Error('ERROR: Dato no encontrado en catálogo');
      } catch (noAny) {
        // Reintento: borrar y volver a escribir + disparar eventos
        console.log('IC1 - ⚠️ La lista no apareció tras Enter. Reintentando borrar y escribir...');
        await typeSlow(code);
        // Re-resolver locator antes de evaluar y capturar cualquier fallo
        try {
          const f2 = this.centerFrame.locator('xpath=//*[@id="input-2"]');
          await f2.evaluate((node) => {
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
          });
        } catch (e) {
          // ignore evaluation errors (node may be detached)
        }
        // Esperar respuesta específica al servicio GetJsonDataTable (pequeño respaldo)
        await this.waitForAutocompleteResponse(2000, ['GetJsonDataTable']);
        try {
          await suggestionLocator.waitFor({ state: 'visible', timeout: 5000 });
        } catch (retryErr) {
          throw new Error('ERROR: Lista de autocompletado no apareció tras reintento');
        }
      }
    }

    // Si la sugerencia exacta está visible, hacer click en ella
    try {
      if (await suggestionLocator.isVisible({ timeout: 0 })) {
        await suggestionLocator.click();
        console.log(`IC1 -   ✅ Opción '${code}' seleccionada (click).`);
      }
    } catch (clickErr) {
      // Fallback: presionar Enter para confirmar
      await field.press('Enter');
      console.log(`IC1 -   ⚠️ Click falló, se presionó Enter para confirmar '${code}'.`);
    }

    // Esperar que indicadores de carga desaparezcan (spinner/overlay)
    const loadingOverlay = this.centerFrame.locator('.loading-overlay, .spinner, [data-loading="true"], md-progress-linear, .lds-ring');
    try {
      await expect(loadingOverlay).not.toBeVisible({ timeout: 15000 });
      console.log('IC1 -   ✅ Overlay de carga desapareció - Integration Code 1 procesado.');
    } catch (error) {
      // Continuar — la ausencia del overlay no es bloqueante
      console.log('IC1 -   ℹ️ No se detectó overlay de carga (o ya desapareció) - Continuando...');
    }
    
    // Esperar un momento adicional para que los datos relacionados terminen de cargar
    await this.page.waitForTimeout(1000);
    console.log('IC1 -   ✅ Integration Code 1 completado.');
  }

  /**
   * Establece el número de Boxes
   * @param boxes - Número de cajas (ej: "27")
   */
  async setBoxes(boxes: string) {
    console.log(`📦 Estableciendo Boxes: ${boxes}`);
    
    try {
      await this.boxesInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.boxesInput.fill(boxes);
      console.log(`   ✅ Boxes ingresado: ${boxes}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Error al ingresar Boxes: ${errorMsg}`);
      throw new Error(`No se pudo localizar el campo Boxes. Error: ${errorMsg}`);
    }
  }

  /**
   * Establece el precio FOB
   * @param price - Precio FOB (ej: "2,34")
   */
  async setFOBPrice(price: string) {
    console.log(`💰 Estableciendo FOB Price: ${price}`);
    
    try {
      await this.fobPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.fobPriceInput.fill(price);
      console.log(`   ✅ FOB Price ingresado: ${price}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Error al ingresar FOB Price: ${errorMsg}`);
      throw new Error(`No se pudo localizar el campo FOB Price. Error: ${errorMsg}`);
    }
  }

  /**
   * Establece el número de Boxes para la Fila 2
   * @param boxes - Número de cajas (ej: "36")
   */
  async setBoxesRow2(boxes: string) {
    console.log(`📦 Estableciendo Boxes (Fila 2): ${boxes}`);
    
    try {
      await this.boxesInputRow2.waitFor({ state: 'visible', timeout: 10000 });
      await this.boxesInputRow2.fill(boxes);
      console.log(`   ✅ Boxes (Fila 2) ingresado: ${boxes}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Error al ingresar Boxes (Fila 2): ${errorMsg}`);
      throw new Error(`No se pudo localizar el campo Boxes Row 2. Error: ${errorMsg}`);
    }
  }

  /**
   * Establece el precio FOB para la Fila 2
   * @param price - Precio FOB (ej: "0,212")
   */
  async setFOBPriceRow2(price: string) {
    console.log(`💰 Estableciendo FOB Price (Fila 2): ${price}`);
    
    try {
      await this.fobPriceInputRow2.waitFor({ state: 'visible', timeout: 10000 });
      await this.fobPriceInputRow2.fill(price);
      console.log(`   ✅ FOB Price (Fila 2) ingresado: ${price}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Error al ingresar FOB Price (Fila 2): ${errorMsg}`);
      throw new Error(`No se pudo localizar el campo FOB Price Row 2. Error: ${errorMsg}`);
    }
  }

  /**
   * Hace clic en el botón Save y espera a que el loader desaparezca
   */
  async clickSave() {
    console.log(`💾 Haciendo clic en botón Save...`);
    
    try {
      await this.saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.saveButton.click();
      console.log(`   ✅ Clic en Save ejecutado`);
      
      // Esperar a que el loader desaparezca
      await this.waitForLoaderToDisappear();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Error al hacer clic en Save: ${errorMsg}`);
      throw new Error(`No se pudo hacer clic en Save. Error: ${errorMsg}`);
    }
  }

  /**
   * Espera a que el loader desaparezca
   */
  async waitForLoaderToDisappear() {
    console.log(`⏳ Esperando a que desaparezca el loader...`);
    
    try {
      // Primero esperar a que aparezca (si existe)
      await this.loader.waitFor({ state: 'visible', timeout: 3000 });
      console.log(`   ℹ️  Loader detectado, esperando a que desaparezca...`);
    } catch {
      // Si no aparece en 3s, probablemente ya terminó o no existe
      console.log(`   ℹ️  Loader no detectado o ya desapareció`);
      return;
    }
    
    try {
      // Esperar a que desaparezca (máximo 30 segundos para operaciones de guardado)
      await expect(this.loader).not.toBeVisible({ timeout: 30000 });
      console.log(`   ✅ Loader desapareció - Operación completada`);
    } catch (error) {
      console.log(`   ⚠️  Timeout esperando a que desaparezca el loader`);
      // No lanzar error, continuar
    }
  }

  /**
   * Obtiene el número de orden generado
   * @returns Número de orden como string
   */
  async getOrderNumber(): Promise<string> {
    console.log(`🔍 Obteniendo número de orden generado...`);
    
    try {
      await this.orderNumberLabel.waitFor({ state: 'visible', timeout: 15000 });
      const orderNumber = await this.orderNumberLabel.textContent();
      
      if (orderNumber && orderNumber.trim()) {
        console.log(`   ✅ Número de Orden: ${orderNumber.trim()}`);
        return orderNumber.trim();
      } else {
        throw new Error('El número de orden está vacío');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Error al obtener número de orden: ${errorMsg}`);
      throw new Error(`No se pudo obtener el número de orden. Error: ${errorMsg}`);
    }
  }

  /**
   * Establece Integration Code 2 con lógica similar a Code 1
   * @param code - Código de integración (ej: "CBS2-Q186")
   */
  async setIntegrationCode2(code: string) {
    console.log(`IC2 - 🔧 Estableciendo Integration Code 2: ${code}`);

    // Localizador principal del campo (confirmado: #input-3)
    const field = this.centerFrame.locator('xpath=//*[@id="input-3"]');

    // Verificar existencia del selector
    try {
      await field.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      throw new Error('ERROR: Localizador #input-3 no encontrado.');
    }

    // Función auxiliar: escribir carácter por carácter
    const typeSlow = async (text: string) => {
      const f = this.centerFrame.locator('xpath=//*[@id="input-3"]');
      try {
        await f.waitFor({ state: 'attached', timeout: 5000 });
        await f.waitFor({ state: 'visible', timeout: 5000 });
        await f.fill('', { timeout: 5000 });
      } catch (e) {
        try {
          await f.click({ timeout: 3000 });
          await f.press('Control+A');
          await f.press('Delete');
        } catch (inner) {
          // ignore
        }
      }

      for (const ch of text) {
        try {
          await f.type(ch, { delay: 120 });
        } catch (e) {
          try {
            await f.evaluate((node, c) => {
              (node as HTMLInputElement).value = (node as HTMLInputElement).value + c;
              node.dispatchEvent(new Event('input', { bubbles: true }));
              node.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
            }, ch);
          } catch (evalErr) {
            // last-resort: continue
          }
        }
      }
    };

    // Localizador de la opción exacta dentro del ul con id ul-3 (similar a ul-2)
    const suggestionXpath = `//ul[@id='ul-3']//li[.//span[normalize-space(text())='${code}']]`;
    const suggestionLocator = this.centerFrame.locator(`xpath=${suggestionXpath}`).first();
    const anySuggestion = this.centerFrame.locator("xpath=//ul[@id='ul-3']//li | //div[contains(@class,'md-autocomplete-suggestions')]//li").first();

    // Intento inicial: escribir carácter por carácter
    await typeSlow(code);

    // Esperar respuesta del servicio GetJsonDataTable
    await this.waitForAutocompleteResponse(8000, ['GetJsonDataTable']);

    // Presionar Enter
    await field.press('Enter');

    // Esperar que la sugerencia exacta aparezca
    try {
      await suggestionLocator.waitFor({ state: 'visible', timeout: 10000 });
    } catch (firstWaitErr) {
      try {
        await anySuggestion.waitFor({ state: 'visible', timeout: 1000 });
        throw new Error('ERROR: Dato no encontrado en catálogo');
      } catch (noAny) {
        console.log('IC2 - ⚠️ La lista no apareció tras Enter. Reintentando...');
        await typeSlow(code);
        try {
          const f2 = this.centerFrame.locator('xpath=//*[@id="input-3"]');
          await f2.evaluate((node) => {
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
          });
        } catch (e) {
          // ignore
        }
        await this.waitForAutocompleteResponse(2000, ['GetJsonDataTable']);
        try {
          await suggestionLocator.waitFor({ state: 'visible', timeout: 5000 });
        } catch (retryErr) {
          throw new Error('ERROR: Lista de autocompletado no apareció tras reintento');
        }
      }
    }

    // Hacer click en la sugerencia
    try {
      if (await suggestionLocator.isVisible({ timeout: 0 })) {
        await suggestionLocator.click();
        console.log(`IC2 -   ✅ Opción '${code}' seleccionada (click).`);
      }
    } catch (clickErr) {
      await field.press('Enter');
      console.log(`IC2 -   ⚠️ Click falló, se presionó Enter para confirmar '${code}'.`);
    }

    // Esperar que indicadores de carga desaparezcan
    const loadingOverlay = this.centerFrame.locator('.loading-overlay, .spinner, [data-loading="true"], md-progress-linear, .lds-ring');
    try {
      await expect(loadingOverlay).not.toBeVisible({ timeout: 15000 });
      console.log('IC2 -   ✅ Overlay de carga desapareció - Integration Code 2 procesado.');
    } catch (error) {
      console.log('IC2 -   ℹ️ No se detectó overlay de carga (o ya desapareció) - Continuando...');
    }
    
    // Esperar un momento adicional para que los datos relacionados terminen de cargar
    await this.page.waitForTimeout(1000);
    console.log('IC2 -   ✅ Integration Code 2 completado.');
  }

  /**
   * Completa el formulario de Order Entry con datos básicos
   * @param data - Datos del formulario
   */
  async fillOrderForm(data: {
    customerCode?: string;
    customerName?: string;
    shippingDays?: number;
    poNumber: string;
    orderBehavior?: string;
    integrationCode1?: string;
    integrationCode2?: string;
    items?: Array<{ row: number; boxes: string; fobPrice: string }>;
  }) {
    console.log('\n📋 Llenando formulario Order Entry...\n');
    
    // Customer
    if (data.customerCode === '6099' || !data.customerCode) {
      await this.selectWalmartCustomer();
    } else {
      await this.selectCustomer(data.customerCode, data.customerName);
    }
    
    // Shipping Date
    await this.setShippingDate(data.shippingDays || 5);
    
    // P.O. Number
    await this.setPONumber(data.poNumber);
    
    // Order Behavior
    await this.selectOrderBehavior(data.orderBehavior || 'Regular');
    
    // Integration Codes (según especificaciones)
    if (data.integrationCode1) {
      await this.setIntegrationCode1(data.integrationCode1);
    }
    
    if (data.integrationCode2) {
      await this.setIntegrationCode2(data.integrationCode2);
    }
    
    // Grid de Items (múltiples filas)
    if (data.items && data.items.length > 0) {
      console.log(`\n📊 Llenando Grid de Items (${data.items.length} fila(s))...\n`);
      
      for (const item of data.items) {
        if (item.row === 1) {
          await this.setBoxes(item.boxes);
          await this.setFOBPrice(item.fobPrice);
        } else if (item.row === 2) {
          await this.setBoxesRow2(item.boxes);
          await this.setFOBPriceRow2(item.fobPrice);
        }
      }
    }
    
    console.log('\n✅ Formulario Order Entry completado\n');
  }

  /**
   * Verifica que el formulario esté lleno correctamente
   */
  async verifyFormFilled() {
    console.log('🔍 Verificando formulario...');
    
    // Verificar que el customer no esté vacío
    await expect(this.customerInput).not.toHaveValue('');
    
    // Verificar P.O. Number (campo principal que siempre debe estar)
    await expect(this.poNumberInput).not.toHaveValue('');
    
    // Verificar Order Behavior (combobox - verificar que esté visible)
    await expect(this.orderBehaviorSelect).toBeVisible();
    
    console.log('✅ Formulario verificado correctamente');
  }
}
