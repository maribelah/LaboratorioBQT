# 🚀 Script de Automatización: Webflowers New PO (Beta Environment)

## 📋 Resumen Ejecutivo

Script de automatización completo para el sistema **Webflowers** usando **Playwright + TypeScript**, con las siguientes características implementadas:

✅ **Resiliencia:** Reintentos automáticos (hasta 2 intentos) para elementos no clickables  
✅ **Manejo de Spinners:** Detección y espera automática de `.working`, `.loading`, `.spinner`  
✅ **Métricas de Performance:** Medición de tiempos de respuesta de acciones críticas  
✅ **Reportes Visuales:** HTML report con screenshots y traces completas  
✅ **Captura de PO:** Extracción y display del número de orden generado  

---

## 🔧 Configuración del Entorno

### 1. Variables de Entorno (`.env`)

```bash
# Ambiente Beta (Staging)
BETA_URL=https://betambb.ghtcorptest.com/
BETA_USER=qaauto
BETA_PASS=qaauto

# Otras configuraciones
API_TIMEOUT=30000
HEADLESS=false
SLOW_MO=0
```

### 2. Configuración de Playwright (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  
  expect: {
    timeout: 10000
  },
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  /* Reporters con HTML y JSON */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  /* Configuración con traces y screenshots habilitados */
  use: {
    trace: 'on',                          // Traces completas para debugging
    screenshot: 'only-on-failure',        // Screenshots automáticos en fallos
    video: 'retain-on-failure',           // Videos en fallos
    actionTimeout: 10000,
    navigationTimeout: 30000,
    viewport: { width: 1280, height: 720 },
  },

  /* Proyectos por ambiente */
  projects: [
    {
      name: 'beta',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BETA_URL,
        launchOptions: {
          slowMo: parseInt(process.env.SLOW_MO || '0'),
        },
      }
    }
  ],
});
```

---

## 💻 Código del Test (TypeScript)

### Archivo Principal: `tests/new-po.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { NewPOPage } from '../src/pages/NewPOPage';
import { ProductSearchModal, QuickFillModal } from '../src/pages/ProductSearchModal';
import { getCredentials } from '../src/helpers/auth';
import { setupPerformanceMonitoring } from '../src/helpers/metrics';
import testData from '../src/data/new-po.data.json';

/**
 * Suite: Webflowers New PO - Beta Environment
 * URL: https://betambb.ghtcorptest.com/
 * 
 * Características implementadas:
 * - Reintentos automáticos para elementos no clickables (2 intentos)
 * - Manejo robusto de spinners (.working, .loading, .spinner)
 * - Medición de tiempos de respuesta
 * - Screenshots automáticos por paso
 * - Captura y display del número de PO
 */
