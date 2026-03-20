# Yawn

The JSX library to embrace JavaScript fatigue.

This library emerges from frameworks constantly deviating from Web Standards, trapping developers in the loop of continuously needing to learn tools that will disappear or change in the next ~5 years, to mention a few critics – and those are just the **tip of the iceberg**:
- React went from classes to hooks, then added server-side apps, and decided to name the `input` event listener `onChange` instead of `onInput` which is the real standard listener (very few React developers actually know that, by the way). It took **years** to support custom elements. The list is really long when it comes to React.
- Vue had the Option API and then added the Composition API to support ~hooks in disguise~ composables, introducing `@vue/reactivity` at the time. It reuses Web APIs names in non-compatible ways (hello Slot props, templates).
- Angular moved to RxJS in v2, now moved to Signals.
- Svelte moved from observable-ish stores to runes, and same as Vue it reuses Web APIs names in non-compatible ways (hello Slot props).
- As much as I like SolidJS (my favorite so far), it adds directives, stores, requires some special control-flow function or components to render a signal of arrays, and with an error-prone quirk of requiring to NOT destructure component props.

I could go on for a  very long while, to be honest.

As you can see, plenty of changes even if you'd stick with the same library. Which is the opposite of what the web is: a never-breaking and evolving platform.

Although it looks like a diatribe, they all had to re-implement their version of everything
depending on the state (🤭) of the Web Platform was at the time of their creation, and their choices pushed the Ecma committee to add features to the Web, so a big thanks is _also_ in order.

This library intends to embrace the Web's philosophy, by manipulating _only_ native Web APIs, offering a super-small API surface (~2 functions and 1 class) and **providing an API which does not change by design because it is mirrored on Web APIs**.

This library is the promise of a forever v1 💛

- JSX elements return HTML elements: `const element: HTMLDivElement = <div />`.
- The mark-up is based on HTML standard:
  - event listeners are lowercase: `<div onclick={…} />`.
  - attributes are the same: `<div class="some class" />`.
  - The only addition is the special `ref` attribute to access an element straight after its creation.
- No `onMount`, `useEffect` or any special concept, as mentioned by [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected) elements are "connected" and "disconnected" from the DOM.
- Reactivity is powered by `AsyncIterable` – see more below.
- As for CSS, I suggest you use the excellent scope at-rule ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope)) and stick to simple `.css` stylesheets.

Because of this approach, the library is super slim: **2.6kB _rendered_ !**.

## Foreword

⚠️ NOTE: This library is currently a **proof of concept**.

Although overall functional, there might be some DX quirks. This library also needs to be tested against memory leaks.

If you want to see this going further, star the project, contribute to the project by getting in touch, or submit issues.

If the project reaches 1,000 stars, I'll start making it production-ready.

## Getting Started

```sh
npm i -D @sacdenoeuds/yawn
```

Why `yawn`?
I don't know why, I like it.

Maybe because it fights JavaScript fatigue? Or a tribute to beloved boring technology?

### Creating a component

```tsx
function Header() {
    return (
        <header>
            …
            <div />
        </header>
    )
}
```

### Using reactivity (states)

```tsx
import { createState } from '@sacdenoeuds/yawn'

export function Counter() {
  const count = createState(0)
  const decrement = () => count.update((count) => count - 1);
  const increment = () => count.update((count) => count + 1);
  const reset = () => count.set(0);

  return (
    <div class="counter" data-count={count}>
      <button type="button" onclick={decrement}>
        -
      </button>
      <span>{count}</span>
      <button type="button" onclick={increment}>
        +
      </button>
    </div>
  );
}
```

A read-only state is basically an `AsyncIterable`

To be writable, a `State` provides 2 additional methods:

- `set(nextValue)`
- `update((previous) => buildNextValueFromPrevious(previous))`

State composition can be achieved by composing native `AsyncIterable`, which may involve a learning curve but once you climbed it, you earned JS knowledge that will remain forever 💛.

#### How is `AsyncIterable` used for reactivity

Picture this:

- the first value of the async iterable is its current value at the time of `for await (…)` declaration
- all the next values are state updates
- the async iterable awaits each next update.

And there you have it.

### Lifecycle

Use `onConnected(element, callback)` and `onDisconnected(element, callback)`

```tsx
import { createState, onConnected, onDisconnected } from '@sacdenoeuds/yawn'

// re-usable and testable function, a bit like hooks and composables.
const initClock = (clock: State<Date>) => (element: HTMLElement) => {
  let interval;
  onConnected(element, () => {
    interval = setInterval(() => {
      time.set(new Date())
    }, 1_000);
  })
  onDisconnected(element, () => {
    clearInterval(interval)
  })
}

export function Clock() {
  const time = createState(new Date())

  return (
    <div ref={initClock(time)}>
      {formatTime(time)}
    </div>
  )
}
```

## Conclusion

If you made it until here, thank you 💛.

If you want to contribute, take a look at [values](./VALUES.md).

Cheers
