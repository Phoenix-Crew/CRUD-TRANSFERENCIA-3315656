// ============================================================
// vite.config.js — Configuración del servidor de desarrollo Vite
// ============================================================
// FUNCIÓN: define cómo se sirve el frontend (puerto 5173) y,
// CRÍTICO, cómo se conecta con el backend Express (puerto 3002).
//
// CONEXIÓN FRONTEND ↔ BACKEND:
//   El frontend hace fetch a rutas /api/* (ver api/*.js)
//   → Vite INTERCEPTA esas peticiones (proxy)
//   → las reenvía a http://localhost:3002 (Express/MySQL)
//   → la respuesta vuelve al navegador SIN errores de CORS
//   Esto permite que el código use rutas relativas ("/api/users")
//   en lugar de URLs absolutas.
// ============================================================

// Importa la función defineConfig de Vite (empaquetador/build tool)
import { defineConfig } from 'vite';

// Exporta la configuración
export default defineConfig({
  root: '.',              // Carpeta raíz del proyecto: client/
  server: {
    host: '0.0.0.0',      // Escucha en todas las interfaces (accesible en red local)
    port: 5173,           // Puerto del frontend en desarrollo
    open: false,          // No abre el navegador automáticamente
    proxy: {
      // PROXY: toda petición que empiece por /api
      '/api': {
        target: 'http://localhost:3002', // se reenvía al backend Express
        changeOrigin: true               // cambia el Host por el del destino
      }
    }
  },
  build: {
    outDir: 'dist',       // Carpeta de salida del build de producción
    emptyOutDir: true,    // La vacía antes de compilar (sin archivos viejos)
    sourcemap: false      // No genera mapas de código (menos peso)
  }
});
