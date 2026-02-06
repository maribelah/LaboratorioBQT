import { Page, FrameLocator, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para el modal QuickSearch de Webflowers
 * El modal se abre en el center_page frame después de invocar QuickSearch
 * IDs basados en selectores reales del sistema
 */
export class ProductSearchModal extends BasePage {
  private centerFrame: FrameLocator;

  // Locators del modal QuickSearch (IDs reales proporcionados del POPUP)
  readonly searchBySelect: Locator;       // id=apcOrder_cmbSearchProductBy (dentro del popup)
  readonly searchInput: Locator;          // id=txtSearch
  readonly searchButton: Locator;         // id=btnSearch (imagen clickeable)
  readonly closeAndAddButton: Locator;    // id=apcOrder_btncloseAndAddProduct

  constructor(page: Page) {
    super(page);
    
    // Estructura REAL: iframe[2] es center_page (hijo directo de page)
    this.centerFrame = this.page.frameLocator('iframe').nth(2);
    
    // Locators del modal QuickSearch con IDs REALES
    // Usar :visible o .first() para evitar las 34 instancias hidden
    this.searchBySelect = this.centerFrame.locator('#apcOrder_cmbSearchProductBy').first();
    this.searchInput = this.centerFrame.locator('#txtSearch').first();
    this.searchButton = this.centerFrame.locator('#btnSearch').first();
    this.closeAndAddButton = this.centerFrame.locator('#apcOrder_btncloseAndAddProduct').first();
  }

  /**
   * Selecciona el criterio de búsqueda en el popup QuickSearch
   * @param searchBy - Criterio (ej: "All", "Product Name", etc.)
   */
  async selectSearchBy(searchBy: string = 'All') {
    console.log(`  🔍 Seleccionando criterio: "${searchBy}" en popup...`);
    
    // Esperar más tiempo para que el popup cargue completamente
    await this.wait(2000);
    
    // Usar attached + force porque puede estar inicialmente hidden
    await this.searchBySelect.waitFor({ state: 'attached', timeout: 15000 });
    
    try {
      // Intentar seleccionar por label
      await this.searchBySelect.selectOption({ label: searchBy }, { force: true });
      console.log(`  ✅ Criterio "${searchBy}" seleccionado`);
    } catch (e) {
      // Fallback: índice 0 (típicamente "All")
      console.log('  ⚠️  Selección por label falló, usando índice 0...');
      await this.searchBySelect.selectOption({ index: 0 }, { force: true });
    }
    
    await this.wait(500);
  }

  /**
   * Busca un producto por nombre en QuickSearch
   * @param productName - Nombre del producto (ej: "Rose")
   */
  async searchProduct(productName: string) {
    console.log(`  🔎 Buscando producto: "${productName}"...`);
    
    // Esperar a que el input esté adjunto al DOM
    await this.searchInput.waitFor({ state: 'attached', timeout: 15000 });
    
    // Ingresar el término de búsqueda con force
    await this.searchInput.fill(productName, { force: true });
    console.log(`  ✅ Texto "${productName}" ingresado en txtSearch`);
    await this.wait(1500); // Esperar a que la UI reaccione
    
    // Hacer clic en el botón Search (imagen con onclick)
    console.log('  🔎 Haciendo clic en btnSearch (imagen)...');
    await this.searchButton.click({ force: true, timeout: 15000 });
    
    // Esperar a que desaparezca "Working..." (CRÍTICO según user)
    console.log('  ⏳ Esperando que desaparezca "Working..."...');
    await this.wait(3000); // Espera inicial para que empiece el loader
    
    // Usar método heredado de BasePage
    await this.waitForLoadingComplete(this.centerFrame);
    
    console.log(`  ✅ Búsqueda completada: "${productName}"`);
  }

  /**
   * Selecciona los primeros N productos de la lista de resultados
   * Hace clic en elementos específicos por su atributo title
   * @param count - Cantidad de productos a seleccionar (default: 2)
   */
  async selectFirstProducts(count: number = 2) {
    console.log(`  ☑️  Seleccionando primeros ${count} productos...`);
    
    // Esperar a que aparezcan los resultados
    await this.wait(2000);
    
    // Títulos específicos de los productos a seleccionar (proporcionados por el usuario)
    const productTitles = [
      '80 CM RFA RED ROSE COSTCO',
      'AL ASST COLOR ROSE VASE MDAY'
    ];
    
    let selectedCount = 0;
    
    // Seleccionar productos por su atributo title
    for (let i = 0; i < productTitles.length && i < count; i++) {
      const title = productTitles[i];
      console.log(`  🌹 Buscando producto: "${title}"...`);
      
      try {
        // Buscar elemento con el atributo title exacto
        const productElement = this.centerFrame.locator(`[title="${title}"]`).first();
        
        // Esperar y hacer clic
        await productElement.waitFor({ state: 'visible', timeout: 10000 });
        await productElement.click({ timeout: 5000 });
        
        selectedCount++;
        console.log(`    ✓ Producto ${selectedCount} seleccionado: "${title}"`);
        await this.wait(500);
      } catch (e) {
        console.log(`    ⚠️  Producto "${title}" no encontrado o no clickeable`);
        console.log(`       Error: ${e}`);
      }
    }
    
    console.log(`  ✅ ${selectedCount} de ${count} productos seleccionados`);
  }

  /**
   * Cierra el modal y agrega los productos seleccionados
   */
  async closeAndAddProducts() {
    console.log('  ➕ Cerrando modal y agregando productos...');
    
    await this.closeAndAddButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.closeAndAddButton.click();
    
    console.log('  ⏳ Esperando carga después de agregar productos...');
    await this.wait(2000);
    
    // Usar método heredado de BasePage
    await this.waitForLoadingComplete(this.centerFrame);
    
    console.log('  ✅ Productos agregados correctamente');
  }
}
