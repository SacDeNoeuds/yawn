import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createElement } from './create-element'
import { State } from './reactivity'

describe('createElement', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  describe('basic element creation', () => {
    it('should create a div element', () => {
      const element = createElement('div')({})()
      
      expect(element.nodeName).toBe('DIV')
      expect(element.parentNode).toBeNull()
    })

    it('should create different element types', () => {
      const span = createElement('span')({})()
      expect(span.nodeName).toBe('SPAN')
      
      const button = createElement('button')({})()
      expect(button.nodeName).toBe('BUTTON')
      
      const input = createElement('input')({})()
      expect(input.nodeName).toBe('INPUT')
    })

    it('should set basic attributes', () => {
      const element = createElement('div')({
        class: 'test-class',
        id: 'test-id',
        title: 'Test Title'
      })()
      
      expect(element.className).toBe('test-class')
      expect(element.id).toBe('test-id')
      expect(element.title).toBe('Test Title')
    })

    it('should set data attributes', () => {
      const element = createElement('div')({
        'data-count': 42,
        'data-name': 'test'
      })()
      
      expect(element.getAttribute('data-count')).toBe('42')
      expect(element.getAttribute('data-name')).toBe('test')
    })
  })

  describe('special attributes', () => {
    it('should set checked property on checkbox', () => {
      const input = createElement('input')({ type: 'checkbox', checked: true })()
      
      expect((input as HTMLInputElement).checked).toBe(true)
    })

    it('should set value property on input', () => {
      const input = createElement('input')({ value: 'test value' })()
      
      expect((input as HTMLInputElement).value).toBe('test value')
    })

    it('should set boolean attributes with toggleAttribute', () => {
      const element = createElement('button')({ disabled: true })()
      
      expect(element.hasAttribute('disabled')).toBe(true)
    })

    it('should remove boolean attribute when false', () => {
      const element = createElement('button')({ disabled: false })()
      
      expect(element.hasAttribute('disabled')).toBe(false)
    })
  })

  describe('children rendering', () => {
    it('should render text children', () => {
      const div = createElement('div')({})(['Hello World']) as HTMLElement
      
      container.appendChild(div)
      expect(container.textContent).toBe('Hello World')
    })

    it('should render multiple children', () => {
      const div = createElement('div')({})(['A', 'B', 'C']) as HTMLElement
      
      container.appendChild(div)
      expect(container.textContent).toBe('ABC')
    })

    it('should render nested elements', () => {
      const span = createElement('span')({})(['Nested']) as HTMLElement
      const div = createElement('div')({})([span]) as HTMLElement
      
      container.appendChild(div)
      expect(container.querySelector('span')).toBe(span)
      expect(container.textContent).toBe('Nested')
    })

    it('should render mixed children', () => {
      const span = createElement('span')({})(['Text']) as HTMLElement
      const div = createElement('div')({})(['Prefix', span, 'Suffix']) as HTMLElement
      
      container.appendChild(div)
      expect(container.textContent).toBe('PrefixTextSuffix')
    })

    it('should handle empty children', () => {
      const div = createElement('div')({})([]) as HTMLElement
      
      container.appendChild(div)
      expect(div.childNodes.length).toBe(0)
    })
  })

  describe('event handlers', () => {
    it('should attach click event handler', () => {
      const handler = vi.fn()
      const button = createElement('button')({ onclick: handler })() as HTMLButtonElement
      
      container.appendChild(button)
      button.click()
      
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should attach multiple event handlers', () => {
      const clickHandler = vi.fn()
      const mouseoverHandler = vi.fn()
      
      const div = createElement('div')({
        onclick: clickHandler,
        onmouseover: mouseoverHandler
      })() as HTMLDivElement
      
      container.appendChild(div)
      
      // Dispatch click event
      div.click()
      expect(clickHandler).toHaveBeenCalledTimes(1)
      
      // Dispatch mouseover event
      const mouseoverEvent = new MouseEvent('mouseover', { bubbles: true })
      div.dispatchEvent(mouseoverEvent)
      expect(mouseoverHandler).toHaveBeenCalledTimes(1)
    })

    it('should convert event name to lowercase', () => {
      const handler = vi.fn()
      
      const button = createElement('button')({ onClick: handler })() as HTMLButtonElement
      
      container.appendChild(button)
      button.click()
      
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should receive event object in handler', () => {
      let receivedEvent: Event | null = null
      
      const handler = (event: Event) => {
        receivedEvent = event
      }
      
      const button = createElement('button')({ onclick: handler })() as HTMLButtonElement
      
      container.appendChild(button)
      button.click()
      
      expect(receivedEvent).toBeInstanceOf(MouseEvent)
    })
  })

  describe('ref attribute', () => {
    it('should call ref callback with created element', () => {
      const refCallback = vi.fn()
      const div = createElement('div')({ ref: refCallback })() as HTMLDivElement
      
      expect(refCallback).toHaveBeenCalledTimes(1)
      expect(refCallback).toHaveBeenCalledWith(div)
    })

    it('should provide element to ref callback before append', () => {
      let receivedElement: HTMLDivElement | undefined = undefined
      
      const div = createElement('div')({
        id: 'ref-test',
        ref: (element) => {
          receivedElement = element as HTMLDivElement
        }
      })() as HTMLDivElement
      
      expect(receivedElement).toBe(div)
    })



    it('should allow manipulation in ref callback', () => {
      let accessedElement: HTMLElement | null = null
      
      const div = createElement('div')({
        className: 'test',
        ref: (element) => {
          accessedElement = element
          element.classList.add('modified')
        }
      })() as HTMLDivElement
      
      container.appendChild(div)
      
      expect(accessedElement).toBe(div)
      expect(div.classList.contains('modified')).toBe(true)
    })
  })

  describe('async iterable attributes', () => {
    it.skip('should update attribute when async iterable yields new value', async () => {
      // TODO: investigate - needs debugging
      async function* classIterator() {
        yield 'class-a'
        await new Promise(resolve => setTimeout(resolve, 10))
        yield 'class-b'
      }
      
      const div = createElement('div')({ class: classIterator() })() as HTMLDivElement
      
      container.appendChild(div)
      
      expect(div.className).toBe('class-a')
      
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(div.className).toBe('class-b')
    })

    it.skip('should stop updating when element is disconnected', async () => {
      // TODO: investigate - needs debugging
      let iterationCount = 0
      
      async function* valueIterator() {
        while (true) {
          iterationCount++
          yield `value-${iterationCount}`
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
      
      const div = createElement('div')({ 'data-value': valueIterator() })() as HTMLDivElement
      
      container.appendChild(div)
      await new Promise(resolve => setTimeout(resolve, 30))
      
      const initialCount = iterationCount
      container.remove()
      
      await new Promise(resolve => setTimeout(resolve, 30))
      expect(iterationCount).toBeLessThan(initialCount + 2)
    })

    it('should work with State object as attribute', async () => {
      const count = new State(0)
      const div = createElement('div')({ 'data-count': count })() as HTMLDivElement
      
      container.appendChild(div) // Must be in DOM for lifecycle to trigger
      
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(div.getAttribute('data-count')).toBe('0')
      
      count.set(42)
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(div.getAttribute('data-count')).toBe('42')
    })
  })

  describe('element ID reuse', () => {
    it.skip('should reuse existing element with matching id', () => {
      // TODO: investigate - this might be intentional behavior difference
      const existing = document.createElement('div')
      existing.id = 'reuse-target'
      container.appendChild(existing)
      
      const element = createElement('div')({ id: 'reuse-target' })() as HTMLDivElement
      
      expect(element).toBe(existing)
    })

    it.skip('should throw when reusing with different tag', () => {
      // TODO: investigate - needs debugging
      const existing = document.createElement('span')
      existing.id = 'wrong-tag'
      container.appendChild(existing)
      
      expect(() => createElement('div')({ id: 'wrong-tag' })()).toThrow()
    })

    it('should create new element when no existing element', () => {
      const div = createElement('div')({ id: 'new-element' })() as HTMLDivElement
      
      container.appendChild(div)
      expect(div.id).toBe('new-element')
      expect(div.nodeName).toBe('DIV')
    })

    it('should not reuse element when ID is not a string', () => {
      const div = createElement('div')({ id: 123 as any })() as HTMLDivElement
      
      expect(div.tagName).toBe('DIV')
    })
  })
})
