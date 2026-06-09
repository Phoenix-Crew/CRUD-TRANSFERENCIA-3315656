# Gestión de Tareas por Usuario — CRUD Modular

> **Una aplicación web que empezó siendo un solo archivo de 385 líneas y se convirtió en una arquitectura modular profesional.**  
> Proyecto de formación SENA — ADSO, Ficha 3315656.

---

## La Historia (para tu exposición)

Imagina que construyes una casa. Al principio es una sola habitación: cocinas, duermes y trabajas en el mismo espacio. Funciona, pero cuando llega más gente y necesitas más espacios, se vuelve un caos. No encuentras nada, todo estorba, y arreglar una cosa rompe otra.

Eso era nuestro proyecto al inicio: **un solo archivo (`script.js`) de 385 líneas** que hacía absolutamente todo:

- Capturaba eventos del mouse y teclado
- Pintaba elementos en pantalla
- Hacía llamadas al servidor con `fetch`
- Validaba formularios
- Guardaba el estado del usuario
- Mostraba notificaciones
- Coordinaba el flujo entero

Funcionaba, sí. Pero era imposible de mantener. Si querías cambiar el color de un mensaje de error, tenías que leerte 385 líneas para encontrar dónde estaba. Si dos personas trabajaban al mismo tiempo, se pisaban los cambios. Y agregar una funcionalidad nueva era como meter un mueble más en una habitación ya repleta.

**El problema no era que no funcionara. El problema era que no estaba organizado para crecer.**

---

## La Solución: Modularización

Dividimos el código en **módulos independientes**, cada uno con una responsabilidad única. Así como una casa tiene cocina, baño, dormitorios y sala, nuestra app ahora tiene módulos especializados que se comunican entre sí de forma ordenada.

### La estructura final

```
client/
├── index.html              ← La página (casi no cambió)
├── styles.css              ← Los estilos (tampoco cambió)
└── js/
    ├── app.js              ← 🎯 El director de orquesta (punto de entrada)
    ├── core/
    │   └── NotificationManager.js  ← 📢 Gestor puro de notificaciones
    ├── api/
    │   └── tareasApi.js    ← 📡 El cartero (solo habla con el servidor)
    ├── services/
    │   └── tareasService.js ← 🧠 El cerebro (lógica de negocio + estado)
    ├── ui/
    │   ├── dom.js          ← 📋 El inventario (referencias al HTML)
    │   ├── notifications.js ← 📣 El speaker (mensajes al usuario)
    │   └── taskRenderer.js ← 🎨 El pintor (tabla, edición, contadores)
    └── utils/
        └── helpers.js      ← 🧰 La caja de herramientas (funciones puras)
```

### ¿Qué hace cada módulo? (para que lo expliques en tu exposición)

| Módulo | Lo puedes explicar como... |
|--------|---------------------------|
| **`app.js`** | Es el **director de orquesta**. No toca instrumentos, solo dice cuándo empezar. Conecta los clics del usuario con la lógica del sistema. Tiene unos 20 event listeners y nada más. |
| **`core/NotificationManager.js`** | Es el **buzón de notificaciones**. Cualquier módulo puede dejar un mensaje aquí, y los que están suscritos lo reciben automáticamente. No sabe qué es una pantalla, ni un botón, ni un fetch. Es 100% puro. |
| **`api/tareasApi.js`** | Es el **cartero**. Solo sabe hacer peticiones al servidor: GET, POST, PATCH, DELETE. No revisa si los datos son válidos ni pinta nada. Solo trae y lleva información. |
| **`services/tareasService.js`** | Es el **cerebro**. Aquí está el estado de la app (usuario actual, tareas, filtros). Decide qué hacer cuando buscas, agregas, editas o eliminas. Llama al cartero cuando necesita datos, y al pintor cuando necesita mostrar algo. |
| **`ui/dom.js`** | Es el **inventario**. Solo guarda referencias a los elementos del HTML (`getElementById`). No hace nada más. Si cambia un ID en el HTML, solo se cambia aquí. |
| **`ui/notifications.js`** | Es el **speaker**. Muestra mensajes al usuario: toasts verdes de éxito, rojos de error, amarillos de advertencia. También muestra los datos del usuario y los errores de validación. |
| **`ui/taskRenderer.js`** | Es el **pintor**. Dibuja la tabla de tareas, crea filas, alterna el modo edición, actualiza el contador, muestra el estado vacío. Solo toca el DOM, no llama a la API. |
| **`utils/helpers.js`** | Es la **caja de herramientas**. Tiene funciones que no dependen de nada: formatear fechas, validar inputs, ordenar arrays, filtrar por estado, construir JSONs. Las puedes usar en cualquier proyecto. |

---

## Las 4 Funcionalidades Clave (RF)

### RF01 — Filtro avanzado de tareas
- Filtra por **usuario** (escribes el documento y solo ves sus tareas)
- Filtra por **estado** (Pendiente, En progreso, Completada)
- Puedes **combinar ambos** filtros: buscas un usuario y luego filtras sus tareas por estado
- Todo sin recargar la página

### RF02 — Ordenamiento dinámico
- Haz clic en los encabezados de la tabla para ordenar por:
  - **Título** (alfabéticamente, respetando acentos y ñ)
  - **Estado** (en orden lógico: Pendiente → En progreso → Completada)
  - **Fecha** (más antigua o más reciente)
