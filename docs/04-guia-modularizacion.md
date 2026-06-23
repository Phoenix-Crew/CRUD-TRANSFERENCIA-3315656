# Guía de Modularización del Frontend

## ¿Por qué modularizamos?

Originalmente todo el JavaScript estaba en un solo archivo (`script.js`) de **385 líneas** que mezclaba:

- Llamadas a la API (`fetch`)
- Manipulación del DOM
- Lógica de negocio (buscar usuario, registrar tarea)
- Validaciones
- Estado global (`currentUser`, `tasks`)

Esto hacía que:
- Tocar una funcionalidad afectara otras sin querer
- Fuera difícil entender qué hacía cada parte
- No se pudiera reutilizar código en otros archivos
- Trabajar en equipo generara conflictos constantes

---

## ¿Qué cambió?

### Antes (monolito)

```
client/
├── index.html
├── styles.css
└── script.js              ← 385 líneas con TODO mezclado
```

### Después (modular)

```
client/
├── index.html
├── styles.css
└── js/
    ├── app.js                     ← Punto de entrada (~20 líneas)
    ├── api/
    │   └── tareasApi.js           ← Solo llamadas al backend
    ├── services/
    │   └── tareasService.js       ← Lógica de negocio + estado
    ├── ui/
    │   ├── dom.js                 ← Referencias a elementos HTML
    │   ├── notifications.js       ← Toast, mensajes, errores
    │   └── taskRenderer.js        ← Tabla, edición, estados visuales
    └── utils/
        └── helpers.js             ← Utilidades genéricas
```

---

## Responsabilidad de cada módulo

| Módulo | ¿Qué hace? | ¿Qué NO hace? |
|--------|------------|---------------|
| `app.js` | Importa módulos, conecta eventos (clicks, teclas), inicia la app | No tiene lógica de negocio ni llamadas API directas |
| `api/tareasApi.js` | Solo `fetch()` al backend (`GET`, `POST`, `PATCH`, `DELETE`) | No toca el DOM, no valida datos, no maneja estado |
| `services/tareasService.js` | Orquesta: llama a la API, actualiza estado, pinta en pantalla | No tiene `fetch` directo, no conoce los elementos HTML uno por uno |
| `ui/dom.js` | `document.getElementById(...)` para cada elemento del HTML | No tiene lógica, solo referencias |
| `ui/notifications.js` | Muestra/oculta mensajes (toast, error de usuario, validación) | No llama a la API, no modifica estado |
| `ui/taskRenderer.js` | Crea filas en la tabla, alterna modo edición, cuenta tareas | No sabe qué es un `fetch`, no guarda estado |
| `utils/helpers.js` | Formatea fechas, valida inputs, colores de estado | No importa nada del DOM ni de la API |

---

## ¿Cómo fluye la información?

```
Usuario hace clic en "Buscar"
        │
        ▼
    app.js (recibe el evento)
        │
        ▼
    services/tareasService.js (orquesta)
        │
        ├── api/tareasApi.js (fetch a GET /users)
        ├── utils/helpers.js (validar input)
        ├── ui/notifications.js (mostrar datos del usuario)
        ├── api/tareasApi.js (fetch a GET /tasks?userId=X)
        └── ui/taskRenderer.js (pintar tabla de tareas)
```

Cada módulo solo habla con sus vecinos inmediatos. Si algo falla, sabes exactamente dónde mirar.

---

## ¿Por qué `services/`?

La carpeta `services/` existe para la **lógica de negocio**. Es el cerebro:

- Tiene el estado (`currentUser`, `tasks`)
- Decide qué hacer cuando el usuario busca, registra, edita o elimina
- Llama a la API cuando necesita datos
- Llama a los módulos UI cuando necesita mostrar algo

Sin `services/`, esa lógica termina en `app.js` y vuelve a mezclarse todo. Con `services/`, `app.js` queda limpio y las operaciones complejas están encapsuladas.

---

## Beneficios concretos

1. **Mantenible**: cada archivo tiene menos de 100 líneas
2. **Reusable**: si mañana necesitas mostrar un toast en otro lado, ya existe `showToast()`
3. **Trabajo en equipo**: tres personas pueden editar `api/`, `ui/` y `services/` sin pisarse
4. **Testeable**: puedes probar `helpers.js` o `tareasApi.js` sin cargar el DOM
5. **Escalable**: agregar una nueva funcionalidad es crear un archivo nuevo, no tocar uno existente

---

## Si necesitas agregar algo nuevo

| Si quieres... | Vas a... |
|--------------|----------|
| Un nuevo endpoint | `api/tareasApi.js` |
| Una nueva validación | `utils/helpers.js` |
| Un nuevo mensaje al usuario | `ui/notifications.js` |
| Un nuevo componente visual | `ui/taskRenderer.js` |
| Una nueva operación (ej: exportar tareas) | `services/tareasService.js` |
| Un nuevo evento o atajo de teclado | `app.js` |
