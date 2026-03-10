# NNN - [Nombre de Feature]

**Número de Tracking:** NNN  
**Tipo:** Test | Feature | Migration | Bugfix  
**Estado:** ⚪ Pendiente | 🟡 En Progreso | 🟢 Completado | 🔴 Bloqueado  
**Fecha Inicio:** YYYY-MM-DD  
**Fecha Fin:** YYYY-MM-DD (o N/A si en progreso)  
**Ambientes:** Alpha | Beta | Prod  
**Responsable:** [Nombre o "QA Team"]

---

## 🎯 Objetivo

**Descripción breve (2-3 líneas):**  
[¿Qué se está implementando? ¿Por qué es necesario?]

**Contexto:**  
[Background adicional si es necesario. ¿Qué problema resuelve? ¿Qué mejora?]

---

## ✅ Criterios de Aceptación

Lista medible de requisitos para considerar la implementación completa:

1. [ ] [Criterio 1 - Específico y medible]
2. [ ] [Criterio 2 - Específico y medible]
3. [ ] [Criterio 3 - Específico y medible]

---

## 📋 Plan de Implementación

### Fase 1: Documentación
- [ ] Consultar `docs/ARCHITECTURE.md` y `docs/STANDARDS.md`
- [ ] Crear este documento de tracking
- [ ] Actualizar `docs/EXECUTION_LOG.md` con nueva fila

### Fase 2: Datos de Prueba
- [ ] Crear/Actualizar JSON en `src/data/[nombre].data.json`
- [ ] Validar formato (sin URLs, sin credenciales)

### Fase 3: Componentes Screenplay
- [ ] Crear `src/ui/[Nombre]Elements.ts` (selectores)
- [ ] Crear `src/tasks/[Nombre]Task.ts` (lógica de negocio)
- [ ] Crear `src/questions/[Nombre]Question.ts` (si aplica)

### Fase 4: Tests
- [ ] Crear `tests/[nombre]-screenplay.spec.ts`
- [ ] Incluir `setupPerformanceMonitoring()`
- [ ] Agregar capturas de pantalla (`test.info().attach()`)
- [ ] Incluir `test.step()` para mejor reporte

### Fase 5: Validación
- [ ] Ejecutar localmente: `npx playwright test --project=alpha`
- [ ] Verificar métricas de performance
- [ ] Revisar reporte HTML (`npx playwright show-report`)
- [ ] Lint y type-check: `npm run lint && tsc --noEmit`

### Fase 6: Documentación Final
- [ ] Completar sección "Artefactos Generados"
- [ ] Completar sección "Problemas y Soluciones"
- [ ] Completar sección "Lecciones Aprendidas"
- [ ] Actualizar estado en `docs/EXECUTION_LOG.md`

---

## 📝 LOG de Implementación

### YYYY-MM-DD HH:MM - [Título de entrada]

[Descripción de lo que pasó. Decisiones tomadas, problemas encontrados, etc.]

```
[Código, comandos, o output relevante si aplica]
```

---

*(Agregar más entradas según avanza la implementación)*

---

## 🗂️ Artefactos Generados

| Archivo | Tipo | Estado | Descripción |
|---------|------|--------|-------------|
| `src/data/[nombre].data.json` | Data | ⚪ | Datos de prueba |
| `src/ui/[Nombre]Elements.ts` | UI | ⚪ | Selectores UI |
| `src/tasks/[Nombre]Task.ts` | Task | ⚪ | Lógica de negocio |
| `src/questions/[Nombre]Question.ts` | Question | ⚪ | Consultas de estado |
| `tests/[nombre]-screenplay.spec.ts` | Test | ⚪ | Test funcional |

**Estados:** ⚪ Pendiente | 🟡 En Progreso | ✅ Completado | ❌ Fallido | ⏸️ Pausado

---

## 🐛 Problemas y Soluciones

| # | Problema | Causa Raíz | Solución Aplicada | Estado |
|---|----------|------------|-------------------|--------|
| 1 | [Descripción del problema] | [Qué lo causó] | [Cómo se resolvió] | ✅ / ⚪ |

---

## 📊 Métricas de Performance

### Ejecución Final

**Comando:**
```bash
npx playwright test [nombre].spec.ts --project=[ambiente]
```

**Resultados:**
- **Tiempo Total:** XXs
- **Desglose:**
  - Login: XXs
  - Navegación: XXs
  - [Paso específico]: XXs
- **Requests:** XXX total, XXXms promedio
- **Requests Lentos (>2s):** X
- **Requests Fallidos:** X

**Screenshots Generados:** X

---

## 🎓 Lecciones Aprendidas

### 1. [Título de lección]

**Contexto:** [¿Qué situación reveló esto?]  
**Aprendizaje:** [¿Qué se descubrió?]  
**Aplicación:** [¿Cómo aplicarlo en el futuro?]

### 2. [Título de lección]

...

---

## 🔗 Referencias

- **Documentación Framework:**
  - [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
  - [docs/STANDARDS.md](../docs/STANDARDS.md)
  - [docs/EXECUTION_LOG.md](../docs/EXECUTION_LOG.md)

- **PRs/Commits Relacionados:**
  - [Link si aplica]

- **Tickets/Issues:**
  - [Link si aplica]

---

## 📌 Notas Adicionales

[Cualquier información adicional relevante que no encaje en otras secciones]

---

**Última Actualización:** YYYY-MM-DD HH:MM  
**Documento Creado:** YYYY-MM-DD
