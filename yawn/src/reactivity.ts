// export interface State<T> extends AsyncIterator<T> {
//   set: (next: T) => void;
//   update: (make: (previous: T) => T) => void;
// }

// As mentioned in MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator
const { getPrototypeOf: protoOf } = Object
const AsyncIteratorPrototype = protoOf(
  protoOf(protoOf((async function* () {})())),
)
interface AsyncIteratorConstructor {
  new <T>(): AsyncIterator<T>
}
// @ts-expect-error
const constructor = (globalThis.AsyncIterator ??
  AsyncIteratorPrototype.constructor) as AsyncIteratorConstructor

export class State<T> extends constructor<T> {
  #value: T
  #currentPromise: Promise<void>
  #nextPromise!: Promise<void>
  #resolveNext!: () => void

  constructor(initialValue: T) {
    super()
    this.#value = initialValue
    this.#currentPromise = Promise.resolve() // immediate for first value
    this.#setupNextPromise()
  }

  #setupNextPromise() {
    this.#nextPromise = new Promise<void>((resolve) => {
      this.#resolveNext = () => {
        resolve()
        this.#setupNextPromise()
      }
    })
  }

  async *[Symbol.asyncIterator]() {
    while (true) {
      yield this.#value
      await this.#currentPromise
      this.#currentPromise = this.#nextPromise
    }
  }

  async next() {
    await this.#currentPromise
    this.#currentPromise = this.#nextPromise
    return { value: this.#value, done: false }
  }

  set(next: T) {
    this.#value = next
    this.#resolveNext()
  }

  update(fn: (previous: T) => T) {
    this.#value = fn(this.#value)
    this.#resolveNext()
  }
}

// export function createState<T>(initialValue: T) {
//   let value = initialValue;
//   let markNextValueAsReady = () => {};
//   let isNextValueReady: Promise<void>;
//   reset();
//   function reset() {
//     isNextValueReady = new Promise<void>((resolve) => {
//       markNextValueAsReady = () => {
//         resolve();
//         reset();
//       };
//     });
//   }

//   return Object.create(AsyncIteratorPrototype, {
//     async *[Symbol.asyncIterator]() {
//       while (true) {
//         yield value;
//         await isNextValueReady;
//       }
//     },
//     async next() {
//       await isNextValueReady;
//       return { value, done: false };
//     },
//     set(next: T) {
//       value = next;
//       markNextValueAsReady();
//     },
//     update(fn: (previous: T) => T) {
//       value = fn(value);
//       markNextValueAsReady();
//     },
//   }) as State<T>;
// }
