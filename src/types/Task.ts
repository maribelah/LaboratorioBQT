import { Actor } from '../actors/Actor';

/**
 * Interfaz para Tareas en Screenplay Pattern
 * 
 * Una Tarea representa una acción de negocio de alto nivel que un actor realiza.
 * Ejemplos: Login, CreateOrder, SearchProduct, etc.
 * 
 * @example
 * ```typescript
 * export class Login implements Task {
 *   static withCredentials(email: string, password: string): Login {
 *     return new Login(email, password);
 *   }
 *   
 *   async performAs(actor: Actor): Promise<void> {
 *     // Implementación
 *   }
 *   
 *   toString(): string {
 *     return `Login with credentials (${this.email})`;
 *   }
 * }
 * ```
 */
export interface Task {
  /**
   * Ejecuta la tarea como el actor dado
   * @param actor - El actor que realiza la tarea
   */
  performAs(actor: Actor): Promise<void>;
  
  /**
   * Retorna una descripción legible de la tarea
   * Usado para logging y reportes
   */
  toString(): string;
}
