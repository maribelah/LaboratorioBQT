import { Page, FrameLocator, Locator } from '@playwright/test';

/**
 * OrderEntryElements - Selectores de elementos UI para página Order Entry
 * 
 * IMPORTANTE: Order Entry usa estructura de iframes:
 * - left_page1: Menú de navegación
 * - center_page: Formulario de Order Entry
 * 
 * Todos los selectores retornan funciones que aceptan Page y retornan Locator/FrameLocator.
 * 
 * @example
 * ```typescript
 * const page = actor.abilityTo(BrowseTheWeb).page;
 * const centerFrame = OrderEntryElements.centerFrame(page);
 * const customerInput = OrderEntryElements.customerInput(centerFrame);
 * await customerInput.fill('6099');
 * ```
 */
export const OrderEntryElements = {
  // ==========================================
  // FRAMES
  // ==========================================
  
  /**
   * Frame del menú lateral (left_page1)
   */
  leftFrame: (page: Page): FrameLocator => 
    page.frameLocator("xpath=//iframe[@id='left_page1']"),
  
  /**
   * Frame del contenido central (center_page)
   */
  centerFrame: (page: Page): FrameLocator => 
    page.frameLocator("xpath=//iframe[@id='center_page']"),
  
  // ==========================================
  // MENÚ DE NAVEGACIÓN (left_page1)
  // ==========================================
  
  /**
   * Opción "Sales" en el menú lateral (segundo elemento)
   */
  salesMenuItem: (leftFrame: FrameLocator): Locator => 
    leftFrame.locator("xpath=(//div[contains(text(), 'Sales')])[2]"),
  
  /**
   * Opción "New" dentro del submenú Sales (con subSales)
   */
  newMenuItem: (leftFrame: FrameLocator): Locator => 
    leftFrame.locator("xpath=//ul[@id='subSales']//div[contains(text(), 'New')]"),
  
  /**
   * Opción "Order Entry" dentro del submenú New
   */
  orderEntryMenuItem: (leftFrame: FrameLocator): Locator => 
    leftFrame.locator("xpath=//ul[@id='subSales']//div[@title='New']//span[contains(text(), 'Order Entry')]"),
  
  // ==========================================
  // FORMULARIO ORDER ENTRY (center_page)
  // ==========================================
  
  /**
   * Input de Customer (autocompletar)
   */
  customerInput: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('#txtCustomer'),
  
  /**
   * Opción de customer WAL-MART (data-item-key="201")
   */
  customerOptionWalmart: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=//div[@data-item-key="201"]'),
  
  /**
   * Input de Shipping Date
   */
  shippingDateInput: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('#lblDueDate'),
  
  /**
   * Input de P.O. Number (segundo elemento con data-ng-model)
   */
  poNumberInput: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=(//input[@data-ng-model="currentOrder.PONumber"])[2]'),
  
  /**
   * Select de Order Behavior
   */
  orderBehaviorSelect: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('#lblOrderBehavior'),
  
  /**
   * Input de Integration Code 1
   */
  integrationCode1Input: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=//*[@id="input-2"]'),
  
  /**
   * Input de Integration Code 2
   */
  integrationCode2Input: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=//*[@id="input-3"]'),
  
  /**
   * Input de Boxes (fila 1 del grid)
   */
  boxesInputRow1: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=(//input[@ng-model="data.Boxes"])[1]'),
  
  /**
   * Input de FOB Price (fila 1 del grid)
   */
  fobPriceInputRow1: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=(//input[@ng-model="data.Price"])[1]'),
  
  /**
   * Input de Boxes (fila 2 del grid)
   */
  boxesInputRow2: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=(//input[@ng-model="data.Boxes"])[2]'),
  
  /**
   * Input de FOB Price (fila 2 del grid)
   */
  fobPriceInputRow2: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=(//input[@ng-model="data.Price"])[2]'),
  
  /**
   * Botón Save
   */
  saveButton: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('#btnSave'),
  
  /**
   * Loader/Spinner (barra de progreso circular)
   */
  loader: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=//md-progress-circular[@md-mode="indeterminate"]'),
  
  /**
   * Label donde aparece el número de orden generado
   */
  orderNumberLabel: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('css=#divForm > div.row.mt-2.animate-show.animate-hide > div:nth-child(1) > div:nth-child(1) > label.col-form-label.col-sm-8.ng-scope > span'),
  
  // ==========================================
  // ELEMENTOS DE AUTOCOMPLETAR (para esperar respuestas)
  // ==========================================
  
  /**
   * Elemento genérico de "Working..." para esperar
   */
  workingIndicator: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('text=Working...'),
  
  /**
   * Cualquier opción de autocompletar (genérico)
   */
  autocompleteOption: (centerFrame: FrameLocator, dataItemKey: string): Locator => 
    centerFrame.locator(`xpath=//div[@data-item-key="${dataItemKey}"]`),
  
  /**
   * Opción del autocomplete de productos (Integration Codes)
   * Busca por texto dentro del botón de las opciones
   */
  productAutocompleteOption: (centerFrame: FrameLocator, productCode: string): Locator => 
    centerFrame.locator(`xpath=//button[contains(text(), '${productCode}')]`).first(),
  
  /**
   * Lista desplegable del autocomplete de productos
   */
  productAutocompleteList: (centerFrame: FrameLocator): Locator => 
    centerFrame.locator('xpath=//div[@role="listbox" or @class="md-autocomplete-suggestions"]')
};
