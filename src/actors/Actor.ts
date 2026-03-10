import { Task } from '../types/Task';
import { Question } from '../types/Question';
import { Ability } from '../types/Ability';

/**
 * Actor - El personaje central en el Screenplay Pattern
 * 
 * Un Actor representa a alguien o algo que interactúa con la aplicación.
 * Los Actors tienen:
 * - Un nombre (para logging/reportes)
 * - Habilidades (qué pueden hacer)
 * - Pueden intentar tareas (acciones de alto nivel)
 * - Pueden hacer preguntas (consultar estado)
 * 
 * @example
 * ```typescript
 * const user = Actor.named('Test User')
 *   .whoCan(BrowseTheWeb.using(page))
 *   .whoCan(CallAnApi.withBaseUrl('https://api.example.com'));
 * 
 * await user.attemptsTo(
 *   Navigate.to('/login'),
 *   Login.withCredentials('user@test.com', 'pass123')
 * );
 * 
 * const isVisible = await user.asks(Dashboard.isVisible());
 * expect(isVisible).toBe(true);
 * ```
 */
export class Actor {
  private abilities = new Map<Function, Ability>();
  
  /**
   * Constructor privado - usa Actor.named() para crear instancias
   * @param name - El nombre del actor
   */
  private constructor(private name: string) {}
  
  /**
   * Método de fábrica para crear un nuevo Actor
   * @param name - El nombre del actor (para logging)
   * @returns Una nueva instancia de Actor
   */
  static named(name: string): Actor {
    return new Actor(name);
  }
  
  /**
   * Otorga al actor una nueva habilidad
   * @param ability - La habilidad a otorgar
   * @returns El actor (para encadenamiento de métodos)
   */
  whoCan<T extends Ability>(ability: T): Actor {
    this.abilities.set(ability.constructor, ability);
    return this;
  }
  
  /**
   * Recupera una habilidad específica
   * @param abilityType - El tipo de habilidad a recuperar
   * @returns La instancia de la habilidad
   * @throws Error si el actor no tiene la habilidad
   */
  abilityTo<T extends Ability>(abilityType: Function): T {
    const ability = this.abilities.get(abilityType);
    
    if (!ability) {
      throw new Error(
        `Actor "${this.name}" no tiene la habilidad "${abilityType.name}". ` +
        `¿Olvidaste llamar .whoCan(${abilityType.name}.using(...))?`
      );
    }
    
    return ability as T;
  }
  
  /**
   * Ejecuta una o más tareas
   * @param tasks - Tareas a realizar
   */
  async attemptsTo(...tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      console.log(`🎭 Actor "${this.name}" attempts to: ${task.toString()}`);
      await task.performAs(this);
    }
  }
  
  /**
   * Hace una pregunta sobre el estado de la aplicación
   * @param question - La pregunta a hacer
   * @returns La respuesta a la pregunta
   */
  async asks<T>(question: Question<T>): Promise<T> {
    console.log(`❓ Actor "${this.name}" asks: ${question.toString()}`);
    return await question.answeredBy(this);
  }
  
  /**
   * Alias para asks() - para legibilidad en lenguaje natural
   */
  async sees<T>(question: Question<T>): Promise<T> {
    return this.asks(question);
  }
  
  /**
   * Obtiene el nombre del actor
   */
  getName(): string {
    return this.name;
  }
}