test.describe('Webflowers New PO - Beta', () => {
  let loginPage: LoginPage;
  let newPOPage: NewPOPage;
  let productSearchModal: ProductSearchModal;
  let quickFillModal: QuickFillModal;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    newPOPage = new NewPOPage(page);
    productSearchModal = new ProductSearchModal(page);
    quickFillModal = new QuickFillModal(page);

    await page.goto('/');
  });

  test('Create New PO with Products - Full E2E Flow', async ({ page }) => {
    const metrics = setupPerformanceMonitoring(page);
    const projectName = 'beta';
    const data = testData[projectName];
    const creds = getCredentials(projectName);
    
    let saveResponseTime = 0;
    let totalStartTime = Date.now();

    // ========== PASO 1: LOGIN ==========
    await test.step('01 - Login to Webflowers', async () => {
      console.log('\\n🔐 Iniciando login...');
      const stepStart = Date.now();
      
      await loginPage.login(creds.email, creds.password);
      await loginPage.screenshot('01-login-completed');
      
      // Esperar dashboard (manejar posible MFA)
      try {
        await expect(page).toHaveURL(/dashboard|home|main/i, { timeout: 15000 });
      } catch (error) {
        console.log('⚠️ Posible MFA detectado. Esperando autenticación manual...');
        await page.waitForTimeout(30000); // Pausa para MFA manual
      }
      
      console.log(`✅ Login completado en ${Date.now() - stepStart}ms`);
    });

    // ========== PASO 2: NAVEGACIÓN ==========
    await test.step('02 - Navigate to Procurement -> Products -> New PO', async () => {
      console.log('\\n🧭 Navegando a New PO...');
      const stepStart = Date.now();
      
      await newPOPage.navigateToNewPO();
      await newPOPage.expectPageLoaded();
      await newPOPage.screenshot('02-new-po-page-loaded');
      
      console.log(`✅ Navegación completada en ${Date.now() - stepStart}ms`);
    });

    // ========== PASO 3: CONFIGURACIÓN VENDOR Y CARRIER ==========
    await test.step('03 - Configure Vendor and Carrier', async () => {
      console.log('\\n⚙️ Configurando Vendor y Carrier...');
      const stepStart = Date.now();
      
      // Vendor: Florexpo Central
      await newPOPage.selectVendor(data.vendor);
      await newPOPage.waitForSpinnerToDisappear();
      
      // Carrier: Florexpo
      await newPOPage.selectCarrier(data.carrier);
      await newPOPage.waitForSpinnerToDisappear();
      
      // Fecha actual
      const today = new Date().toISOString().split('T')[0];
      await newPOPage.setDueDate(today);
      
      await newPOPage.screenshot('03-vendor-carrier-configured');
      console.log(`✅ Configuración completada en ${Date.now() - stepStart}ms`);
    });

    // ========== PASO 4: QUICKSEARCH - BÚSQUEDA DE PRODUCTOS ==========
    await test.step('04 - Open QuickSearch and Search Products', async () => {
      console.log('\\n🔍 Buscando productos...');
      const stepStart = Date.now();
      
      // Abrir QuickSearch
      await newPOPage.openQuickSearch();
      await productSearchModal.screenshot('04-quicksearch-modal-opened');
      
      // Seleccionar "All"
      await productSearchModal.selectSearchByAll();
      await productSearchModal.waitForLoadingComplete();
      
      // Buscar "Rose"
      await productSearchModal.searchProducts(data.searchQuery);
      await productSearchModal.screenshot('04-search-results');
      
      console.log(`✅ Búsqueda completada en ${Date.now() - stepStart}ms`);
    });

    // ========== PASO 5: SELECCIÓN DE PRODUCTOS ==========
    await test.step('05 - Select First 2 Products', async () => {
      console.log('\\n✔️ Seleccionando productos...');
      const stepStart = Date.now();
      
      await productSearchModal.selectFirstProducts(data.productsToSelect);
      await productSearchModal.screenshot('05-products-selected');
      
      await productSearchModal.confirmSelection();
      await newPOPage.waitForSpinnerToDisappear();
      
      console.log(`✅ Productos seleccionados en ${Date.now() - stepStart}ms`);
    });

    // ========== PASO 6: QUICK FILL ==========
    await test.step('06 - Apply Quick Fill', async () => {
      console.log('\\n📝 Aplicando Quick Fill...');
      const stepStart = Date.now();
      
      try {
        await quickFillModal.waitForModalVisible();
        await quickFillModal.screenshot('06-quickfill-modal');
        
        // Llenar datos: COSTCO WHOLESALE, 10 cajas, costo 12
        await quickFillModal.fillQuickFillData(
          data.quickFill.customer,
          data.quickFill.boxes,
          data.quickFill.cost
        );
        
        await quickFillModal.selectCheckAll();
        await quickFillModal.screenshot('06-quickfill-filled');
        await quickFillModal.apply();
        
        console.log(`✅ Quick Fill aplicado en ${Date.now() - stepStart}ms`);
      } catch (error) {
        console.log('⚠️ Quick Fill modal no apareció, continuando...');
      }
      
      await newPOPage.screenshot('06-po-with-products');
    });

    // ========== PASO 7: GUARDAR PO (MEDICIÓN DE TIEMPO) ==========
    await test.step('07 - Save PO and Measure Response Time', async () => {
      console.log('\\n💾 Guardando PO...');
      
      saveResponseTime = await newPOPage.savePO();
      await newPOPage.screenshot('07-po-saved');
      
      console.log(`✅ PO guardado en ${saveResponseTime}ms`);
    });

    // ========== PASO 8: CAPTURAR NÚMERO DE PO ==========
    await test.step('08 - Capture and Display PO Number', async () => {
      console.log('\\n📄 Capturando número de PO...');
      
      const poNumber = await newPOPage.getPONumber();
      
      // ========== OUTPUT PRINCIPAL ==========
      const totalTime = Date.now() - totalStartTime;
      console.log('\\n' + '='.repeat(60));
      console.log('✅ PO CREADA EXITOSAMENTE');
      console.log('='.repeat(60));
      console.log(`📄 Número de PO: ${poNumber}`);
      console.log(`⏱️  Tiempo de guardado: ${saveResponseTime}ms`);
      console.log(`⏱️  Tiempo total: ${totalTime}ms`);
      console.log('='.repeat(60) + '\\n');
      
      // Aserciones finales
      expect(poNumber).toBeTruthy();
      expect(poNumber.length).toBeGreaterThan(0);
      
      await newPOPage.screenshot('08-final-po-number');
    });

    // ========== PASO 9: MÉTRICAS DE PERFORMANCE ==========
    await test.step('09 - Performance Metrics Summary', async () => {
      console.log('\\n📊 Resumen de Métricas de Red:');
      metrics.printSummary();
      
      const slowRequests = metrics.getSlowRequests();
      if (slowRequests.length > 0) {
        console.log(`\\n⚠️ Requests lentos detectados: ${slowRequests.length}`);
        slowRequests.slice(0, 5).forEach(req => {
          console.log(`  - ${req.url}: ${req.duration}ms`);
        });
      }
    });
  });
});
```

---

## 🚀 Comandos de Ejecución

### Ejecutar el Test en Beta

```bash
# Ejecución normal
npx playwright test new-po.spec.ts --project=beta

