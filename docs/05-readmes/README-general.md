# Gestión de Tareas — Proyecto Formativo SENA

**Producto:** Aplicación web CRUD para gestión de tareas con panel de administración  
**Programa:** Técnico en Programación de Software (Código: 3315656)  
**Proyecto:** Construcción de software integrador de tecnologías orientadas a servicios  
**Fase:** Ejecución  
**Competencia:** Desarrollar la solución de software según diseño y metodologías de desarrollo  
**Versión:** v4.0 — Asignación multi-usuario y administración completa

---

## 1. Descripción del producto

Aplicación web que permite gestionar tareas de forma dinámica mediante una interfaz moderna con temática **Silver Emerald**, conectada a una **API REST propia con Express**. Los usuarios pueden buscar compañeros por documento, asignarles tareas a **uno o varios usuarios** usando checkboxes intuitivos, editarlas mediante un modal interactivo, filtrarlas, ordenarlas y exportar los datos. Además, incluye un **Panel de Administración** global con estadísticas en tiempo real, filtros combinados y distribución de tareas por usuario, más un **módulo completo de administración de usuarios** con CRUD y activación/desactivación — todo sin recargar la página.

---

## 2. Manual de uso — ¿Cómo funciona la página?

### 2.1 Pantalla principal (Gestión de tareas por usuario)

