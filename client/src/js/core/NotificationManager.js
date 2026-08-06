class NotificationManager {
    constructor() {
        this._notifications = [];
        this._subscribers = [];
    }

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
