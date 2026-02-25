import { test, expect } from '@playwright/test';
import { performLogin } from '../src/routines/loginRoutine';
import { setupPerformanceMonitoring } from '../src/helpers/metrics';
import { OrderEntryPage } from '../src/pages/OrderEntryPage';
import orderData from '../src/data/order-entry.data.json';

// Incrementar timeout del test por latencias del entorno (ej: long-polling)
test.setTimeout(240000);

/**
 * Test Suite: New Order Entry - Webflowers ERP
 * 
 * Flujo completo:
 * 1. Login con usuario qaauto
 * 2. Navegación por menú de iframes: Sales > New > Order Entry
 * 3. Llenado de formulario con:
 *    - Customer: 6099 (WAL-MART)
 *    - Shipping Date: Fecha actual + 5 días
 *    - P.O. Number: QAAuto
 *    - Order Behavior: Regular
 *    - Integration Code 1: BRDR-U023
 *    - Integration Code 2: CBS2-Q186
 *    - Grid Items (Fila 1): Boxes 27, Price 2,34
 *    - Grid Items (Fila 2): Boxes 36, Price 0,212
 * 4. Click en Botón Save
 * 5. Validación del número de orden generado
 * 
 * Restricciones:
 * - NO usa waitForTimeout() - solo web-first assertions
 * - Manejo de múltiples iframes (left_page1, center_page)
 * - Captura de métricas de performance en cada paso
 * - Screenshots automáticos adjuntos al reporte HTML
 */
