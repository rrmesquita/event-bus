import { describe, expect, test, vi } from 'vitest'

import { EventBus } from '../src/EventBus'

class TestableEventBus extends EventBus {
    public debug() {
        // eslint-disable-next-line no-console
        console.log(this.listeners)
    }
}

describe('EventBus', () => {
    test('it registers a callback to a new listener', () => {
        const bus = new TestableEventBus()
        const fn = vi.fn()

        bus.on('bazinga', fn)
        bus.emit('bazinga')

        expect(fn).toBeCalled()
    })

    test('it can fire multiple times', () => {
        const bus = new TestableEventBus()
        const fn = vi.fn()

        bus.on('bazinga', fn)
        bus.emit('bazinga')
        bus.emit('bazinga')
        bus.emit('bazinga')

        expect(fn).toBeCalledTimes(3)
    })

    test('it unregisters listener', () => {
        const bus = new TestableEventBus()
        const fn = vi.fn()

        bus.on('bazinga', fn)
        bus.off('bazinga')
        bus.emit('bazinga')

        expect(fn).not.toBeCalled()
    })

    test('it respects a listeners execution limit', () => {
        const bus = new TestableEventBus()
        let execs = 0

        bus.exactly(3, 'bazinga', () => execs++)

        bus.emit('bazinga')
        bus.emit('bazinga')
        bus.emit('bazinga')
        bus.emit('bazinga')

        expect(execs).toBe(3)
    })

    test('it emits with bound context', () => {
        const bus = new TestableEventBus()
        const ctx = { bazinga: 'evt-bus' }
        const expected = { value: '' }

        bus.on('bazinga', function (this: typeof ctx) {
            expected.value = this.bazinga
        })

        bus.emitWith('bazinga', ctx)

        expect(expected.value).toBe(ctx.bazinga)
    })
})
