/**
 * Lifecycle hooks for Yawn components.
 *
 * This module provides `onConnected` which fires when an element is connected to the DOM,
 * and optionally returns a cleanup function that will be called on disconnect.
 */

interface Listener {
  listener: () => unknown | (() => void)
  cleanup?: () => void
  active: boolean
}

const listeners = new Map<Node, Set<Listener>>()

/**
 * Fires callback when element is connected to DOM.
 * If callback returns a function, it will be called on disconnect (cleanup).
 * Callback can be async and return Promise<void> or a cleanup function.
 *
 * @param element - The element to observe
 * @param callback - Fire on connect, optionally returns cleanup function for disconnect
 */
export function onConnected(
  element: Node,
  callback: () => unknown | (() => void),
): void {
  const entry: Listener = { listener: callback, active: false }

  // Register the listener
  const set = listeners.get(element) ?? new Set()
  set.add(entry)
  listeners.set(element, set)

  // Fire immediately if already connected and never been active
  if (element.isConnected && !entry.active) {
    const cleanupOrPromise = callback()
    const isFunction = typeof cleanupOrPromise === "function"
    if (isFunction) {
      entry.cleanup = cleanupOrPromise as () => void
    }
    entry.active = true
  }
}

/**
 * Internal: Run cleanup for disconnected elements.
 */
function handleDisconnect(element: Node): void {
  const set = listeners.get(element)
  if (!set) return

  // Run all cleanups in reverse order (LIFO like useEffect)
  for (const entry of set) {
    if (entry.active) {
      entry.cleanup?.()
      entry.active = false
    }
  }
}

/**
 * Internal: Handle connect for already-connected elements.
 */
function handleConnect(element: Node): void {
  const set = listeners.get(element)
  if (!set) return

  for (const entry of set) {
    // Only call if not currently active
    if (!entry.active) {
      const result = entry.listener()

      // If it returns a function, store as cleanup
      if (typeof result === "function") {
        entry.cleanup = result as () => void
      } else {
        entry.cleanup = undefined
      }
      entry.active = true
    }
  }
}

// MutationObserver for DOM changes
const observer = new MutationObserver((mutations) => {
  const connectedNodes = new Set<Node>()
  const disconnectedNodes = new Set<Node>()

  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        collectConnected(node as Element, connectedNodes)
      }
    })

    mutation.removedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        collectDisconnected(node as Element, disconnectedNodes)
      }
    })
  })

  // Process disconnections first (clean up before new connections)
  disconnectedNodes.forEach(handleDisconnect)
  connectedNodes.forEach(handleConnect)
})

/**
 * Recursively collect all connected elements.
 */
function collectConnected(element: Element, collection: Set<Node>): void {
  if (element.isConnected) {
    collection.add(element)
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        collectConnected(child as Element, collection)
      }
    })
  }
}

/**
 * Recursively collect all disconnected elements.
 */
function collectDisconnected(element: Element, collection: Set<Node>): void {
  // If parent is not connected, this element and its children are also disconnected
  if (!element.isConnected) {
    collection.add(element)
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        collectDisconnected(child as Element, collection)
      }
    })
  }
}

// Start observing DOM mutations
observer.observe(document.body, { childList: true, subtree: true })
