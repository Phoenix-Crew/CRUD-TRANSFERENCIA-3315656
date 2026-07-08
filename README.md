# Gestión de Tareas — Proyecto Formativo SENA

**Producto:** Aplicación web CRUD para gestión de tareas  
**Programa:** Técnico en Programación de Software (Código: 3315656)  
**Proyecto:** Construcción de software integrador de tecnologías orientadas a servicios  
**Fase:** Ejecución  
**Competencia:** Desarrollar la solución de software según diseño y metodologías de desarrollo  
**Versión:** v2.1 — Empaquetado profesional con Vite  

---

## 1. Descripción del producto

Aplicación web que permite gestionar tareas de forma dinámica mediante una interfaz moderna, conectada a una API REST. Los usuarios pueden buscar compañeros por documento, asignarles tareas, editarlas, filtrarlas, ordenarlas y exportar los datos — todo sin recargar la página.

---

## 2. Funcionalidades

| Funcionalidad | Descripción |
|---------------|-------------|
| **Buscar usuario** | Ingresa un número de documento y obtén la información del usuario y sus tareas asociadas |
| **Registrar tarea** | Crea nuevas tareas con título, descripción y estado (Pendiente/En progreso/Completada) |
| **Editar tarea** | Edición inline directamente en la tabla sin recargar la página |
| **Eliminar tarea** | Eliminación con confirmación mediante modal |
| **Filtrar por estado** | Filtra las tareas visibles por Pendiente, En progreso o Completada |
| **Ordenar tabla** | Ordena por título, estado o fecha, de forma ascendente o descendente |
| **Exportar a JSON** | Descarga las tareas visibles en formato JSON con metadatos |
| **Notificaciones toast** | Feedback visual de éxito, error o información con animaciones |

---

## 3. Arquitectura del software

### 3.1 Estructura del proyecto

```
📁 CRUD-TRANSFERENCIA-3315656/
├── 📁 client/                          → Aplicación frontend (Vite)
│   ├── 📄 index.html                   → Página principal
│   ├── 📄 package.json                 → dayjs + vite
│   ├── 📄 vite.config.js               → Proxy, build, server
│   ├── 📄 .env                         → Variables de entorno (desarrollo)
│   ├── 📄 .env.production              → Variables de entorno (producción)
│   └── 📁 src/
│       ├── 📁 styles/
│       │   └── 📄 styles.css           → Diseño Silver Emerald
│       └── 📁 js/
│           ├── 📄 app.js               → Punto de entrada
│           ├── 📁 core/
│           │   └── 📄 NotificationManager.js  → Patrón observador
│           ├── 📁 api/
│           │   └── 📄 tareasApi.js     → Capa HTTP
│           ├── 📁 services/
│           │   └── 📄 tareasService.js → Lógica de negocio + estado
│           ├── 📁 ui/
│           │   ├── 📄 dom.js           → Referencias DOM
│           │   ├── 📄 notifications.js → Mensajes al usuario
│           │   ├── 📄 taskRenderer.js  → Renderizado de componentes
│           │   └── 📄 confirmDialog.js → Modal de confirmación
│           └── 📁 utils/
│               └── 📄 helpers.js       → Funciones puras
│
├── 📁 server/                          → Backend (json-server)
│   ├── 📄 package.json                 → json-server
│   └── 📄 db.json                      → 5 usuarios + tareas
│
├── 📁 docs/                            → Documentación del proceso
│   ├── 📁 01-guia-sistema/             → Issues, milestones, Kanban, ramas
│   ├── 📁 02-guia-metodologia/         → GitFlow, commits, PRs
│   ├── 📁 03-formatos-maestros/        → Templates
│   ├── 📄 04-guia-modularizacion.md
│   ├── 📄 plan-tecnico.md
│   ├── 📄 reporte-tecnico.md
│   └── 📄 README-pasos-server.md
│
├── 📁 .github/                         → Templates GitHub
│   ├── 📄 pull_request_template.md
│   └── 📁 ISSUE_TEMPLATE/
│       ├── 📄 bug_report.md
│       └── 📄 feature_request.md
│
├── 📄 package.json                     → Scripts raíz (dev, build, preview)
├── 📄 vite.config.js
├── 📄 TEAM_AGREEMENT.md
├── 📄 estilo.md
├── 📄 Parte1.md
└── 📄 README.md
```

