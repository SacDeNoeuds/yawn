export interface State<T> extends AsyncIterable<T> {
  set: (next: T) => void;
  update: (make: (previous: T) => T) => void;
}

export function createState<T>(initialValue: T): State<T> {
  let value = initialValue;
  let markNextValueAsReady = () => {};
  let isNextValueReady: Promise<void>;
  reset();
  function reset() {
    isNextValueReady = new Promise<void>((resolve) => {
      markNextValueAsReady = () => {
        resolve();
        reset();
      };
    });
  }

  return {
    [Symbol.asyncIterator]() {
      let isFirstIteration = true;
      return {
        async next() {
          if (isFirstIteration) isFirstIteration = false;
          else await isNextValueReady;
          return { value, done: false };
        },
      };
    },
    set(next: T) {
      value = next;
      markNextValueAsReady();
    },
    update(fn: (previous: T) => T) {
      value = fn(value);
      markNextValueAsReady();
    },
  };
}
