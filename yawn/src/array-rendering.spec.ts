import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderChildren } from './create-node'
import { State } from './reactivity'

describe('Array Rendering - Investigation', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('ul')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Static arrays', () => {
    it('should render static array as children', () => {
      renderChildren(container, [1, 2, 3])
      
      expect(container.childNodes.length).toBe(3)
      expect(container.textContent).toBe('123')
    })

    it('should render array of strings', () => {
      renderChildren(container, ['A', 'B', 'C'])
      
      expect(container.textContent).toBe('ABC')
    })

    it('should render mixed array content', () => {
      const nodes = [
        document.createTextNode('Hello'),
        42,
        null
      ]
      renderChildren(container, nodes)
      
      expect(container.childNodes.length).toBe(3)
      expect(container.textContent).toBe('Hello42')
    })

    it('should handle empty array', () => {
      renderChildren(container, [])
      
      expect(container.childNodes.length).toBe(0)
    })
  })

  describe('Dynamic arrays via State - INVESTIGATE', () => {
    // This is the problem we need to solve: how to re-render when array changes?
    
    it.skip('should re-render when State yields new array', async () => {
      const items = new State<number[]>([1, 2])
      
      renderChildren(container, items)
      
      expect(container.textContent).toBe('12')
      
      items.set([1, 2, 3])
      await new Promise(r => setTimeout(r, 50))
      
      // Currently this fails - array update doesn't trigger re-render properly
      expect(container.textContent).toBe('123')
    })

    it.skip('should replace elements, not append when array shrinks', async () => {
      const items = new State<number[]>([1, 2, 3])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.childNodes.length).toBe(3)
      
      // Array shrinks
      items.set([1, 2])
      await new Promise(r => setTimeout(r, 50))
      
      // Should have only 2 elements, not 5 (3 old + 2 new)
      expect(container.childNodes.length).toBe(2)
    })

    it.skip('should handle array reordering', async () => {
      const items = new State<string[]>(['A', 'B', 'C'])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('ABC')
      
      // Reorder
      items.set(['C', 'B', 'A'])
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('CBA')
    })

    it.skip('should stable-identity based reordering (if keys were supported)', async () => {
      // This would require a key system like React's
      type Item = { id: number; value: string }
      const items = new State<Item[]>([
        { id: 1, value: 'A' },
        { id: 2, value: 'B' }
      ])
      
      // Would need to attach data-id attributes or similar
      // This is a future enhancement
    })
  })

  describe('Array rendering requirements', () => {
    it('documents current behavior - arrays are flattened once', () => {
      renderChildren(container, [[1], [2], [3]])
      
      // Arrays are spread recursively
      expect(container.textContent).toBe('123')
    })

    it('documents limitation - no diff algorithm yet', () => {
      // Without a virtual DOM or proper diffing:
      // - Array updates append instead of replace
      // - No stable identity tracking
      // - Memory leaks possible with long-running async iterables
      
      expect(true).toBe(true) // Marker test for known limitation
    })
  })
})
