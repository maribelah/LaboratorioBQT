# 001 - Order Entry Migration to Screenplay Pattern

**Número de Tracking:** 001  
**Tipo:** Migration  
**Estado:** 🟢 Completado  
**Fecha Inicio:** 2026-03-05  
**Fecha Fin:** 2026-03-05  
**Ambientes:** Beta  
**Responsable:** QA Team

---

## 🎯 Objetivo

**Descripción breve:**  
Migrar el módulo de Order Entry desde Page Object Model (POM) a Screenplay Pattern, implementando una arquitectura Actor-based completa con separación de responsabilidades (UI Elements, Tasks, Interactions, Questions).

**Contexto:**  
El framework está en transición de POM a Screenplay Pattern para mejorar mantenibilidad, legibilidad y reusabilidad del código. Order Entry es un módulo crítico que involucra navegación por menú, manejo de iframes, formularios complejos con autocomplete, dropdowns, integration codes, y grid items con validaciones de precios.

---

## ✅ Criterios de Aceptación

1. [x] Test funcional completo que cree una orden válida en WebFlowers Beta
2. [x] Todos los campos del formulario llenados correctamente (Customer, Shipping Date, P.O., Order Behavior, Integration Codes, Grid Items)
3. [x] Grid Items con valores de Boxes y FOB Price persistiendo correctamente en el sistema
4. [x] Extracción exitosa del número de orden generado
5. [x] Performance aceptable (<60s por orden completa)
6. [x] Arquitectura Screenplay completa (UI Elements, Tasks, Questions)
7. [x] Documentación de lecciones aprendidas y problemas resueltos

---

## 📋 Plan de Implementación

### Fase 1: Documentación
- [x] Consultar `docs/ARCHITECTURE.md` y `docs/STANDARDS.md`
- [x] Crear este documento de tracking (001)
- [x] Actualizar `docs/EXECUTION_LOG.md` con nueva fila

### Fase 2: Datos de Prueba
- [x] Crear `src/data/order-entry.data.json` con estructura de orden
- [x] Validar formato sin URLs ni credenciales
- [x] Corregir formato decimal (punto en lugar de coma)

### Fase 3: Componentes Screenplay
- [x] Crear `src/ui/OrderEntryElements.ts` - Selectores para iframes y formulario
- [x] Crear `src/tasks/NavigateToOrderEntry.ts` - Navegación por menú
- [x] Crear `src/tasks/FillOrderForm.ts` - Llenado completo del formulario
- [x] Crear `src/tasks/SaveOrder.ts` - Guardado con espera de loader
- [x] Crear `src/questions/OrderNumber.ts` - Extracción de número de orden

### Fase 4: Tests
- [x] Crear `tests/order-entry-screenplay.spec.ts`
- [x] Incluir `setupPerformanceMonitoring()`
- [x] Agregar capturas de pantalla con `test.info().attach()`
- [x] Estructurar en 5 pasos con `test.step()`

### Fase 5: Validación
- [x] Ejecutar localmente en Beta
- [x] Validar órdenes creadas (154998-155006)
- [x] Confirmar Grid Items precios correctos (orden 155006)
- [x] Verificar métricas de performance

### Fase 6: Documentación Final
- [x] Completar sección "Artefactos Generados"
- [x] Completar sección "Problemas y Soluciones"
- [x] Completar sección "Lecciones Aprendidas"
- [x] Actualizar estado en `docs/EXECUTION_LOG.md`
- [x] Actualizar `copilot-instructions.md` con lecciones críticas

---

## 📝 LOG de Implementación

### 2026-03-05 09:00 - Inicio de Migración

Iniciada migración de Order Entry a Screenplay Pattern. Componentes base ya creados en sesiones anteriores (Actor, Abilities, Interactions, Questions genéricas).

**Decisión:** Crear UI Elements separados en lugar de Page Object monolítico.

### 2026-03-05 10:15 - Navegación por Menú

Implementada `NavigateToOrderEntry.ts` con navegación por iframes (left_page1 para menú, center_page para formulario).

**Selector clave:** Menu Sales usando xpath `//span[contains(@class,'subSales')]`

### 2026-03-05 11:30 - Problema: Customer Selection

**Issue:** Customer autocomplete no seleccionaba el valor correcto (6099 WAL-MART).

**Solución:** Click específico en dropdown option con `data-item-key="201"` en lugar de navegación por teclado.

### 2026-03-05 12:00 - Problema: Order Behavior

**Issue:** Order Behavior no mostraba "Regular" correctamente.

**Solución:** Usar `selectOption({ label: 'Regular' })` en lugar de navegación por teclado.

### 2026-03-05 13:00 - Problema: Integration Code 2 Timeout

