// Qué es NotificationManager: el administrador central de notificaciones (patrón pub/sub).
// Cómo se lee: "clase que guarda notificaciones y a los suscriptores que las dibujan".
class NotificationManager {
    constructor() {
        this._notifications = [];
        this._subscribers = [];
    }

    // Cómo se lee: "add: guarda una notificación y avisa a los suscriptores".
    // Qué hace: es lo que llama showToast para disparar el aviso.
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

    // Cómo se lee: "subscribe: registra una función que se entera de cada notificación".
    // Qué es la devuelta: por eso en notifications.js createToastElement se entera de cada toast.
    subscribe(callback) {
        this._subscribers.push(callback);
        const unsubscribe = () => {
            this._subscribers = this._subscribers.filter(cb => cb !== callback);
        };
        return unsubscribe;
    }

    unsubscribe(callback) {
        this._subscribers = this._subscribers.filter(cb => cb !== callback);
    }

    getAll() {
        return this._notifications.slice();
    }

    clear() {
        this._notifications = [];
    }

    // Qué hace: le pasa cada notificación nueva a todas las funciones suscritas.
    _notify(notification) {
        this._subscribers.forEach(cb => {
            try {
                cb(notification);
            } catch (_) {

            }
        });
    }
}

// Cómo se lee: "crea una única instancia del administrador y la exporta".
// Qué es: instancia única (singleton) compartida por toda la app para no duplicar toasts.
const instance = new NotificationManager();
export default instance;
