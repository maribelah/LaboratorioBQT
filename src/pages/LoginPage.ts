import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la página de Login
 * Representa todos los elementos y acciones disponibles en la pantalla de login
 */
export class LoginPage extends BasePage {
  // Locators - Definidos como propiedades readonly
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  
  /**
   * Constructor
   * @param page - Instancia de Page de Playwright
   */
  constructor(page: Page) {
    super(page);
    
    // Inicializar locators usando selectores semánticos
    // Nota: Ajustar selectores según la estructura real del HTML de tu aplicación
    this.usernameInput = page.locator('input[name="username"], input#username, input[type="text"]').first();
    this.passwordInput = page.locator('input[name="password"], input#password, input[type="password"]').first();
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar"), input[type="submit"]').first();
    this.errorMessage = page.locator('.error, .alert-danger, [role="alert"]');
    this.successMessage = page.locator('.success, .alert-success');
  }
  
  /**
   * Realiza el proceso completo de login
   * @param username - Nombre de usuario
   * @param password - Contraseña
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
  
  /**
   * Verifica que el usuario está en la página de login
   */
  async expectToBeOnLoginPage() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
  
  /**
   * Verifica que se muestra un mensaje de error
   * @param message - Mensaje de error esperado (opcional)
   */
  async expectLoginError(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }
  
  /**
   * Verifica que el login fue exitoso (ya no está en la página de login)
   */
  async expectLoginSuccess() {
    // Verificar que ya no estamos en la página de login
    // Ajustar según el comportamiento real de tu aplicación
    await this.page.waitForURL(/dashboard|home|main|inicio/i, { timeout: 10000 });
  }
  
  /**
   * Limpia el formulario de login
   */
  async clearForm() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }
  
  /**
   * Verifica si el botón de login está habilitado
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }
}
