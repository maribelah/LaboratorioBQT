import { Page, Request } from '@playwright/test';

/**
 * Interface para métricas de requests HTTP
 */
export interface RequestMetric {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: string;
}

/**
 * Opciones de configuración para el monitoreo de performance
 */
export interface MetricsOptions {
  slowThreshold?: number;      // Umbral para considerar un request lento (ms)
  logSlowRequests?: boolean;   // Log automático de requests lentos
  logErrorRequests?: boolean;  // Log automático de requests con error
}

/**
 * Configura el monitoreo automático de performance en la página
 * Captura métricas de todos los requests HTTP
 * 
 * @param page - Instancia de Page de Playwright
 * @param options - Opciones de configuración
 * @returns Objeto con métodos para acceder a las métricas
 */
export function setupPerformanceMonitoring(
  page: Page, 
  options: MetricsOptions = {}
) {
  const {
    slowThreshold = 2000,
    logSlowRequests = true,
    logErrorRequests = true
  } = options;

  const metrics: RequestMetric[] = [];
  
  page.on('requestfinished', async (request: Request) => {
    try {
      const response = await request.response();
      if (response) {
        const timing = request.timing();
        const metric: RequestMetric = {
          method: request.method(),
          url: request.url(),
          status: response.status(),
          duration: timing.responseEnd,
          timestamp: new Date().toISOString()
        };
        
        metrics.push(metric);
        
        // Log automático de requests problemáticos
        if (logSlowRequests && timing.responseEnd > slowThreshold) {
          console.warn(
            `⚠️ [SLOW REQUEST] ${metric.method} ${metric.url} - ${metric.duration.toFixed(0)}ms`
          );
        }
        
        if (logErrorRequests && response.status() >= 400) {
          console.error(
            `❌ [HTTP ERROR] ${metric.status} - ${metric.method} ${metric.url}`
          );
        }
      }
    } catch (error) {
      // Ignorar errores de requests cancelados o abortados
    }
  });
  
  return {
    /**
     * Obtiene todas las métricas capturadas
     */
    getMetrics: () => metrics,
    
    /**
     * Obtiene solo los requests que superaron el umbral de tiempo
     */
    getSlowRequests: (threshold = slowThreshold) => 
      metrics.filter(m => m.duration > threshold),
    
    /**
     * Obtiene solo los requests con error HTTP (status >= 400)
     */
    getErrorRequests: () => 
      metrics.filter(m => m.status >= 400),
    
    /**
     * Obtiene requests por método HTTP
     */
    getRequestsByMethod: (method: string) =>
      metrics.filter(m => m.method.toUpperCase() === method.toUpperCase()),
    
    /**
     * Calcula el tiempo promedio de respuesta
     */
    getAverageDuration: () => {
      if (metrics.length === 0) return 0;
      return metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length;
    },
    
    /**
     * Imprime un resumen de las métricas en consola
     */
    printSummary: () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 Performance Summary`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Total requests: ${metrics.length}`);
      
      if (metrics.length > 0) {
        const avgDuration = metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length;
        console.log(`Average duration: ${avgDuration.toFixed(0)}ms`);
        
        const maxDuration = Math.max(...metrics.map(m => m.duration));
        const slowest = metrics.find(m => m.duration === maxDuration);
        if (slowest) {
          console.log(`Slowest request: ${slowest.method} ${slowest.url} (${maxDuration.toFixed(0)}ms)`);
        }
        
        const slow = metrics.filter(m => m.duration > slowThreshold).length;
        if (slow > 0) {
          console.log(`⚠️ Slow requests (>${slowThreshold}ms): ${slow}`);
        }
        
        const errors = metrics.filter(m => m.status >= 400).length;
        if (errors > 0) {
          console.log(`❌ Failed requests (status >= 400): ${errors}`);
        }
        
        // Distribución por método
        const methodCounts = metrics.reduce((acc, m) => {
          acc[m.method] = (acc[m.method] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log(`\nRequests by method:`);
        Object.entries(methodCounts).forEach(([method, count]) => {
          console.log(`  ${method}: ${count}`);
        });
      }
      console.log(`${'='.repeat(60)}\n`);
    }
  };
}
