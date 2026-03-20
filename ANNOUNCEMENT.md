# Yawn

The JSX library to embrace JavaScript fatigue.

This library emerges from frameworks constantly deviating from Web Standards, trapping developers in the loop of continuously needing to learn tools that will disappear or change in the next ~5 years, to mention a few critics – and those are just the **tip of the iceberg**:

> [!NOTE]
> 
> The critics I am about to share **are not a diatribe**, all these tools had to re-implement their version of everything depending on the state (🤭) of the Web Platform at the time of their creation, and their choices pushed the Ecma committee to add features to the Web, so a **big thanks is in order**.

Now that the mindset is clarified, let's go back to those critics:
- React went from classes to hooks, then added server-side apps, and decided to name the `input` event listener `onChange` instead of `onInput` which is the real standard listener (very few React developers actually know that, by the way). It took **years** to support custom elements. The list is really long when it comes to React.
- Vue had the Option API and then added the Composition API to support ~hooks in disguise~ composables, introducing `@vue/reactivity` at the time. It reuses Web APIs names in non-compatible ways (hello Slot props, templates).
- Angular moved to RxJS in v2, now moved to Signals.
- Svelte moved from observable-ish stores to runes, and same as Vue it reuses Web APIs names in non-compatible ways (hello Slot props).
- As much as I like SolidJS (my favorite so far), it adds directives, stores, and with an error-prone quirk of requiring to NOT destructure component props.

I could go on for a very long while, to be honest.

As you can see, plenty of changes even if you'd stick with the same library. Which is the opposite of what the web is: a never-breaking and evolving platform.

This library intends to embrace the Web's philosophy – notably when it comes to breaking changes policy, AKA no breaking change –, by offering a super-small API surface (~2 functions and 1 class) and **providing an API which does not change by design because it is mirrored on Web APIs**.

This library is the promise of a forever v1 💛

- JSX elements return HTML elements: `const element: HTMLDivElement = <div />`.
- The mark-up is based on HTML standard:
  - event listeners are lowercase: `<div onclick={…} />`.
  - attributes are the same: `<div class="some class" />`.
  - The only addition is the special `ref` attribute to access an element straight after its creation.
- No `onMount`, `useEffect` or any special concept, as mentioned by [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected) elements are "connected" and "disconnected" from the DOM.
- Reactivity is powered by `AsyncIterable` – see more below.
- As for CSS, I suggest you use the excellent scope at-rule ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope)) and stick to simple `.css` stylesheets.

Because of this approach, the library is super slim: **2.6kB _rendered_ !**

## Introduction

In JavaScript frontend ecosystem, we lack a Standard regarding reactivity. Because reactivity is the root of all client-side rendering, any tool proposing this kind of feature _needs_ to build their own reactivity system.

React ships its `useState`, Vue goes with `ref` & co, Angular delegated it to RxJS, and Svelte had observables-like stores until Solid made its case about Signals and they got runes.

Yet, no consensus. So much that there's even an EcmaScript proposal for Signal.

I have even better.
What if told you that we already have reactivity in the frontend ?

In the name of … Async Iterables 🎉

## How it works

Picture this:

- the first value of the async iterable is its initial value at the time of `for await (…)` declaration
- all the next values are state updates
- the async iterable awaits each next update.
And there you have it.

## Proof of Concept – a glimpse of the API

The demo is located at https://github.com/SacDeNoeuds/yawn/tree/main/demo

### Example of a component with reactive state

A read-only state is basically an `AsyncIterable`.

To be writable, a `State` provides 2 additional methods:

- `set(nextValue)`
- `update((previous) => buildNextValueFromPrevious(previous))`