### 3.2 Módulos del frontend

| Módulo | Responsabilidad | Archivo |
|--------|----------------|---------|
| **app.js** | Orquestador: conecta eventos del DOM con la lógica de negocio | `client/src/js/app.js` |
| **NotificationManager** | Gestor de eventos con patrón observador, 100% independiente del DOM | `client/src/js/core/NotificationManager.js` |
| **tareasApi** | Comunicación HTTP: GET, POST, PATCH, DELETE | `client/src/js/api/tareasApi.js` |
| **tareasService** | Estado global y lógica de negocio: coordina API + UI | `client/src/js/services/tareasService.js` |
| **dom** | Referencias centralizadas a elementos del HTML | `client/src/js/ui/dom.js` |
| **notifications** | Mensajes al usuario: toasts, errores, datos de usuario | `client/src/js/ui/notifications.js` |
| **taskRenderer** | Manipulación del DOM: tabla, edición inline, contadores | `client/src/js/ui/taskRenderer.js` |
| **confirmDialog** | Modal de confirmación reutilizable con Promise | `client/src/js/ui/confirmDialog.js` |
| **helpers** | Funciones puras: fechas (dayjs), validaciones, filtros, ordenamiento | `client/src/js/utils/helpers.js` |

### 3.3 Flujo de datos

```
usuario (clic/teclado)
    → app.js (event listener)
        → tareasService.js (lógica de negocio)
            ├── api/tareasApi.js (fetch HTTP)
            ├── utils/helpers.js (validaciones, transformaciones)
            ├── ui/notifications.js (mensajes al usuario)
            └── ui/taskRenderer.js (actualización del DOM)
```

La UI nunca llama directamente a la API. La API nunca manipula el DOM. Cada capa tiene una responsabilidad única.

### 3.4 API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users` | Lista todos los usuarios |
| GET | `/users/{id}` | Busca usuario por ID |
| GET | `/tasks?userId=X` | Obtiene tareas de un usuario |
| POST | `/tasks` | Crea una nueva tarea |
| PATCH | `/tasks/{id}` | Actualiza una tarea |
| DELETE | `/tasks/{id}` | Elimina una tarea |

---

## 4. Diseño visual: Silver Emerald

### 4.1 Concepto

Combinación de **verde esmeralda institucional SENA** con **plateado (silver)** para evocar identidad, modernidad y profesionalismo.

### 4.2 Paleta

| Color | Código | Uso |
|-------|--------|-----|
| Verde esmeralda | `#10b981` | Botones, bordes, acentos |
| Verde oscuro | `#022c22` | Fondos de inputs |
| Plateado | `#cbd5e1` | Bordes tabla, badges |
| Fondo página | `#030a06` | Fondo general |
| Texto | `#f1f5f9` | Texto principal |

### 4.3 Animaciones (15 en total)

Todas en CSS puro, sin librerías externas: partículas flotantes, esferas pulsantes, barrido de luz en header, texto con brillo plateado animado, toasts con rebote, filas que se deslizan, divisor giratorio, y más.

---

## 5. Requisitos técnicos e instalación

### Requisitos

- Node.js ≥ 18
- npm ≥ 9

### Instalación y ejecución

```bash
# Servidor (API REST)
cd server
npm install
npm start                # http://localhost:3002

# Cliente (desarrollo)
cd client
npm install
npm run dev              # http://localhost:5173

# Build producción
cd client
npm run build
npm run preview
```

### Variables de entorno

| Variable | Desarrollo | Producción |
|----------|-----------|------------|
| `VITE_API_URL` | `/api` (proxy → localhost:3002) | `http://10.5.225.75:3002` |

---

## 6. Datos de prueba

| ID | Nombre | Rol |
|:--:|--------|-----|
| 1 | Brian Bayona | Aprendiz |
| 2 | Nestor Gomez | Aprendiz |
| 3 | Joser Fuentes | Aprendiz |
| 4 | Ana María López | Instrutora |
| 5 | Carlos Andrés Pérez | Aprendiz |

---

