import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { NewPOPage } from '../src/pages/NewPOPage';
import { ProductSearchModal } from '../src/pages/ProductSearchModal';
import { QuickFillModal } from '../src/pages/QuickFillModal';

/**
 * Test Suite: Webflowers New PO Creation - FLUJO COMPLETO
 * Arquitectura: frame[@name='main'] -> iframe#left_page1 (menú) + iframe#center_page (contenido)
 * Telemetría: Medición de tiempos por bloque usando console.time/timeEnd
 * Evidencia: Screenshots en cada paso crítico usando testInfo.attach()
 * 
 * FLUJO:
 * 1. Login (qaauto / qaauto)
 * 2. Navegar: Procurement -> Products -> New PO
 * 3. Verificar formulario cargado (Vendor, Carrier, Date)
 * 4. QuickSearch: Seleccionar "All" y buscar "Rose"
 * 5. Seleccionar primeros 2 productos y cerrar modal
 * 6. QuickFill: Customer (COSTCO), Boxes (10), Cost (12), Check All, Apply
 * 7. Guardar PO y capturar número desde #lblPOId
 */

test.describe('Webflowers New PO - E2E Flow', () => {
  
  test('Create New Purchase Order with QuickSearch and QuickFill', async ({ page }, testInfo) => {
    // ══════════════════════════════════════════════════════════════════
    // CONFIGURACIÓN E INICIALIZACIÓN
    // ══════════════════════════════════════════════════════════════════
    console.log('\n╔═════════════════════════════════════════════════════════╗');
    console.log('║   WEBFLOWERS ERP - NEW PO AUTOMATION TEST               ║');
    console.log('╚═════════════════════════════════════════════════════════╝\n');
    
    // Inicializar Page Objects
    const loginPage = new LoginPage(page);
    const newPOPage = new NewPOPage(page);
    const quickSearchModal = new ProductSearchModal(page);
    const quickFillModal = new QuickFillModal(page);

    // ══════════════════════════════════════════════════════════════════
    // PASO 1: LOGIN
    // ══════════════════════════════════════════════════════════════════
    await test.step('01 - Login to Webflowers', async () => {
      console.time('⏱️  01_LOGIN');
      console.log('\n📍 PASO 1: LOGIN');
      console.log('─'.repeat(60));
      
      await page.goto('https://betambb.ghtcorptest.com/');
      
      // Si aparece MFA, pausar para completar manualmente
      const mfaPresent = await page.locator('text=/MFA|Two.Factor|Verification/i').count() > 0;
      if (mfaPresent) {
        console.log('⚠️  MFA detected - Complete manually');
        await page.pause();
      }
      
      // Login con credenciales
      await loginPage.login('qaauto', 'qaauto');
      await loginPage.wait(3000);
      
      // Screenshot post-login
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('01_Login_Success', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  01_LOGIN');
      console.log('✅ Login completado\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // PASO 2: NAVEGACIÓN A NEW PO
    // ══════════════════════════════════════════════════════════════════
    await test.step('02 - Navigate to New PO', async () => {
      console.time('⏱️  02_NAVIGATION');
      console.log('\n📍 PASO 2: NAVEGACIÓN');
      console.log('─'.repeat(60));
      
      // Navegar: Procurement -> Products -> New PO
      await newPOPage.navigateToNewPO();
      await newPOPage.waitForCenterFrameReady();
      
      // Screenshot de la pantalla New PO
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('02_NewPO_Form', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  02_NAVIGATION');
      console.log('✅ Navegación completada\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // PASO 3: COMPLETAR CABECERA - VENDOR Y CARRIER
    // ══════════════════════════════════════════════════════════════════
    await test.step('03 - Fill Header: Vendor and Carrier', async () => {
      console.time('⏱️  03_FILL_HEADER');
      console.log('\n📍 PASO 3: COMPLETAR CABECERA (VENDOR Y CARRIER)');
      console.log('─'.repeat(60));
      
      // Verificar que formulario esté cargado
      await newPOPage.waitForVendorVisible();
      await newPOPage.waitForCarrierVisible();
      
      // Seleccionar Vendor: Florexpo Central
      await newPOPage.selectVendor('Florexpo Central');
      
      // Seleccionar Carrier: Florexpo
      await newPOPage.selectCarrier('Florexpo');
      
      // Screenshot del formulario con cabecera completada
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('03_Header_Completed', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  03_FILL_HEADER');
      console.log('✅ Cabecera completada correctamente\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // PASO 4: QUICKSEARCH - CONFIGURAR CRITERIO Y BUSCAR
    // ══════════════════════════════════════════════════════════════════
    await test.step('04 - QuickSearch: Configure and Search', async () => {
      console.time('⏱️  04_QUICKSEARCH_SEARCH');
      console.log('\n📍 PASO 4: QUICKSEARCH - CONFIGURAR Y BUSCAR');
      console.log('─'.repeat(60));
      
      // Abrir modal QuickSearch (cmbAddProduct -> QuickSearch)
      await newPOPage.openQuickSearch();
      
      // EN EL POPUP: Seleccionar "All" en apcOrder_cmbSearchProductBy
      await quickSearchModal.selectSearchBy('All');
      
      // Escribir "Rose" en txtSearch y hacer click en btnSearch
      await quickSearchModal.searchProduct('Rose');
      
      // Screenshot de resultados de búsqueda
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('04_QuickSearch_Results', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  04_QUICKSEARCH_SEARCH');
      console.log('✅ Búsqueda completada\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // PASO 5: BUSCAR Y SELECCIONAR PRODUCTOS
    // ══════════════════════════════════════════════════════════════════
    await test.step('05 - Search and Select Products', async () => {
      console.time('⏱️  05_SEARCH_SELECT');
      console.log('\n📍 PASO 5: BÚSQUEDA Y SELECCIÓN DE PRODUCTOS');
      console.log('─'.repeat(60));
      
      // Buscar "Rose"
      await quickSearchModal.searchProduct('Rose');
      
      // Seleccionar primeros 2 productos
      await quickSearchModal.selectFirstProducts(2);
      
      // Screenshot de productos seleccionados
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('05_Products_Selected', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  05_SEARCH_SELECT');
      console.log('✅ Productos seleccionados\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // PASO 6: CERRAR MODAL Y AGREGAR PRODUCTOS
    // ══════════════════════════════════════════════════════════════════
    await test.step('06 - Close Modal and Add Products', async () => {
      console.time('⏱️  06_CLOSE_MODAL');
      console.log('\n📍 PASO 6: CERRAR MODAL Y AGREGAR');
      console.log('─'.repeat(60));
      
      // Cerrar modal con botón "Close and Add Product"
      await quickSearchModal.closeAndAddProducts();
      
      // Esperar a que los productos se agreguen a la grilla
      await newPOPage.wait(2000);
      
      // Screenshot de productos agregados en la grilla
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('06_Products_Added_To_Grid', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  06_CLOSE_MODAL');
      console.log('✅ Productos agregados a la PO\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // PASO 7: QUICKFILL - LLENAR INFORMACIÓN DE PRODUCTOS
    // ══════════════════════════════════════════════════════════════════
    await test.step('07 - QuickFill: Fill Customer, Boxes, Cost', async () => {
      console.time('⏱️  07_QUICKFILL');
      console.log('\n📍 PASO 7: QUICKFILL - LLENADO DE DATOS');
      console.log('─'.repeat(60));
      
      // Abrir modal QuickFill
      await newPOPage.clickQuickFill();
      
      // Llenar formulario: Customer=COSTCO WHOLESALE, Boxes=10, Cost=12
      await quickFillModal.fillQuickFillForm('COSTCO WHOLESALE', '10', '12');
      
      // Aplicar QuickFill
      await quickFillModal.applyQuickFill();
      
      // Screenshot post-QuickFill
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('07_QuickFill_Applied', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  07_QUICKFILL');
      console.log('✅ QuickFill completado\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // PASO 8: GUARDAR PO
    // ══════════════════════════════════════════════════════════════════
    await test.step('08 - Save Purchase Order', async () => {
      console.time('⏱️  08_SAVE_PO');
      console.log('\n📍 PASO 8: GUARDAR PURCHASE ORDER');
      console.log('─'.repeat(60));
      
      // Guardar la PO
      await newPOPage.savePO();
      
      // Screenshot post-guardado
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('08_PO_Saved', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  08_SAVE_PO');
      console.log('✅ PO guardada exitosamente\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // PASO 9: CAPTURAR NÚMERO DE PO
    // ══════════════════════════════════════════════════════════════════
    await test.step('09 - Capture PO Number', async () => {
      console.time('⏱️  09_CAPTURE_PO');
      console.log('\n📍 PASO 9: EXTRACCIÓN DE NÚMERO DE PO');
      console.log('─'.repeat(60));
      
      // Obtener número de PO del label #lblPOId
      const poNumber = await newPOPage.getPONumber();
      
      // Validar que el número no esté vacío
      expect(poNumber).toBeTruthy();
      expect(poNumber.length).toBeGreaterThan(0);
      
      // Screenshot final con PO Number visible
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('09_Final_PO_Number', {
        body: screenshot,
        contentType: 'image/png'
      });
      
      console.timeEnd('⏱️  09_CAPTURE_PO');
      console.log('✅ Número de PO capturado\n');
    });

    // ══════════════════════════════════════════════════════════════════
    // RESUMEN FINAL
    // ══════════════════════════════════════════════════════════════════
    console.log('\n╔═════════════════════════════════════════════════════════╗');
    console.log('║               TEST COMPLETADO EXITOSAMENTE              ║');
    console.log('╚═════════════════════════════════════════════════════════╝\n');
  });
});