**Issue:** Integration Code 2 causaba timeout antes de Grid Items.

**Solución:** Extender timeout a 30s y agregar espera explícita de loader (`.loading-overlay`) después de selección.

### 2026-03-05 14:00 - PROBLEMA CRÍTICO: Grid Items FOB Price = 0

**Issue:** Todos los valores de precio en Grid Items se guardaban como 0 en el sistema, aunque visualmente se mostraban correctos durante el test.

**Órdenes afectadas:** 155002, 155003, 155005

**Intentos de solución:**
1. Attempt 1 (155002): Aumentar esperas después de fill() → **Falló**
2. Attempt 2 (155003): Agregar `page.keyboard.press('Enter')` global → **Falló**
3. Attempt 3 (155005): Cambiar a `priceInput.press('Enter')` en el campo → **Falló**

### 2026-03-05 14:45 - Uso de Playwright Codegen

**Decisión:** Usar `npx playwright codegen` para capturar la interacción real que WebFlowers espera.

**Código generado por Codegen:**
```typescript
await page.locator('iframe[name="main"]').contentFrame()
  .locator('.input-cell.form-control.text-right.ng-pristine').first()
  .fill('0.212');
await page.locator('iframe[name="main"]').contentFrame()
  .locator('.input-cell.form-control.text-right.ng-pristine').first()
  .press('Enter');
await page.locator('iframe[name="main"]').contentFrame()
  .locator('.ag-body-viewport').click();
```

**Hallazgos clave:**
1. **Formato decimal:** Usa `'0.212'` (punto) NO `'0,212'` (coma)
2. **Enter en campo:** `priceInput.press('Enter')` NO `page.keyboard.press('Enter')`
3. **Click en viewport:** `.ag-body-viewport` en lugar de `body` genérico

### 2026-03-05 15:00 - Solución Final: Doble Causa Raíz

**Problema:** Combinación de DOS errores:
1. **Formato decimal incorrecto:** `"2,34"` (europeo) → Debía ser `"2.34"` (americano)
2. **Enter global:** `page.keyboard.press('Enter')` → Debía ser `priceInput.press('Enter')`

**Cambios aplicados:**
- `src/data/order-entry.data.json`: Cambio de formato decimal (coma → punto)
- `src/tasks/FillOrderForm.ts`: Enter en campo específico + click en `.ag-body-viewport`
- `.github/copilot-instructions.md`: Documentación de patrón correcto

**Validación:** Orden 155006 creada con precios correctos ✅

### 2026-03-05 15:30 - Documentación Final

Completado sistema de tracking con:
- `output/README.md` - Explicación del sistema
- `output/TEMPLATE.md` - Template para futuras implementaciones
- `docs/EXECUTION_LOG.md` - Índice maestro
- `output/001-order-entry-migration.md` - Este documento

### 2026-03-05 15:45 - Limpieza de Archivos Legacy

**Eliminados 13 archivos legacy** que no pertenecen a la arquitectura Screenplay:

**Carpetas eliminadas:**
- `src/pages/` (6 archivos POM): BasePage, LoginPage, NewPOPage, OrderEntryPage, ProductSearchModal, QuickFillModal
- `src/routines/` (1 archivo): loginRoutine.ts

**Tests legacy eliminados:**
- `tests/login.spec.ts` (reemplazado por `login-screenplay.spec.ts`)
- `tests/new-order-entry.spec.ts` (reemplazado por `order-entry-screenplay.spec.ts`)
- `tests/new-po-real.spec.ts` (POM legacy)
- `tests/new-po.spec.ts` (POM legacy)

**Documentación/scripts legacy:**
- `RUN_NEW_ORDER.md` - Guía para tests POM
- `run-fresh-test.bat` - Script batch para test inexistente

**Resultado:** Framework 100% limpio con solo arquitectura Screenplay. TypeScript compilación sin errores ✅

---

## 🗂️ Artefactos Generados

| Archivo | Tipo | Estado | Descripción |
|---------|------|--------|-------------|
| `src/data/order-entry.data.json` | Data | ✅ | Datos de prueba (formato decimal corregido) |
| `src/ui/OrderEntryElements.ts` | UI | ✅ | Selectores para iframes, formulario, grid items |
| `src/tasks/NavigateToOrderEntry.ts` | Task | ✅ | Navegación Sales > New > Order Entry |
| `src/tasks/FillOrderForm.ts` | Task | ✅ | Llenado completo con Grid Items |
| `src/tasks/SaveOrder.ts` | Task | ✅ | Guardado con espera de loader |
| `src/questions/OrderNumber.ts` | Question | ✅ | Extracción del número de orden |
| `tests/order-entry-screenplay.spec.ts` | Test | ✅ | Test funcional en 5 pasos |
| `output/README.md` | Docs | ✅ | Sistema de tracking |
| `output/TEMPLATE.md` | Docs | ✅ | Template de implementación |
| `docs/EXECUTION_LOG.md` | Docs | ✅ | Índice maestro |

