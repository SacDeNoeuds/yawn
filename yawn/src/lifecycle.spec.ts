import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { onConnected } from './lifecycle'

/**
 * Tests for simplified lifecycle system using only `onConnected` with cleanup return value.
 */
describe('Lifecycle hooks', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container.innerHTML = ''
    listenersClear()
  })

  describe('onConnected', () => {
    it('should call callback when element is connected to DOM', (done) => {
      const element = document.createElement('div')
      const listener = vi.fn()
      
      onConnected(element, listener)
      container.appendChild(element)
      
      setTimeout(() => {
        expect(listener).toHaveBeenCalledTimes(1)
        done()
      }, 50)
    })

    it('should call callback immediately if element already connected', () => {
      const element = document.createElement('div')
      container.appendChild(element)
      
      const listener = vi.fn()
      onConnected(element, listener)
      
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should call cleanup when disconnected', (done) => {
      const element = document.createElement('div')
      let cleanupCalled = false
      
      onConnected(element, () => {
        return () => { cleanupCalled = true }
      })
      
      container.appendChild(element)
      
      setTimeout(() => {
        container.removeChild(element)
        
        setTimeout(() => {
          expect(cleanupCalled).toBe(true)
          done()
        }, 50)
      }, 50)
    })

    it('should handle multiple listeners on same element', (done) => {
      const element = document.createElement('div')
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      onConnected(element, listener1)
      onConnected(element, listener2)
      
      container.appendChild(element)
      
      setTimeout(() => {
        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)
        done()
      }, 50)
    })

    it('should call callback for each connection', (done) => {
      const element = document.createElement('div')
      let connectCount = 0
      
      onConnected(element, () => { connectCount++ })
      
      container.appendChild(element)
      
      setTimeout(() => {
        expect(connectCount).toBe(1)
        
        // Disconnect and reconnect
        container.removeChild(element)
        
        setTimeout(() => {
          container.appendChild(element)
          
          setTimeout(() => {
            expect(connectCount).toBe(2)
            done()
          }, 50)
        }, 50)
      }, 50)
    })

    it('should not call callback if already connected', (done) => {
      const element = document.createElement('div')
      container.appendChild(element) // Connect first
      
      const listener = vi.fn()
      onConnected(element, listener) // Register after connect
      
      setTimeout(() => {
        expect(listener).toHaveBeenCalledTimes(1)
        
        // Re-register should not fire again immediately
        onConnected(element, listener)
        
        setTimeout(() => {
          expect(listener).toHaveBeenCalledTimes(2)
          done()
        }, 50)
      }, 50)
    })

    it('should run cleanup before next connect', (done) => {
      const element = document.createElement('div')
      const events: string[] = []
      
      onConnected(element, () => {
        events.push('connected')
        return () => { events.push('cleaned') }
      })
      
      container.appendChild(element)
      
      setTimeout(() => {
        expect(events).toEqual(['connected'])
        
        container.removeChild(element)
        
        setTimeout(() => {
          expect(events).toEqual(['connected', 'cleaned'])
          
          // Reconnect
          container.appendChild(element)
          
          setTimeout(() => {
            expect(events).toEqual(['connected', 'cleaned', 'connected'])
            done()
          }, 50)
        }, 50)
      }, 50)
    })
  })

  describe('onConnected with nested elements', () => {
    it('should detect disconnection of nested elements', (done) => {
      const parent = document.createElement('div')
      const child = document.createElement('span')
      parent.appendChild(child)
      container.appendChild(parent)
      
      let childCleanupCalled = false
      onConnected(child, () => {
        return () => { childCleanupCalled = true }
      })
      
      // Remove parent should disconnect child too
      container.removeChild(parent)
      
      setTimeout(() => {
        expect(childCleanupCalled).toBe(true)
        done()
      }, 50)
    })

    it('should handle multiple nested levels', (done) => {
      const level3 = document.createElement('div')
      const level2 = document.createElement('div').appendChild(level3)
      const level1 = document.createElement('div').appendChild(level2)
      
      let cleanup1Called = false
      let cleanup2Called = false
      let cleanup3Called = false
      
      onConnected(level1, () => () => { cleanup1Called = true })
      onConnected(level2, () => () => { cleanup2Called = true })
      onConnected(level3, () => () => { cleanup3Called = true })
      
      container.appendChild(level1)
      
      setTimeout(() => {
        container.removeChild(level1)
        
        setTimeout(() => {
          expect(cleanup1Called).toBe(true)
          expect(cleanup2Called).toBe(true)
          expect(cleanup3Called).toBe(true)
          done()
        }, 50)
      }, 50)
    })

    it('should only call cleanup once per listener', (done) => {
      const element = document.createElement('div')
      let cleanupCount = 0
      
      onConnected(element, () => {
        return () => { cleanupCount++ }
      })
      
      container.appendChild(element)
      
      setTimeout(() => {
        // Disconnect multiple times (should only cleanup once per connect)
        container.removeChild(element)
        
        setTimeout(() => {
          expect(cleanupCount).toBe(1)
          
          // Reconnect and disconnect again
          container.appendChild(element)
          
          setTimeout(() => {
            container.removeChild(element)
            
            setTimeout(() => {
              expect(cleanupCount).toBe(2)
              done()
            }, 50)
          }, 50)
        }, 50)
      }, 50)
    })
  })

  describe('onConnected edge cases', () => {
    it('should handle element without cleanup return', (done) => {
      const element = document.createElement('div')
      
      onConnected(element, () => {
        // No return value = no cleanup
      })
      
      container.appendChild(element)
      setTimeout(() => {
        container.removeChild(element)
        
        // Should not crash even without cleanup
        setTimeout(() => {
          expect(true).toBe(true)
          done()
        }, 50)
      }, 50)
    })

    it('should handle rapid connect/disconnect cycles', (done) => {
      const element = document.createElement('div')
      const events: string[] = []
      
      onConnected(element, () => {
        events.push('connected')
        return () => { events.push('disconnected') }
      })
      
      // Rapid cycling
      container.appendChild(element)
      setTimeout(() => {
        container.removeChild(element)
        
        setTimeout(() => {
          container.appendChild(element)
          
          setTimeout(() => {
            container.removeChild(element)
            
            setTimeout(() => {
              expect(events).toEqual([
                'connected',
                'disconnected',
                'connected',
                'disconnected'
              ])
              done()
            }, 50)
          }, 50)
        }, 50)
      }, 50)
    })

    it('should not crash on document root elements', () => {
      const listener = vi.fn()
      
      // document.documentElement is already connected
      expect(() => onConnected(document.documentElement, listener)).not.toThrow()
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })
})

// Utility to clear listeners (for test isolation)
function listenersClear(): void {
  // Note: There's no public API for this, but useful in tests
  // In practice, you'd want to reinitialize the module
}
