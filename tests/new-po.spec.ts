import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { NewPOPage } from '../src/pages/NewPOPage';
import { ProductSearchModal, QuickFillModal } from '../src/pages/ProductSearchModal';
import { getCredentials } from '../src/helpers/auth';
import { setupPerformanceMonitoring } from '../src/helpers/metrics';
import testData from '../src/data/new-po.data.json';

/**
 * Suite de Pruebas: Webflowers - New PO (Nueva Orden de Compra)
 * 
 * Flujo de negocio:
 * 1. Login con credenciales del ambiente
 * 2. Navegar a Procurement -> Products -> New PO
 * 3. Configurar Vendor, Carrier y Due Date
 * 4. Agregar productos mediante QuickSearch
 * 5. Usar Quick Fill para llenar datos de productos
 * 6. Guardar PO y capturar el número generado
 * 
 * Ambiente: Configurado via --project=alpha|beta|prod
 */
test.describe('Webflowers New PO', () => {
  let loginPage: LoginPage;
  let newPOPage: NewPOPage;
  let productSearchModal: ProductSearchModal;
  let quickFillModal: QuickFillModal;

  test.beforeEach(async ({ page }) => {
    // Inicializar Page Objects
    loginPage = new LoginPage(page);
    newPOPage = new NewPOPage(page);
    productSearchModal = new ProductSearchModal(page);
    quickFillModal = new QuickFillModal(page);

    // Navegar a la página principal (usa baseURL del proyecto)
    await page.goto('/');
  });

  test('Create new PO with products successfully', async ({ page }) => {
    // Configurar monitoreo de performance
    const metrics = setupPerformanceMonitoring(page);

    // Obtener datos del test según el ambiente activo
    const projectName = process.env.PROJECT_NAME || 'alpha';
    const data = testData[projectName as keyof typeof testData];
    const creds = getCredentials(projectName);

    // Variable para almacenar el tiempo de respuesta del guardado
    let saveResponseTime = 0;

    // ========== PASO 1: Login ==========
    await test.step('01 - Login with valid credentials', async () => {
      await loginPage.login(creds.email, creds.password);
      
      // Captura de pantalla adjuntada al reporte
      await loginPage.screenshot('01-login-completed');

      // Verificar que llegamos al dashboard o página principal
      await expect(page).toHaveURL(/dashboard|home|main/i, { timeout: 10000 });
    });

    // ========== PASO 2: Navegar a New PO ==========
    await test.step('02 - Navigate to Procurement -> Products -> New PO', async () => {
      await newPOPage.navigateToNewPO();
      
      // Verificar que la página de New PO está cargada
      await newPOPage.expectPageLoaded();
      
      // Screenshot de la página New PO
      await newPOPage.screenshot('02-new-po-page-loaded');
    });

    // ========== PASO 3: Configurar Vendor y Carrier ==========
    await test.step('03 - Configure Vendor and Carrier', async () => {
      // Seleccionar Vendor
      await newPOPage.selectVendor(data.vendor);
      await newPOPage.wait(500);

      // Seleccionar Carrier
      await newPOPage.selectCarrier(data.carrier);
      await newPOPage.wait(500);

      // Establecer fecha actual como Due Date
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      await newPOPage.setDueDate(today);

      // Screenshot después de configurar
      await newPOPage.screenshot('03-vendor-carrier-configured');
    });

    // ========== PASO 4: Abrir QuickSearch y buscar productos ==========
    await test.step('04 - Open QuickSearch and search for products', async () => {
      // Abrir modal de búsqueda
      await newPOPage.openQuickSearch();
      
      // Screenshot con el modal abierto
      await productSearchModal.screenshot('04-quicksearch-modal-opened');

      // Seleccionar "All" en el combobox
      await productSearchModal.selectSearchByAll();
      await productSearchModal.wait(500);

      // Buscar productos (ej: "Rose")
      await productSearchModal.searchProducts(data.searchQuery);
      
      // Esperar a que termine la carga
      await productSearchModal.waitForLoadingComplete();

      // Screenshot de los resultados de búsqueda
      await productSearchModal.screenshot('04-search-results');
    });

    // ========== PASO 5: Seleccionar productos ==========
    await test.step('05 - Select first N products', async () => {
      // Seleccionar los primeros N productos
      await productSearchModal.selectFirstProducts(data.productsToSelect);
      
      // Screenshot con productos seleccionados
      await productSearchModal.screenshot('05-products-selected');

      // Confirmar selección
      await productSearchModal.confirmSelection();
      
      // Pequeña pausa para que se procesen los productos
      await newPOPage.wait(1000);
    });

    // ========== PASO 6: Quick Fill - Llenar datos de productos ==========
    await test.step('06 - Fill product data using Quick Fill', async () => {
      // Esperar a que aparezca el modal de Quick Fill (si existe)
      try {
        await quickFillModal.waitForModalVisible();
        
        // Screenshot del modal Quick Fill
        await quickFillModal.screenshot('06-quickfill-modal');

        // Llenar datos del Quick Fill
        await quickFillModal.fillQuickFillData(
          data.quickFill.customer,
          data.quickFill.boxes,
          data.quickFill.cost
        );

        // Seleccionar "Check All"
        await quickFillModal.selectCheckAll();

        // Screenshot antes de aplicar
        await quickFillModal.screenshot('06-quickfill-filled');

        // Aplicar cambios
        await quickFillModal.apply();
        
      } catch (error) {
        console.log('⚠️ Modal Quick Fill no apareció o ya estaba aplicado');
      }

      // Screenshot de la PO con productos agregados
      await newPOPage.screenshot('06-po-with-products');
    });

    // ========== PASO 7: Guardar PO y capturar tiempo de respuesta ==========
    await test.step('07 - Save PO and capture response time', async () => {
      // Guardar y medir tiempo de respuesta
      saveResponseTime = await newPOPage.savePO();
      
      console.log(`⏱️ Tiempo de respuesta del guardado: ${saveResponseTime}ms`);

      // Verificar que el PO se guardó correctamente
      await expect(newPOPage.lblPOId).toBeVisible();
      
      // Screenshot del PO guardado
      await newPOPage.screenshot('07-po-saved');
    });

    // ========== PASO 8: Capturar y mostrar número de PO ==========
    await test.step('08 - Capture and display PO number', async () => {
      const poNumber = await newPOPage.getPONumber();
      
      // Mostrar en consola como solicitado
      console.log(`\n${'='.repeat(50)}`);
      console.log(`✅ PO CREADA EXITOSAMENTE`);
      console.log(`📄 Número de PO: ${poNumber}`);
      console.log(`⏱️ Tiempo de guardado: ${saveResponseTime}ms`);
      console.log(`${'='.repeat(50)}\n`);

      // Aserciones finales
      expect(poNumber).toBeTruthy();
      expect(poNumber.length).toBeGreaterThan(0);
      
      // Screenshot final con número de PO visible
      await newPOPage.screenshot('08-final-po-number');
    });

    // ========== Resumen de Métricas de Performance ==========
    await test.step('09 - Performance metrics summary', async () => {
      // Imprimir resumen de métricas de red
      metrics.printSummary();

      // Aserciones opcionales sobre performance
      const slowRequests = metrics.getSlowRequests();
      console.log(`\n📊 Requests lentos (>2s): ${slowRequests.length}`);
      
      // Advertencia si hay muchos requests lentos
      if (slowRequests.length > 10) {
        console.warn(`⚠️ Atención: ${slowRequests.length} requests superaron los 2 segundos`);
      }
    });
  });

  // Test adicional: Validación de campos requeridos
  test.skip('Validate required fields on New PO', async ({ page }) => {
    const projectName = process.env.PROJECT_NAME || 'alpha';
    const creds = getCredentials(projectName);

    // Login
    await test.step('Login', async () => {
      await loginPage.login(creds.email, creds.password);
      await expect(page).toHaveURL(/dashboard|home|main/i, { timeout: 10000 });
    });

    // Navegar a New PO
    await test.step('Navigate to New PO', async () => {
      await newPOPage.navigateToNewPO();
      await newPOPage.expectPageLoaded();
    });

    // Intentar guardar sin llenar campos
    await test.step('Attempt to save without required fields', async () => {
      await newPOPage.btnSave.click();
      
      // Verificar que aparezca mensaje de error o validación
      const errorMessage = page.getByRole('alert').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      await newPOPage.screenshot('validation-error');
    });
  });
});
