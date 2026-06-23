# Guía de Estilo — Gestión de Tareas Grupo 4

## Tema: **Silver Emerald**

Diseño visual inspirado en la identidad corporativa del SENA (verde esmeralda institucional) combinado con tonos plateados (*silver*) para una estética profesional, moderna y llamativa. Fondos oscuros con efectos de vidrio (*glassmorphism*), animaciones sutiles y una distribución en dos columnas que optimiza el flujo de trabajo.

---

## 1. Paleta de Colores

| Color | Código | Uso |
|---|---|---|
| Verde esmeralda oscuro | `#022c22` | Fondos de inputs, selects |
| Verde esmeralda | `#064e3b` | Fondos de tarjetas, bordes |
| Verde brillante | `#10b981` | Botones primarios, acentos, bordes izquierdos |
| Verde claro | `#34d399` | Labels, textos decorativos |
hazm
| Plateado (silver) | `#cbd5e1` | Acento secundario, badges "Pendiente", bordes tabla |
| Plateado oscuro | `#94a3b8` | Textos secundarios |
| Plateado brillante | `#f1f5f9` | Texto "Tareas" con gradiente animado |
| Fondo página | `#030a06` | Fondo general muy oscuro |
| Texto principal | `#f1f5f9` | Blanco hueso |
| Texto secundario | `#94a3b8` | Gris azulado |
| Rojo error | `#ef4444` | Errores, botón eliminar |

**Principio cromático:** Combinación de **verde institucional SENA** con **plateado** para evocar modernidad, confianza y elegancia. El verde aporta la identidad de la entidad formativa, mientras que el plateado reemplaza al dorado tradicional para un acabado más sobrio y contemporáneo.

---

## 2. Tipografía

- **Familia principal:** `Inter` (Google Fonts) con caída a `Segoe UI`, `system-ui`
- **Pesos utilizados:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Tamaño base:** 15px
- **Interlineado:** 1.6

**Jerarquía tipográfica:**

| Elemento | Tamaño | Peso | Color |
|---|---|---|---|
| Título principal | clamp(1.4rem, 3vw, 1.9rem) | 800 | `#f1f5f9` |
| Subtítulo header | 13px | 400 | `#475569` |
| Título de card | 15px | 700 | `#f1f5f9` |
| Labels formulario | 10px | 700 | `#34d399` |
| Texto de tabla | 14px | 400 | `#d6d3d1` |
| Cabeceras tabla | 11px | 600 | `#94a3b8` |
| Badge header | 9px | 700 | `#94a3b8` |
| Texto footer | 12px | 500 | `#475569` |

---

## 3. Layout — Distribución en 2 Columnas

```
┌──────────────────────────────────────────────┐
│               HEADER (full width)             │
├────────────────────┬─────────────────────────┤
│   COLUMNA IZQUIERDA│   COLUMNA DERECHA        │
│   (280px)          │   (1fr — flexible)       │
│                    │                          │
│   ┌──────────────┐│   ┌─────────────────────┐│
│   │🔍 Buscar ID  ││   │📌 Tareas Registradas││
│   │ (card verde) ││   │   Filtros + Tabla   ││
│   └──────────────┘│   │   (borde plateado)  ││
│   ┌──────────────┐│   └─────────────────────┘│
│   │📋 Registrar  ││                          │
│   │ (card silver)││                          │
│   └──────────────┘│                          │
├────────────────────┴─────────────────────────┤
│           DIVISOR DECORATIVO ✦                │
├──────────────────────────────────────────────┤
│               FOOTER (full width)             │
└──────────────────────────────────────────────┘
```

El layout se implementa con **CSS Grid**:

```css
.container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
}
```

---

## 4. Componentes

### 4.1 Header

- Fondo: gradiente sutil verde oscuro con `backdrop-filter: blur(16px)`
- Línea superior animada (`beamSweep`) que barre el header horizontalmente
- Insignia "ADSO · 3315656 · Grupo 4" con punto verde pulsante y borde plateado
- Título con glow animado (`titleGlow`) que respira suavemente
- Efecto `flare`: círculo decorativo en esquina inferior derecha que pulsa
- Texto "Tareas" con gradiente plateado animado (`silverShimmer`)

### 4.2 Cards

- Fondo semitransparente con `backdrop-filter: blur(14px)`
- Borde izquierdo de 3px de color:
  - **Verde** (`#10b981`): Card de búsqueda
  - **Plateado** (`#cbd5e1`): Card de registro
- Efecto `sweep`: barrido luminoso que cruza la card al hacer hover
- Efecto `borderShimmer`: bordes superior e inferior decorativos que aparecen al hover
- Borde gradiente perimetral con `mask-composite: exclude`
- Sombra profunda `0 16px 48px rgba(0, 0, 0, 0.3)` al hover

### 4.3 Formulario

- Inputs con fondo oscuro semitransparente `rgba(2, 44, 34, 0.3)`
- Borde que cambia a verde brillante al focus con glow exterior
- Labels en mayúscula sostenida con tracking amplio (0.6px)
- Placeholder en gris oscuro `#475569`
- Animación `fadeSlideUp` al aparecer las secciones

### 4.4 Botones

