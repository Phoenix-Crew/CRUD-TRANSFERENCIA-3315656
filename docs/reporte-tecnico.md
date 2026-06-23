# Reporte Técnico — Versión v2.1

## 1. Problemas resueltos

### Integración de `dayjs`
La función `getCurrentTimestamp()` generaba fechas con formato colombiano usando `toLocaleString('es-CO')`. Esto funcionaba, pero:
- No permitía cambiar el formato fácilmente
- Dependía de la implementación de cada navegador
- No ofrecía utilidades para manipular fechas (sumar días, comparar, etc.)

Con `dayjs` ahora tenemos:
- Formato consistente en todos los navegadores
- API moderna y legible: `dayjs().format('DD/MM/YYYY, hh:mm a')`
- Soporte de locale español (`dayjs/locale/es`)
- Librería liviana (~2kB) sin dependencias adicionales
- Posibilidad de expandir a futuro (plugins para rangos, duraciones, etc.)

### CSS en `/src/styles`
El CSS estaba fuera del alcance de Vite. Al moverlo a `src/styles/styles.css` e importarlo desde JavaScript, Vite ahora puede:
- Minificarlo automáticamente en producción
- Agregar hashes al nombre del archivo (cache busting)
- Aplicar autoprefixing según configuración
- Optimizar la carga (CSS crítico inline)

## 2. Gestión de dependencias

La dependencia se instaló con:
```bash
cd client
npm install dayjs
```

Esto agregó `dayjs` a `dependencies` en `package.json` y descargó el paquete a `node_modules/`. Al ser una dependencia de producción, Vite la incluye en el bundle final solo si se importa en algún módulo.

## 3. Cambios estructurales

### Antes (v2.0)
```
client/
├── styles.css              ← suelto en la raíz
├── index.html              ← <link rel="stylesheet" href="styles.css">
└── src/js/utils/helpers.js ← toLocaleString()
```

### Después (v2.1)
```
client/
├── src/styles/styles.css   ← dentro de src, procesado por Vite
├── index.html              ← sin <link>, Vite lo inyecta
└── src/js/utils/helpers.js ← dayjs().format()
```

### Código modificado

**helpers.js** — antes:
```js
export function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('es-CO', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}
```

**helpers.js** — después:
```js
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

export function getCurrentTimestamp() {
    return dayjs().format('DD/MM/YYYY, hh:mm a');
}
```

## 4. Diferencia entre desarrollo y producción

| Aspecto | `npm run dev` | `npm run build` |
|---|---|---|
| CSS | Sin minificar, con sourcemaps por si se necesita debuggear | Minificado, con hash en el nombre (ej. `index-GT9f68TT.css`) |
| JS | Módulos sin transformar, hot reload activo | Un solo bundle minificado (~14KB) |
| Tiempo de carga | Bajo (carga bajo demanda) | Óptimo (archivos empaquetados) |
| Errores | Mensajes detallados en consola | Sin mensajes de debug |
| Servidor | Vite Dev Server (puerto 5173) con proxy | `npm run preview` simula producción desde `/dist` |

## 5. Dificultades y soluciones

**Problema 1: Locale español de dayjs**  
Al importar `dayjs` directamente, las fechas se mostraban en inglés (ej. "AM" en vez de "a. m.").  
**Solución:** Importar `dayjs/locale/es` y ejecutar `dayjs.locale('es')` al inicio del módulo.

**Problema 2: Ruta del CSS al moverlo**  
El CSS importaba una fuente de Google con `@import url(...)`. Al migrar a `src/styles/` la ruta relativa seguía funcionando porque es una URL absoluta de Google Fonts, no un archivo local.  
**Solución:** Ninguna necesaria — Vite respeta los `@import` de CSS externos.

**Problema 3: Animaciones de entrada (`modalIn`, `messageSlide`)**  
El CSS define animaciones con `@keyframes`. Vite las procesa correctamente sin cambios, ya que reconoce las reglas `@keyframes` y las empaqueta junto al resto del CSS.  
**Solución:** Ninguna — funcionó sin modificaciones.

## 6. Conclusión

La versión v2.1 profesionaliza el proyecto en dos frentes:
1. **Dependencias externas** — se demostró que npm permite integrar librerías profesionales (`dayjs`) de forma controlada y versionada.
2. **Organización de assets** — el CSS ahora vive dentro de `src/` y es procesado por Vite, alineándose con las mejores prácticas del desarrollo frontend moderno.

Ambos cambios son transparentes para el usuario final pero mejoran la mantenibilidad y escalabilidad del proyecto.