## 7. Tecnologías

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| JavaScript (ES Modules) | — | Lógica de la aplicación |
| HTML5 + CSS3 | — | Estructura y diseño Silver Emerald |
| Fetch API | — | Comunicación con el servidor |
| Vite | ^8.0 | Empaquetado y dev server |
| dayjs | ^1.11 | Formateo de fechas |
| json-server | ^1.0 | API REST de pruebas |
| Git + GitHub | — | Control de versiones y trabajo colaborativo |

---

## 8. Equipo de trabajo

| Integrante | Rol | Contribuciones principales |
|------------|-----|---------------------------|
| **Brian Bayona** | Líder / Arquitecto | `tareasService.js`, `app.js`, `NotificationManager.js`, migración Vite, coordinación, merges |
| **Néstor Gómez** | Desarrollador | `tareasApi.js`, `helpers.js`, ordenamiento dinámico (RF02), exportación JSON (RF04) |
| **Joser Fuentes** | Desarrollador | `dom.js`, `taskRenderer.js`, diseño visual Silver Emerald, `confirmDialog.js` |

---

## 9. Proceso de desarrollo

### 9.1 Línea de tiempo

| Etapa | Logro | Commits clave |
|-------|-------|---------------|
| 1. Base | Servidor json-server + HTML/CSS/JS funcional | `3ac5345`, `36a9c88` |
| 2. CRUD | Crear, leer, editar, eliminar sin recargar | `9c31903` |
| 3. Modularización | Código separado en 7 módulos con responsabilidad única | `f65b298` |
| 4. Features extra | Filtros (RF01), ordenamiento (RF02), notificaciones (RF03), exportación (RF04) | `6c97b0b`, `340b911`, `04ce551` |
| 5. Silver Emerald | Rediseño visual con 15 animaciones CSS | `7ad8eed` |
| 6. Vite v2.1 | Empaquetado, variables de entorno, dayjs, CSS en src/ | `da49353`, `593a527`, `c95b67e` |

### 9.2 Análisis inicial (Parte 1)

El proyecto comenzó con un solo archivo (`script.js`) de **385 líneas** que mezclaba 9 responsabilidades: referencias DOM, comunicación API, estado global, búsqueda, validaciones, CRUD, renderizado, notificaciones y contadores. El análisis documentado en `Parte1.md` identificó cada función y determinó a qué módulo debía pertenecer, siguiendo el principio de responsabilidad única.

```
Antes:  script.js (385 líneas, todo mezclado)
Después: 8 módulos especializados + 1 orquestador
```

### 9.3 Metodologías aplicadas

| Metodología | Documentación |
|-------------|---------------|
| **GitFlow** | Rama `main` (producción), `develop` (integración), `feat/*` (tareas) | `docs/02-guia-metodologia/gitflow.md` |
| **Conventional Commits** | `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` | `docs/02-guia-metodologia/conventional-commits.md` |
| **Issues** | Templates para bugs y features, milestones, labels | `docs/01-guia-sistema/creacion-issues.md` |
| **Pull Requests** | Template con checklist de calidad, evidencia, análisis de impacto | `docs/02-guia-metodologia/GUIA_PULL_REQUEST.md` |
| **Kanban** | Tablero con 4 columnas: To Do, In Progress, In Review, Done | `docs/01-guia-sistema/tablero-kanban.md` |
| **Blindaje de ramas** | Rulesets: PR obligatorio, aprobación requerida, protecciones | `docs/01-guia-sistema/blindaje-ramas.md` |

---

## 10. Documentación entregable

| Documento | Contenido |
|-----------|-----------|
| `docs/04-guia-modularizacion.md` | Guía completa de cómo y por qué se modularizó el código |
| `docs/plan-tecnico.md` | Planeación técnica de la migración a Vite v2.1 |
| `docs/reporte-tecnico.md` | Reporte técnico post-implementación con problemas y soluciones |
| `estilo.md` | Guía de estilo Silver Emerald con paleta, animaciones y componentes |
| `Parte1.md` | Análisis del código heredado y propuesta de separación |
| `TEAM_AGREEMENT.md` | Acuerdo de trabajo del equipo con roles y reglas |

---

**SENA — ADSO — Ficha 3315656 — Grupo 4 — 2026**