test.describe('New Order Entry - Webflowers', () => {
  test('03302 - New Order Entry via iframes @beta', async ({ page }) => {
    // ==========================================
    // CONFIGURACIÓN DE MÉTRICAS DE PERFORMANCE
    // ==========================================
    const metrics = setupPerformanceMonitoring(page, { slowThreshold: 2000 });
    const performanceLog: Record<string, number> = {};

    // ==========================================
    // PASO 1: LOGIN
    // ==========================================
    await test.step('01 - Login to Webflowers (qaauto)', async () => {
      // Bloquear peticiones long-polling / notification hub para evitar timeouts
      try {
        await page.route('**/notificationhub/**', (route) => route.abort());
        await page.route('https://webflowerseventhubtest.azurewebsites.net/**', (route) => route.abort());
      } catch (e) {
        // ignore routing errors
      }
      const startLogin = Date.now();
      
      const { loginPage } = await performLogin(page, { 
        screenshotPrefix: 'neworder-login' 
      });
      
      const loginTime = Date.now() - startLogin;
      performanceLog['01_Login'] = loginTime;
      
      console.log(`\n⏱️  LOGIN COMPLETADO en ${loginTime} ms (${(loginTime / 1000).toFixed(2)}s)`);
      
      // Screenshot post-login
      await loginPage.screenshot('01-post-login-dashboard');
    });

    // ==========================================
    // PASO 2: NAVEGACIÓN A ORDER ENTRY
    // ==========================================
    await test.step('02 - Navigate to Order Entry (Sales > New > Order Entry)', async () => {
      const orderEntryPage = new OrderEntryPage(page);
      
      const startNav = Date.now();
      await orderEntryPage.navigateToOrderEntry();
      const navTime = Date.now() - startNav;
      performanceLog['02_Navigation'] = navTime;
      
      console.log(`\n⏱️  NAVEGACIÓN COMPLETADA en ${navTime} ms (${(navTime / 1000).toFixed(2)}s)`);
      
      // Verificar que el formulario esté visible (web-first assertion)
      const customerField = orderEntryPage['customerInput'];
      await expect(customerField).toBeVisible({ timeout: 10000 });
      
      await orderEntryPage.screenshot('02-order-entry-form-loaded');
    });

    // ==========================================
    // PASO 3: LLENAR FORMULARIO COMPLETO
    // ==========================================
    await test.step('03 - Fill Order Entry Form (Customer, Date, PO, Codes, Items)', async () => {
      const orderEntryPage = new OrderEntryPage(page);

      // Usar datos del archivo JSON (sin hardcoding)
      const orderInfo = orderData.orderBasico;
      
      console.log('\n📋 Iniciando llenado de formulario con datos:');
      console.log(`   • Customer: ${orderInfo.customerCode} (${orderInfo.customerName})`);
      console.log(`   • Shipping Date: +${orderInfo.shippingDays} días`);
      console.log(`   • P.O. Number: ${orderInfo.poNumber}`);
      console.log(`   • Order Behavior: ${orderInfo.orderBehavior}`);
      console.log(`   • Integration Code 1: ${orderInfo.integrationCode1}`);
      console.log(`   • Integration Code 2: ${orderInfo.integrationCode2}`);
      
      // Mostrar información de los items del grid
      if (orderInfo.items && orderInfo.items.length > 0) {
        console.log(`   • Grid Items:`);
        orderInfo.items.forEach((item: any) => {
          console.log(`     - Fila ${item.row}: Boxes ${item.boxes}, Price ${item.fobPrice}`);
        });
      }
      console.log('');
      
      // Llenar formulario completo usando Page Object
      const startForm = Date.now();
      await orderEntryPage.fillOrderForm(orderInfo);
      const formTime = Date.now() - startForm;
      performanceLog['03_Form_Fill'] = formTime;

      console.log(`\n⏱️  FORMULARIO COMPLETADO en ${formTime} ms (${(formTime / 1000).toFixed(2)}s)`);
      
      // Screenshot del formulario completado
      await orderEntryPage.screenshot('03-form-filled-complete');
    });

    // ==========================================
    // PASO 4: GUARDAR ORDEN (SAVE)
    // ==========================================
    await test.step('04 - Save Order', async () => {
      const orderEntryPage = new OrderEntryPage(page);

      console.log('\n💾 GUARDANDO ORDEN...');
      
      const startSave = Date.now();
      await orderEntryPage.clickSave();
      const saveTime = Date.now() - startSave;
      performanceLog['04_Save_Order'] = saveTime;
      
      console.log(`\n⏱️  ORDEN GUARDADA en ${saveTime} ms (${(saveTime / 1000).toFixed(2)}s)`);
      
      // Screenshot después de guardar
      await orderEntryPage.screenshot('04-order-saved');
    });

    // ==========================================
    // PASO 5: VALIDACIÓN DEL NÚMERO DE ORDEN
    // ==========================================
    await test.step('05 - Verify Order Number Generated', async () => {
      const orderEntryPage = new OrderEntryPage(page);

      console.log('\n🔍 VALIDANDO NÚMERO DE ORDEN GENERADO...');
      
      // Obtener el número de orden generado
      const orderNumber = await orderEntryPage.getOrderNumber();
      
      // Validar que el número de orden no esté vacío
      expect(orderNumber).toBeTruthy();
      expect(orderNumber.length).toBeGreaterThan(0);
      
      console.log('\n✅ ORDEN CREADA EXITOSAMENTE');
      console.log(`\n🎯 NÚMERO DE ORDEN: ${orderNumber}\n`);
      
      // Screenshot final con número de orden visible
      await orderEntryPage.screenshot('05-order-number-verified');
    });

    // ==========================================
    // RESUMEN DE MÉTRICAS
    // ==========================================
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE MÉTRICAS DE PERFORMANCE');
    console.log('═══════════════════════════════════════════════════');
    
    let totalTime = 0;
    for (const [step, time] of Object.entries(performanceLog)) {
      const seconds = (time / 1000).toFixed(2);
      console.log(`   ${step.padEnd(20)}: ${time.toString().padStart(6)} ms (${seconds}s)`);
      totalTime += time;
    }
    
    console.log('───────────────────────────────────────────────────');
    console.log(`   ${'TOTAL'.padEnd(20)}: ${totalTime.toString().padStart(6)} ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log('═══════════════════════════════════════════════════\n');
    
    // Métricas de red (requests lentos, etc.)
    metrics.printSummary();
  });
});
