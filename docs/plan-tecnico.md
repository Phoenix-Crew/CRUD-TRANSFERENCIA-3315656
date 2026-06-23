# Plan Técnico de Implementación — v2.1

## Mejoras seleccionadas

### 1. Integración de librería externa: `dayjs`
**Problema que resuelve:** La función `getCurrentTimestamp()` en `helpers.js` usaba `toLocaleString()` de JavaScript nativo para formatear fechas. Aunque funciona, no ofrece flexibilidad para formatos personalizados, cambios de locale o manipulaciones avanzadas de fechas.

**Solución:** Instalar `dayjs` (2kB, librería moderna de fechas) vía npm y reemplazar la implementación manual.

### 2. Mejora visual desde `/src/styles`
**Problema que resuelve:** El archivo `styles.css` estaba en la raíz de `client/`, fuera de la estructura gestionada por Vite. Esto impedía que Vite procesara el CSS (minificación, autoprefixing, hash en producción).

**Solución:** Mover `styles.css` a `src/styles/styles.css` e importarlo desde `app.js`. Vite lo procesa automáticamente.

## Cambios estructurales requeridos

| Archivo | Acción |
|---|---|
| `client/package.json` | Agregar `dayjs` como dependencia |
| `client/src/js/utils/helpers.js` | Agregar `import dayjs`, reemplazar `getCurrentTimestamp()` |
| `client/styles.css` | Mover a `client/src/styles/styles.css` |
| `client/index.html` | Eliminar `<link rel="stylesheet">` (Vite lo inyecta) |
| `client/src/js/app.js` | Agregar `import '../styles/styles.css'` |

## Dependencias a instalar

```bash
npm install dayjs
```

Dayjs es una librería liviana (~2kB) para manejo de fechas en JavaScript. Se instalará como dependencia de producción (no de desarrollo) porque su código se ejecuta en el navegador.

## Plan de implementación

1. Instalar `dayjs` con npm
2. Modificar `helpers.js`: importar dayjs y reemplazar `getCurrentTimestamp()`
3. Crear `src/styles/` y mover `styles.css` allí
4. Agregar import del CSS en `app.js`
5. Eliminar el `<link>` de CSS en `index.html`
6. Verificar con `npm run dev`
7. Generar build con `npm run build`
8. Validar con `npm run preview`

## Impacto en la estructura del proyecto

```
client/
├── src/
│   ├── js/
│   │   └── utils/
│   │       └── helpers.js       ← modificado (usa dayjs)
│   └── styles/
│       └── styles.css            ← NUEVO (movido desde raíz)
├── index.html                    ← modificado (sin link CSS)
├── package.json                  ← modificado (dayjs agregado)
└── node_modules/dayjs/           ← NUEVO (instalado por npm)
```

No hay impacto negativo. Los cambios son aditivos y no alteran la lógica de negocio ni la experiencia de usuario final.
