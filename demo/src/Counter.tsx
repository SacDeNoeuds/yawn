import { State } from "@sacdenoeuds/yawn";
import './counter.css';

interface Props {
  count: State<number>;
}
export function Counter({ count }: Props) {
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
