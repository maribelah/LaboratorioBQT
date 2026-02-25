# 🚀 New Order Entry - Guía de Ejecución

## 📋 Descripción
Script automatizado para el flujo completo de "New Order Entry" en Webflowers Beta.

### Funcionalidades Implementadas
✅ Login reutilizado (sin duplicación de código)  
✅ Manejo automático de MFA (pausa si es requerido)  
✅ Navegación por iframes (menú lateral y central)  
✅ Medición de tiempos de respuesta  
✅ Capturas de pantalla en pasos críticos  
✅ Reporte HTML detallado  
✅ Visualización en navegador en tiempo real  

---

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias (primera vez)
```powershell
npm install
npx playwright install
```

### 2. Verificar archivo .env
Asegúrate de que existe el archivo `.env` con estas configuraciones:
```dotenv
PROJECT_NAME=beta
HEADLESS=false         # Ver el navegador durante la ejecución
SLOW_MO=500           # Velocidad de ejecución (ms entre acciones)
BETA_USER=qaauto
BETA_PASS=qaauto
BETA_URL=https://betabqc.ghtcorptest.com/
```

---

## 🎬 Ejecución

### Opción 1: Navegador Visible (Recomendado para visualizar)
```powershell
# Ejecutar con navegador visible y velocidad moderada
npx playwright test new-order-entry.spec.ts --project=beta

# Ejecutar más lento (para ver cada paso)
$env:SLOW_MO="1000"; npx playwright test new-order-entry.spec.ts --project=beta

# Ejecutar a velocidad normal (sin pausa)
$env:SLOW_MO="0"; npx playwright test new-order-entry.spec.ts --project=beta
```

### Opción 2: Modo Headless (Sin Interfaz)
```powershell
$env:HEADLESS="true"; npx playwright test new-order-entry.spec.ts --project=beta
```

### Opción 3: Modo UI (Interactivo - Recomendado para debugging)
```powershell
npx playwright test new-order-entry.spec.ts --project=beta --ui
```

### Opción 4: Modo Debug (Paso a paso)
```powershell
npx playwright test new-order-entry.spec.ts --project=beta --debug
```

---

## 📊 Ver Resultados

### Reporte HTML (después de la ejecución)
```powershell
npx playwright show-report
```

Abrirá automáticamente el reporte en tu navegador con:
- Estado de cada paso del test
- Capturas de pantalla adjuntas
- Métricas de tiempo de carga
- Trace viewer para debugging profundo

### Consola
Durante la ejecución verás en tiempo real:
```
⏱️ Order Entry iframe loaded in 1250 ms

✅ Order form completed successfully!
   Customer: WAL-MART 6099-MACCLENNY
   Shipping Date: 2/21/2026
   P.O. No: QAAuto
   Order Behavior: Regular

📊 Performance Summary:
   Total Requests: 15
   Slow Requests: 2 (threshold: 2000ms)
   ...
```

---

## 🔍 Flujo Detallado del Test

### Paso 1: Login (Reusado)
- Navega a `https://betabqc.ghtcorptest.com/`
- Ingresa credenciales desde `.env`
- Maneja MFA si es solicitado (pausa para entrada manual)
- Captura: `neworder-login-01-login-page.png`

### Paso 2: Navegación por Menú (iframe lateral)
- Entra al iframe `left_page1`
- Clic en: **Sales** → **New** → **Order Entry**
- Mide tiempo de carga del iframe central
- Captura: `03-order-entry-loaded.png`

### Paso 3: Llenado de Formulario (iframe central)
- Entra al iframe `center_page`
- **Customer:** `WAL-MART 6099-MACCLENNY` (con selección de dropdown)
- **Shipping Date:** Fecha actual + 5 días (cálculo automático)
- **P.O. No.:** `QAAuto`
- **Order Behavior:** `Regular` (selección desplegable)
- Captura: `04-order-form-completed.png`

### Paso 4: Métricas
- Imprime resumen de performance en consola
- Identifica requests lentos (>2s)
- Genera reporte HTML con todos los detalles

---

## 🐛 Troubleshooting

### MFA Code Required
Si el sistema solicita MFA, el script pausará automáticamente:
```
MFA code required. Please enter the verification code: _
```
Ingresa el código desde tu email/app y presiona Enter.

### Elemento No Encontrado
- Verifica que la URL en `.env` sea correcta
- Los iframes pueden tardar en cargar: el script incluye waits de hasta 20s
- Revisa el trace en el reporte HTML para debugging visual

### Test Falla
1. Abre el reporte: `npx playwright show-report`
2. Ve a la sección del paso que falló
3. Revisa la captura de pantalla adjunta
4. Usa el Trace Viewer para ver paso a paso

---

## 📸 Capturas Generadas

Todas las capturas se adjuntan automáticamente al reporte HTML:

1. **neworder-login-01-login-page.png** - Página de login inicial
2. **neworder-login-02-credentials-entered.png** - Después de ingresar credenciales
3. **neworder-login-03-after-login.png** - Login exitoso
4. **03-order-entry-loaded.png** - Iframe de Order Entry cargado
5. **04-order-form-completed.png** - Formulario completado

También disponibles en carpeta: `screenshots/`

---

## ⚡ Comandos Rápidos

```powershell
# Ver test con navegador visible
npx playwright test new-order-entry.spec.ts --project=beta

# Ver reporte del último test
npx playwright show-report

# Limpiar resultados previos
Remove-Item test-results -Recurse -Force; Remove-Item playwright-report -Recurse -Force

# Ver todos los tests disponibles
npx playwright test --list

# Ejecutar solo un paso específico (modo debug)
npx playwright test new-order-entry.spec.ts --project=beta --debug
```

---

## 📈 Métricas de Performance

El test mide automáticamente:
- ⏱️ Tiempo de carga del iframe Order Entry
- 📊 Número total de requests HTTP
- 🐌 Requests lentos (>2s) con URLs y tiempos
- 📦 Estadísticas de red (promedio, min, max)

Ejemplo de output:
```
⏱️ Order Entry iframe loaded in 1250 ms

📊 Performance Summary:
==================================================
Total Requests: 12
Slow Requests (>2000ms): 1
  - https://betabqc.ghtcorptest.com/api/customers (3450ms)
Average Response Time: 850ms
```

---

## 🔗 Referencias

- **Archivo del Test:** `tests/new-order-entry.spec.ts`
- **Page Objects:** `src/pages/LoginPage.ts`, `BasePage.ts`
- **Routines:** `src/routines/loginRoutine.ts`
- **Helpers:** `src/helpers/auth.ts`, `metrics.ts`
- **Config:** `playwright.config.ts`

---

**Última Actualización:** Febrero 2026  
**Ambiente Objetivo:** Beta (https://betabqc.ghtcorptest.com/)  
**Credenciales:** qaauto/qaauto  
