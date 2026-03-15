# Yawn

The JSX library to embrace JavaScript fatigue.

This library emerges from frameworks constantly deviating from Web Standards, trapping developers in the loop of continuously needing to learn tools that will disappear in ~5 years.

This library is the exact opposite, it manipulates _only_ native Web APIs:

- JSX elements return HTML elements: `const element: HTMLDivElement = <div />`.
- The markup is based on HTML standard:
  - event listeners are lowercase: `<div onclick={…} />`.
  - attributes are the same: `<div class="some class" />`.
  - The only addition is the special `ref` attribute to access an element straight after its creation.
- No `onMount`, `useEffect` or any special concept, as mentioned by [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected) elements are "connected" and "disconnected" from the DOM.
- Reactivity is powered by `AsyncIterable` – see more below.
- As for CSS, I suggest you use the excellent scope at-rule ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope)) and stick to simple `.css` stylesheets.

Because of this approach, the library is super slim: **2.6kB _rendered_**.

## Foreword

⚠️ NOTE: This library is currently a **proof of concept**.

Although overall functional, there might be some DX quirks. This library also needs to be tested against memory leaks.

If you want to see this going further, star the project, contribute to the project by getting in touch, or submit issues.

## Getting Started

```sh
npm i -D @sacdenoeuds/yawn
```

Why `yawn`?
I don't know why, I like it. Maybe because it fights JavaScript fatigue? Or because I love so much boring technology?

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

A read-only `State` is basically an `AsyncIterable`

To be writable, a `State` provides 2 additional methods:

- `set(nextValue)`
- `update((previous) => buildNextValueFromPrevious(previous))`

State composition can be achieved by composing native `AsyncIterable`, which may involve a learning curve but once you climbed it, you earned JS knowledge that will remain forever 💛.

#### How can an `AsyncIterable` be used for reactivity

Picture this:

- the first value of the async iterable is its initial value at the time of `for await (…)` declaration
- all the next values are state updates
- the async iterable awaits each next update.

And there you have it.

### Lifecycle

Use `onConnected(node, callback)` and `onDisconnected(node, callback)`

```tsx
import { createState, onConnected, onDisconnected } from '@sacdenoeuds/yawn'

export function Clock() {
    const time = createState(new Date())
    function init(element: HTMLElement) {
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

    return (
        <div ref={init}>
            {formatTime(time)}
        </div>
    )
}
```

## Conclusion

If you made it until here, thank you 💛.

You can take a look at [values](./VALUES.md) if you want to know more.
