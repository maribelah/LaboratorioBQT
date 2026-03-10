# 🔄 Guía de Migración: POM → Screenplay Pattern

**Versión:** 1.0  
**Fecha:** Marzo 5, 2026  
**Audiencia:** Desarrolladores QA que migran código existente

---

## 📖 Índice

1. [Estrategia de Migración](#estrategia-de-migración)
2. [Checklist de Migración](#checklist-de-migración)
3. [Mapeo Detallado](#mapeo-detallado)
4. [Ejemplo Paso a Paso](#ejemplo-paso-a-paso)
5. [Patrones Comunes](#patrones-comunes)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Estrategia de Migración

### Enfoque: Migración Gradual (Incremental)

**NO** migres todo de una vez. **SÍ** migra módulo por módulo.

```
┌─────────────────────────────────────────┐
│  FASE 1: Setup (1 día)                  │
│  - Crear estructura base                │
│  - Documentar                           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  FASE 2: Piloto (2-3 días)              │
│  - Migrar 1 test simple (Login)        │
│  - Validar funcionamiento               │
│  - Ajustar patterns si es necesario     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  FASE 3: Expansión (1-2 semanas)        │
│  - Migrar módulos por prioridad         │
│  - Mantener POM funcionando en paralelo │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  FASE 4: Cleanup (2-3 días)             │
│  - Eliminar código POM antiguo          │
│  - Refactorizar duplicados              │
│  - Actualizar docs                      │
└─────────────────────────────────────────┘
```

### Reglas de Oro

1. **Nunca rompas tests existentes** durante la migración
2. **Un test a la vez** - valida que funcione antes de seguir
3. **Convivencia temporal** - ambos patrones pueden coexistir
4. **Documentar decisiones** - mantén changelog de cambios

---

## ✅ Checklist de Migración

### Pre-Migración

- [ ] Leer `docs/ARCHITECTURE.md` completo
- [ ] Entender componentes Screenplay (Actor, Task, Interaction, Question)
- [ ] Identificar tests candidatos (empezar con el más simple)
- [ ] Crear branch: `git checkout -b feature/screenplay-migration`

### Fase 1: Estructura Base

- [ ] Crear carpetas: `src/actors/`, `src/abilities/`, `src/tasks/`, `src/interactions/`, `src/questions/`, `src/ui/`, `src/types/`
- [ ] Crear `src/types/Task.ts`, `src/types/Question.ts`, `src/types/Ability.ts`
- [ ] Crear `src/actors/Actor.ts`
- [ ] Crear `src/abilities/BrowseTheWeb.ts`
- [ ] Crear interactions básicas: `Click.ts`, `Fill.ts`, `Navigate.ts`
- [ ] Crear questions básicas: `Text.ts`, `Visibility.ts`, `CurrentUrl.ts`

### Fase 2: Migración Piloto (Login)

- [ ] Identificar `src/pages/LoginPage.ts`
- [ ] Crear `src/ui/LoginElements.ts` (solo selectores)
- [ ] Crear `src/tasks/Login.ts`
- [ ] Migrar `tests/login.spec.ts` a Screenplay
- [ ] Ejecutar test: `npx playwright test login.spec.ts --project=alpha`
- [ ] Validar que pase ✅

### Fase 3: Expansión

- [ ] Migrar módulo Order Entry
- [ ] Migrar módulo Product Search
- [ ] Migrar módulo Dashboard
- [ ] ... (continuar con resto de módulos)

### Fase 4: Cleanup

- [ ] Eliminar carpeta `src/pages/` (backup primero)
- [ ] Renombrar `src/routines/` → `src/tasks/` (si aplica)
- [ ] Actualizar `docs/EXECUTION_LOG.md`
- [ ] Update `README.md` principal
- [ ] Merge a main: `git checkout main && git merge feature/screenplay-migration`

---

## 🗺️ Mapeo Detallado

### Mapeo de Conceptos

| **POM (Antes)** | **Screenplay (Después)** | **Acción** |
|----------------|------------------------|----------|
| `LoginPage.ts` | `LoginElements.ts` + `Login.ts` | Separar selectores de lógica |
| `loginPage.login(user, pass)` | `Login.withCredentials(user, pass)` | Convertir a Task |
| `loginPage.expectLoginError()` | `Visibility.of(LoginElements.errorMessage)` | Convertir a Question |
| `loginPage.navigate('/login')` | `Navigate.to('/login')` | Usar Interaction |
| `new LoginPage(page)` | `Actor.whoCan(BrowseTheWeb.using(page))` | Usar Actor |

### Mapeo de Archivos

#### ANTES (POM)

```
src/
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── OrderEntryPage.ts
│   └── ProductSearchModal.ts
├── routines/
│   └── loginRoutine.ts
└── helpers/
    └── auth.ts
```

#### DESPUÉS (Screenplay)

```
src/
├── actors/
│   └── Actor.ts
├── abilities/
│   └── BrowseTheWeb.ts
├── tasks/
│   ├── Login.ts
│   └── CreateOrder.ts
├── interactions/
│   ├── Click.ts
│   ├── Fill.ts
│   └── Navigate.ts
├── questions/
│   ├── Text.ts
│   └── Visibility.ts
├── ui/
│   ├── LoginElements.ts
│   ├── OrderEntryElements.ts
│   └── ProductSearchElements.ts
└── helpers/
    └── auth.ts  ← Se mantiene igual
```

---

## 📝 Ejemplo Paso a Paso

### ANTES: Login con POM

#### 1. Page Object (`src/pages/LoginPage.ts`)

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  
  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error');
  }
  
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
  
  async expectLoginError(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }
}
```

#### 2. Test (`tests/login.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';

test('login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.navigate('/login');
  await loginPage.login('user@test.com', 'pass123');
  
  await expect(page).toHaveURL(/dashboard/);
});
```

---

### DESPUÉS: Login con Screenplay

#### 1. UI Elements (`src/ui/LoginElements.ts`)

```typescript
import { Page } from '@playwright/test';

export const LoginElements = {
  usernameInput: (page: Page) => page.locator('input[name="username"]'),
  passwordInput: (page: Page) => page.locator('input[name="password"]'),
  submitButton: (page: Page) => page.locator('button[type="submit"]'),
  errorMessage: (page: Page) => page.locator('.error')
};
```

#### 2. Task (`src/tasks/Login.ts`)

```typescript
import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { Fill } from '../interactions/Fill';
import { Click } from '../interactions/Click';
import { LoginElements } from '../ui/LoginElements';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';

export class Login implements Task {
  private constructor(
    private username: string,
    private password: string
  ) {}
  
  static withCredentials(username: string, password: string): Login {
    return new Login(username, password);
  }
  
  async performAs(actor: Actor): Promise<void> {
    const page = actor.abilityTo(BrowseTheWeb).page;
    
    await actor.attemptsTo(
      Fill.field(LoginElements.usernameInput(page)).with(this.username),
      Fill.field(LoginElements.passwordInput(page)).with(this.password),
      Click.on(LoginElements.submitButton(page))
    );
  }
  
  toString(): string {
    return `Login with credentials (${this.username})`;
  }
}
```

#### 3. Question (`src/questions/LoginError.ts`)

```typescript
import { Actor } from '../actors/Actor';
import { Question } from '../types/Question';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { LoginElements } from '../ui/LoginElements';

export class LoginError implements Question<string> {
  private constructor() {}
  
  static message(): LoginError {
    return new LoginError();
  }
  
  async answeredBy(actor: Actor): Promise<string> {
    const page = actor.abilityTo(BrowseTheWeb).page;
    const errorElement = LoginElements.errorMessage(page);
    
    return await errorElement.textContent() || '';
  }
  
  toString(): string {
    return 'Login error message';
  }
}
```

#### 4. Test (`tests/login.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { Actor } from '../src/actors/Actor';
import { BrowseTheWeb } from '../src/abilities/BrowseTheWeb';
import { Navigate } from '../src/interactions/Navigate';
import { Login } from '../src/tasks/Login';
import { CurrentUrl } from '../src/questions/CurrentUrl';

test('login successfully', async ({ page }) => {
  const user = Actor.named('Test User')
    .whoCan(BrowseTheWeb.using(page));
  
  await user.attemptsTo(
    Navigate.to('/login'),
    Login.withCredentials('user@test.com', 'pass123')
  );
  
  const currentUrl = await user.asks(CurrentUrl.value());
  expect(currentUrl).toMatch(/dashboard/);
});
```

---

## 🔧 Patrones Comunes

### Patrón 1: Convertir Método de Page a Task

**ANTES:**

```typescript
// LoginPage.ts
async loginWithMFA(username: string, password: string, mfaCode: string) {
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
  await this.mfaInput.fill(mfaCode);
  await this.verifyButton.click();
}
```

**DESPUÉS:**

```typescript
// src/tasks/LoginWithMFA.ts
export class LoginWithMFA implements Task {
  static usingCredentials(username: string, password: string, mfaCode: string) {
    return new LoginWithMFA(username, password, mfaCode);
  }
  
  async performAs(actor: Actor): Promise<void> {
    const page = actor.abilityTo(BrowseTheWeb).page;
    
    await actor.attemptsTo(
      Fill.field(LoginElements.usernameInput(page)).with(this.username),
      Fill.field(LoginElements.passwordInput(page)).with(this.password),
      Click.on(LoginElements.submitButton(page)),
      Wait.forElement(LoginElements.mfaInput(page)).toBeVisible(),
      Fill.field(LoginElements.mfaInput(page)).with(this.mfaCode),
      Click.on(LoginElements.verifyButton(page))
    );
  }
}
```

### Patrón 2: Convertir Aserción a Question

**ANTES:**

```typescript
// LoginPage.ts
async expectLoginError(message: string) {
  await expect(this.errorMessage).toBeVisible();
  await expect(this.errorMessage).toContainText(message);
}
```

**DESPUÉS:**

```typescript
// Test directo
const errorVisible = await user.asks(Visibility.of(LoginElements.errorMessage(page)));
expect(errorVisible).toBe(true);

const errorText = await user.asks(Text.of(LoginElements.errorMessage(page)));
expect(errorText).toContain(message);
```

### Patrón 3: Selectores con Contexto

**ANTES:**

```typescript
// ProductPage.ts
readonly productCard = (name: string) => 
  this.page.locator(`.product-card:has-text("${name}")`);
```

**DESPUÉS:**

```typescript
// src/ui/ProductElements.ts
export const ProductElements = {
  productCard: (page: Page, name: string) => 
    page.locator(`.product-card:has-text("${name}")`),
  
  // O mejor aún, con función factory
  productCardByName: (name: string) => (page: Page) => 
    page.locator(`.product-card:has-text("${name}")`)
};

// Uso en Task
const page = actor.abilityTo(BrowseTheWeb).page;
await actor.attemptsTo(
  Click.on(ProductElements.productCardByName('Roses')(page))
);
```

### Patrón 4: Routines → Tasks Componibles

**ANTES:**

```typescript
// loginRoutine.ts
export async function performLogin(page: Page) {
  const loginPage = new LoginPage(page);
  const creds = getCredentials();
  
  await loginPage.navigate('/login');
  await loginPage.login(creds.email, creds.password);
  await loginPage.expectLoginSuccess();
}
```

**DESPUÉS:**

```typescript
// src/tasks/PerformCompleteLogin.ts
export class PerformCompleteLogin implements Task {
  static asUser(projectName: string = 'alpha'): PerformCompleteLogin {
    return new PerformCompleteLogin(projectName);
  }
  
  async performAs(actor: Actor): Promise<void> {
    const creds = getCredentials(this.projectName);
    
    await actor.attemptsTo(
      Navigate.to('/login'),
      Login.withCredentials(creds.email, creds.password),
      Wait.forElement(DashboardElements.mainContent).toBeVisible()
    );
  }
}
```

---

## 🐛 Troubleshooting

### Problema 1: "Cannot read properties of undefined (reading 'page')"

**Causa:** Actor no tiene la ability `BrowseTheWeb`.

**Solución:**

```typescript
// ❌ MAL
const actor = Actor.named('User');
await actor.attemptsTo(Navigate.to('/login'));  // Error!

// ✅ BIEN
const actor = Actor.named('User').whoCan(BrowseTheWeb.using(page));
await actor.attemptsTo(Navigate.to('/login'));
```

### Problema 2: "Locator is not a function"

**Causa:** UI Element espera una función pero se pasa directamente.

**Solución:**

```typescript
// ❌ MAL - Selector directo
const emailInput = page.getByLabel('Email');
await Fill.field(emailInput).with('test@test.com');

// ✅ BIEN - Función que retorna locator
const LoginElements = {
  emailInput: (page: Page) => page.getByLabel('Email')
};

const page = actor.abilityTo(BrowseTheWeb).page;
await Fill.field(LoginElements.emailInput(page)).with('test@test.com');
```

### Problema 3: Tests fallan después de migración

**Diagnóstico:**

1. Comparar screenshots POM vs Screenplay
2. Verificar que selectores sean idénticos
3. Revisar timing (esperas implícitas)

**Solución:**

```typescript
// Agregar waits explícitos si es necesario
await actor.attemptsTo(
  Click.on(submitButton),
  Wait.forElement(successMessage).toBeVisible({ timeout: 10000 })
);
```

### Problema 4: "performAs is not a function"

**Causa:** Task no implementa interface correctamente.

**Solución:**

```typescript
// ❌ MAL
export class MyTask {
  async perform(actor: Actor) { ... }  // Nombre incorrecto
}

// ✅ BIEN
export class MyTask implements Task {
  async performAs(actor: Actor): Promise<void> { ... }
}
```

---

## 📊 Checklist de Validación Post-Migración

Después de migrar un módulo, verificar:

- [ ] Tests pasan en los 3 ambientes (alpha, beta, prod)
- [ ] Screenshots se capturan correctamente
- [ ] Métricas de performance funcionan
- [ ] Logs son descriptivos (usar `toString()`)
- [ ] No hay selectores duplicados en múltiples archivos
- [ ] Code coverage no disminuyó
- [ ] Tiempo de ejecución es similar o mejor

---

## 🎓 Recursos Adicionales

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentación completa de Screenplay
- [STANDARDS.md](./STANDARDS.md) - Estándares de código
- [Serenity/JS Screenplay](https://serenity-js.org/handbook/design/screenplay-pattern.html)

---

## 📞 Soporte

Si tienes dudas durante la migración:

1. Revisa ejemplos en `tests/login.spec.ts` (migrado)
2. Consulta `docs/ARCHITECTURE.md`
3. Busca patrones similares en código existente
4. Documenta problemas en `docs/CHANGELOG.md`

---

**Última Actualización:** Marzo 5, 2026  
**Mantenedor:** QA Team
