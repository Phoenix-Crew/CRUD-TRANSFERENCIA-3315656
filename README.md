# CRUD Transferencia - Gestión de Tareas por Usuario

**Milestone:** Modularización del Frontend
**Estado:** Completado

---

## Tabla de Issues

| Issue | Descripción | Prioridad | Assignee |
|---|---|---|---|
| #1 | Crear módulo api/tareasApi.js con llamadas CRUD al backend | Alta | Nestor Stiven Gomez |
| #2 | Crear módulo utils/helpers.js con utilidades genericas | Media | Nestor Stiven Gomez |
| #3 | Crear módulo ui/dom.js con referencias a elementos HTML | Alta | Joser Andres Fuentes |
| #4 | Crear módulo ui/notifications.js con toast y mensajes de usuario | Alta | Joser Andres Fuentes |
| #5 | Crear módulo ui/taskRenderer.js para tabla y edicion inline | Alta | Joser Andres Fuentes |
| #6 | Crear módulo services/tareasService.js con logica de negocio | Alta | Brian Bayona |
| #7 | Refactorizar app.js como punto de entrada orquestador | Alta | Brian Bayona |

---

## Division de Asignaciones (3 Personas)

### Brian Bayona — Lider / Arquitecto
Rama: feat/brian

| Issue | Archivo | Responsabilidad |
|---|---|---|
| #6 | client/js/services/tareasService.js | Orquestar llamadas API + estado global + flujo de negocio |
| #7 | client/js/app.js | Conectar eventos, importar modulos, iniciar la app |

### Nestor Stiven Gomez — Desarrollador
Rama: feat/nestor

| Issue | Archivo | Responsabilidad |
|---|---|---|
| #1 | client/js/api/tareasApi.js | Fetch CRUD (GET, POST, PATCH, DELETE) contra json-server |
| #2 | client/js/utils/helpers.js | Timestamp, validacion de inputs, colores de estado |

### Joser Andres Fuentes — Desarrollador
Rama: feat/joser

| Issue | Archivo | Responsabilidad |
|---|---|---|
| #3 | client/js/ui/dom.js | Referencias getElementById a todos los elementos del HTML |
| #4 | client/js/ui/notifications.js | Toast, mostrar/ocultar info de usuario, errores de validacion |
| #5 | client/js/ui/taskRenderer.js | Renderizar tabla, alternar modo edicion, contar tareas |

---

## Estructura Final del Proyecto

```
/
├── client/
│   ├── index.html
│   ├── styles.css
│   └── js/
│       ├── app.js
│       ├── api/
│       │   └── tareasApi.js
│       ├── services/
│       │   └── tareasService.js
│       ├── ui/
│       │   ├── dom.js
│       │   ├── notifications.js
│       │   └── taskRenderer.js
│       └── utils/
│           └── helpers.js
├── server/
│   ├── db.json
│   ├── package.json
│   └── package-lock.json
└── docs/
    └── 04-guia-modularizacion.md
```

---

## Reglas para PRs

1. Cada desarrollador trabaja en su rama feat/
2. Al terminar, abre un PR contra develop
3. El Lider revisa y aprueba el codigo
4. El PR debe incluir Closes #ID en la descripcion
5. Solo mergea el Lider despues de aprobacion

---

**Equipo:** Brian Bayona, Nestor Stiven Gomez, Joser Andres Fuentes
**Institucion:** SENA - ADSO
