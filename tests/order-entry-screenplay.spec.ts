import { test, expect } from '@playwright/test';
import { Actor } from '../src/actors/Actor';
import { BrowseTheWeb } from '../src/abilities/BrowseTheWeb';
import { PerformCompleteLogin } from '../src/tasks/PerformCompleteLogin';
import { NavigateToOrderEntry } from '../src/tasks/NavigateToOrderEntry';
import { FillOrderForm } from '../src/tasks/FillOrderForm';
import { SaveOrder } from '../src/tasks/SaveOrder';
import { OrderNumber } from '../src/questions/OrderNumber';
import { setupPerformanceMonitoring } from '../src/helpers/metrics';
import orderData from '../src/data/order-entry.data.json';

// Incrementar timeout por latencias
test.setTimeout(240000);

/**
 * Order Entry Tests - Screenplay Pattern
 * 
 * Flujo completo migrado a Screenplay Pattern:
 * 1. Login
 * 2. Navegar a Order Entry
 * 3. Llenar formulario
 * 4. Guardar orden
 * 5. Validar número de orden
 */
test.describe('Order Entry - Screenplay Pattern', () => {
  test('should create new order via Order Entry form @beta', async ({ page }) => {
    // Setup performance monitoring
    const metrics = setupPerformanceMonitoring(page, { slowThreshold: 2000 });
    const performanceLog: Record<string, number> = {};
    
    // Bloquear peticiones long-polling / notification hub
    try {
      await page.route('**/notificationhub/**', (route) => route.abort());
      await page.route('https://webflowerseventhubtest.azurewebsites.net/**', (route) => route.abort());
    } catch (e) {
      // ignore routing errors
    }
    
    // Crear actor con habilidades
    const qaUser = Actor.named('QA Order Creator')
      .whoCan(BrowseTheWeb.using(page));
    
    const projectName = process.env.PROJECT_NAME || 'beta';
    
    // ==========================================
    // PASO 1: LOGIN
    // ==========================================
    await test.step('01 - Login to Webflowers', async () => {
      const startLogin = Date.now();
      
      await qaUser.attemptsTo(
        PerformCompleteLogin.asUser(projectName)
      );
      
      const loginTime = Date.now() - startLogin;
      performanceLog['01_Login'] = loginTime;
      console.log(`\n⏱️  LOGIN COMPLETADO en ${loginTime} ms (${(loginTime / 1000).toFixed(2)}s)`);
      
      // Screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await test.info().attach('01-post-login-dashboard', {
        body: screenshot,
        contentType: 'image/png'
      });
    });
    
    // ==========================================
    // PASO 2: NAVEGACIÓN A ORDER ENTRY
    // ==========================================
    await test.step('02 - Navigate to Order Entry', async () => {
      const startNav = Date.now();
      
      await qaUser.attemptsTo(
        NavigateToOrderEntry.toForm()
      );
      
      const navTime = Date.now() - startNav;
      performanceLog['02_Navigation'] = navTime;
      console.log(`\n⏱️  NAVEGACIÓN COMPLETADA en ${navTime} ms (${(navTime / 1000).toFixed(2)}s)`);
      
      // Screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await test.info().attach('02-order-entry-form-loaded', {
        body: screenshot,
        contentType: 'image/png'
      });
    });
    
    // ==========================================
    // PASO 3: LLENAR FORMULARIO
    // ==========================================
    await test.step('03 - Fill Order Entry Form', async () => {
      const startForm = Date.now();
      
      await qaUser.attemptsTo(
        FillOrderForm.withData(orderData.orderBasico)
      );
      
      const formTime = Date.now() - startForm;
      performanceLog['03_Form_Fill'] = formTime;
      console.log(`\n⏱️  FORMULARIO COMPLETADO en ${formTime} ms (${(formTime / 1000).toFixed(2)}s)`);
      
      // Screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await test.info().attach('03-form-filled-complete', {
        body: screenshot,
        contentType: 'image/png'
      });
    });
    
    // ==========================================
    // PASO 4: GUARDAR ORDEN
    // ==========================================
    await test.step('04 - Save Order', async () => {
      const startSave = Date.now();
      
      await qaUser.attemptsTo(
        SaveOrder.now()
      );
      
      const saveTime = Date.now() - startSave;
      performanceLog['04_Save_Order'] = saveTime;
      console.log(`\n⏱️  ORDEN GUARDADA en ${saveTime} ms (${(saveTime / 1000).toFixed(2)}s)`);
      
      // Screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await test.info().attach('04-order-saved', {
        body: screenshot,
        contentType: 'image/png'
      });
    });
    
    // ==========================================
    // PASO 5: VALIDAR NÚMERO DE ORDEN
    // ==========================================
    await test.step('05 - Verify Order Number Generated', async () => {
      const orderNumber = await qaUser.asks(OrderNumber.generated());
      
      console.log(`\n🎉 ORDEN GENERADA: ${orderNumber}`);
      
      // Aserciones
      expect(orderNumber).toBeTruthy();
      expect(orderNumber.length).toBeGreaterThan(0);
      expect(orderNumber).toMatch(/^\d+$/); // Solo dígitos
      
      console.log(`✅ Número de orden válido: ${orderNumber}`);
      
      // Screenshot final
      const screenshot = await page.screenshot({ fullPage: true });
      await test.info().attach('05-order-number-verified', {
        body: screenshot,
        contentType: 'image/png'
      });
    });
    
    // ==========================================
    // RESUMEN DE PERFORMANCE
    // ==========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE TIEMPOS');
    console.log('='.repeat(60));
    for (const [step, time] of Object.entries(performanceLog)) {
      console.log(`${step.padEnd(20)}: ${time}ms (${(time / 1000).toFixed(2)}s)`);
    }
    const totalTime = Object.values(performanceLog).reduce((a, b) => a + b, 0);
    console.log('-'.repeat(60));
    console.log(`${'TOTAL'.padEnd(20)}: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log('='.repeat(60) + '\n');
    
    metrics.printSummary();
  });
  
  /**
   * Test alternativo: Validar campos requeridos
   */
  test.skip('should validate required fields', async ({ page }) => {
    const qaUser = Actor.named('QA Validator')
      .whoCan(BrowseTheWeb.using(page));
    
    const projectName = process.env.PROJECT_NAME || 'beta';
    
    await qaUser.attemptsTo(
      PerformCompleteLogin.asUser(projectName),
      NavigateToOrderEntry.toForm()
    );
    
    // Intentar guardar sin llenar campos
    await qaUser.attemptsTo(
      SaveOrder.now()
    );
    
    // Verificar que sigue en el formulario (no se guardó)
    // TODO: Agregar Question para verificar errores de validación
  });
});