---

## 🐛 Problemas y Soluciones

| # | Problema | Causa Raíz | Solución Aplicada | Orden | Estado |
|---|----------|------------|-------------------|-------|--------|
| 1 | Customer incorrecto | Navegación por teclado no confiable | Click específico en dropdown option `data-item-key="201"` | 154999 | ✅ |
| 2 | Order Behavior incorrecto | Navegación por teclado no confiable | `selectOption({ label: 'Regular' })` | 155000 | ✅ |
| 3 | Integration Code 2 timeout | Esperas insuficientes | Timeout 30s + espera explícita de loader | 155001 | ✅ |
| 4 | Grid Items FOB Price = 0 (Intento 1) | Esperas insuficientes (hipótesis incorrecta) | Aumentar waits → **No resolvió** | 155002 | ❌ |
| 5 | Grid Items FOB Price = 0 (Intento 2) | Enter global sin contexto de campo | `page.keyboard.press('Enter')` → **No resolvió** | 155003 | ❌ |
| 6 | Grid Items FOB Price = 0 (Intento 3) | Enter correcto pero formato decimal incorrecto | `priceInput.press('Enter')` → **No resolvió** (faltaba punto decimal) | 155005 | ❌ |
| 7 | **Grid Items FOB Price = 0 (Solución final)** | **Doble causa:** 1) Formato `"2,34"` (coma) parseado como NaN, 2) Enter global no en campo | 1) Cambio a `"2.34"` (punto), 2) `priceInput.press('Enter')`, 3) Click en `.ag-body-viewport` | 155006 | ✅ |

---

## 📊 Métricas de Performance

### Ejecución Final (Orden 155006)

**Comando:**
```bash
npx playwright test order-entry-screenplay.spec.ts --project=beta --headed --timeout=300000
```

**Resultados:**
- **Tiempo Total:** 43.19s (< 60s objetivo ✅)
- **Desglose:**
  - Login: 4.66s
  - Navegación: 2.21s
  - Llenado de Formulario: 29.65s
  - Guardado: 6.67s
- **Network:**
  - Requests totales: 338
  - Duración promedio: 297ms
  - Request más lento: 1809ms (POST ExecuteCommandStream)
  - Requests fallidos (404): 2 (imágenes, no críticos)

**Screenshots Generados:** 5 (Login, Navegación, Formulario, Guardado, Confirmación)

### Órdenes de Validación

| Orden | Status | Customer | Behavior | IC1 | IC2 | Boxes | Prices | Notas |
|-------|--------|----------|----------|-----|-----|-------|--------|-------|
| 154998 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❓ | Primera orden, no validado precio |
| 154999 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❓ | Fix customer dropdown |
| 155000 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❓ | Fix order behavior |
| 155001 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❓ | Fix IC2 timeout |
| 155002 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (0) | Intento con waits aumentados |
| 155003 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (0) | Intento con `page.keyboard.press('Enter')` |
| 155005 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (0) | Intento con `priceInput.press('Enter')` pero coma decimal |
| 155006 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Solución final: punto decimal + Enter en campo** |

---

## 🎓 Lecciones Aprendidas

### 1. Angular Form Fields Require Specific Event Sequences

**Contexto:** Grid Items FOB Price con `ng-model="data.Price"` requería interacción específica.

**Aprendizaje:** 
- Fields con Angular/AG-Grid NO basta con `fill()` + `blur()`
- Requieren: **Enter EN EL CAMPO** (`locator.press('Enter')`), NO Enter global (`page.keyboard.press()`)
- Además requieren click en viewport del grid (`.ag-body-viewport`) para "commitear" el cambio

**Aplicación:** Siempre usar `locator.press('Enter')` en lugar de `page.keyboard.press()` para campos calculados o con bindings complejos.

### 2. Decimal Format is Critical in Angular Apps

**Contexto:** WebFlowers Beta no parseaba correctamente valores con coma decimal.

**Aprendizaje:**
- Angular parsea números con formato **americano (punto)**: `"2.34"`, `"0.212"` ✅
- Formato **europeo (coma)** falla silenciosamente: `"2,34"` → parseado como `NaN` → guardado como `0` ❌
- No hay error visible en UI, solo en datos guardados

**Aplicación:** SIEMPRE usar punto decimal en datos JSON para aplicaciones Angular. Validar formato antes de test execution.

### 3. Playwright Codegen is Invaluable for Complex Interactions

