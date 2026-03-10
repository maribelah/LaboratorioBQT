import { Page, Locator } from '@playwright/test';

/**
 * LoginElements - Selectores de elementos UI para la página de Login
 * 
 * Contiene solo selectores, SIN lógica o acciones.
 * Todos los métodos retornan funciones que aceptan un Page y retornan un Locator.
 * 
 * @example
 * ```typescript
 * const page = actor.abilityTo(BrowseTheWeb).page;
 * const emailField = LoginElements.usernameInput(page);
 * await emailField.fill('user@test.com');
 * ```
 */
export const LoginElements = {
  /**
   * Campo de entrada para Username/Email
   */
  usernameInput: (page: Page): Locator => 
    page.locator('input[name="username"], input#username, input[type="text"]').first(),
  
  /**
   * Campo de entrada para Password
   */
  passwordInput: (page: Page): Locator => 
    page.locator('input[name="password"], input#password, input[type="password"]').first(),
  
  /**
   * Botón Submit/Login
   */
  submitButton: (page: Page): Locator => 
    page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar"), input[type="submit"]').first(),
  
  /**
   * Contenedor de mensaje de error
   */
  errorMessage: (page: Page): Locator => 
    page.locator('.error, .alert-danger, [role="alert"]'),
  
  /**
   * Contenedor de mensaje de éxito
   */
  successMessage: (page: Page): Locator => 
    page.locator('.success, .alert-success'),
  
  /**
   * Campo de entrada MFA/OTP (para autenticación de múltiples factores)
   */
  mfaInput: (page: Page): Locator => 
    page.locator('input[name="otp"], input[name="mfa"], #otp, input[id*=mfa]').first(),
  
  /**
   * Botón de verificación MFA
   */
  mfaVerifyButton: (page: Page): Locator => 
    page.locator('button:has-text("Verify"), button:has-text("Submit")').first()
};
