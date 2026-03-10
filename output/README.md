# 📂 Output - Sistema de Tracking de Implementaciones

Este directorio contiene **documentos de tracking numerados** para cada feature o módulo implementado usando el framework de Screenplay Pattern.

## 🎯 Objetivo

Mantener un registro detallado y secuencial de:
- ✅ Qué se implementó
- 📋 Cómo se implementó (checklist de progreso)
- 🐛 Qué problemas se encontraron y cómo se resolvieron
- 📊 Métricas de performance
- 🎓 Lecciones aprendidas

## 📝 Sistema de Numeración

Cada implementación recibe un **número secuencial de 3 dígitos**: `001`, `002`, `003`, etc.

### Nombre de Archivo

```
NNN-nombre-feature.md
```

**Ejemplos:**
- `001-order-entry-migration.md` - Migración de Order Entry a Screenplay
- `002-dashboard-tests.md` - Tests del Dashboard
- `003-product-search-automation.md` - Automatización de búsqueda de productos

### ¿Por qué numeración secuencial?

1. **Orden cronológico claro**: Fácil ver en qué orden se hicieron las cosas
2. **Referencias únicas**: No hay ambigüedad al mencionar "implementación 001"
3. **Trazabilidad**: El índice maestro (`docs/EXECUTION_LOG.md`) mantiene la tabla completa
4. **Facilita búsqueda**: `git log`, `grep`, búsquedas de texto encuentran referencias fácilmente

## 📄 Estructura de un Documento de Tracking

Cada documento sigue el template de `TEMPLATE.md` e incluye:

### 1. Header con Metadatos
```markdown
# NNN - Nombre de Feature

**Número de Tracking:** NNN  
**Tipo:** Test | Feature | Migration | Bugfix  
**Estado:** ⚪ Pendiente | 🟡 En Progreso | 🟢 Completado | 🔴 Bloqueado  
**Fecha Inicio:** YYYY-MM-DD  
**Fecha Fin:** YYYY-MM-DD  
**Ambientes:** Alpha | Beta | Prod  
```

### 2. Descripción y Objetivo

Qué se está implementando y por qué.

### 3. Criterios de Aceptación

Lista medible de requisitos para considerar la implementación completa.

### 4. Plan de Implementación

Checklist con tareas organizadas por fases:
- [ ] Fase 1: Documentación
- [ ] Fase 2: Datos de Prueba
- [ ] Fase 3: Componentes Screenplay
- [ ] Fase 4: Tests
- [ ] Fase 5: Validación

### 5. LOG Cronológico

Registro con timestamps de decisiones y cambios importantes:

```markdown
## 📝 LOG de Implementación

### 2026-03-05 10:30 - Inicio
Creado documento de tracking...

### 2026-03-05 11:15 - Problema detectado
Grid Items FOB Price guardando valores como 0...
```

### 6. Artefactos Generados

Tabla con todos los archivos creados/modificados:

| Archivo | Tipo | Estado | Descripción |
|---------|------|--------|-------------|
| `src/ui/...` | UI | ✅ | Selectores... |

### 7. Problemas y Soluciones

Tabla de issues encontrados:

| # | Problema | Causa Raíz | Solución | Estado |
|---|----------|------------|----------|--------|
| 1 | Precio en 0 | Formato decimal | Usar punto | ✅ |

### 8. Métricas de Performance

Tiempos de ejecución, requests, etc.

### 9. Lecciones Aprendidas

Conocimiento clave para futuras implementaciones.

## 🗂️ Índice Maestro

El archivo **`docs/EXECUTION_LOG.md`** mantiene una tabla de todas las implementaciones:

| # | Feature | Estado | Inicio | Fin | Documento |
|---|---------|--------|--------|-----|-----------|
| 001 | Order Entry Migration | 🟢 | 2026-03-05 | 2026-03-05 | [001-order-entry-migration.md](../output/001-order-entry-migration.md) |

## 📦 Carpeta Archive

`output/archive/` - Documentos históricos:
- Análisis one-time
- Documentación obsoleta
- Investigaciones puntuales

**No reciben número secuencial** porque no son implementaciones formales del framework.

## 🔄 Flujo de Trabajo

### Al Iniciar Nueva Implementación

1. **Consultar** `docs/EXECUTION_LOG.md` para ver siguiente número
2. **Copiar** `output/TEMPLATE.md` → `output/NNN-nombre.md`
3. **Llenar** metadatos (número, tipo, estado ⚪)
4. **Agregar fila** en `docs/EXECUTION_LOG.md`
5. **Actualizar** el documento continuamente durante implementación

### Durante Implementación

- ✅ Marcar checkboxes según avanzas
- 📝 Agregar entradas en LOG con timestamps
- 🐛 Documentar problemas en tabla

### Al Finalizar

- 🟢 Cambiar estado a "Completado"
- 📊 Completar métricas finales
- 🎓 Escribir lecciones aprendidas
- ✅ Actualizar tabla en `docs/EXECUTION_LOG.md`

## 🚀 Ejemplo Completo

Ver `001-order-entry-migration.md` como referencia.

---

**Última Actualización:** 2026-03-05  
**Versión:** 1.0
