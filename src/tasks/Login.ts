import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { Fill } from '../interactions/Fill';
import { Click } from '../interactions/Click';
import { Wait } from '../interactions/Wait';
import { LoginElements } from '../ui/LoginElements';

/**
 * Login - Tarea para realizar login de usuario
 * 
 * @example
 * ```typescript
 * await actor.attemptsTo(
 *   Navigate.to('/login'),
 *   Login.withCredentials('user@test.com', 'password123')
 * );
 * 
 * // Con MFA
 * await actor.attemptsTo(
 *   Navigate.to('/login'),
 *   Login.withCredentials('user@test.com', 'password123')
 *     .andMFA('123456')
 * );
 * ```
 */
export class Login implements Task {
  private mfaCode?: string;
  
  private constructor(
    private username: string,
    private password: string
  ) {}
  
  /**
   * Método de fábrica para crear una tarea Login
   * @param username - Nombre de usuario o email
   * @param password - Contraseña
   */
  static withCredentials(username: string, password: string): Login {
    return new Login(username, password);
  }
  
  /**
   * Agrega código MFA/OTP para autenticación de dos factores
   * @param code - Código de verificación MFA
   */
  andMFA(code: string): Login {
    this.mfaCode = code;
    return this;
  }
  
  async performAs(actor: Actor): Promise<void> {
    const page = actor.abilityTo<BrowseTheWeb>(BrowseTheWeb).page;
    
    // Fill username
    await actor.attemptsTo(
      Fill.field(LoginElements.usernameInput(page)).with(this.username)
    );
    
    // Fill password
    await actor.attemptsTo(
      Fill.field(LoginElements.passwordInput(page)).with(this.password)
    );
    
    // Click submit
    await actor.attemptsTo(
      Click.on(LoginElements.submitButton(page))
    );
    
    // Handle MFA if provided
    if (this.mfaCode) {
      await actor.attemptsTo(
        Wait.forElement(LoginElements.mfaInput(page)).toBeVisible(),
        Fill.field(LoginElements.mfaInput(page)).with(this.mfaCode),
        Click.on(LoginElements.mfaVerifyButton(page))
      );
    }
    
    // Esperar navegación (indicador de login exitoso)
    // Esto asume que un login exitoso redirige fuera de /login
    try {
      await page.waitForURL((url) => !url.pathname.includes('/login'), { 
        timeout: 10000 
      });
    } catch (error) {
      // Si hay timeout, el login podría haber fallado o la estructura de la página es diferente
      console.warn('⚠️ Login: Expected navigation away from /login page');
    }
  }
  
  toString(): string {
    return `Login with credentials (${this.username})${this.mfaCode ? ' and MFA' : ''}`;
  }
}
