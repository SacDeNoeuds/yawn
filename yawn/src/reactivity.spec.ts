import { describe, it, expect } from 'vitest'
import { State } from './reactivity'

describe('State', () => {
  describe('constructor', () => {
    it('should initialize with initial value', async () => {
      const state = new State(42)
      const result = await state.next()
      
      expect(result.value).toBe(42)
      expect(result.done).toBe(false)
    })

    it('should support string values', async () => {
      const state = new State('hello')
      const result = await state.next()
      
      expect(result.value).toBe('hello')
    })

    it('should support object values', async () => {
      const initialState = { count: 0, name: 'test' }
      const state = new State(initialState)
      const result = await state.next()
      
      expect(result.value).toEqual(initialState)
      expect(result.value).toBe(initialState) // référence identique
    })

    it('should support null and undefined', async () => {
      const nullState = new State(null as unknown as number)
      const nullResult = await nullState.next()
      expect(nullResult.value).toBeNull()

      const undefinedState = new State(undefined as unknown as string)
      const undefinedResult = await undefinedState.next()
      expect(undefinedResult.value).toBeUndefined()
    })
  })

  describe('.set()', () => {
    it('should update value and notify next iteration', async () => {
      const state = new State(0)
      
      // First value
      const first = await state.next()
      expect(first.value).toBe(0)
      
      // Update value
      state.set(10)
      
      // Next iteration should get updated value
      const second = await state.next()
      expect(second.value).toBe(10)
    })

    it('should support multiple updates', async () => {
      const state = new State(0)
      
      await state.next() // initial
      state.set(1)
      state.set(2)
      state.set(3)
      
      const val1 = await state.next()
      expect(val1.value).toBe(3) // dernière valeur
      
      state.set(4)
      const val2 = await state.next()
      expect(val2.value).toBe(4)
    })

    it('should support async iteration with Symbol.asyncIterator', async () => {
      const state = new State('initial')
      const updates: string[] = []
      
      // Limiter le nombre d'itérations
      const iterator = state[Symbol.asyncIterator]()
      
      // First iteration
      const first = await iterator.next()
      updates.push(first.value as string)
      
      // Update and second iteration
      state.set('updated')
      const second = await iterator.next()
      updates.push(second.value as string)
      
      iterator.return?.()
      
      expect(updates).toEqual(['initial', 'updated'])
    })
  })

  describe('.update()', () => {
    it('should update value based on previous value', async () => {
      const state = new State(0)
      
      await state.next() // initial
      
      state.update((prev) => prev + 1)
      const val1 = await state.next()
      expect(val1.value).toBe(1)

      state.update((prev) => prev * 2)
      const val2 = await state.next()
      expect(val2.value).toBe(2)
    })

    it('should handle complex transformations', async () => {
      const state = new State({ count: 0 })
      
      await state.next() // initial
      
      state.update((prev) => ({ ...prev, count: prev.count + 1 }))
      const val1 = await state.next()
      expect(val1.value).toEqual({ count: 1 })

      state.update((prev) => ({ ...prev, count: prev.count * 10 }))
      const val2 = await state.next()
      expect(val2.value).toEqual({ count: 10 })
    })

    it('should chain multiple updates', async () => {
      const state = new State(1)
      
      await state.next() // initial
      
      state.update((prev) => prev + 1) // 2
      state.update((prev) => prev * 2) // 4
      state.update((prev) => prev - 1) // 3
      
      const result = await state.next()
      expect(result.value).toBe(3)
    })

    it('should not be able to access current value without iteration', async () => {
      const state = new State(0)
      
      // Pas d'accès direct à la valeur (propriété privée #value)
      // L'unique façon d'accéder est via next() ou Symbol.asyncIterator
      
      state.set(42)
      const result = await state.next()
      
      expect(result.value).toBe(42)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid updates without losing values', async () => {
      const state = new State(0)
      await state.next() // initial
      
      // Rapid updates
      for (let i = 1; i <= 100; i++) {
        state.set(i)
      }
      
      const result = await state.next()
      expect(result.value).toBe(100) // dernière valeur
    })

    it('should handle same value updates', async () => {
      const state = new State(42)
      await state.next()
      
      state.set(42) // même valeur
      const result = await state.next()
      
      expect(result.value).toBe(42)
    })

    it('should support boolean values', async () => {
      const state = new State(true)
      let result = await state.next()
      expect(result.value).toBe(true)

      state.set(false)
      result = await state.next()
      expect(result.value).toBe(false)
    })

    it('should support array values', async () => {
      const state = new State<number[]>([1, 2, 3])
      let result = await state.next()
      expect(result.value).toEqual([1, 2, 3])

      state.set([4, 5, 6])
      result = await state.next()
      expect(result.value).toEqual([4, 5, 6])
    })
  })

  describe('iteration protocol', () => {
    it('should never return done: true in async iteration', async () => {
      const state = new State(0)
      const iterator = state[Symbol.asyncIterator]()
      
      for (let i = 0; i < 5; i++) {
        state.set(i + 1)
        const result = await iterator.next()
        expect(result.done).toBe(false)
      }
    })

    it('should yield new value on each next()', async () => {
      const state = new State('a')
      
      let result = await state.next()
      expect(result.value).toBe('a')
      
      state.set('b')
      result = await state.next()
      expect(result.value).toBe('b')
      
      state.set('c')
      result = await state.next()
      expect(result.value).toBe('c')
    })
  })
})