- Gradiente verde esmeralda en botones primarios
- Transición con rebote (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
- Efecto de elevación al hover: `translateY(-2px) scale(1.02)`
- Contracción al click: `scale(0.98)`
- Botones de acción en tabla con bounce y sombra

### 4.5 Tabla de Tareas

- Fondo semitransparente con `backdrop-filter: blur(14px)`
- **Línea plateada lateral** izquierda (`table-wrapper__silverline`) con animación pulsante
- Cabeceras en plateado oscuro con tracking amplio
- Filas alternadas con hover sutil
- Animación `messageSlide` escalonada para cada fila

### 4.6 Controles de Ordenamiento

- Fondo semitransparente con borde plateado
- Select con flecha SVG personalizada en plateado
- Botón de ordenamiento en gradiente plateado con texto verde oscuro
- Línea superior animada (`silverLine`) que pulsa

### 4.7 Exportar JSON

- Botón en gradiente plateado con texto verde oscuro
- Efecto bounce al hover
- Estado disabled con opacidad reducida

---

## 5. Efectos Visuales y Animaciones

| Animación | Duración | Descripción |
|---|---|---|
| `floatParticle` | 5-9s | Partículas que flotan por la página (5 puntos brillantes) |
| `orbPulse` | 10s | 3 esferas de fondo con blur de 100px que pulsan |
| `beamSweep` | 5s | Barrido de luz horizontal en header y footer |
| `badgePulse` | 3s | Insignia del header que titila |
| `dotPulse` | 1.5s | Punto verde del badge que late |
| `titleGlow` | 4s | Sombra luminosa del título que respira |
| `silverShimmer` | 4s | Gradiente plateado del texto que se desplaza |
| `silverPulse` | 4s | Línea plateada de la tabla que pulsa |
| `borderShimmer` | 3s | Bordes decorativos de cards que brillan |
| `sweep` | 0.8s | Barrido luminoso al pasar el mouse sobre cards |
| `sparkleRotate` | 4s | Rombo ◆ del divisor que gira infinitamente |
| `messageSlide` | 0.5s | Cada mensaje aparece desde la izquierda con delay |
| `toastBounce` | 0.5s | Notificaciones entran con rebote |
| `fadeSlideUp` | 0.5s | Secciones aparecen desde abajo |
| `flarePulse` | 6s | Flare del header que se expande |

### Efectos de hover

| Elemento | Efecto |
|---|---|
| Card | Elevación `translateY(-3px) scale(1.005)` + sweep + esquinas |
| Botón primario | Elevación + escala `1.02` + sombra |
| Botón sort | Elevación + escala `1.02` |
| Fila de tabla | Fondo más claro |
| Mensaje (card) | Desplazamiento `translateX(4px)` + sombra |
| Input | Borde más brillante |

---

## 6. Elementos Decorativos en HTML

Se añadieron los siguientes elementos al `index.html` **sin afectar la funcionalidad**:

| Elemento | Propósito |
|---|---|
| `.particle--1` a `--5` | Puntos flotantes decorativos en el fondo |
| `.bg-orb--1` a `--3` | Esferas de luz con blur para ambiente |
| `.header__beam` | Línea de luz que barre el header |
| `.header__badge` | Insignia "ADSO · 3315656 · Grupo 4" |
| `.header__flare` | Círculo decorativo pulsante |
| `.card__border--top/bottom` | Líneas decorativas que aparecen al hover |
| `.card__sweep` | Barrido luminoso al hover |
| `.table-wrapper__silverline` | Línea plateada lateral izquierda |
| `.messages-header__glow` | Glow decorativo en cabecera de tareas |
| `.divider` with `.divider__sparkle` | Separador decorativo con rombo giratorio |
| `.footer__beam` | Barrido de luz en footer |
| `.text-silver` | Texto con gradiente plateado animado |

---

## 7. Diseño Responsive

| Breakpoint | Comportamiento |
|---|---|
| > 820px | Grid de 2 columnas completas |
| ≤ 820px | Grid colapsa a 1 columna, elementos en vertical |
| ≤ 480px | Padding reducido, fuentes más pequeñas, botones full-width |

Adaptaciones principales en responsive:
- Búsqueda y registro pasan debajo del header
- Tabla con scroll horizontal (`overflow-x: auto`)
- Controles de filtro en columna
- Toasts ocupan todo el ancho disponible

---

## 8. Decisiones de Diseño

1. **Fondo oscuro**: Elegido para reducir fatiga visual durante uso prolongado y para que los colores verde y plateado resalten con mayor contraste.

2. **Glassmorphism moderado**: Se usa `backdrop-filter: blur()` en cards y paneles para dar sensación de profundidad sin sacrificar legibilidad.

3. **Transiciones con rebote**: La curva `cubic-bezier(0.34, 1.56, 0.64, 1)` se aplica a botones y elementos interactivos para una sensación más orgánica y divertida.

4. **Plateado en lugar de dorado**: Se reemplazó el dorado inicial por plateado para un acabado más sobrio, moderno y profesional, manteniendo el brillo visual.

5. **Animaciones sutiles**: Todas las animaciones son de baja intensidad para no distraer al usuario, sino para aportar una sensación de pulido y calidad.

6. **Sin dependencias externas**: Todo el estilo es CSS nativo, sin frameworks, librerías ni iconos externos (los iconos son emoji Unicode).

---

## 9. Archivos Modificados

| Archivo | Cambios |
|---|---|
| `client/index.html` | Adición de elementos decorativos (partículas, orbes, beams, divisores, badges, glows) sin alterar la funcionalidad |
| `client/styles.css` | Sistema completo de diseño con paleta silver-emerald, glassmorphism, animaciones, grid 2 columnas, responsive |
| `client/js/utils/helpers.js` | Actualización de `statusColors` para usar plateado en "Pendiente" |

---

*Documento elaborado para exposición del diseño visual del proyecto CRUD-TRANSFERENCIA-3315656 — Grupo 4*
