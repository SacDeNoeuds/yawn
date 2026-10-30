import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderChildren } from './create-node'
import { State } from './reactivity'

/**
 * Tests documenting the array rendering problem.
 * 
 * When a State yields arrays that change size or content,
 * how should we re-render without duplicating elements?
 */
describe('Array Rendering - Investigation', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('ul')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
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

  describe('Dynamic arrays via State - WORKING', () => {
    // It turns out the implementation works better than expected!
    
    it('should replace when array shrinks', async () => {
      const items = new State<string[]>(['A', 'B'])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('AB')
      expect(container.childNodes.length).toBe(2)
      
      // Array shrinks - should replace content entirely
      items.set(['X'])
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('X')
      expect(container.childNodes.length).toBe(1)
    })

    it('should expand when array grows', async () => {
      const items = new State<string[]>(['A'])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('A')
      
      // Array grows
      items.set(['A', 'B', 'C'])
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('ABC')
    })

    it('should update content for same-size arrays', async () => {
      const items = new State<string[]>(['A', 'B'])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('AB')
      
      // Same size, different content
      items.set(['C', 'D'])
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('CD')
    })

    it('should handle array reordering', async () => {
      const items = new State<string[]>(['A', 'B', 'C'])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('ABC')
      
      // Reorder
      items.set(['C', 'B', 'A'])
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('CBA')
    })

    it('should clear when array becomes empty', async () => {
      const items = new State<string[]>(['A', 'B', 'C'])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.textContent).toBe('ABC')
      expect(container.childNodes.length).toBe(3)
      
      // Clear array
      items.set([])
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.childNodes.length).toBe(0)
    })

    it('should handle multiple consecutive updates', async () => {
      const items = new State<string[]>(['A'])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      // Rapid updates
      items.set(['B'])
      items.set(['C'])
      items.set(['D', 'E', 'F'])
      
      await new Promise(r => setTimeout(r, 100))
      
      expect(container.textContent).toBe('DEF')
    })

    it('should handle complex child types in arrays', async () => {
      type ChildNode = string | HTMLSpanElement
      
      const createSpan = (text: string) => {
        const span = document.createElement('span')
        span.textContent = text
        return span
      }
      
      const items = new State<ChildNode[]>([createSpan('S1'), 'Text'])
      
      renderChildren(container, items)
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.querySelector('span')?.textContent).toBe('S1')
      expect(container.childNodes.length).toBe(2)
      
      // Update with different mix
      items.set([createSpan('S2'), createSpan('S3')])
      await new Promise(r => setTimeout(r, 50))
      
      expect(container.querySelectorAll('span').length).toBe(2)
    })
  })

  describe('Limitations and missing features', () => {
    it.todo('should support keyed elements for efficient reordering'),
    it.todo('should batch multiple updates to avoid DOM thrashing'),
    it.todo('should have stable identity tracking (like React keys)'),
    it.todo('should provide diff algorithm benchmark against React/Vue/Solid')
  })

  describe('Future enhancements', () => {
    it.skip('Solution A: Virtual DOM approach', () => {
      // Most efficient but complex implementation
      expect(true).toBe(true)
    })

    it.skip('Solution B: Keyed elements system', () => {
      // data-key attribute tracking
      expect(true).toBe(true)
    })
  })
})
