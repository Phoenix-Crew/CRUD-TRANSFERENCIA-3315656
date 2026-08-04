# Client — Frontend Gestión de Tareas (Grupo 4)

**Tema:** Silver Emerald / Animado
**Tecnología:** Vite + Vanilla JavaScript (ES modules)
**Puerto dev:** `5173` → proxy `/api` → backend Express `:3002`

---

## Estructura de carpetas

```
client/
├── index.html              ← SPA única con 3 pestañas (tasks / admin / users)
├── vite.config.js          ← Dev server + proxy a Express :3002
├── .env                    ← VITE_API_URL (vacío = usa proxy)
├── src/
│   ├── styles/styles.css   ← Estilos globales (tema Silver Emerald)
│   └── js/
│       ├── app.js              ← Orquestador de eventos (NO tiene lógica de negocio)
│       ├── api/
│       │   ├── tareasApi.js    ← Capa HTTP para tareas (GET/POST/PUT/DELETE)
│       │   └── usersApi.js     ← Capa HTTP para usuarios
│       ├── services/
│       │   ├── tareasService.js  ← Lógica de negocio de tareas
│       │   └── usersService.js   ← Lógica de negocio de usuarios
│       ├── ui/
│       │   ├── dom.js            ← Referencias a elementos del HTML
│       │   ├── taskRenderer.js   ← Renderiza tabla de tareas
│       │   ├── userRenderer.js   ← Renderiza tabla de usuarios
│       │   ├── notifications.js  ← Toasts + feedback de usuario
│       │   ├── confirmDialog.js  ← Modal de confirmación (Sí/No)
│       │   └── editModal.js      ← Modal de edición de tarea
│       ├── core/
│       │   └── NotificationManager.js  ← Cola de notificaciones (observador)
│       └── utils/
│           └── helpers.js        ← Funciones genéricas (sort, filter, export, etc.)
└── README.md               ← Este archivo
```

---

## Flujo general

```
index.html  →  app.js  →  services/*.js  →  api/*.js  →  Express :3002  →  MySQL
                                         ↑
                     taskRenderer / userRenderer / notifications  ←  renderizan respuesta
```

---

## Comandos

```bash
# Instalar dependencias
npm install

# Modo desarrollo (puerto 5173, proxy a :3002)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## Variables de entorno

| Variable | Archivo | Descripción |
|---|---|---|
| `VITE_API_URL` | `client/.env` | URL base de la API (vacío = usa proxy de Vite) |

---

## Documentación complementaria

- `../docs/topologia-frontend.md` — Mapa completo de botones → funciones → APIs → backend
- `../docs/plan-tecnico.md` — Plan técnico del proyecto
- `../docs/04-guia-modularizacion.md` — Guía de modularización
- `../estilo.md` — Guía de estilo visual (Silver Emerald)
- `../README.md` — README general del proyecto (raíz del repo)
