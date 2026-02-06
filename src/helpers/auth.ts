import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Interface para credenciales de usuario
 */
export interface Credentials {
  email: string;
  password: string;
  baseUrl: string;
}

/**
 * Obtiene las credenciales del ambiente especificado desde variables de entorno
 * @param projectName - Nombre del proyecto/ambiente (alpha, beta, prod)
 * @returns Credenciales del ambiente
 * @throws Error si faltan variables de entorno
 */
export function getCredentials(projectName: string): Credentials {
  const env = projectName.toUpperCase();
  
  const email = process.env[`${env}_USER`];
  const password = process.env[`${env}_PASS`];
  const baseUrl = process.env[`${env}_URL`];
  
  if (!email || !password || !baseUrl) {
    throw new Error(
      `❌ Faltan credenciales para el ambiente: ${projectName}\n` +
      `Verifica que existan las variables: ${env}_USER, ${env}_PASS, ${env}_URL en el archivo .env`
    );
  }
  
  return { 
    email, 
    password, 
    baseUrl 
  };
}

/**
 * Valida que todas las variables de entorno necesarias estén configuradas
 * @param projectName - Nombre del proyecto a validar
 * @returns true si todo está configurado correctamente
 */
export function validateEnvironment(projectName: string): boolean {
  try {
    getCredentials(projectName);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