```
┌─────────────────────────────────────────────────────┐
│  Header: Título + badges institucionales            │
├──────────────┬──────────────────────────────────────┤
│  Columna izq. │  Columna der.                       │
│              │                                      │
│  Buscar ID   │  Tareas del usuario                  │
│  [input]     │  [Filtrar▼] [Ordenar▼]              │
│  [Buscar]    │                                      │
│              │  ┌───┬──────────┬──────┬──────┬───┐ │
│  Registrar   │  │ # │ Título   │Estada│Fecha │ 🛠│ │
│  Tarea       │  ├───┼──────────┼──────┼──────┼───┤ │
│  [formulario]│  │   │ ...      │ 🟡   │ ...  │ 📝🗑│ │
│              │  └───┴──────────┴──────┴──────┴───┘ │
├──────────────┴──────────────────────────────────────┤
│  Panel de Administración (abajo)                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ Total │ │ Compl│ │Progr.│ │Pend. │               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│  [Estado▼] [Usuario▼] [Fecha▼] [Fecha▼] [Filtrar]  │
│  ┌─── Tabla global de tareas ───┐ ┌─── x Usuario ┐ │
│  │ Título | Estado | Usuario... │ │ Usuario | #  │ │
│  └──────────────────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

#### Paso a paso:

1. **Buscar usuario** — Escribe el número de documento y presiona "Buscar" o Enter.
2. **Registrar tarea** — Una vez encontrado el usuario, aparecerá un formulario para crear tareas con título, descripción y estado. Además, se mostrará una lista de **checkboxes** con todos los usuarios del sistema: el usuario buscado aparece **pre-seleccionado** y puedes marcar/desmarcar a otros para asignar la tarea a varios compañeros.
3. **Editar tarea** — Haz clic en "Editar" sobre cualquier tarea. Se abrirá un **modal** donde puedes cambiar título, descripción y estado.
4. **Eliminar tarea** — Haz clic en "Eliminar". Aparecerá un modal de confirmación.
5. **Filtrar y ordenar** — Usa el selector de estado y los botones de ordenamiento para organizar la tabla.
6. **Exportar JSON** — Descarga las tareas visibles en formato estructurado con metadatos.

### 2.2 Panel de Administración

Ubicado al final de la página, muestra:

- **4 tarjetas de estadísticas**: Total de tareas, Completadas (verde), En progreso (azul), Pendientes (ámbar).
- **Filtros combinados**: Filtra por estado, usuario y rango de fechas simultáneamente.
- **Tabla global**: Todas las tareas del sistema con su usuario asignado.
- **Distribución por usuario**: Tabla resumen de cuántas tareas tiene cada persona.

---

## 3. Funcionalidades

| Funcionalidad | Descripción |
|---------------|-------------|
| **Buscar usuario** | Ingresa un número de documento y obtén su información y tareas |
| **Registrar tarea** | Crea tareas con título, descripción y estado |
| **Asignación multi-usuario** | Asigna una tarea a varios usuarios usando checkboxes intuitivos |
| **Editar tarea (modal)** | Edición mediante ventana modal con validación visual |
| **Eliminar tarea** | Eliminación con confirmación mediante modal interactivo |
| **Filtrar por estado** | Filtra por Pendiente, En progreso o Completada |
| **Ordenar tabla** | Ordena por título, estado o fecha, ascendente o descendente |
| **Exportar a JSON** | Descarga las tareas visibles con metadatos del filtro aplicado |
| **Notificaciones toast** | Feedback visual animado de éxito, error o información |
| **Panel de Administración** | Estadísticas globales, filtros combinados, tabla global, distribución por usuario |
| **Filtros combinados** | Filtra tareas por estado + usuario + rango de fechas simultáneamente |
| **Admin de usuarios** | CRUD completo de usuarios: crear, editar, eliminar, activar/desactivar |

---

## 4. Arquitectura del software

### 4.1 Estructura del proyecto

```
📁 CRUD-TRANSFERENCIA-3315656/
├── 📁 client/                          → Frontend (Vite)
│   ├── 📄 index.html                   → Página principal con todo el HTML
│   ├── 📄 package.json                 → dayjs + vite
│   ├── 📄 vite.config.js               → Proxy, build, server
│   ├── 📄 .env / .env.production       → Variables de entorno
│   └── 📁 src/
│       ├── 📁 styles/
│       │   └── 📄 styles.css           → Tema Silver Emerald (~1400 líneas)
│       └── 📁 js/
│           ├── 📄 app.js               → Orquestador de eventos
│           ├── 📁 core/
│           │   └── 📄 NotificationManager.js  → Patrón observador
│           ├── 📁 api/
│           │   ├── 📄 tareasApi.js     → Capa HTTP tareas (fetch)
│           │   └── 📄 usersApi.js      → Capa HTTP usuarios (fetch)
│           ├── 📁 services/
│           │   ├── 📄 tareasService.js → Lógica de negocio + estado tareas
│           │   └── 📄 usersService.js  → Lógica de negocio + estado usuarios
│           ├── 📁 ui/
│           │   ├── 📄 dom.js           → Referencias a elementos HTML
│           │   ├── 📄 notifications.js → Toasts y feedback visual
│           │   ├── 📄 taskRenderer.js  → Renderizado de la tabla de tareas
│           │   ├── 📄 userRenderer.js  → Renderizado de tabla de usuarios y formulario modal
│           │   ├── 📄 confirmDialog.js → Modal de confirmación reutilizable
│           │   └── 📄 editModal.js     → Modal de edición con formulario
│           └── 📁 utils/
│               └── 📄 helpers.js       → Fechas, filtros, ordenamiento, colores
│
├── 📁 server/                          → Backend (Express)
│   ├── 📄 package.json                 → express, cors, uuid
│   ├── 📄 db.json                      → Base de datos JSON (5 usuarios + tareas)
│   └── 📁 src/
│       ├── 📄 index.js                 → Servidor Express, CORS, rutas
│       ├── 📁 models/
│       │   └── 📄 index.js             → readDB / writeDB
│       ├── 📁 controllers/
│       │   ├── 📄 task.controller.js   → CRUD tareas + filtro + dashboard
│       │   ├── 📄 user.controller.js   → CRUD usuarios + tareas por usuario
│       │   └── 📄 auth.controller.js   → Login
│       └── 📁 routes/
│           ├── 📄 task.routes.js       → 10 endpoints REST
│           ├── 📄 user.routes.js       → 7 endpoints REST
│           └── 📄 auth.routes.js       → Login endpoint
│
├── 📁 docs/                            → Documentación del proceso
│   ├── 📁 01-guia-sistema/             → Issues, milestones, Kanban, ramas
│   ├── 📁 02-guia-metodologia/         → GitFlow, commits, PRs
│   ├── 📁 03-formatos-maestros/        → Templates de issues y PRs
│   ├── 📄 04-guia-modularizacion.md    → Cómo y por qué se modularizó
│   ├── 📄 plan-tecnico.md              → Planeación técnica
│   ├── 📄 reporte-tecnico.md           → Reporte post-implementación
│   └── 📄 README-pasos-server.md       → Guía del servidor
│
├── 📁 .github/                         → Templates GitHub
│   ├── 📄 pull_request_template.md
│   └── 📁 ISSUE_TEMPLATE/
│       ├── 📄 bug_report.md
│       └── 📄 feature_request.md
│
├── 📄 TEAM_AGREEMENT.md                → Acuerdo de trabajo del equipo
├── 📄 estilo.md                        → Guía de estilo Silver Emerald
├── 📄 Parte1.md                        → Análisis del código heredado
└── 📄 README.md                        → Este archivo
```

### 4.2 Módulos del frontend

| Módulo | Responsabilidad |
|--------|----------------|
| **app.js** | Orquestador: conecta eventos del DOM con la lógica de negocio |
| **NotificationManager** | Gestor de eventos con patrón observador (pub/sub) |
| **tareasApi** | Comunicación HTTP con el backend para tareas (fetch) |
| **usersApi** | Comunicación HTTP con el backend para usuarios (fetch) |
| **tareasService** | Estado global y lógica de negocio de tareas: coordina API + UI |
| **usersService** | Lógica de negocio de usuarios: CRUD, modal de formulario |
| **dom** | Referencias centralizadas a elementos del HTML |
| **notifications** | Mensajes al usuario: toasts, errores, datos de usuario |
| **taskRenderer** | Manipulación del DOM: tabla de tareas, contadores, ordenamiento |
| **userRenderer** | Renderizado de tabla de usuarios y formulario modal |
| **confirmDialog** | Modal de confirmación reutilizable con Promise |
| **editModal** | Modal de edición de tareas con formulario y validación visual |
| **helpers** | Funciones puras: fechas, filtros, ordenamiento, colores |

### 4.3 Flujo de datos

```
Usuario (clic/teclado)
  → app.js (event listener)
    → tareasService.js (lógica de negocio + estado tareas)
    → usersService.js (lógica de negocio + estado usuarios)
      ├── api/tareasApi.js (fetch HTTP tareas → backend)
      ├── api/usersApi.js (fetch HTTP usuarios → backend)
      ├── utils/helpers.js (filtros, ordenamiento, fechas)
      ├── ui/notifications.js (toasts, feedback)
      ├── ui/taskRenderer.js (pintar tabla tareas, contadores)
      ├── ui/userRenderer.js (pintar tabla usuarios, formulario modal)
      ├── ui/confirmDialog.js (confirmación eliminar)
      └── ui/editModal.js (edición con modal)
