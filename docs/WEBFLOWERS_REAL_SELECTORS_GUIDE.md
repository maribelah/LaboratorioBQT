# 🚀 Webflowers ERP - New PO Automation Guide

## 📋 Información del Sistema

- **Sistema**: Webflowers ERP
- **URL Beta**: https://betambb.ghtcorptest.com/
- **Credenciales**: `qaauto` / `qaauto`
- **Arquitectura**: Aplicación multi-iframe (frame[@name='main'] → iframe#left_page1 + iframe#center_page)

---

## 🏗️ Arquitectura de Iframes

Webflowers usa una arquitectura de iframes anidados:

```
┌─────────────────────────────────────────────────────────────┐
│ Página Principal (page)                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ frame[@name="main"]                                    │   │
│  │  ┌──────────────────┐  ┌───────────────────────────┐│   │
│  │  │ iframe#left_page1│  │ iframe#center_page         ││   │
│  │  │ (Menú Modules)   │  │ (Form Content)             ││   │
│  │  │                  │  │                             ││   │
│  │  │ • Procurement    │  │ • #ddlVendor               ││   │
│  │  │ • Products       │  │ • #ddlCarrier              ││   │
│  │  │ • New PO         │  │ • #btnQuickSearch          ││   │
│  │  │                  │  │ • #txtSearch, #btnSearch   ││   │
│  │  │                  │  │ • #txtCustomer, #txtBoxes  ││   │
│  │  │                  │  │ • #btnSavePO, #lblPOId     ││   │
│  │  └──────────────────┘  └───────────────────────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Selectores Reales Implementados

### Tabla de Localizadores

| Proceso | Elemento | Selector (ID) | Archivo |
| :--- | :--- | :--- | :--- |
| **Login** | Username | `#txtUsername` | LoginPage.ts |
| | Password | `#txtPassword` | LoginPage.ts |
| | Login Button | `#btnLogin` | LoginPage.ts |
| **Navegación** | Procurement | `text=Procurement` | NewPOPage.ts |
| | Products | `text=Products` | NewPOPage.ts |
| | New PO | `text=New PO` | NewPOPage.ts |
| **Formulario PO** | Vendor Dropdown | `#ddlVendor` | NewPOPage.ts |
| | Carrier Dropdown | `#ddlCarrier` | NewPOPage.ts |
| | Order Date | `#txtDate` | NewPOPage.ts |
| | QuickSearch Button | `#btnQuickSearch` | NewPOPage.ts |
| **QuickSearch** | Search Input | `#txtSearch` | ProductSearchModal.ts |
| | Search Button | `#btnSearch` | ProductSearchModal.ts |
| | Apply Button | `#btnApply` | ProductSearchModal.ts |
| **QuickFill** | Customer Input | `#txtCustomer` | ProductSearchModal.ts |
| | Boxes Input | `#txtBoxes` | ProductSearchModal.ts |
| | Unit Cost Input | `#txtCost` | ProductSearchModal.ts |
| | Apply Button | `#btnApplyQuickFill` | ProductSearchModal.ts |
| **Finalización** | Save Button | `#btnSavePO` | NewPOPage.ts |
| | PO Number Label | `#lblPOId` | NewPOPage.ts |
| **Global** | Loader | `text=Working...`, `text=Loading...` | Todas |

---

## 📦 Page Objects Creados

### 1. **NewPOPage.ts**
- **Responsabilidad**: Formulario de New PO, navegación de menús
- **Iframes**: Accede a `main → left_page1` (menú) y `main → center_page` (formulario)
- **Métodos principales**:
  - `navigateToNewPO()`: Procurement → Products → New PO
  - `selectVendorByIndex(index)`: Selecciona vendor por índice
  - `selectCarrierByIndex(index)`: Selecciona carrier por índice
  - `openQuickSearch()`: Abre modal de búsqueda de productos
  - `savePO()`: Guarda la Purchase Order
  - `getPONumber()`: Extrae el número de PO del label #lblPOId

### 2. **ProductSearchModal.ts**
- **Responsabilidad**: QuickSearch modal (búsqueda de productos)
- **Iframes**: Accede a `main → center_page`
- **Métodos principales**:
  - `searchProduct(productName)`: Busca producto por nombre
  - `selectFirstProduct()`: Selecciona primer checkbox de resultados
  - `applySelection()`: Aplica selección (#btnApply)

### 3. **QuickFillModal.ts**
- **Responsabilidad**: QuickFill modal (Customer, Boxes, Cost)
- **Iframes**: Accede a `main → center_page`
- **Métodos principales**:
  - `fillQuickFillForm(customer, boxes, unitCost)`: Llena los 3 campos
  - `applyQuickFill()`: Aplica cambios (#btnApplyQuickFill)

---

## ⚙️ Configuración de Playwright (playwright.config.ts)

El archivo ha sido **optimizado específicamente para Webflowers ERP**:

### Timeouts Extendidos
```typescript
timeout: 180000,  // 3 minutos por test (iframes lentos)
actionTimeout: 20000,  // 20 segundos por acción
navigationTimeout: 60000,  // 60 segundos para iframes anidados
```

### Ejecución en Serie
```typescript
fullyParallel: false,
workers: 1,  // Evita conflictos de sesión
```

### Chrome Args para Iframes
```typescript
args: [
  '--disable-web-security',
  '--disable-features=IsolateOrigins,site-per-process',
  '--no-sandbox'
]
```

### Evidencia Completa
```typescript
screenshot: 'on',  // Capturas en cada step
trace: 'on-first-retry',  // Traces para debugging
video: 'on-first-retry'  // Videos si falla
```

---

## 🎬 Ejecución del Test

### Comando Básico (Beta Environment)
```powershell
npx playwright test new-po-real.spec.ts --project=beta --headed --workers=1
```

### Con Modo Lento (Debugging Visual)
```powershell
$env:SLOW_MO="1000"; npx playwright test new-po-real.spec.ts --project=beta --headed
```

### Ver Reporte HTML
```powershell
npx playwright show-report
```

### Abrir Trace Viewer (Si falla)
```powershell
npx playwright show-trace test-results/.../trace.zip
```

---

## 📊 Telemetría Implementada

El test **new-po-real.spec.ts** incluye medición de tiempos por bloque:

### Ejemplo de Salida en Consola
```
╔═════════════════════════════════════════════════════════╗
║   WEBFLOWERS ERP - NEW PO AUTOMATION TEST               ║
╚═════════════════════════════════════════════════════════╝

📍 PASO 1: LOGIN
────────────────────────────────────────────────────────
⏱️  01_LOGIN: 3.421s
✅ Login completado

📍 PASO 2: NAVEGACIÓN
────────────────────────────────────────────────────────
🧭 Iniciando navegación: Procurement -> Products -> New PO
  ▶️  Haciendo clic en Procurement...
  ▶️  Haciendo clic en Products...
  ▶️  Haciendo clic en New PO...
✅ Navegación completada
⏱️  02_NAVIGATION: 8.134s

📍 PASO 3: CONFIGURACIÓN VENDOR/CARRIER
────────────────────────────────────────────────────────
📋 Seleccionando Vendor (index: 1)
🚚 Seleccionando Carrier (index: 1)
⏱️  03_VENDOR_CARRIER: 2.876s

📍 PASO 4: QUICKSEARCH - BÚSQUEDA DE PRODUCTOS
────────────────────────────────────────────────────────
🔍 Abriendo QuickSearch...
  🔎 Buscando producto: "Rose"...
  ✅ Búsqueda completada: "Rose"
⏱️  04_QUICKSEARCH: 5.234s

📍 PASO 5: SELECCIÓN DE PRODUCTO
────────────────────────────────────────────────────────
  ☑️  Seleccionando primer producto de resultados...
⏱️  05_SELECT_PRODUCT: 1.543s

📍 PASO 6: APLICAR SELECCIÓN
────────────────────────────────────────────────────────
  💾 Aplicando selección de productos...
⏱️  06_APPLY_SELECTION: 3.102s

📍 PASO 7: QUICKFILL - LLENADO DE DATOS
────────────────────────────────────────────────────────
  📦 Llenando QuickFill: Customer="COSTCO", Boxes=10, Cost=$12
  💾 Aplicando QuickFill...
⏱️  07_QUICKFILL: 4.098s

📍 PASO 8: GUARDAR PURCHASE ORDER
────────────────────────────────────────────────────────
💾 Guardando Purchase Order...
⏱️  08_SAVE_PO: 6.234s

📍 PASO 9: EXTRACCIÓN DE NÚMERO DE PO
────────────────────────────────────────────────────────
🔢 Extrayendo número de Purchase Order...

═══════════════════════════════════════
📋 PO GENERADA: PO-2026-00123
═══════════════════════════════════════

⏱️  09_CAPTURE_PO: 2.123s

╔═════════════════════════════════════════════════════════╗
║               TEST COMPLETADO EXITOSAMENTE              ║
╚═════════════════════════════════════════════════════════╝
```

---

## 📸 Screenshots Automáticos

El test captura screenshots en cada paso crítico y **los adjunta al HTML report**:

| Paso | Nombre del Attach | Contenido |
| :--- | :--- | :--- |
| 01 | `01_Login_Success` | Dashboard post-login |
| 02 | `02_NewPO_Form` | Formulario New PO cargado |
| 03 | `03_Vendor_Carrier_Selected` | Dropdowns seleccionados |
| 04 | `04_QuickSearch_Results` | Resultados de búsqueda "Rose" |
| 05 | `05_Product_Selected` | Producto con checkbox marcado |
| 06 | `06_Selection_Applied` | Modal cerrado, producto agregado |
| 07 | `07_QuickFill_Applied` | Datos de QuickFill aplicados |
| 08 | `08_PO_Saved` | PO guardada exitosamente |
| 09 | `09_Final_PO_Number` | Label #lblPOId visible |

### Ver Screenshots en HTML Report
```powershell
npx playwright show-report
```
Navega a: **Test Name → Attachments** → Ver imágenes en orden cronológico

---

## 🧪 Manejo de Escenarios Especiales

### MFA (Multi-Factor Authentication)
Si aparece un challenge de MFA durante el login:
```typescript
await page.pause();  // El test se pausará automáticamente
```
**Acción manual**: Completar el MFA y presionar "Resume" en el inspector

### Loaders/Spinners
El framework detecta automáticamente estos loaders:
- `text=Working...`
- `text=Loading...`
- `[class*="working"]`, `[class*="loading"]`, `.spinner`

**Timeout configurado**: 30 segundos por loader

### Reintentos
- **Local**: 1 reintento automático
- **CI**: 2 reintentos automáticos

### Elementos No Visibles
Page Objects usan estrategias robustas:
- `dispatchEvent('click')` para elementos dentro de iframes ocultos
- `waitFor({ state: 'visible' })` antes de interacciones
- Esperas explícitas después de cada acción

---

## 🔧 Troubleshooting

### ❌ Error: "Frame detached"
**Causa**: El iframe se recargó después de una acción.
**Solución**: Aumentar `wait()` después de acciones que disparan recargas (ej: seleccionar vendor).

### ❌ Error: "Timeout 15000ms exceeded"
**Causa**: Loader no desapareció en el tiempo esperado.
**Solución**: Verificar selectores de loader en `waitForLoadingComplete()`.

### ❌ Error: "Element is not clickable"
**Causa**: Elemento cubierto por otro (ej: modal abierto).
**Solución**: Agregar `force: true` o usar `dispatchEvent('click')`.

### ❌ Error: "strict mode violation"
**Causa**: Múltiples elementos con el mismo selector.
**Solución**: Usar `.first()`, `.last()` o `.nth(index)` para desambiguar.

---

## 📚 Referencias del Framework

### Archivos Clave
- **Tests**: `tests/new-po-real.spec.ts`
- **Page Objects**: `src/pages/NewPOPage.ts`, `src/pages/ProductSearchModal.ts`
- **Config**: `playwright.config.ts`
- **Environment**: `.env` (URLs y credenciales)

### Comandos Útiles
```powershell
# Generar selectores con Codegen
npx playwright codegen https://betambb.ghtcorptest.com/

# Modo UI interactivo
npx playwright test --ui

# Debug con Inspector
npx playwright test --debug

# Ver videos (si falló)
Get-ChildItem -Path "test-results" -Recurse -Filter "*.webm"
```

---

## ✅ Checklist de Validación Post-Ejecución

- [ ] Test completó los 9 pasos sin errores
- [ ] Consola muestra el número de PO generado
- [ ] HTML report contiene 9 screenshots adjuntos
- [ ] Tiempos de ejecución son razonables (<3 minutos total)
- [ ] Si falló: Trace viewer muestra el iframe correcto
- [ ] Si falló: Error message indica el selector exacto

---

## 📊 Métricas Esperadas (Benchmark)

| Paso | Tiempo Esperado |
| :--- | :--- |
| 01 - Login | 2-4 segundos |
| 02 - Navegación | 6-10 segundos |
| 03 - Vendor/Carrier | 2-4 segundos |
| 04 - QuickSearch | 4-6 segundos |
| 05 - Selección | 1-2 segundos |
| 06 - Apply | 2-4 segundos |
| 07 - QuickFill | 3-5 segundos |
| 08 - Save | 5-8 segundos |
| 09 - Capture PO | 2-3 segundos |
| **TOTAL** | **27-46 segundos** |

> ⚠️ Si un paso tarda más de 2x el tiempo esperado, revisar network tab y loaders.

---

## 🎓 Mejores Prácticas Implementadas

✅ **Arquitectura POM**: Separación clara entre Page Objects y tests
✅ **Selectores por ID**: Máxima estabilidad (#ddlVendor, #btnSearch, etc.)
✅ **Manejo robusto de iframes**: frameLocator encadenado (main → left_page1/center_page)
✅ **Esperas inteligentes**: Detección automática de loaders múltiples
✅ **Telemetría granular**: console.time/timeEnd por cada bloque
✅ **Evidencia completa**: Screenshots adjuntos con test.info().attach()
✅ **Logs descriptivos**: Emojis y formato para facilitar lectura en consola
✅ **Configuración optimizada**: Timeouts, args de Chrome, workers=1

---

**Última actualización**: Febrero 2026  
**Versión del Framework**: 2.0 (Real Selectors)  
**Mantenedor**: QA Automation Team
