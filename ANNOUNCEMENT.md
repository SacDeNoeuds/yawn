# Announcement

## Introduction

In JavaScript frontend ecosystem, we lack a Standard regarding reactivity. React ships its `useState`, Vue goes with `ref` & co, Angular delegated it to RxJS, and Svelte had observables-like stores until Solid made its case about Signals and they got runes.

Yet, no consensus.
So much that there's even an EcmaScript proposal for Signal.

I have even better.
What if told you that we already have reactivity in the frontend ?

In the name of …
Async Iterables 🎉

## How it works

Picture this:

- the first value of the async iterable is its initial value at the time of `for await (…)` declaration
- all the next values are state updates
- the async iterable awaits each next update.
And there you have it.

## Proof of Concept

The demo is located at https://github.com/SacDeNoeuds/yawn/tree/main/demo

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

It represents quite some work if one wants to propose as much features as React, Vue, Next/Nuxt, Svelte(Kit) or Solid(Start) though.

## Closing words

If anyone is interested in pushing this further and document it, get in touch on GitHub ☺️, here's the repo: https://github.com/SacDeNoeuds/yawn.

If I ever go there, here are some [values](./VALUES.md) and expectations I have regarding frontend libraries or frameworks.
