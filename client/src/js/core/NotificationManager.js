
// NotificationManager.js — Módulo puro de gestión de notificaciones
//
// ¿Qué hace?
//   Administra una cola de notificaciones con un patrón observador.
//   Los módulos externos se suscriben para recibir notificaciones
//   sin que este módulo sepa cómo se renderizan.
//
// ¿Qué NO hace?
//   NO manipula el DOM
//   NO hace llamadas a la API
//   NO importa nada de otros módulos del proyecto
//   NO tiene dependencias externas
//
// ¿Qué exporta?
//   - instancia única (singleton) de NotificationManager
//   - Métodos públicos:
//     .add(type, message)   → agrega notif y notifica suscriptores
//     .subscribe(callback)  → registra un callback para recibir notif
//     .unsubscribe(callback)→ elimina un suscriptor
//     .getAll()             → devuelve copia de todas las notif
//     .clear()              → vacía la cola
//
// Tipos soportados: 'success', 'error', 'warning', 'info'
//
// ¿Quién lo usa?
//   - ui/notifications.js → se suscribe al cargarse y renderiza toasts

class NotificationManager {
    constructor() {
        this._notifications = [];
        this._subscribers = [];
    }

    // add — Agrega una notificacion a la cola y notifica a los suscriptores
    add(type, message) {
        const notification = {
            id: Date.now() + Math.random(),
            type,
            message,
            timestamp: new Date().toISOString()
        };
        this._notifications.push(notification);
        this._notify(notification);
        return notification;
    }

    // subscribe — Registra un callback que se ejecuta al añadir una notificacion; retorna funcion para anular
    subscribe(callback) {
        this._subscribers.push(callback);
        const unsubscribe = () => {
            this._subscribers = this._subscribers.filter(cb => cb !== callback);
        };
        return unsubscribe;
    }

    // unsubscribe — Elimina un callback de la lista de suscriptores
    unsubscribe(callback) {
        this._subscribers = this._subscribers.filter(cb => cb !== callback);
    }

    // getAll — Retorna una copia de todas las notificaciones acumuladas
    getAll() {
        return this._notifications.slice();
    }

    // clear — Vacía la cola de notificaciones
    clear() {
        this._notifications = [];
    }

    // _notify — Interno: ejecuta todos los callbacks suscritos con la notificacion
    _notify(notification) {
        this._subscribers.forEach(cb => {
            try {
                cb(notification);
            } catch (_) {

            }
        });
    }
}

const instance = new NotificationManager();
export default instance;