State composition can be achieved by composing native `AsyncIterable` using soon-to-come [iterator helpers](https://github.com/tc39/proposal-async-iterator-helpers), which may involve a learning curve but once you climbed it, you earned JS knowledge that will remain forever 💛.

Here’s good ol’ `Counter` example.

```tsx
import { State } from '@sacdenoeuds/yawn'

export function Counter() {
  const count = new State(0)
  const decrement = () => count.update((count) => count - 1);
  const increment = () => count.update((count) => count + 1);
  const reset = () => count.set(0);

  return (
    <div class="counter" data-count={count}>
      <button type="button" onclick={decrement}>
        -
      </button>
      <span>{count}</span>
      <span class="doubled">{count.map((count) => count * 2)}</span>
      <button type="button" onclick={increment}>
        +
      </button>
    </div>
  );
}
```


### Example of connected/disconnected lifecycles

This is the equivalent of React’s `useEffect` or Vue’s `onMount/onUnmount`.

Use `onConnected(element, callback)` and `onDisconnected(element, callback)`

```tsx
import { State, onConnected, onDisconnected } from '@sacdenoeuds/yawn'

function makeClock(time: State<Date>) {
  let interval: ReturnType<typeof setInterval>
  return {
    startTicking() {
      interval = setInterval(() => time.set(new Date()), 1_000)
    },
    stopTicking() {
      clearInterval(interval)
    },
  }
}

export function Clock() {
  const time = new State(new Date())
  const clock = makeClock(time)
  const init = (element: HTMLElement) => {
    onConnected(element, clock.startTicking)
    onDisconnected(element, clock.stopTicking)
  }

  return (
    <div ref={init}>
      {formatTime(time)}
    </div>
  )
}
```

## The pros

Because it is pure & standard JavaScript, the pros are massive:

1. No need to learn yet-another-library, just plain ol' standard JavaScript. Your knowledge will remain forever (bye bye JavaScript fatigue).
2. You get all the ecosystem for free ; (soon-to-come) helpers like map, filter, reduce, take, etc of the iterator protocol. Polyfill already available via [core-js](https://core-js.io/v4/docs/features/proposals/asynciterator-helpers).
3. Any library helper for async iterators will work out-of-the-box. A bunch of them are pointed out in the [proposal](https://github.com/tc39/proposal-iterator-helpers?tab=readme-ov-file#prior-art--userland-implementations). Another worth mentioning is [fx-ts](https://fxts.dev/)
4. Such a reactivity system weighs literally just a few bytes compared to 10+kB gzipped of existing solutions like Vue's, see the [implementation](https://github.com/SacDeNoeuds/yawn/blob/main/yawn/src/reactivity.ts).
5. Async iterables are lazily evaluated, therefore super efficient and result in a fine-grained reactivity, pull-based like signals: if you don't `for await (…)` nothing happens.
6. Some objects are already implementing the async iterator protocol like WebSocket, Server-Sent Events, ReadableStream, etc., you could even drive your frontend state from your backend streams !
7. The door is wide opened for state history or state travel using Iterable helpers.
8. One cannot forget to track a dependency: there is no access to the current value without iterating on the iterable.

## The cons

This approach looks promising but still requires exploration regarding rendering an array state for instance, or composing JSX from a Server-Sent Event state. Checking memory leaks is clearly on the radar too.

Async Iterators is a difficult technology to master, it has pitfalls and traps.
Compared to Signals, automatic dependency tracking is lost, I consider this to actually be a pro  but it still is a missing feature compared to Signals.

Finally, yet another JSX runtime must be created to support Async Iterables as attribute values or children.

Which I [did](https://github.com/SacDeNoeuds/yawn) and it weighs [1.5kB gzipped](https://sacdenoeuds.github.io/yawn/bundle-stats.html). The JSX runtime implementation's design leaves room for future changes like hydration.

## Closing words

If anyone is interested in pushing this further and document it, star the project. If the repo reaches 1,000+ stars I will start making it production-ready.

You can also help out or get in touch on GitHub by creating [an issue](https://github.com/SacDeNoeuds/yawn/issues) ☺️.

If you are interested in contributing, take a look at [values](./VALUES.md), it contains expectations & philosophies I have regarding frontend libraries or frameworks.

Thanks 💛