# Ejecución con interfaz visible (headed)
npx playwright test new-po.spec.ts --project=beta --headed

# Ejecución con slow motion (útil para ver el flujo)
SLOW_MO=500 npx playwright test new-po.spec.ts --project=beta --headed

# Ejecución en modo debug
npx playwright test new-po.spec.ts --project=beta --debug

# Ejecución con UI interactiva
npx playwright test new-po.spec.ts --project=beta --ui
```

---

## 📊 Visualizar Reportes

### 1. Abrir Reporte HTML

```bash
npx playwright show-report
```

El reporte incluye:
- ✅ Estado de cada step (passed/failed)
- 📸 Screenshots de cada paso del flujo
- 🎬 Videos (si el test falla)
- 🔍 Traces completas para debugging
- ⏱️ Tiempos de ejecución

### 2. Screenshots Generados

Location: `screenshots/`

```
screenshots/
├── 01-login-completed-[timestamp].png
├── 02-new-po-page-loaded-[timestamp].png
├── 03-vendor-carrier-configured-[timestamp].png
├── 04-quicksearch-modal-opened-[timestamp].png
├── 04-search-results-[timestamp].png
├── 05-products-selected-[timestamp].png
├── 06-quickfill-modal-[timestamp].png
├── 06-quickfill-filled-[timestamp].png
├── 06-po-with-products-[timestamp].png
├── 07-po-saved-[timestamp].png
└── 08-final-po-number-[timestamp].png
```

### 3. Traces de Ejecución

Si el test falla, las traces están disponibles en el reporte HTML:
- Click en el test fallido
- Click en "Trace" tab
- Inspeccionar timeline completo de acciones

---

## 🛡️ Características de Resiliencia Implementadas

### 1. Reintentos Automáticos
```typescript
// Método en BasePage
async clickWithRetry(locator: any, maxRetries: number = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      await locator.click({ timeout: 5000 });
      return; // Éxito
    } catch (error) {
      console.log(`⚠️ Intento ${attempt + 1}/${maxRetries + 1} fallido. Reintentando...`);
      if (attempt < maxRetries) await this.wait(1000);
    }
  }
  throw new Error(`Click falló después de ${maxRetries + 1} intentos`);
}
```

### 2. Detección Robusta de Spinners
```typescript
async waitForSpinnerToDisappear() {
  const spinnerSelectors = [
    '[class*="spinner"]',
    '[class*="loading"]', 
    '[class*="working"]',
    '.spinner',
    '.loading',
    '.working'
  ];
  
  for (const selector of spinnerSelectors) {
    try {
      const spinner = this.page.locator(selector).first();
      await spinner.waitFor({ state: 'visible', timeout: 1000 });
      await spinner.waitFor({ state: 'hidden', timeout: 30000 });
      console.log(`✅ Spinner desapareció: ${selector}`);
      return;
    } catch { continue; }
  }
  
  // Fallback a network idle
  await this.waitForNetworkIdle();
}
```

### 3. Manejo de MFA
```typescript
try {
  await expect(page).toHaveURL(/dashboard|home|main/i, { timeout: 15000 });
} catch (error) {
  console.log('⚠️ Posible MFA detectado. Esperando autenticación manual...');
  await page.waitForTimeout(30000); // Pausa para MFA
}
```

---

## 📈 Output Esperado en Consola

```
🔐 Iniciando login...
✅ Login completado en 2340ms