```

**Regla fundamental:** La UI nunca llama directamente a la API. La API nunca manipula el DOM. Cada capa tiene una responsabilidad única.

### 4.4 API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **Usuarios** | | |
| POST | `/api/users` | Crear un nuevo usuario |
| GET | `/api/users` | Lista todos los usuarios |
| GET | `/api/users/{id}` | Busca usuario por ID |
| PUT | `/api/users/{id}` | Actualizar un usuario |
| DELETE | `/api/users/{id}` | Eliminar un usuario |
| PATCH | `/api/users/{id}/status` | Activar/desactivar un usuario |
| GET | `/api/users/{userId}/tasks` | Tareas de un usuario específico |
| **Tareas** | | |
| POST | `/api/tasks` | Crea una nueva tarea (con assignedUsers) |
| GET | `/api/tasks` | Lista todas las tareas |
| GET | `/api/tasks/filter?status=&userId=&dateFrom=&dateTo=` | Filtro combinado de tareas |
| GET | `/api/tasks/{id}` | Obtiene una tarea por ID |
| PUT | `/api/tasks/{id}` | Actualizar una tarea |
| PATCH | `/api/tasks/{id}` | Actualiza una tarea |
| PATCH | `/api/tasks/{id}/status` | Actualizar estado de una tarea |
| DELETE | `/api/tasks/{id}` | Elimina una tarea |
| POST | `/api/tasks/{taskId}/assign` | Asignar usuario(s) a una tarea |
| GET | `/api/tasks/{taskId}/users` | Usuarios asignados a una tarea |
| DELETE | `/api/tasks/{taskId}/users/{userId}` | Eliminar asignación de usuario |
| **Dashboard** | | |
| GET | `/api/dashboard` | Estadísticas globales (total, por estado, por usuario) |

---

## 5. Diseño visual: Silver Emerald

### 5.1 Concepto

Combinación de **verde esmeralda institucional SENA** con **plateado (silver)** para evocar identidad, modernidad y profesionalismo. Animaciones sutiles que dan sensación de fluidez sin distraer.

### 5.2 Paleta

| Color | Código | Uso |
|-------|--------|-----|
| Verde esmeralda | `#10b981` | Botones principales, acentos |
| Verde oscuro | `#022c22` | Fondos de inputs, paneles |
| Plateado | `#cbd5e1` | Bordes, badges, textos secundarios |
| Ámbar | `#f59e0b` | Badge "Pendiente" |
| Azul | `#3b82f6` | Badge "En progreso" |
| Fondo página | `#030a06` | Fondo general |
| Texto principal | `#f1f5f9` | Texto sobre fondos oscuros |

