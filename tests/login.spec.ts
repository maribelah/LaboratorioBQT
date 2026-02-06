import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { getCredentials } from '../src/helpers/auth';
import { setupPerformanceMonitoring } from '../src/helpers/metrics';

/**
 * Suite de pruebas para el flujo de Login
 */
test.describe('Login Flow - WebFlowers Alpha', () => {
  let loginPage: LoginPage;
  
  /**
   * Setup antes de cada test
   */
  test.beforeEach(async ({ page }) => {
    // Instanciar el Page Object
    loginPage = new LoginPage(page);
    
    // Navegar a la página de login
    await loginPage.navigate('/');
    
    // Captura inicial
    await loginPage.screenshot('01-login-page-loaded');
  });
  
  /**
   * Test 1: Login exitoso con credenciales válidas
   */
  test('should login successfully with valid credentials', async ({ page }) => {
    // Configurar monitoreo de performance
    const metrics = setupPerformanceMonitoring(page, {
      slowThreshold: 2000,
      logSlowRequests: true,
      logErrorRequests: true
    });
    
    // Obtener credenciales del ambiente actual
    const projectName = process.env.PROJECT_NAME || 'alpha';
    const credentials = getCredentials(projectName);
    
    await test.step('Verificar página de login cargada', async () => {
      await loginPage.expectToBeOnLoginPage();
      console.log(`✅ Página de login cargada correctamente`);
    });
    
    await test.step('Ingresar credenciales', async () => {
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.screenshot('02-credentials-entered');
      console.log(`✅ Credenciales ingresadas: ${credentials.email}`);
    });
    
    await test.step('Verificar login exitoso', async () => {
      // Esperar que la navegación complete
      await loginPage.waitForNetworkIdle();
      
      // Captura después del login
      await loginPage.screenshot('03-after-login');
      
      // Verificar que ya no estamos en la página de login
      const currentUrl = await loginPage.getCurrentURL();
      console.log(`✅ URL después del login: ${currentUrl}`);
      
      // Verificar que la URL cambió (ajustar según tu aplicación)
      expect(currentUrl).not.toContain('/login');
      
      console.log(`✅ Login exitoso!`);
    });
    
    // Imprimir resumen de métricas
    metrics.printSummary();
    
    // Aserciones sobre performance
    const slowRequests = metrics.getSlowRequests();
    if (slowRequests.length > 0) {
      console.warn(`⚠️ Se detectaron ${slowRequests.length} requests lentos`);
    }
    
    // Opcional: Fallar el test si hay demasiados requests lentos
    // expect(slowRequests.length).toBeLessThan(5);
  });
  
  /**
   * Test 2: Login fallido con credenciales inválidas
   */
  test.skip('should show error with invalid credentials', async ({ page }) => {
    const metrics = setupPerformanceMonitoring(page);
    
    await test.step('Intentar login con credenciales inválidas', async () => {
      await loginPage.login('usuario_invalido', 'password_invalida');
      await loginPage.screenshot('error-invalid-credentials');
    });
    
    await test.step('Verificar mensaje de error', async () => {
      await loginPage.expectLoginError();
      console.log(`✅ Mensaje de error mostrado correctamente`);
    });
    
    metrics.printSummary();
  });
  
  /**
   * Test 3: Validación de campos vacíos
   */
  test.skip('should validate empty fields', async ({ page }) => {
    await test.step('Intentar login sin credenciales', async () => {
      await loginPage.loginButton.click();
      await loginPage.screenshot('error-empty-fields');
    });
    
    await test.step('Verificar que no se permite login', async () => {
      // Verificar que seguimos en la página de login
      await loginPage.expectToBeOnLoginPage();
      console.log(`✅ Validación de campos vacíos funciona correctamente`);
    });
  });
});
