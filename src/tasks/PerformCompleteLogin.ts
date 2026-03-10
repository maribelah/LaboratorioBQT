import { Actor } from '../actors/Actor';
import { Task } from '../types/Task';
import { Navigate } from '../interactions/Navigate';
import { Login } from './Login';
import { getCredentials } from '../helpers/auth';

/**
 * PerformCompleteLogin - Tarea para realizar login completo con navegación
 * 
 * Esta es una tarea compuesta que:
 * 1. Navega a la URL base
 * 2. Realiza login con credenciales del ambiente
 * 3. Espera a que se cargue el dashboard
 * 
 * @example
 * ```typescript
 * await actor.attemptsTo(
 *   PerformCompleteLogin.asUser('beta')
 * );
 * ```
 */
export class PerformCompleteLogin implements Task {
  private constructor(private projectName: string) {}
  
  /**
   * Método de fábrica para crear la tarea de login
   * @param projectName - Nombre del proyecto (alpha, beta, prod)
   */
  static asUser(projectName: string = 'alpha'): PerformCompleteLogin {
    return new PerformCompleteLogin(projectName);
  }
  
  async performAs(actor: Actor): Promise<void> {
    const creds = getCredentials(this.projectName);
    
    await actor.attemptsTo(
      Navigate.to(creds.baseUrl),
      Login.withCredentials(creds.email, creds.password)
    );
  }
  
  toString(): string {
    return `Perform complete login for ${this.projectName} environment`;
  }
}