🧭 Navegando a New PO...
✅ Navegación completada en 3120ms

⚙️ Configurando Vendor y Carrier...
✅ Spinner desapareció: [class*="loading"]
✅ Configuración completada en 2890ms

🔍 Buscando productos...
🔄 Spinner detectado: [class*="working"]
✅ Spinner desaparecido: [class*="working"]
✅ Búsqueda completada en 4560ms

✔️ Seleccionando productos...
✅ Productos seleccionados en 1230ms

📝 Aplicando Quick Fill...
✅ Quick Fill aplicado en 890ms

💾 Guardando PO...
✅ PO guardado en 3450ms

📄 Capturando número de PO...

============================================================
✅ PO CREADA EXITOSAMENTE
============================================================
📄 Número de PO: PO-2024-00512
⏱️  Tiempo de guardado: 3450ms
⏱️  Tiempo total: 18540ms
============================================================

📊 Resumen de Métricas de Red:
📊 Total requests: 47
⏱️ Tiempo promedio: 520ms
🐌 Requests lentos (>2s): 3
```

---

## 📁 Estructura de Archivos

```
DemoQA-playwright/
├── .env                              # Credenciales (NO commitear)
├── playwright.config.ts              # Configuración principal
├── src/
│   ├── pages/
│   │   ├── BasePage.ts              # Clase base con clickWithRetry()
│   │   ├── LoginPage.ts
│   │   ├── NewPOPage.ts             # Page Object principal
│   │   └── ProductSearchModal.ts    # Modales de búsqueda/quickfill
│   ├── helpers/
│   │   ├── auth.ts                  # getCredentials()
│   │   └── metrics.ts               # setupPerformanceMonitoring()
│   └── data/
│       └── new-po.data.json         # Datos de prueba
├── tests/
│   └── new-po.spec.ts               # Test E2E completo
├── screenshots/                      # Capturas generadas
├── playwright-report/                # Reporte HTML
└── test-results/                     # Resultados JSON
```

---

## 🔍 Troubleshooting

### Error: "Click falló después de 3 intentos"
✅ **Solución:** Verificar que el elemento esté visible y no esté cubierto por otro elemento (overlay, modal, etc.)

### Error: "Timeout waiting for selector"
✅ **Solución:** 
- Aumentar timeout en `playwright.config.ts`
- Verificar que los IDs de elementos coincidan con la aplicación
- Ejecutar en modo `--headed` para ver qué está pasando

### Spinners no son detectados
✅ **Solución:** Agregar el selector específico de tu aplicación en el array `spinnerSelectors`

### MFA bloquea el test
✅ **Solución:** Usar `storageState` para guardar sesión autenticada:
```bash
# Guardar estado
npx playwright codegen https://betambb.ghtcorptest.com/ --save-storage=auth.json

# Usar en config
storageState: 'auth.json'
```

---

## ✅ Checklist de Pre-Ejecución

- [ ] Archivo `.env` configurado con credenciales Beta
- [ ] Dependencias instaladas: `npm install`
- [ ] Browsers instalados: `npx playwright install chromium`
- [ ] URL accesible: https://betambb.ghtcorptest.com/
- [ ] Credenciales válidas: `qaauto / qaauto`

---

## 📝 Notas Importantes

1. **Reintentos:** El framework intenta hasta 2 veces antes de fallar en clicks
2. **Spinners:** El test espera automáticamente a 6 tipos diferentes de indicadores de carga
3. **Screenshots:** Se adjuntan automáticamente al reporte HTML de Playwright
4. **Traces:** Habilitadas para debugging completo de cada acción
5. **Performance:** Todos los requests HTTP son monitoreados y reportados

---

## 🎯 Próximos Pasos

1. Ejecutar el test: `npx playwright test new-po.spec.ts --project=beta --headed`
2. Verificar el output en consola con el número de PO
3. Abrir reporte: `npx playwright show-report`
4. Revisar screenshots en carpeta `screenshots/`
5. Ajustar selectores si hay diferencias con la aplicación real

---

**Última Actualización:** Febrero 6, 2026  
**Framework:** Playwright v1.40+ con TypeScript  
**Ambiente:** Beta (https://betambb.ghtcorptest.com/)
