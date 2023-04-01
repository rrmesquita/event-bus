type EventCallback = (...args: any[]) => void

interface Listener {
    callback: EventCallback
    executions: number
    maxExecutions: number
}

export class EventBus {
    protected listeners: Record<string, Listener[]> = {}

    /**
     * Attach a callback to an event.
     *
     * @param eventName - name of the event
     * @param callback - callback executed when this event is triggered
     * @param executions - max number of executions
     */
    public on(eventName: string, callback: EventCallback, executions = -1) {
        this.registerListener(eventName, callback, executions)
    }

    /**
     * Attach a callback to an event. The callback will not be executed more than once
     *
     * @param eventName - name of the event
     * @param callback - callback executed when this event is triggered
     */
    public once(eventName: string, callback: EventCallback) {
        this.registerListener(eventName, callback, 1)
    }

    /**
     * Attach a callback to an event.
     *
     * @param executions - max number of executions
     * @param eventName - name of the event
     * @param callback - callback executed when this event is triggered
     */
    public exactly(executions: number, eventName: string, callback: EventCallback) {
        this.on(eventName, callback, executions)
    }

    /**
     * Kill an event with all it's callbacks
     *
     * @param eventName - name of the event
     */
    public off(eventName: string) {
        delete this.listeners[eventName]
    }

    /**
     * Remove the callback for the given event
     *
     * @param eventName - name of the event
     * @param callback - the callback to remove (undefined to remove all of them).
     */
    public detach(eventName: string, callback: EventCallback) {
        let listeners = this.listeners[eventName] || []

        listeners = listeners.filter((value) => value.callback !== callback)

        if (this.listeners[eventName]) {
            this.listeners[eventName] = listeners
        }
    }

    /**
     * Emit the event
     *
     * @param eventName - name of the event
     * @param args - callback arguments
     */
    public emit(eventName: string, ...args: any[]) {
        this.emitWith(eventName, null, ...args)
    }

    /**
     * Emit the event with bound context
     *
     * @param eventName - name of the event
     * @param context - `this` context to bind to
     * @param args - callback arguments
     */
    public emitWith(eventName: string, context: any, ...args: any[]) {
        let listeners: Listener[] = []

        if (this.listeners[eventName]) {
            listeners = this.listeners[eventName]
        } else if (eventName.includes('*')) {
            let newName = eventName.replace(/\*\*/, '([^.]+.?)+')

            newName = newName.replace(/\*/g, '[^.]+')

            const match = eventName.match(newName)

            if (match && eventName === match[0]) {
                listeners = this.listeners[eventName]
            }
        }

        listeners.forEach((listener, index) => {
            listener.executions++

            let callback = listener.callback

            if (context) {
                callback = listener.callback.bind(context)
            }

            callback(...args)

            // If this event cannot be fired again, remove from the stack
            const reachedMaxExecutions = listener.maxExecutions >= 0 && listener.executions >= listener.maxExecutions

            if (reachedMaxExecutions) {
                this.listeners[eventName].splice(index, 1)
            }
        })
    }

    protected registerListener(eventName: string, callbackFn: EventCallback, maxExecutions: number) {
        this.listeners[eventName] = this.listeners[eventName] || []
        this.listeners[eventName].push({
            callback: callbackFn,
            executions: 0,
            maxExecutions: maxExecutions,
        })
    }
}
