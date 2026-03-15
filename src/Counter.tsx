import { createState } from "yawn";

interface Props {
  initialCount?: number;
}
export function Counter({ initialCount = 0 }: Props) {
  const count = createState(initialCount);
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