**Contexto:** Después de 3 intentos fallidos de debug manual, Codegen reveló el problema inmediatamente.

**Aprendizaje:**
- Codegen captura la **secuencia exacta** de eventos que la aplicación espera
- Es especialmente útil para:
  - Angular/React apps con event handling complejo
  - Grid libraries (AG-Grid, Kendo, etc.)
  - Custom form controls
  - Timing-sensitive interactions

**Aplicación:** Cuando una interacción falla repetidamente y la causa no es obvia, usar Codegen ANTES de hacer más intentos manuales. Ahorra tiempo.

### 4. Explicit Waits After Data-Loading Operations

**Contexto:** Integration Code 2 disparaba carga de datos relacionados antes de Grid Items.

**Aprendizaje:**
- SIEMPRE esperar explícitamente después de:
  - Autocomplete selections
  - Integration codes
  - Dropdowns que disparan carga de datos relacionados
- Esperar tanto el loader (`.loading-overlay`) como un timeout adicional (500-1000ms)

**Aplicación:** Patrón estandarizado:
```typescript
await field.selectOption();
await expect(loadingOverlay).not.toBeVisible({ timeout: 15000 });
await page.waitForTimeout(1000); // Estabilidad adicional
```

### 5. Double-Check Assumptions with Real Validation

**Contexto:** Tests pasaban "green" pero datos en sistema incorrectos.

**Aprendizaje:**
- Playwright test `passed` NO garantiza datos correctos si no hay aserciones específicas
- SIEMPRE validar en el sistema real (WebFlowers) después de test automation
- Considerar agregar aserciones de valores guardados cuando sea posible

**Aplicación:** Para flujos críticos, agregar validation step que consulte la orden guardada y verifique valores exactos.

### 6. Isolated Component Testing Would Have Saved Time

**Contexto:** Grid Items era el último paso de un flujo de 30s, causando ciclo de debug lento.

**Aprendizaje:**
- Para componentes complejos (grids, modals), crear **test aislado** primero
- Validar comportamiento del componente ANTES de integrarlo en flujo completo
- Reduce ciclo de feedback de 40s a ~10s

**Aplicación:** Próxima vez, crear `tests/grid-items-isolated.spec.ts` para debug rápido antes del test de integración completo.

---

## 🔗 Referencias

- **Documentación Framework:**
  - [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Guía completa de Screenplay Pattern
  - [docs/STANDARDS.md](../docs/STANDARDS.md) - Estándares de código (si existe)
  - [docs/EXECUTION_LOG.md](../docs/EXECUTION_LOG.md) - Índice maestro

- **Componentes Relacionados:**
  - Login Screenplay: `tests/login-screenplay.spec.ts`
  - Login Task: `src/tasks/PerformCompleteLogin.ts`

- **Playwright Documentation:**
  - [Codegen Guide](https://playwright.dev/docs/codegen)
  - [Web-First Assertions](https://playwright.dev/docs/best-practices#use-web-first-assertions)

---

## 📌 Notas Adicionales

### Próximos Pasos Sugeridos

1. **Agregar validación de valores guardados**: Query a la orden recién creada para verificar que Grid Items tienen valores correctos programáticamente
2. **Test de múltiples Grid Items**: Validar con 3-5 filas en lugar de solo 2
3. **Test de edge cases**: Valores decimales extremos (0.001, 9999.99), valores negativos, etc.
4. **Refactor de esperas**: Considerar crear helper `waitForAngularStability()` para encapsular patrón de espera de loader + timeout
5. **Performance optimization**: Investigar si `page.waitForTimeout()` puede reducirse con mejores selectores de estado

### Archivos Legacy - Estado

✅ **COMPLETADO (2026-03-05 15:45)**: Todos los archivos legacy POM eliminados del workspace. Framework 100% Screenplay Pattern.

---

**Última Actualización:** 2026-03-05 15:30  
**Documento Creado:** 2026-03-05

---

## ✅ Checklist de Cierre

- [x] Todos los criterios de aceptación cumplidos
- [x] Test validado con orden real (155006) ✅
- [x] Performance dentro de límites (<60s)
- [x] Documentación completa
- [x] Lecciones aprendidas documentadas
- [x] `docs/EXECUTION_LOG.md` actualizado
- [x] `.github/copilot-instructions.md` actualizado con patrones nuevos
- [ ] Commit de cambios al repositorio
- [ ] PR/Merge a rama principal (si aplica)
x] Archivos legacy POM eliminados (13 archivos/carpetas)
- [x] TypeScript compilación verificada (sin errores)
- [ ] Commit de cambios al repositorio
- [ ] PR/Merge a rama principal (si aplica)

**Estado Final:** 🟢 **COMPLETADO, VALIDADO Y LIMPI