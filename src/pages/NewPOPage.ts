import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para New PO (Purchase Order) de Webflowers ERP
 * Usa estructura de iframes: frame[@name='main'] -> iframe[@id='left_page1'] y iframe[@id='center_page']
 * Selectores basados en IDs reales proporcionados del sistema
 */
export class NewPOPage extends BasePage {
  // Estructura de iframes de Webflowers (CONFIRMADA)
  private mainFrame: FrameLocator;
  private leftFrame: FrameLocator;   // Menu lateral (left_page1)
  private centerFrame: FrameLocator; // Contenido principal (center_page)

  // Selectores para el formulario de New PO (IDs exactos del sistema)
  readonly addProductsButton: Locator;           // id=cmbAddProduct
  readonly quickSearchSelect: Locator;           // id=apcOrder_cmbSearchProductBy
  readonly vendorDropdown: Locator;              // id=lblVendor
  readonly carrierDropdown: Locator;             // id=lblCarriers
  readonly orderDateInput: Locator;              // id=txtDueDate
  readonly quickFillButton: Locator;             // id=btnQuickFill
  readonly saveButton: Locator;                  // id=btnSave
  readonly poNumberLabel: Locator;               // id=lblPOId
  readonly closeAndAddProductButton: Locator;    // id=apcOrder_btncloseAndAddProduct

  constructor(page: Page) {
    super(page);
    
    // Estructura de iframes REAL y COMPROBADA:
    // Los iframes son hijos DIRECTOS de page (NO existe frame[@name='main'])
    // iframe[0] = header
    // iframe[1] = left_page1 (menú lateral)
    // iframe[2] = center_page (contenido principal)
    
    this.mainFrame = this.page.frameLocator('iframe'); // Referencia base
    this.leftFrame = this.page.frameLocator('iframe').nth(1);
    this.centerFrame = this.page.frameLocator('iframe').nth(2);
    
    // Locators del formulario New PO con IDs REALES del sistema
    this.addProductsButton = this.centerFrame.locator('#cmbAddProduct');
    this.quickSearchSelect = this.centerFrame.locator('#apcOrder_cmbSearchProductBy');
    this.vendorDropdown = this.centerFrame.locator('#lblVendor');
    this.carrierDropdown = this.centerFrame.locator('#lblCarriers');
    this.orderDateInput = this.centerFrame.locator('#txtDueDate');
    this.quickFillButton = this.centerFrame.locator('#btnQuickFill');
    this.saveButton = this.centerFrame.locator('#btnSave');
    this.poNumberLabel = this.centerFrame.locator('#lblPOId');
    this.closeAndAddProductButton = this.centerFrame.locator('#apcOrder_btncloseAndAddProduct');
  }

  /**
   * Helper para obtener el frame de contenido central
   */
  getCenterFrame(): FrameLocator {
    return this.centerFrame;
  }

  /**
   * Helper para obtener el frame del menú lateral (left_page1)
   */
  getLeftFrame(): FrameLocator {
    return this.leftFrame;
  }

  /**
   * Navega a New PO: Procurement -> Products -> New PO
   * Usa la estructura de iframes: main -> left_page1 (módulos)
   */
  async navigateToNewPO() {
    console.log('🧭 Iniciando navegación: Procurement -> Products -> New PO');
    
    const menuFrame = this.getLeftFrame();
    
    // Esperar a que el frame de módulos esté disponible
    await this.wait(2000);
    await this.waitForLoadingComplete();
    
    // Paso 1: Click en Procurement - usar XPath específico (segundo elemento)
    console.log('  ▶️  Haciendo clic en Procurement...');
    const procurementMenu = menuFrame.locator('xpath=(//div[contains(text(), "Procurement")])[2]');
    await procurementMenu.click({ timeout: 15000 });
    await this.wait(1500);
    await this.waitForLoadingComplete();
    
    // Paso 2: Click en Products - usar XPath específico (segundo elemento)
    console.log('  ▶️  Haciendo clic en Products...');
    const productsMenu = menuFrame.locator('xpath=(//div[contains(text(), "Products")])[2]');
    await productsMenu.click({ timeout: 15000 });
    await this.wait(1500);
    await this.waitForLoadingComplete();
    
    // Paso 3: Click en New PO - usar XPath específico con span (primer elemento)
    console.log('  ▶️  Haciendo clic en New PO...');
    const newPOMenu = menuFrame.locator('xpath=//span[contains(text(), "New PO")]').first();
    await newPOMenu.click({ timeout: 15000 });
    await this.wait(2000);
    await this.waitForLoadingComplete();
    
    console.log('✅ Navegación completada');
  }

