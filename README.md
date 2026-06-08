# GESTIÓN DE TAREAS — CRUD Transfers

Una aplicación web para gestionar tareas por usuario, con filtros inteligentes,
ordenamiento dinámico, notificaciones en vivo y exportación de datos.

Creada por aprendices SENA — ADSO, como proyecto de modularización frontend.

---

## 🧠 ¿Qué hace esta app?

1. Buscas un usuario por su número de documento.
2. Ves sus tareas en una tabla.
3. Puedes **agregar**, **editar** y **eliminar** tareas.
4. Puedes **filtrar** por estado (Pendiente, En progreso, Completada).
5. Puedes **ordenar** por fecha, nombre o estado, en orden ascendente o descendente.
6. Puedes **exportar** las tareas visibles a un archivo JSON.
7. Todo sin recargar la página — todo es instantáneo.

---

## 🏗️ Arquitectura — Cómo está construido

El proyecto sigue una **arquitectura modular en capas**. Cada archivo tiene
una responsabilidad ÚNICA y bien definida.

```
📁 client/js/
│
├── 📄 app.js                      ← El director de orquesta
│   Conecta los eventos (clics, cambios) con la lógica de negocio.
│   No tiene lógica propia — solo importa y conecta.
│
├── 📁 core/
│   ├── NotificationManager.js     ← Módulo PURO de notificaciones
│       Gestiona una cola de mensajes con patrón observador.
│       Sin DOM, sin API, sin importar nada del proyecto.
│
├── 📁 api/
│   ├── tareasApi.js               ← El cartero
│       Habla con el servidor (fetch GET, POST, PATCH, DELETE).
│       No sabe qué es un botón ni una tabla.
│
├── 📁 services/
│   ├── tareasService.js           ← El cerebro
│       Orquesta todo: valida, coordina, llama a la API y a la UI.
│       Tiene el estado global (usuario actual, tareas, filtros).
│
├── 📁 ui/
│   ├── dom.js                     ← El inventario
│       Solo guarda referencias a elementos HTML (getElementById).
│       No hace nada más.
│   ├── notifications.js           ← El speaker
│       Muestra mensajes al usuario (toasts, errores, feedback).
│       Consume a NotificationManager para recibir notificaciones.
│   ├── taskRenderer.js            ← El pintor
│       Dibuja la tabla, los modos de edición, los contadores.
│       Solo toca el DOM, no llama a la API.
│
└── 📁 utils/
    ├── helpers.js                 ← La caja de herramientas
        Funciones puras: ordenar, filtrar, validar, colores, timestamps.
        No toca el DOM ni la API — solo procesa datos.
```

### 📦 ¿Cómo se relacionan?

```
app.js
 ├── dom.js (referencias HTML)
 ├── tareasService.js (lógica de negocio)
 │    ├── dom.js
 │    ├── tareasApi.js (llamadas al servidor)
 │    ├── notifications.js (mensajes al usuario)
 │    │    ├── dom.js
 │    │    └── core/NotificationManager.js 💡 NUEVO
 │    ├── taskRenderer.js (dibujar en pantalla)
 │    │    ├── dom.js
 │    │    └── helpers.js
 │    └── helpers.js
 ├── tareasApi.js
 └── taskRenderer.js
```

> ✅ **0 dependencias circulares.** El grafo es un DAG (Directed Acyclic Graph)
> limpio y verificable.

---

## ✨ Funcionalidades implementadas

### RF01 — Filtro avanzado de tareas
- Filtro por **estado**: Pendiente, En progreso, Completada.
- Filtro por **usuario** (desde el buscador inicial).
- La tabla se actualiza al instante sin recargar la página.

### RF02 — Ordenamiento dinámico
- Haz clic en los encabezados de la tabla para ordenar por:
  - 📅 **Fecha** de creación
  - 🔤 **Nombre** de la tarea
  - 📌 **Estado**
- Botón para alternar entre ascendente ▲ y descendente ▼.
- La columna activa muestra un indicador visual.

### RF03 — Sistema de notificaciones
- Módulo `core/NotificationManager.js` — **100% puro**:
  - Sin dependencias del DOM.
  - Sin dependencias de la API.
  - Sin importar otros módulos del proyecto.
- Patrón **observador**: los módulos UI se suscriben para renderizar.
- Tipos de notificación: ✅ éxito, ❌ error, ⚠️ advertencia, ℹ️ información.
- Las notificaciones aparecen como toasts con animación y se cierran solas.

### RF04 — Exportación a JSON
- Botón "Exportar JSON" descarga las tareas **visibles** en pantalla.
- Respeta filtros y ordenamiento activos.
- El archivo incluye metadatos: usuario, filtros aplicados, fecha de exportación.
- Separación estricta:
  - `helpers.js` → construye el JSON y el nombre del archivo.
  - `taskRenderer.js` → descarga el archivo en el navegador.
  - `tareasService.js` → coordina el proceso.

---

## 🚀 Cómo ejecutar el proyecto

### 1. Inicia el servidor (backend)

```bash
cd server
npm install
npm start
```

> El servidor corre en `http://localhost:3002`

### 2. Abre la aplicación

Solo abre el archivo `client/index.html` en tu navegador favorito.

O si prefieres un servidor local:

```bash
npx serve client
```

### 3. IDs de prueba

| ID  | Nombre | Rol |
|:---:|--------|-----|
| 1   | Brian Bayona | Aprendiz |
| 2   | Nestor Gomez | Aprendiz |
| 3   | Joser Fuentes | Aprendiz |
| 4   | Ana María López | Instrutora |
| 5   | Carlos Andrés Pérez | Aprendiz |

Escribe un ID en el campo de búsqueda y presiona Enter o haz clic en "Buscar".

---

## 👥 Equipo

| Integrante | Rol | Contribuciones |
|------------|-----|----------------|
| **Brian Bayona** | Líder / Arquitecto | Estructura base, CRUD, responsive, `NotificationManager.js`, refactor de notificaciones, `app.js`, `tareasService.js`, coordinación, merges |
| **Néstor Stiven Gómez** | Desarrollador | `tareasApi.js`, `helpers.js`, **RF02** (ordenamiento + filtro por estado), **RF04** (exportación JSON), documentación técnica |
| **Joser Andrés Fuentes** | Desarrollador | `dom.js`, `taskRenderer.js`, mejoras de UI/UX, filtros de interfaz |

---

## 🧪 Pruebas rápidas

1. Abre la app y busca el ID **1** → verás tareas de Brian.
2. Cambia el filtro de estado a "En progreso" → solo se ven las tareas en curso.
3. Haz clic en "Título" → las tareas se ordenan alfabéticamente.
4. Haz clic en ▼ → cambia a orden ascendente.
5. Haz clic en "Exportar JSON" → descarga un archivo con las tareas visibles.
6. Agrega una tarea nueva → aparece al instante y recibes una notificación verde.
7. Edita o elimina una tarea → todo en vivo, sin recargar.

---

## 📚 Documentación adicional

En la carpeta `docs/` encontrarás guías detalladas sobre:
- `01-guia-sistema/` — Protección de ramas, issues, milestones, Kanban
- `02-guia-metodologia/` — Issues, Pull Requests, Conventional Commits, Git Flow
- `03-formatos-maestros/` — Plantillas de issues y PR
- `04-guia-modularizacion.md` — Guía de arquitectura modular

---

> **Institución:** SENA — ADSO (Análisis y Desarrollo de Software)
> **Ficha:** 3315656