- Botón para alternar entre ascendente ▲ y descendente ▼
- La columna activa muestra una flechita que indica el orden

### RF03 — Sistema de notificaciones
- Implementamos un **NotificationManager** con patrón observador
- Es **100% independiente**: no importa nada del DOM, ni de la API, ni de otros módulos
- Cualquier parte del sistema puede notificar sin saber cómo se va a mostrar
- Tipos: ✅ éxito, ❌ error, ⚠️ advertencia, ℹ️ información
- Los toasts aparecen con animación y se cierran solos a los 4 segundos

### RF04 — Exportación a JSON
- Botón "Exportar JSON" descarga las tareas que ESTÁS VIENDO en pantalla
- Respeta los filtros y el ordenamiento activos
- El archivo incluye metadatos: quién exportó, con qué filtros, cuándo
- Separación estricta:
  - `helpers.js` construye el JSON y el nombre del archivo
  - `taskRenderer.js` dispara la descarga en el navegador
  - `tareasService.js` coordina el proceso

---

## Cómo fluye la información (diagrama para tu exposición)

```
USUARIO hace clic en "Buscar"
       │
       ▼
┌─────────────────┐
│     app.js      │  Recibe el evento y llama a searchUser()
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ tareasService.js    │  El cerebro: valida el input, pide datos,
│  (searchUser)       │  coordina la respuesta, actualiza estado
└──┬──────┬──────┬───┘
   │      │      │
   ▼      ▼      ▼
┌──────┐ ┌────┐ ┌──────────────┐
│ api/ │ │ui/ │ │ ui/          │
│ tarea│ │noti│ │taskRenderer  │
│ sApi │ │fica│ │              │
│ .js  │ │tion│ │Pinta la tabla│
│      │ │s.js│ │              │
│ fetch│ │Mues│ │createTask    │
│Users │ │tra │ │Element()     │
│fetch │ │info│ │              │
│Tasks │ │user│ │              │
└──────┘ └────┘ └──────────────┘
```

**Regla de oro:** Un módulo solo se comunica con sus vecinos directos.  
La UI nunca llama directo a la API. La API nunca toca el DOM.  
Si algo falla, sabes exactamente dónde mirar.

---

## Lo que NO cambió (y por qué está bien)

- La aplicación **sigue funcionando exactamente igual** que antes
- El HTML y el CSS **no se modificaron** (solo se agregaron los atributos `data-sort` para el ordenamiento)
- El servidor (json-server) **sigue siendo el mismo**
- Los usuarios pueden **seguir haciendo las mismas operaciones**: buscar, crear, editar, eliminar

Lo que cambió está **debajo del capó**: el código ahora es mantenible, escalable y profesional.

---

## Cómo ejecutar el proyecto

```bash
# 1. Inicia el backend (json-server)
cd server
npm install
npm start
# El servidor corre en http://localhost:3002

# 2. Abre la aplicación
# Simplemente abre client/index.html en tu navegador
# O usa: npx serve client
```

### IDs de prueba para la exposición

| ID | Nombre | Rol |
|:--:|--------|-----|
| 1 | Brian Bayona | Aprendiz |
| 2 | Nestor Gomez | Aprendiz |
| 3 | Joser Fuentes | Aprendiz |
| 4 | Ana María López | Instrutora |
| 5 | Carlos Andrés Pérez | Aprendiz |

---

## Para tu presentación: preguntas frecuentes

**¿Cuál es el archivo más importante?**  
`tareasService.js` — es el cerebro. Todo pasa por ahí.

**¿Dónde cambiarías la URL de la API?**  
Solo en `api/tareasApi.js`, línea 31. Un solo cambio.

**¿Puede la UI hablar directo con la API?**  
No, y esa es la gracia. Si la UI hablara directo, la lógica de negocio quedaría dispersa. Todo pasa por `services/`.

**¿Qué pasa si agregamos una nueva funcionalidad?**  
Creamos un archivo nuevo en el módulo correspondiente. No tocamos los existentes. El proyecto está listo para crecer.

**¿Cuántas líneas tiene ahora `app.js`?**  
85 líneas, de las cuales la mitad son comentarios explicativos. El archivo principal pasó de 385 líneas a ser legible en 2 minutos.

---

## Equipo

| Integrante | Rol | ¿Qué hizo? |
|------------|-----|------------|
| **Brian Bayona** | Líder / Arquitecto | Estructura base, `app.js`, `tareasService.js`, `NotificationManager.js`, coordinación, merges |
| **Néstor Stiven Gómez** | Desarrollador | `tareasApi.js`, `helpers.js`, ordenamiento dinámico (RF02), exportación JSON (RF04) |
| **Joser Andrés Fuentes** | Desarrollador | `dom.js`, `taskRenderer.js`, mejoras UI/UX, filtros de interfaz |

---

## Una reflexión final (para cerrar tu exposición)

> *"El software no es como un documento de Word que solo tú editas.  
> Es como una ciudad donde muchas personas construyen al mismo tiempo.  
> Si cada quien construye donde le parece, terminas con calles que no llevan a ningún lado.  
> La modularización es ponerle dirección a las calles y decirle a cada quién dónde construir."*

---

**SENA — ADSO**  
**Ficha:** 3315656  
**Guía:** GFPI-F-135 V04 — Modularización en JavaScript