  /**
   * Verifica que el vendor esté visible
   */
  async waitForVendorVisible() {
    console.log('📋 Verificando Vendor visible...');
    await this.vendorDropdown.waitFor({ state: 'visible', timeout: 15000 });
    const vendorText = await this.vendorDropdown.innerText();
    console.log(`  ✅ Vendor: ${vendorText}`);
    await this.wait(500);
  }

  /**
   * Verifica que el carrier esté visible
   */
  async waitForCarrierVisible() {
    console.log('🚚 Verificando Carrier visible...');
    await this.carrierDropdown.waitFor({ state: 'visible', timeout: 15000 });
    const carrierText = await this.carrierDropdown.innerText();
    console.log(`  ✅ Carrier: ${carrierText}`);
    await this.wait(500);
  }

  /**
   * Selecciona un Vendor del dropdown
   * @param vendorName - Nombre del vendor (ej: "Florexpo Central")
   */
  async selectVendor(vendorName: string) {
    console.log(`🏢 Seleccionando Vendor: "${vendorName}"...`);
    
    await this.vendorDropdown.waitFor({ state: 'visible', timeout: 15000 });
    await this.wait(1000);
    
    // Es un select dropdown HTML estándar
    await this.vendorDropdown.selectOption({ label: vendorName });
    console.log(`  ✅ Vendor "${vendorName}" seleccionado`);
    await this.wait(1000);
  }

  /**
   * Selecciona un Carrier del dropdown
   * @param carrierName - Nombre del carrier (ej: "Florexpo")
   */
  async selectCarrier(carrierName: string) {
    console.log(`🚚 Seleccionando Carrier: "${carrierName}"...`);
    
    await this.carrierDropdown.waitFor({ state: 'visible', timeout: 15000 });
    await this.wait(1000);
    
    // Es un select dropdown HTML estándar
    await this.carrierDropdown.selectOption({ label: carrierName });
    console.log(`  ✅ Carrier "${carrierName}" seleccionado`);
    await this.wait(1000);
  }

  /**
   * Abre el modal de QuickSearch
   * Selecciona value="QuickSearch" en el select #cmbAddProduct
   */
  async openQuickSearch() {
    console.log('🔍 Abriendo QuickSearch...');
    
    // cmbAddProduct es un SELECT - seleccionar opción value="QuickSearch"
    console.log('  ▶️  Seleccionando QuickSearch en cmbAddProduct...');
    await this.addProductsButton.waitFor({ state: 'visible', timeout: 15000 });
    
    try {
      // Intentar por value exacto
      await this.addProductsButton.selectOption({ value: 'QuickSearch' });
      console.log('  ✅ QuickSearch seleccionado por value');
    } catch (e) {
      try {
        // Fallback: por label (string literal)
        await this.addProductsButton.selectOption({ label: 'QuickSearch' });
        console.log('  ✅ QuickSearch seleccionado por label');
      } catch (e2) {
        // Último intento: por índice
        console.log('  ⚠️  Selección por value/label falló, intentando índice 1...');
        await this.addProductsButton.selectOption({ index: 1 });
      }
    }
    
    // Esperar a que el popup/modal se abra
    await this.wait(2000);
    await this.waitForLoadingComplete();
    console.log('✅ Modal QuickSearch abierto');
  }

  /**
   * Hace clic en el botón QuickFill para abrir el modal de llenado rápido
   */
  async clickQuickFill() {
    console.log('📦 Abriendo QuickFill...');
    await this.quickFillButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.quickFillButton.click();
    await this.wait(2000);
    await this.waitForLoadingComplete();
    console.log('✅ Modal QuickFill abierto');
  }

  /**
   * Guarda la PO y espera confirmación
   */
  async savePO() {
    console.log('💾 Guardando Purchase Order...');
    await this.saveButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.saveButton.click();
    
    // Esperar a que el loader desaparezca completamente
    await this.wait(3000);
    await this.waitForLoadingComplete();
    
    console.log('✅ Purchase Order guardada exitosamente');
  }

  /**
   * Obtiene el número de PO generado desde #lblPOId
   * @returns El número de PO como string
   */
  async getPONumber(): Promise<string> {
    console.log('🔢 Extrayendo número de Purchase Order...');
    await this.poNumberLabel.waitFor({ state: 'visible', timeout: 20000 });
    const poNumber = await this.poNumberLabel.innerText();
    console.log(`\n═══════════════════════════════════════`);
    console.log(`📋 PO GENERADA: ${poNumber}`);
    console.log(`═══════════════════════════════════════\n`);
    return poNumber;
  }

  /**
   * Espera que el iframe center_page esté completamente cargado
   */
  async waitForCenterFrameReady() {
    await this.wait(1500);
    await this.waitForLoadingComplete(this.centerFrame);
  }
}
