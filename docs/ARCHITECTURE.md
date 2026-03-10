# 🏛️ Arquitectura del Framework - Screenplay Pattern

**Versión:** 2.0  
**Fecha de Actualización:** Marzo 5, 2026  
**Patrón:** Screenplay Pattern con Playwright + TypeScript

---

## 📖 Índice

1. [Qué es Screenplay Pattern](#qué-es-screenplay-pattern)
2. [Ventajas sobre Page Object Model](#ventajas-sobre-page-object-model)
3. [Componentes Principales](#componentes-principales)
4. [Flujo de Ejecución](#flujo-de-ejecución)
5. [Estructura de Directorios](#estructura-de-directorios)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [Convenciones de Código](#convenciones-de-código)
8. [Patrones Avanzados](#patrones-avanzados)

---

## 🎭 Qué es Screenplay Pattern

**Screenplay Pattern** es un patrón de diseño para automatización de pruebas que modela las interacciones con la aplicación desde la perspectiva de **actores** (usuarios) que realizan **tareas** para lograr sus objetivos.

### Filosofía Central

```
Un ACTOR con ciertas HABILIDADES realiza TAREAS compuestas de INTERACCIONES,
y luego hace PREGUNTAS para verificar resultados.
```

### Comparación con POM

| **Aspecto** | **Page Object Model** | **Screenplay Pattern** |
|------------|----------------------|----------------------|
| **Enfoque** | Estructura de la página | Intención del usuario |
| **Organización** | Por páginas | Por capacidades/tareas |
| **Legibilidad** | Código técnico | Lenguaje de negocio |
| **Reutilización** | Métodos de página | Tareas componibles |
| **Escalabilidad** | Se complica con UI complejas | Crece linealmente |

---

## ✅ Ventajas sobre Page Object Model

### 1. **Mayor Legibilidad**

```typescript
// ❌ POM - Perspectiva técnica
await loginPage.navigate('/login');
await loginPage.fillEmail('user@test.com');
await loginPage.fillPassword('pass123');
await loginPage.clickSubmit();

// ✅ Screenplay - Perspectiva del usuario
await actor.attemptsTo(
  Navigate.to('/login'),
  Login.withCredentials('user@test.com', 'pass123')
);
```

### 2. **Mejor Reusabilidad**

Las tareas se componen como bloques LEGO:

```typescript
await actor.attemptsTo(
  Login.withCredentials(email, password),
  SearchProduct.byName('Roses'),
  AddToCart.quantity(12),
  ProceedToCheckout()
);
```

### 3. **Separación Clara de Responsabilidades**

```
UI Elements → Solo selectores (sin lógica)
Interactions → Acciones atómicas (Click, Fill, etc.)
Tasks → Flujos de negocio (Login, CreateOrder, etc.)
Questions → Aserciones/consultas (IsVisible, GetText, etc.)
```

### 4. **Fácil Testing de APIs + UI**

El actor puede tener múltiples habilidades:

```typescript
const actor = Actor.named('TestUser')
  .whoCan(BrowseTheWeb.using(page))
  .whoCan(CallAnApi.withBaseUrl('https://api.example.com'));

await actor.attemptsTo(
  CreateProduct.viaApi({ name: 'Test Product' }),  // API
  Navigate.to('/products'),                         // UI
  VerifyProduct.isVisible('Test Product')            // UI
);
```

---

## 🧩 Componentes Principales

### 1. 🎭 Actor (Actor)

**¿Qué es?** El "quien" ejecuta las acciones. Representa un usuario o sistema.

**Ubicación:** `src/actors/Actor.ts`

**Responsabilidad:**
- Mantener habilidades (abilities)
- Ejecutar tareas (tasks)
- Hacer preguntas (questions)

**Ejemplo:**

```typescript
const qaUser = Actor.named('QA Tester')
  .whoCan(BrowseTheWeb.using(page))
  .whoCan(TakeScreenshots.withPrefix('qa-test'));

await qaUser.attemptsTo(Login.withCredentials(email, password));
const isLoggedIn = await qaUser.asks(Dashboard.isVisible());
```

---

### 2. 💪 Abilities (Habilidades)

**¿Qué son?** Capacidades que el actor tiene (interactuar con navegador, llamar APIs, etc.)

**Ubicación:** `src/abilities/`

**Responsabilidad:**
- Encapsular herramientas técnicas (Playwright Page, API client, etc.)
- Proveer acceso controlado a recursos

**Abilities Principales:**

| Ability | Propósito | Ejemplo |
|---------|-----------|---------|
| `BrowseTheWeb` | Navegar con Playwright | `actor.abilityTo(BrowseTheWeb).page` |
| `CallAnApi` | Hacer requests HTTP | `actor.abilityTo(CallAnApi).request(...)` |
| `TakeScreenshots` | Capturar pantallas | `actor.abilityTo(TakeScreenshots).capture(...)` |

**Código:**

```typescript
// src/abilities/BrowseTheWeb.ts
export class BrowseTheWeb {
  private constructor(public readonly page: Page) {}
  
  static using(page: Page): BrowseTheWeb {
    return new BrowseTheWeb(page);
  }
}
```

---

### 3. 🎯 Tasks (Tareas)

**¿Qué son?** Flujos de negocio de alto nivel que un usuario realizaría.

**Ubicación:** `src/tasks/`

**Responsabilidad:**
- Orquestar múltiples interacciones
- Representar objetivos del usuario
- Ser componibles

**Ejemplos:**
- `Login.withCredentials(email, password)`
- `CreateOrder.withProducts([product1, product2])`
- `SearchProduct.byName(name)`

**Estructura:**

```typescript
// src/tasks/Login.ts
import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { Fill } from '../interactions/Fill';
import { Click } from '../interactions/Click';
import { LoginElements } from '../ui/LoginElements';

export class Login implements Task {
  private constructor(
    private email: string,
    private password: string
  ) {}
  
  static withCredentials(email: string, password: string): Login {
    return new Login(email, password);
  }
  
  async performAs(actor: Actor): Promise<void> {
    await actor.attemptsTo(
      Fill.field(LoginElements.emailInput).with(this.email),
      Fill.field(LoginElements.passwordInput).with(this.password),
      Click.on(LoginElements.submitButton)
    );
  }
  
  toString(): string {
    return `Login with credentials (${this.email})`;
  }
}
```

---

### 4. ⚡ Interactions (Interacciones)

**¿Qué son?** Acciones atómicas sobre elementos de la UI (equivalente a métodos de Playwright).

**Ubicación:** `src/interactions/`

**Responsabilidad:**
- Acciones básicas: Click, Fill, Wait, Navigate, etc.
- Manejo de errores y reintentos
- Logging detallado

**Interactions Principales:**

| Interaction | Propósito | Ejemplo |
|------------|-----------|---------|
| `Click` | Hacer click | `Click.on(button)` |
| `Fill` | Llenar campo | `Fill.field(input).with(text)` |
| `Navigate` | Ir a URL | `Navigate.to('/login')` |
| `Wait` | Esperar elemento | `Wait.forElement(spinner).toDisappear()` |
| `Select` | Seleccionar opción | `Select.option(dropdown).byValue('option1')` |

**Código:**

```typescript
// src/interactions/Click.ts
import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { Locator } from '@playwright/test';

export class Click implements Task {
  private constructor(private target: Locator | (() => Locator)) {}
  
  static on(target: Locator | (() => Locator)): Click {
    return new Click(target);
  }
  
  async performAs(actor: Actor): Promise<void> {
    const page = actor.abilityTo(BrowseTheWeb).page;
    const locator = typeof this.target === 'function' ? this.target() : this.target;
    
    await locator.click();
  }
  
  toString(): string {
    return `Click on element`;
  }
}
```

---

### 5. ❓ Questions (Preguntas)

**¿Qué son?** Consultas sobre el estado de la aplicación (equivalente a aserciones).

**Ubicación:** `src/questions/`

**Responsabilidad:**
- Obtener información de la UI
- Retornar valores para aserciones
- No modificar estado

**Questions Principales:**

| Question | Retorno | Ejemplo |
|----------|---------|---------|
| `Text.of(element)` | `string` | `await actor.asks(Text.of(heading))` |
| `Visibility.of(element)` | `boolean` | `await actor.asks(Visibility.of(modal))` |
| `Value.of(input)` | `string` | `await actor.asks(Value.of(emailField))` |
| `CurrentUrl` | `string` | `await actor.asks(CurrentUrl.value())` |

**Código:**

```typescript
// src/questions/Visibility.ts
import { Actor } from '../actors/Actor';
import { Question } from '../types/Question';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { Locator } from '@playwright/test';

export class Visibility implements Question<boolean> {
  private constructor(private target: Locator | (() => Locator)) {}
  
  static of(target: Locator | (() => Locator)): Visibility {
    return new Visibility(target);
  }
  
  async answeredBy(actor: Actor): Promise<boolean> {
    const page = actor.abilityTo(BrowseTheWeb).page;
    const locator = typeof this.target === 'function' ? this.target() : this.target;
    
    return await locator.isVisible();
  }
  
  toString(): string {
    return `Visibility of element`;
  }
}
```

---

### 6. 🎨 UI Elements

**¿Qué son?** Definiciones puras de selectores (sin lógica).

**Ubicación:** `src/ui/`

**Responsabilidad:**
- Centralizar selectores
- Usar selectores semánticos (getByRole, getByLabel)
- NO contener métodos de acción

**Antes (POM):**

```typescript
// ❌ LoginPage con lógica
export class LoginPage {
  readonly emailInput = this.page.getByLabel('Email');
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    // ...más lógica...
  }
}
```

**Después (Screenplay):**

```typescript
// ✅ Solo selectores
// src/ui/LoginElements.ts
import { Page } from '@playwright/test';

export const LoginElements = {
  emailInput: (page: Page) => page.getByLabel('Email'),
  passwordInput: (page: Page) => page.getByLabel('Password'),
  submitButton: (page: Page) => page.getByRole('button', { name: /login|ingresar/i }),
  errorMessage: (page: Page) => page.getByRole('alert')
};
```

---

## 🔄 Flujo de Ejecución

### Diagrama de Flujo

```
┌─────────────┐
│   TEST      │
│   SPEC      │
└──────┬──────┘
       │
       │ 1. Crea Actor
       ↓
┌─────────────┐
│    ACTOR    │ ← 2. Asigna Abilities (BrowseTheWeb, CallAnApi, etc.)
└──────┬──────┘
       │
       │ 3. attemptsTo(Task)
       ↓
┌─────────────┐
│    TASK     │ ← 4. Descompone en Interactions
└──────┬──────┘
       │
       │ 5. performAs(actor)
       ↓
┌─────────────┐
│ INTERACTION │ ← 6. Usa Abilities para obtener Page/API client
└──────┬──────┘
       │
       │ 7. Ejecuta acción (click, fill, etc.)
       ↓
┌─────────────┐
│ UI ELEMENT  │ ← 8. Selector Playwright
└──────┬──────┘
       │
       │ 9. Acción sobre DOM
       ↓
┌─────────────┐
│  APLICACIÓN │
└─────────────┘
```

### Ejemplo Completo

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { Actor } from '../src/actors/Actor';
import { BrowseTheWeb } from '../src/abilities/BrowseTheWeb';
import { Navigate } from '../src/interactions/Navigate';
import { Login } from '../src/tasks/Login';
import { Dashboard } from '../src/questions/Dashboard';

test('User can login successfully', async ({ page }) => {
  // 1. Crear actor
  const user = Actor.named('Test User')
    .whoCan(BrowseTheWeb.using(page));
  
  // 2. Ejecutar tareas
  await user.attemptsTo(
    Navigate.to('/login'),
    Login.withCredentials('user@test.com', 'pass123')
  );
  
  // 3. Hacer preguntas (aserciones)
  const dashboardIsVisible = await user.asks(Dashboard.isVisible());
  expect(dashboardIsVisible).toBe(true);
});
```

---

## 📂 Estructura de Directorios

```
c:\WebFlowers_BQTUSA\LaboratorioBQT\
│
├── src/
│   │
│   ├── actors/
│   │   └── Actor.ts                    # Clase base del Actor
│   │
│   ├── abilities/
│   │   ├── BrowseTheWeb.ts             # Capacidad de usar Playwright
│   │   ├── CallAnApi.ts                # Capacidad de hacer requests HTTP
│   │   └── TakeScreenshots.ts          # Capacidad de capturar pantallas
│   │
│   ├── tasks/                          # Tareas de alto nivel (ex-routines)
│   │   ├── Login.ts                    # Tarea: Realizar login
│   │   ├── CreateOrder.ts              # Tarea: Crear orden
│   │   ├── SearchProduct.ts            # Tarea: Buscar producto
│   │   └── AddToCart.ts                # Tarea: Agregar al carrito
│   │
│   ├── interactions/                   # Interacciones atómicas
│   │   ├── Click.ts                    # Click en elemento
│   │   ├── Fill.ts                     # Llenar campo
│   │   ├── Navigate.ts                 # Navegar a URL
│   │   ├── Wait.ts                     # Esperar elemento
│   │   ├── Select.ts                   # Seleccionar opción
│   │   └── Hover.ts                    # Hover sobre elemento
│   │
│   ├── questions/                      # Preguntas (aserciones)
│   │   ├── Text.ts                     # Obtener texto de elemento
│   │   ├── Visibility.ts               # Verificar visibilidad
│   │   ├── Value.ts                    # Obtener valor de input
│   │   ├── CurrentUrl.ts               # Obtener URL actual
│   │   └── ElementCount.ts             # Contar elementos
│   │
│   ├── ui/                             # Selectores UI (ex-pages)
│   │   ├── LoginElements.ts            # Selectores de login
│   │   ├── OrderEntryElements.ts       # Selectores de orden
│   │   ├── ProductSearchElements.ts    # Selectores de búsqueda
│   │   └── DashboardElements.ts        # Selectores de dashboard
│   │
│   ├── types/                          # Interfaces TypeScript
│   │   ├── Task.ts                     # Interface Task
│   │   ├── Question.ts                 # Interface Question
│   │   └── Ability.ts                  # Interface Ability
│   │
│   ├── helpers/                        # Utilidades (sin cambios)
│   │   ├── auth.ts
│   │   ├── metrics.ts
│   │   └── data.ts
│   │
│   └── data/                           # Datos de prueba JSON
│       └── *.data.json
│
├── tests/                              # Test specs usando Screenplay
│   ├── login.spec.ts
│   ├── order-entry.spec.ts
│   └── product-search.spec.ts
│
├── docs/
│   ├── ARCHITECTURE.md                 # Este archivo
│   ├── MIGRATION_GUIDE.md              # Guía de migración POM→Screenplay
│   └── STANDARDS.md
│
└── playwright.config.ts
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Login Simple

```typescript
// tests/login.spec.ts
test('Login with valid credentials', async ({ page }) => {
  const user = Actor.named('QA User').whoCan(BrowseTheWeb.using(page));
  
  await user.attemptsTo(
    Navigate.to('/login'),
    Login.withCredentials('qa@test.com', 'SecurePass123')
  );
  
  expect(await user.asks(CurrentUrl.value())).toContain('/dashboard');
});
```

### Ejemplo 2: Crear Orden Completa

```typescript
test('Create new order with multiple products', async ({ page }) => {
  const buyer = Actor.named('Buyer').whoCan(BrowseTheWeb.using(page));
  
  await buyer.attemptsTo(
    Navigate.to('/login'),
    Login.withCredentials('buyer@test.com', 'pass'),
    Navigate.to('/orders/new'),
    SelectCustomer.byName('ACME Corp'),
    AddProduct.withDetails({ name: 'Roses', quantity: 100 }),
    AddProduct.withDetails({ name: 'Tulips', quantity: 50 }),
    SubmitOrder()
  );
  
  expect(await buyer.asks(SuccessMessage.text())).toContain('Order created');
});
```

### Ejemplo 3: Combinar API + UI

```typescript
test('Verify product created via API appears in UI', async ({ page, request }) => {
  const tester = Actor.named('API Tester')
    .whoCan(BrowseTheWeb.using(page))
    .whoCan(CallAnApi.using(request));
  
  // Crear producto via API
  await tester.attemptsTo(
    CreateProduct.viaApi({ name: 'TestProduct', price: 99.99 })
  );
  
  // Verificar en UI
  await tester.attemptsTo(
    Navigate.to('/products'),
    SearchProduct.byName('TestProduct')
  );
  
  expect(await tester.asks(ProductCard.isVisible())).toBe(true);
});
```

---

## 📏 Convenciones de Código

### 1. Naming Conventions

```typescript
// ✅ CORRECTO
class Login implements Task { ... }
class Click implements Task { ... }
class Visibility implements Question<boolean> { ... }

// ❌ INCORRECTO
class LoginTask { ... }
class ClickInteraction { ... }
class VisibilityQuestion { ... }
```

### 2. Factory Methods

Todos los componentes usan **factory methods estáticos**:

```typescript
// Task
Login.withCredentials(email, password)

// Interaction
Click.on(button)
Fill.field(input).with(value)

// Question
Text.of(element)
Visibility.of(element)
```

### 3. Method Chaining

Las interacciones deben ser fluidas:

```typescript
await actor.attemptsTo(
  Fill.field(emailInput).with('user@test.com'),
  Fill.field(passwordInput).with('password').slowly(),  // Typing slow
  Click.on(submitButton).withForce()                     // Force click
);
```

### 4. toString() Obligatorio

Para logging descriptivo:

```typescript
export class Login implements Task {
  toString(): string {
    return `Login with credentials (${this.email})`;
  }
}

// Output en logs:
// ✅ "Actor 'QA User' attempts to: Login with credentials (qa@test.com)"
// ❌ "Actor 'QA User' attempts to: [object Object]"
```

---

## 🚀 Patrones Avanzados

### 1. Tasks Componibles

```typescript
export class CreateCompleteOrder implements Task {
  static withProducts(products: Product[]): CreateCompleteOrder {
    return new CreateCompleteOrder(products);
  }
  
  async performAs(actor: Actor): Promise<void> {
    await actor.attemptsTo(
      Navigate.to('/orders/new'),
      SelectCustomer.byName('Default Customer'),
      ...this.products.map(p => AddProduct.withDetails(p)),
      ReviewOrder(),
      SubmitOrder()
    );
  }
}
```

### 2. Questions con Matchers

```typescript
const productCount = await actor.asks(ElementCount.of(productCards));
expect(productCount).toBeGreaterThan(5);

const welcomeText = await actor.asks(Text.of(welcomeHeading));
expect(welcomeText).toMatch(/welcome/i);
```

### 3. Abilities con Configuración

```typescript
const admin = Actor.named('Admin')
  .whoCan(
    BrowseTheWeb.using(page),
    CallAnApi.withConfig({
      baseUrl: 'https://api.example.com',
      headers: { 'Authorization': 'Bearer token123' }
    })
  );
```

### 4. Error Handling en Tasks

```typescript
export class Login implements Task {
  async performAs(actor: Actor): Promise<void> {
    try {
      await actor.attemptsTo(
        Fill.field(LoginElements.emailInput).with(this.email),
        Fill.field(LoginElements.passwordInput).with(this.password),
        Click.on(LoginElements.submitButton)
      );
    } catch (error) {
      await actor.attemptsTo(
        TakeScreenshot.named('login-error')
      );
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}
```

---

## 🔗 Referencias

- **Screenplay Pattern Original:** https://serenity-js.org/handbook/design/screenplay-pattern.html
- **Playwright Docs:** https://playwright.dev/
- **TypeScript Best Practices:** https://basarat.gitbook.io/typescript/

---

## 📝 Changelog

### [2.0] - Marzo 5, 2026
- ✨ Migración completa de POM a Screenplay Pattern
- 🏗️ Nueva estructura con actors, abilities, tasks, interactions, questions
- 📚 Documentación completa de arquitectura

### [1.0] - Febrero 2026
- 🎉 Primera versión con Page Object Model

---

**Mantenido por:** QA Team  
**Última Revisión:** Marzo 5, 2026
