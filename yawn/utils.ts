export function absurd(value: never): never {
  throw new Error("absurd");
}

export type AnyFunction = (...args: any[]) => any;
export const isFunction = (value: unknown): value is AnyFunction =>
  typeof value === "function";

export function isAsyncIterable<T = any>(
  value: unknown
): value is AsyncIterable<T> {
  return !!value && typeof value === "object" && Symbol.asyncIterator in value;
}

export type AnyConstructor = new (...args: any[]) => any;

export const isInstanceOf =
  <T extends AnyConstructor>(Class: T) =>
  (value: unknown): value is InstanceType<T> =>
    value instanceof Class;