### 5.3 Componentes visuales

- **Header**: Barrido de luz animado, badge corporativo, brillo plateado en el título
- **Cards**: Efecto glassmorphism con borde degradado, hover con elevación
- **Tabla**: Línea plateada vertical animada, filas con hover sutil
- **Toasts**: Notificaciones con animación de rebote, auto-cierre
- **Modales**: Animación de entrada y salida, overlay con blur
- **Partículas**: Puntos flotantes de fondo (emerald y silver)
- **Estadísticas**: Tarjetas con borde izquierdo de color distintivo por estado

---

## 6. Requisitos técnicos e instalación

### Requisitos

- Node.js ≥ 18
- npm ≥ 9

### Instalación y ejecución

```bash
# 1. Servidor (API REST con Express) — https://github.com/Phoenix-Crew/Backend.git
cd ../backend
npm install
npm start                # http://localhost:3002

# 2. Cliente (desarrollo con Vite) — este repo
cd client
npm install
npm run dev              # http://localhost:5173

# 3. Build producción
cd client
npm run build
npm run preview
```

<!-- ============================================================
[F2 - Brian] Actualizar según configuración final con BD
- Cambiar ruta del backend si es necesario
- Actualizar variables de entorno
- Agregar documentación de migración de datos
============================================================ -->

### Variables de entorno

| Variable | Desarrollo | Producción |
|----------|-----------|------------|
| `VITE_API_URL` | `/api` (proxy Vite → localhost:3002) | `http://localhost:3002` |

---

## 7. Datos de prueba

| ID | Nombre | Rol |
|:--:|--------|-----|
| 1 | Brian Bayona | Aprendiz |
| 2 | Nestor Gomez | Aprendiz |
| 3 | Joser Fuentes | Aprendiz |
| 4 | Ana María López | Instrutora |
| 5 | Carlos Andrés Pérez | Aprendiz |

---

## 8. Tecnologías

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| JavaScript (ES Modules) | — | Lógica de la aplicación (frontend y backend) |
| HTML5 + CSS3 | — | Estructura y diseño Silver Emerald |
| Fetch API | — | Comunicación HTTP con el backend |
| Express | ^4.21 | Servidor API REST propio |
| Vite | ^8.0 | Empaquetado y dev server con HMR |
| dayjs | ^1.11 | Formateo de fechas en español |
| uuid | ^10.0 | Generación de IDs únicos para tareas |
| Git + GitHub | — | Control de versiones, issues, milestones, PRs |

---

## 9. Procedimiento de desarrollo

### 9.1 Línea de tiempo (etapas)

