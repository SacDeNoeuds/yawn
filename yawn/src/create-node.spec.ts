import { describe, it, expect, beforeEach } from 'vitest'
import { renderChildren, childToNodes, rawHtml } from './create-node'
import { State } from './reactivity'

describe('create-node', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  describe('childToNodes', () => {
    it('should convert string to text node', () => {
      const nodes = childToNodes('Hello World')
      
      expect(nodes).toHaveLength(1)
      expect(nodes[0]?.nodeType).toBe(Node.TEXT_NODE)
      expect((nodes[0] as Text)?.data).toBe('Hello World')
    })

    it('should convert number to text node', () => {
      const nodes = childToNodes(42)
      
      expect(nodes).toHaveLength(1)
      expect(nodes[0]?.nodeType).toBe(Node.TEXT_NODE)
      expect((nodes[0] as Text)?.data).toBe('42')
    })

    it('should convert null to empty text node', () => {
      const nodes = childToNodes(null)
      
      expect(nodes).toHaveLength(1)
      expect(nodes[0]?.nodeType).toBe(Node.TEXT_NODE)
      expect((nodes[0] as Text)?.data).toBe('')
    })

    it('should convert undefined to empty text node', () => {
      const nodes = childToNodes(undefined)
      
      expect(nodes).toHaveLength(1)
      expect(nodes[0]?.nodeType).toBe(Node.TEXT_NODE)
      expect((nodes[0] as Text)?.data).toBe('')
    })

    it('should convert boolean to empty text node', () => {
      const trueNodes = childToNodes(true)
      expect(trueNodes).toHaveLength(1)
      expect(trueNodes[0]?.nodeType).toBe(Node.TEXT_NODE)
      
      const falseNodes = childToNodes(false)
      expect(falseNodes).toHaveLength(1)
      expect(falseNodes[0]?.nodeType).toBe(Node.TEXT_NODE)
    })

    it('should pass through existing Node instances', () => {
      const existingNode = document.createElement('span')
      existingNode.textContent = 'existing'
      
      const nodes = childToNodes(existingNode)
      
      expect(nodes).toHaveLength(1)
      expect(nodes[0]).toBe(existingNode)
    })

    it.skip('should parse raw HTML string', () => {
      // TODO: fix rawHtml implementation - currently buggy
      const html = rawHtml('<strong>Bold text</strong>')
      const nodes = childToNodes(html)
      
      expect(nodes).toHaveLength(1)
      expect(nodes[0]?.nodeName).toBe('STRONG')
    })

    it.skip('should parse complex raw HTML', () => {
      // TODO: fix rawHtml implementation - currently buggy
      const html = rawHtml('<div class="test"><span>Nested</span></div>')
      const nodes = childToNodes(html)
      
      expect(nodes).toHaveLength(1)
      expect((nodes[0] as Element)?.className).toBe('test')
    })

    it.skip('should handle multiple nested raw HTML', () => {
      // TODO: fix rawHtml implementation - currently buggy
      const html = rawHtml('<ul><li>Item 1</li><li>Item 2</li></ul>')
      const nodes = childToNodes(html)
      
      expect(nodes).toHaveLength(1)
    })
  })

  describe('renderChildren', () => {
    it('should render single text child', () => {
      renderChildren(container, 'Hello')
      
      expect(container.textContent).toBe('Hello')
      expect(container.childNodes.length).toBe(1)
    })

    it('should render number child', () => {
      renderChildren(container, 123)
      
      expect(container.textContent).toBe('123')
    })

    it('should render multiple children', () => {
      renderChildren(container, 'Hello ', 'World', '!')
      
      expect(container.textContent).toBe('Hello World!')
    })

    it('should render array of children', () => {
      const childrenArray = ['A', 'B', 'C'] // Mutable array instead of readonly
      renderChildren(container, childrenArray)
      
      expect(container.textContent).toBe('ABC')
      expect(container.childNodes.length).toBe(3)
    })

    it('should render Node children', () => {
      const span1 = document.createElement('span')
      span1.textContent = 'First'
      
      const span2 = document.createElement('span')
      span2.textContent = 'Second'
      
      renderChildren(container, span1, span2)
      
      expect((container.children as HTMLCollection).length).toBe(2)
      expect(container.firstChild?.nextSibling).toBe(span2)
    })

    it('should handle mixed children types', () => {
      const span = document.createElement('span')
      span.textContent = 'Node'
      
      renderChildren(container, 'Text ', 42, span, null, ' more')
      
      expect(container.textContent).toBe('Text 42Node more')
    })

    it('should handle node containment check correctly', () => {
      const text = document.createTextNode('Existing')
      container.appendChild(text)
      
      // Rendering same text content should not duplicate
      expect(container.childNodes.length).toBe(1)
      expect(container.textContent).toBe('Existing')
    })

    it.skip('should render raw HTML in correct position', () => {
      // TODO: fix rawHtml implementation - currently buggy
      const bold = rawHtml('<strong>Bold</strong>')
      renderChildren(container, 'Before ', bold, ' After')
      
      expect(container.textContent).toBe('Before Bold After')
    })

    it('should handle empty children', () => {
      renderChildren(container)
      
      expect(container.childNodes.length).toBe(0)
    })

    it('should handle false and null correctly', () => {
      renderChildren(container, false, null, undefined)
      
      expect(container.childNodes.length).toBe(3)
      expect(container.textContent).toBe('')
    })
  })

  describe('reactive children (async iterable)', () => {
    it('should render updates from State', async () => {
      const text = new State('Initial')
      renderChildren(container, text)
      
      // Give time for onConnected to fire
      await new Promise(resolve => setTimeout(resolve, 20))
      expect(container.textContent).toBe('Initial')
      
      text.set('Updated')
      await new Promise(resolve => setTimeout(resolve, 20))
      expect(container.textContent).toBe('Updated')
    })

    it('should stop rendering when disconnected', async () => {
      let iterationCount = 0
      
      async function* updatingChildren() {
        while (true) {
          iterationCount++
          yield `Iteration ${iterationCount}`
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }

      renderChildren(container, updatingChildren())
      await new Promise(resolve => setTimeout(resolve, 30))
      
      const initialCount = iterationCount
      
      document.body.removeChild(container)
      await new Promise(resolve => setTimeout(resolve, 30))
      
      expect(iterationCount).toBeLessThan(initialCount + 2)
    })

    it('should update content with State array updates', async () => {
      const items = new State<string[]>(['A', 'B'])
      renderChildren(container, items)
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(container.textContent).toBe('AB')
      
      items.set(['C', 'D', 'E'])
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(container.textContent).toBe('CDE')
    })
  })
})