| Etapa | Versión | Logro |
|-------|---------|-------|
| **1. Base monolítica** | v1.0 | HTML + CSS + JS en un solo archivo (`script.js` de 385 líneas) con json-server |
| **2. Modularización** | v1.1 | Código separado en 7 módulos con responsabilidad única (api, services, ui, utils, core) |
| **3. CRUD completo** | v1.2 | Crear, leer, editar, eliminar tareas sin recargar la página |
| **4. Features** | v1.3 | Filtros por estado (RF01), ordenamiento dinámico (RF02), notificaciones toast (RF03), exportación JSON (RF04) |
| **5. Rediseño visual** | v2.0 | Tema Silver Emerald con 15 animaciones CSS, glassmorphism, partículas |
| **6. Empaquetado Vite** | v2.1 | Migración a Vite, variables de entorno, dayjs, estructura profesional |
| **7. Backend propio** | v3.0 | Migración de json-server a Express con controladores, rutas y modelos propios |
| **8. Panel Admin** | v3.0 | Estadísticas globales, filtros combinados, tabla global, distribución por usuario |
| **9. Edición modal** | v3.0 | Reemplazo de edición inline por modal interactivo con validación |
| **10. Admin usuarios** | v3.0 | Módulo completo de administración de usuarios: CRUD + activación/desactivación |
| **11. Multi-usuario** | v4.0 | Asignación de tareas a múltiples usuarios mediante checkboxes intuitivos |

### 9.2 Análisis inicial (Parte 1)

El proyecto comenzó con un solo archivo (`script.js`) de **385 líneas** que mezclaba 9 responsabilidades: referencias DOM, comunicación API, estado global, búsqueda, validaciones, CRUD, renderizado, notificaciones y contadores. El análisis documentado en `Parte1.md` identificó cada función y determinó a qué módulo debía pertenecer.

```
Antes (v1.0):  script.js (385 líneas, todo mezclado)
Después (v3.0): 10 módulos especializados + 1 orquestador + backend Express
```

### 9.3 Migración de json-server a Express

En la versión 3.0 se reemplazó json-server por un backend propio con Express para tener control total sobre la lógica:

- **Antes**: json-server generaba automáticamente los endpoints REST con lógica genérica.
- **Después**: Controladores con lógica explícita para filtrar, agregar estadísticas y manejar relaciones usuario-tarea.

Beneficios:
- Endpoint `GET /api/tasks/filter` con filtros combinados por query params
- Endpoint `GET /api/dashboard` con agregaciones (total, por estado, por usuario)
- Control total sobre la lógica de negocio del lado del servidor

### 9.4 Mejora de edición (inline → modal)

En la versión 3.0 se reemplazó la edición inline (inputs ocultos dentro de la tabla) por un modal interactivo:

- **Antes**: Al hacer clic en "Editar", la fila se expandía mostrando inputs inline. Código complejo con lógica de mostrar/ocultar elementos.
- **Ahora**: Al hacer clic en "Editar", se abre un modal con campos de formulario, validación visual y botones claros de Guardar/Cancelar.

### 9.5 Metodologías aplicadas

| Metodología | Documentación |
|-------------|---------------|
| **GitFlow** | Rama `main` (producción), `develop` (integración), `feat/*` (tareas) |
| **Conventional Commits** | `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` |
| **Issues** | Templates para bugs y features, milestones, labels |
| **Pull Requests** | Template con checklist de calidad, evidencia, análisis de impacto |
| **Kanban** | Tablero con 4 columnas: To Do, In Progress, In Review, Done |
| **Blindaje de ramas** | Rulesets: PR obligatorio, aprobación requerida, protecciones |

### 9.6 Flujo de trabajo por issue

1. Se crea una issue en GitHub con template de feature/bug
2. Se asigna a un milestone y se etiqueta
3. Se mueve a "In Progress" en el Kanban
4. Se crea una rama `feat/nombre-descriptivo` desde `develop`
5. Se implementa la funcionalidad con commits convencionales
6. Se abre un Pull Request hacia `develop` con `Closes #ID`
7. Se revisa el código, se aprueba y se mergea
8. Se mueve la issue a "Done"

---

## 10. Documentación entregable

| Documento | Contenido |
|-----------|-----------|
| `docs/04-guia-modularizacion.md` | Guía completa de cómo y por qué se modularizó el código |
| `docs/plan-tecnico.md` | Planeación técnica de la migración a Vite v2.1 |
| `docs/reporte-tecnico.md` | Reporte técnico post-implementación con problemas y soluciones |
| `estilo.md` | Guía de estilo Silver Emerald con paleta, animaciones y componentes |
| `Parte1.md` | Análisis del código heredado y propuesta de separación en módulos |
| `TEAM_AGREEMENT.md` | Acuerdo de trabajo del equipo con roles y reglas |

---

**SENA — ADSO — Ficha 3315656 — Grupo 4 — 2026**
